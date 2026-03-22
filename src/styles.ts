import * as fs from 'fs';
import * as path from 'path';
import { StyleConfig, StyleProperties } from './types';

/**
 * Converts camelCase to kebab-case for CSS properties
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Converts a StyleProperties object to CSS declarations
 */
function stylePropertiesToCss(properties: StyleProperties): string {
  return Object.entries(properties)
    .map(([key, value]) => `  ${camelToKebab(key)}: ${value};`)
    .join('\n');
}

/**
 * Converts a StyleConfig object to a complete CSS string
 */
export function styleConfigToCss(config: StyleConfig): string {
  const cssRules: string[] = [];

  for (const [selector, properties] of Object.entries(config)) {
    if (properties && Object.keys(properties).length > 0) {
      const cssProperties = stylePropertiesToCss(properties);
      cssRules.push(`${selector} {\n${cssProperties}\n}`);
    }
  }

  return cssRules.join('\n\n');
}

/**
 * Loads a style configuration from a JSON file
 */
export function loadStyleConfig(templatesDir: string, themeName: string): StyleConfig {
  const stylePath = path.join(templatesDir, 'styles', `${themeName}.json`);

  if (!fs.existsSync(stylePath)) {
    throw new Error(`Theme not found: ${themeName} (looked in ${stylePath})`);
  }

  const content = fs.readFileSync(stylePath, 'utf-8');
  return JSON.parse(content) as StyleConfig;
}

/**
 * Gets the CSS for a specific theme
 */
export function getThemeCss(templatesDir: string, themeName: string): string {
  const config = loadStyleConfig(templatesDir, themeName);
  return styleConfigToCss(config);
}

/**
 * Lists all available themes
 */
export function listAvailableThemes(templatesDir: string): string[] {
  const stylesDir = path.join(templatesDir, 'styles');

  if (!fs.existsSync(stylesDir)) {
    return [];
  }

  const files = fs.readdirSync(stylesDir);
  return files
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace('.json', ''));
}

