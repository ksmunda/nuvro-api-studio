/**
 * Environment variable interpolation engine.
 *
 * Replaces {{variableName}} tokens in strings with values from a
 * resolved environment variable map.
 *
 * @example
 *   interpolateVariables('{{baseUrl}}/users/{{userId}}', {
 *     baseUrl: 'https://api.example.com',
 *     userId: '42',
 *   });
 *   // => 'https://api.example.com/users/42'
 */

const VARIABLE_PATTERN = /\{\{([^{}]+)\}\}/g;

/**
 * Replaces all {{variableName}} tokens in the input string.
 * Tokens with no matching variable are left intact (not removed).
 */
export function interpolateVariables(
  input: string,
  variables: Record<string, string>,
): string {
  return input.replace(VARIABLE_PATTERN, (match, key: string) => {
    const trimmedKey = key.trim();
    return Object.prototype.hasOwnProperty.call(variables, trimmedKey)
      ? (variables[trimmedKey] ?? match)
      : match;
  });
}

/**
 * Replaces all {{variableName}} tokens in the input string, throwing an error if any variables are missing.
 */
export function interpolateVariablesStrict(
  input: string,
  variables: Record<string, string>,
): string {
  return input.replace(VARIABLE_PATTERN, (match, key: string) => {
    const trimmedKey = key.trim();
    if (!Object.prototype.hasOwnProperty.call(variables, trimmedKey)) {
      throw new Error(`Environment variable "${trimmedKey}" was not found.`);
    }
    return variables[trimmedKey] ?? '';
  });
}

/**
 * Extracts all unique variable names referenced in the input string.
 *
 * @example
 *   extractVariableNames('{{baseUrl}}/users/{{userId}}/posts/{{userId}}')
 *   // => ['baseUrl', 'userId']
 */
export function extractVariableNames(input: string): string[] {
  const names = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(VARIABLE_PATTERN.source, 'g');
  while ((match = re.exec(input)) !== null) {
    const key = match[1]?.trim();
    if (key) names.add(key);
  }
  return Array.from(names);
}
