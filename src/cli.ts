#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';
import { runPipeline } from './pipeline';
import { listAvailableThemes } from './styles';

const program = new Command();

program
  .name('resume-pipeline')
  .description('AI-powered resume generation pipeline')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a resume from input data')
  .option('-i, --input <path>', 'Path to input JSON file', 'data/input.json')
  .option('-t, --theme <name>', 'Theme to use for styling', 'modern')
  .option('-o, --output <dir>', 'Output directory', 'output')
  .option('--debug', 'Save debug HTML file', false)
  .option('--timestamp', 'Add timestamp to output filename', false)
  .option('--no-validate', 'Skip Markdown validation')
  .action(async (options) => {
    try {
      // Load input data
      const inputPath = path.resolve(options.input);
      if (!fs.existsSync(inputPath)) {
        console.error(`❌ Input file not found: ${inputPath}`);
        process.exit(1);
      }

      const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

      // Load configuration
      const config = loadConfig({
        theme: options.theme,
        outputDir: path.resolve(options.output),
      });

      // Run pipeline
      const result = await runPipeline(inputData, config, {
        saveDebugHtml: options.debug,
        validateMarkdown: options.validate,
        timestamp: options.timestamp,
      });

      console.log('\n📄 Generated files:');
      result.results.forEach((r) => {
        if (r.targetJob) {
          console.log(`   📎 ${r.targetJob.company} - ${r.targetJob.title}:`);
          console.log(`      PDF: ${r.pdfPath}`);
        } else {
          console.log(`   PDF: ${r.pdfPath}`);
        }
      });
      if (options.debug) {
        console.log(`   HTML: ${path.join(config.outputDir, 'debug*.html')}`);
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('themes')
  .description('List available themes')
  .action(() => {
    try {
      const templatesDir = path.join(process.cwd(), 'templates');
      const themes = listAvailableThemes(templatesDir);

      if (themes.length === 0) {
        console.log('No themes found.');
      } else {
        console.log('Available themes:');
        themes.forEach((theme) => console.log(`  - ${theme}`));
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate input data without generating')
  .option('-i, --input <path>', 'Path to input JSON file', 'data/input.json')
  .action((options) => {
    try {
      const inputPath = path.resolve(options.input);
      if (!fs.existsSync(inputPath)) {
        console.error(`❌ Input file not found: ${inputPath}`);
        process.exit(1);
      }

      const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

      // Import and validate
      const { ResumeInputSchema } = require('./types');
      const result = ResumeInputSchema.safeParse(inputData);

      if (result.success) {
        console.log('✅ Input data is valid!');
        console.log(`   Name: ${result.data.name}`);
        console.log(`   Experiences: ${result.data.experiences.length}`);
        console.log(`   Skills: ${result.data.skills?.length || 0}`);
        console.log(`   Certifications: ${result.data.certifications?.length || 0}`);
      } else {
        console.error('❌ Validation errors:');
        result.error.errors.forEach((err: { path: string[]; message: string }) => {
          console.error(`   ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();

