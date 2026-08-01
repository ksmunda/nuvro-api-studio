import { dnsLookup } from './dns-resolver.js';
import { BadRequestError } from '../errors/app-error.js';

/**
 * Checks if a resolved IP address belongs to any private, loopback, or link-local subnet ranges.
 */
export function isPrivateIp(ip: string): boolean {
  // Normalize IPv4 mapped IPv6 addresses (e.g. ::ffff:127.0.0.1)
  let targetIp = ip;
  if (targetIp.startsWith('::ffff:')) {
    targetIp = targetIp.substring(7);
  }

  // IPv4 Checks
  if (targetIp.includes('.')) {
    const parts = targetIp.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some(isNaN)) {
      return true; // Treat invalid IPs as private/unsafe
    }

    const [a, b, c, d] = parts;
    if (a === undefined || b === undefined || c === undefined || d === undefined) {
      return true;
    }

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 10.0.0.0/8 (Private RFC 1918)
    if (a === 10) return true;
    // 172.16.0.0/12 (Private RFC 1918)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (Private RFC 1918)
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (Link-Local / Cloud Metadata)
    if (a === 169 && b === 254) return true;
    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;

    return false;
  }

  // IPv6 Checks
  if (targetIp.includes(':')) {
    const normalized = targetIp.toLowerCase();
    // Loopback ::1
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // Link-local fe80::/10
    if (normalized.startsWith('fe80:')) return true;
    // Unique local address fc00::/7
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // Unspecified ::
    if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

    return false;
  }

  return true; // Default block
}

/**
 * Validates a target URL, resolving its hostname to confirm it does not point to a private IP range.
 * Throws a BadRequestError if validation fails.
 */
export async function validateUrlForSsrf(urlStr: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    throw new BadRequestError('Invalid target request URL schema', 'INVALID_URL');
  }

  // Protocol Whitelist
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestError(`Protocol "${url.protocol}" is not supported. Only http: and https: are allowed.`, 'UNSUPPORTED_PROTOCOL');
  }

  // url.hostname returns bracketed IPv6 (e.g. "[::1]") — strip brackets for validation
  const rawHostname = url.hostname;
  const hostname = rawHostname.startsWith('[') && rawHostname.endsWith(']')
    ? rawHostname.slice(1, -1)
    : rawHostname;

  // Resolve hostname to IP addresses
  let resolvedIps: string[];
  try {
    resolvedIps = await dnsLookup(hostname);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Host unresolved';
    throw new BadRequestError(`DNS resolution failed for hostname "${hostname}": ${message}`, 'DNS_ERROR');
  }

  // Ensure ALL resolved IPs are public
  if (process.env['ALLOW_PRIVATE_IPS'] !== 'true') {
    for (const ip of resolvedIps) {
      if (isPrivateIp(ip)) {
        throw new BadRequestError(`Unsafe destination address resolved: target "${hostname}" resolves to private IP range (${ip})`, 'BLOCKED_SSRF');
      }
    }
  }

  return urlStr;
}
