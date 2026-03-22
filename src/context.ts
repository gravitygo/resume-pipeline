import * as fs from 'fs';
import * as path from 'path';

/**
 * Available context file types
 */
export type ContextFile = 'project' | 'experiences' | 'skills' | 'templates' | 'rules';

/**
 * Loads a single context file from the context directory
 */
export function loadContextFile(contextDir: string, fileName: ContextFile): string {
  const filePath = path.join(contextDir, `${fileName}.md`);

  if (!fs.existsSync(filePath)) {
    console.warn(`Context file not found: ${filePath}`);
    return '';
  }

  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Loads multiple context files and concatenates them
 */
export function loadContextFiles(contextDir: string, fileNames: ContextFile[]): string {
  const contents = fileNames
    .map((fileName) => {
      const content = loadContextFile(contextDir, fileName);
      if (content) {
        return `--- ${fileName.toUpperCase()} ---\n\n${content}`;
      }
      return '';
    })
    .filter((content) => content.length > 0);

  return contents.join('\n\n');
}

/**
 * Loads all available context files from the context directory
 */
export function loadAllContext(contextDir: string): string {
  const allFiles: ContextFile[] = ['project', 'rules', 'templates', 'experiences', 'skills'];
  return loadContextFiles(contextDir, allFiles);
}

/**
 * Gets the default context files for resume generation
 */
export function getResumeContext(contextDir: string): string {
  const resumeFiles: ContextFile[] = ['project', 'rules'];
  return loadContextFiles(contextDir, resumeFiles);
}

