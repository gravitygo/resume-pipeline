import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads an HTML template from the templates directory
 */
export function loadTemplate(templatesDir: string, templateName: string = 'resume'): string {
  const templatePath = path.join(templatesDir, `${templateName}.html`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName} (looked in ${templatePath})`);
  }

  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Injects content and styles into an HTML template
 */
export function renderTemplate(
  template: string,
  content: string,
  css: string,
  title: string = 'Resume'
): string {
  let html = template;

  // Replace placeholders
  html = html.replace('{{content}}', content);
  html = html.replace('{{styles}}', css);
  html = html.replace('{{title}}', title);

  return html;
}

/**
 * Creates the full HTML document from markdown HTML and styles
 */
export function createHtmlDocument(
  templatesDir: string,
  markdownHtml: string,
  css: string,
  title: string = 'Resume'
): string {
  const template = loadTemplate(templatesDir);
  return renderTemplate(template, markdownHtml, css, title);
}

/**
 * Gets the default HTML template structure
 */
export function getDefaultTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.5;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }

    {{styles}}
  </style>
</head>
<body>
  <main class="resume">
    {{content}}
  </main>
</body>
</html>`;
}

