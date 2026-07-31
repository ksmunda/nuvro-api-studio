import dns from 'dns';

/**
 * Resolves a hostname to a list of IP addresses (v4 and v6) using node dns.lookup.
 */
export function dnsLookup(hostname: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // If the input is already an IP address, return it directly
    if (netIsIP(hostname)) {
      return resolve([hostname]);
    }

    dns.lookup(hostname, { all: true }, (err, addresses) => {
      if (err) {
        return reject(err);
      }
      const ips = addresses.map((addr) => addr.address);
      resolve(ips);
    });
  });
}

function netIsIP(value: string): number {
  // Check IPv4
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)) {
    return 4;
  }
  // Check IPv6
  if (value.includes(':')) {
    return 6;
  }
  return 0;
}
