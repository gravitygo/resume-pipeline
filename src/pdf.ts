import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PDF generation options
 */
export interface PdfOptions {
  format?: 'A4' | 'Letter';
  printBackground?: boolean;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
}

/**
 * Default PDF options for resume generation
 */
const DEFAULT_PDF_OPTIONS: PdfOptions = {
  format: 'A4',
  printBackground: true,
  marginTop: '0.5in',
  marginBottom: '0.5in',
  marginLeft: '0.5in',
  marginRight: '0.5in',
};

/**
 * Renders HTML content to a PDF file using Puppeteer
 */
export async function renderPdf(
  htmlContent: string,
  outputPath: string,
  options: PdfOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options };

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: mergedOptions.format,
      printBackground: mergedOptions.printBackground,
      margin: {
        top: mergedOptions.marginTop,
        bottom: mergedOptions.marginBottom,
        left: mergedOptions.marginLeft,
        right: mergedOptions.marginRight,
      },
    });

    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Generates a filename for the resume PDF
 */
export function generatePdfFilename(candidateName: string, timestamp: boolean = false): string {
  // Sanitize the candidate name for use in filename
  const sanitized = candidateName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (timestamp) {
    const date = new Date().toISOString().split('T')[0];
    return `${sanitized}-resume-${date}.pdf`;
  }

  return `${sanitized}-resume.pdf`;
}

/**
 * Saves HTML content to a file for debugging
 */
export async function saveHtmlDebug(
  htmlContent: string,
  outputDir: string,
  filename: string = 'debug.html'
): Promise<string> {
  const outputPath = path.join(outputDir, filename);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, htmlContent, 'utf-8');
  return outputPath;
}

