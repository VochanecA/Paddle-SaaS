// lib/getNextVersion.ts
import packageJson from '../../package.json';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const pkg = packageJson as PackageJson;

export function getNextVersion(): string {
  const version = pkg.dependencies?.next || pkg.devDependencies?.next;
  return version ? version.replace(/^[^\d]*/, '') : 'latest';
}
