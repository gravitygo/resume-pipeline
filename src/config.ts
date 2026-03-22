import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

/**
 * Supported AI providers
 */
export type AIProvider = 'openai' | 'azure';

/**
 * Azure-specific configuration
 */
export interface AzureConfig {
  endpoint: string; // Azure OpenAI or Azure AI Foundry endpoint
  apiKey: string;
  apiVersion: string;
  deploymentName: string; // Deployment name in Azure
}

export interface Config {
  aiProvider: AIProvider;
  openaiApiKey: string;
  openaiModel: string;
  azureConfig?: AzureConfig;
  theme: string;
  outputDir: string;
  contextDir: string;
  templatesDir: string;
}

/**
 * Validates and returns the configuration from environment variables
 */
export function loadConfig(overrides: Partial<Config> = {}): Config {
  const aiProvider = (overrides.aiProvider || process.env.AI_PROVIDER || 'openai') as AIProvider;

  // Validate provider
  if (!['openai', 'azure'].includes(aiProvider)) {
    throw new Error(`Invalid AI_PROVIDER: ${aiProvider}. Must be 'openai' or 'azure'`);
  }

  let openaiApiKey = '';
  let azureConfig: AzureConfig | undefined;

  if (aiProvider === 'openai') {
    openaiApiKey = overrides.openaiApiKey || process.env.OPENAI_API_KEY || '';
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required when using OpenAI provider');
    }
  } else if (aiProvider === 'azure') {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_AI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_AI_API_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-01';
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AZURE_AI_DEPLOYMENT;

    if (!endpoint) {
      throw new Error('AZURE_OPENAI_ENDPOINT or AZURE_AI_ENDPOINT environment variable is required when using Azure provider');
    }
    if (!apiKey) {
      throw new Error('AZURE_OPENAI_API_KEY or AZURE_AI_API_KEY environment variable is required when using Azure provider');
    }
    if (!deploymentName) {
      throw new Error('AZURE_OPENAI_DEPLOYMENT or AZURE_AI_DEPLOYMENT environment variable is required when using Azure provider');
    }

    azureConfig = {
      endpoint,
      apiKey,
      apiVersion,
      deploymentName,
    };
  }

  return {
    aiProvider,
    openaiApiKey,
    openaiModel: overrides.openaiModel || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    azureConfig,
    theme: overrides.theme || process.env.THEME || 'modern',
    outputDir: overrides.outputDir || process.env.OUTPUT_DIR || path.join(process.cwd(), 'output'),
    contextDir: overrides.contextDir || process.env.CONTEXT_DIR || path.join(process.cwd(), 'context'),
    templatesDir: overrides.templatesDir || process.env.TEMPLATES_DIR || path.join(process.cwd(), 'templates'),
  };
}

/**
 * Validates that all required configuration values are present
 */
export function validateConfig(config: Config): void {
  if (config.aiProvider === 'openai' && !config.openaiApiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (config.aiProvider === 'azure' && !config.azureConfig) {
    throw new Error('Azure configuration is required');
  }

  if (!config.theme) {
    throw new Error('Theme is required');
  }
}

