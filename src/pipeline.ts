import * as path from "path";
import { ResumeInput, ResumeInputSchema, TargetJob } from "./types";
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
 * Pipeline result for a single resume
 */
export interface SingleResumeResult {
  markdown: string;
  html: string;
  pdfPath: string;
  candidateName: string;
  targetJob?: TargetJob;
}

/**
 * Pipeline result
 */
export interface PipelineResult {
  results: SingleResumeResult[];
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
 * Generates a slug from a string (for filenames)
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generates a PDF filename for a specific target job
 */
function generateTargetJobFilename(
  candidateName: string,
  targetJob: TargetJob,
  timestamp: boolean = false
): string {
  const namePart = slugify(candidateName);
  const companyPart = slugify(targetJob.company);
  const titlePart = slugify(targetJob.title);

  let filename = `${namePart}-${companyPart}-${titlePart}`;

  if (timestamp) {
    const date = new Date().toISOString().split("T")[0];
    filename = `${filename}-${date}`;
  }

  return `${filename}.pdf`;
}

/**
 * Generates a single resume (either general or tailored to a target job)
 */
async function generateSingleResume(
  validatedInput: ResumeInput,
  config: Config,
  context: string,
  aiClient: ReturnType<typeof createAIClient>,
  modelName: string,
  options: PipelineOptions,
  targetJob?: TargetJob
): Promise<SingleResumeResult> {
  const {
    saveDebugHtml = false,
    validateMarkdown = true,
    timestamp = false,
  } = options;

  // Log target job info if present
  if (targetJob) {
    console.log(`\n🎯 Tailoring resume for: ${targetJob.title} at ${targetJob.company}`);
  } else {
    console.log("\n📝 Generating general resume...");
  }

  // Generate Markdown via LLM
  console.log("🤖 Generating Markdown via LLM...");
  const markdown = await generateMarkdownResume(
    aiClient,
    modelName,
    validatedInput,
    context,
    targetJob
  );

  // Validate Markdown structure
  if (validateMarkdown) {
    console.log("✅ Validating Markdown structure...");
    const validation = validateMarkdownStructure(markdown);
    if (!validation.valid) {
      console.warn("⚠️ Markdown validation warnings:", validation.errors);
    }
  }

  // Extract candidate name
  const candidateName = extractCandidateName(markdown) || validatedInput.name;

  // Convert Markdown to HTML
  console.log("📝 Converting Markdown to HTML...");
  const markdownHtml = markdownToHtml(markdown);

  // Load theme CSS
  console.log(`🎨 Loading theme: ${config.theme}...`);
  const css = getThemeCss(config.templatesDir, config.theme);

  // Create full HTML document
  console.log("📄 Creating HTML document...");
  const title = targetJob
    ? `${candidateName} - Resume - ${targetJob.company}`
    : `${candidateName} - Resume`;
  const html = createHtmlDocument(
    config.templatesDir,
    markdownHtml,
    css,
    title
  );

  // Save debug HTML if requested
  if (saveDebugHtml) {
    const debugFilename = targetJob
      ? `debug-${slugify(targetJob.company)}-${slugify(targetJob.title)}.html`
      : "debug.html";
    const debugPath = await saveHtmlDebug(html, config.outputDir, debugFilename);
    console.log(`🐛 Debug HTML saved to: ${debugPath}`);
  }

  // Generate PDF
  console.log("📑 Generating PDF...");
  const pdfFilename = targetJob
    ? generateTargetJobFilename(candidateName, targetJob, timestamp)
    : generatePdfFilename(candidateName, timestamp);
  const pdfPath = path.join(config.outputDir, pdfFilename);
  await renderPdf(html, pdfPath);

  console.log(`✨ Resume generated successfully: ${pdfPath}`);

  return {
    markdown,
    html,
    pdfPath,
    candidateName,
    targetJob,
  };
}

/**
 * Runs the complete resume generation pipeline
 */
export async function runPipeline(
  input: unknown,
  config: Config,
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  console.log("🚀 Starting resume generation pipeline...");

  // Step 1: Validate input
  console.log("📋 Validating input...");
  const validatedInput = validateInput(input);

  // Step 2: Load context
  console.log("📚 Loading context...");
  const context = getResumeContext(config.contextDir);

  // Step 3: Create AI client
  const aiClient = createAIClient(config);
  const modelName = getModelName(config);

  const results: SingleResumeResult[] = [];

  // Step 4: Generate resumes
  const targetJobs = validatedInput.targetJobs;

  if (targetJobs && targetJobs.length > 0) {
    // Generate a tailored resume for each target job
    console.log(`\n📋 Found ${targetJobs.length} target job(s). Generating tailored resumes...`);

    for (const targetJob of targetJobs) {
      const result = await generateSingleResume(
        validatedInput,
        config,
        context,
        aiClient,
        modelName,
        options,
        targetJob
      );
      results.push(result);
    }
  } else {
    // Generate a general resume showcasing all experience
    const result = await generateSingleResume(
      validatedInput,
      config,
      context,
      aiClient,
      modelName,
      options
    );
    results.push(result);
  }

  const candidateName = results[0]?.candidateName || validatedInput.name;

  console.log(`\n🎉 Pipeline complete! Generated ${results.length} resume(s).`);

  return {
    results,
    candidateName,
  };
}
