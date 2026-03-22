import * as path from "path";
import { ResumeInput, ResumeInputSchema } from "./types";
import { Config } from "./config";
import { getResumeContext } from "./context";
import { createAIClient, getModelName, generateMarkdownResume } from "./llm";
import {
  markdownToHtml,
  validateMarkdownStructure,
  extractCandidateName,
} from "./markdown";
import { getThemeCss } from "./styles";
import { createHtmlDocument } from "./template";
import { renderPdf, generatePdfFilename, saveHtmlDebug } from "./pdf";

/**
 * Pipeline result
 */
export interface PipelineResult {
  markdown: string;
  html: string;
  pdfPath: string;
  candidateName: string;
}

/**
 * Pipeline options
 */
export interface PipelineOptions {
  saveDebugHtml?: boolean;
  validateMarkdown?: boolean;
  timestamp?: boolean;
}

/**
 * Validates the input data against the schema
 */
function validateInput(input: unknown): ResumeInput {
  const result = ResumeInputSchema.safeParse(input);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Invalid input: ${errors}`);
  }

  return result.data;
}

/**
 * Runs the complete resume generation pipeline
 */
export async function runPipeline(
  input: unknown,
  config: Config,
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const {
    saveDebugHtml = false,
    validateMarkdown = true,
    timestamp = false,
  } = options;

  console.log("🚀 Starting resume generation pipeline...");

  // Step 1: Validate input
  console.log("📋 Validating input...");
  const validatedInput = validateInput(input);

  // Step 2: Load context
  console.log("📚 Loading context...");
  const context = getResumeContext(config.contextDir);

  // Step 3: Generate Markdown via LLM
  console.log("🤖 Generating Markdown via LLM...");
  const aiClient = createAIClient(config);
  const modelName = getModelName(config);
  const markdown = await generateMarkdownResume(
    aiClient,
    modelName,
    validatedInput,
    context,
  );

  // Step 4: Validate Markdown structure
  if (validateMarkdown) {
    console.log("✅ Validating Markdown structure...");
    const validation = validateMarkdownStructure(markdown);
    if (!validation.valid) {
      console.warn("⚠️ Markdown validation warnings:", validation.errors);
    }
  }

  // Step 5: Extract candidate name
  const candidateName = extractCandidateName(markdown) || validatedInput.name;

  // Step 6: Convert Markdown to HTML
  console.log("📝 Converting Markdown to HTML...");
  const markdownHtml = markdownToHtml(markdown);

  // Step 7: Load theme CSS
  console.log(`🎨 Loading theme: ${config.theme}...`);
  const css = getThemeCss(config.templatesDir, config.theme);

  // Step 8: Create full HTML document
  console.log("📄 Creating HTML document...");
  const html = createHtmlDocument(
    config.templatesDir,
    markdownHtml,
    css,
    `${candidateName} - Resume`,
  );

  // Step 9: Save debug HTML if requested
  if (saveDebugHtml) {
    const debugPath = await saveHtmlDebug(html, config.outputDir, "debug.html");
    console.log(`🐛 Debug HTML saved to: ${debugPath}`);
  }

  // Step 10: Generate PDF
  console.log("📑 Generating PDF...");
  const pdfFilename = generatePdfFilename(candidateName, timestamp);
  const pdfPath = path.join(config.outputDir, pdfFilename);
  await renderPdf(html, pdfPath);

  console.log(`✨ Resume generated successfully: ${pdfPath}`);

  return {
    markdown,
    html,
    pdfPath,
    candidateName,
  };
}
