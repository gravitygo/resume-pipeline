import { marked } from 'marked';

/**
 * Configure marked for consistent output
 */
marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Converts Markdown content to HTML
 */
export function markdownToHtml(markdown: string): string {
  const html = marked.parse(markdown);

  if (typeof html !== 'string') {
    throw new Error('Failed to parse markdown');
  }

  return html;
}

/**
 * Valid section names for resume
 */
const VALID_SECTIONS = [
  'Contact',
  'Links',
  'Summary',
  'Experience',
  'Education',
  'Skills',
  'Projects',
  'Certifications',
  'Languages',
  'Volunteer Experience',
  'Awards',
];

/**
 * Required sections that must be present
 */
const REQUIRED_SECTIONS = ['Summary', 'Experience', 'Skills'];

/**
 * Validates that the Markdown follows the required structure
 */
export function validateMarkdownStructure(markdown: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = markdown.split('\n');

  let hasH1 = false;
  let h1Count = 0;
  const foundSections: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for H1 (should only appear once)
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      h1Count++;
      hasH1 = true;
    }

    // Check for sections (H2)
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      const sectionName = trimmed.substring(3).trim();
      foundSections.push(sectionName);

      // Warn if section is not in valid list
      if (!VALID_SECTIONS.includes(sectionName)) {
        warnings.push(`Unknown section: ${sectionName}`);
      }
    }

    // Check for invalid heading levels (H4 and beyond)
    if (trimmed.startsWith('#### ')) {
      errors.push('Invalid heading level detected (H4 or deeper not allowed)');
    }

    // Check for inline HTML (except comments)
    if (/<[^>]+>/.test(trimmed) && !trimmed.startsWith('<!--')) {
      errors.push(`Inline HTML detected: ${trimmed.substring(0, 50)}...`);
    }
  }

  // Check for H1
  if (!hasH1) {
    errors.push('Missing H1 heading (candidate name)');
  }

  if (h1Count > 1) {
    errors.push(`Multiple H1 headings detected (found ${h1Count}, expected 1)`);
  }

  // Check for required sections
  for (const required of REQUIRED_SECTIONS) {
    if (!foundSections.includes(required)) {
      errors.push(`Missing required section: ${required}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extracts all sections from the Markdown
 */
export function extractSections(markdown: string): string[] {
  const lines = markdown.split('\n');
  const sections: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      sections.push(trimmed.substring(3).trim());
    }
  }

  return sections;
}

/**
 * Extracts the candidate name from the Markdown
 */
export function extractCandidateName(markdown: string): string | null {
  const lines = markdown.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      return trimmed.substring(2).trim();
    }
  }

  return null;
}

