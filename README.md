# Resume Generation Pipeline

An AI-powered resume generation system that transforms structured career data into polished, ATS-friendly PDF resumes.

## Overview

This pipeline:

1. Accepts structured input data (name, experiences, skills, certifications)
2. Generates a Markdown resume via OpenAI LLM
3. Converts Markdown to HTML
4. Applies theme styling from JSON configuration
5. Renders a PDF using a headless browser

## Features

- **AI-Powered**: Uses OpenAI's GPT models to generate professional resume content
- **Multiple Themes**: Choose from modern, classic, or compact themes
- **ATS-Friendly**: Generates clean, selectable text PDFs
- **Consistent Output**: Deterministic generation with strict Markdown schema
- **CLI Interface**: Easy command-line usage
- **GitHub Actions**: Automated resume generation via CI/CD

## Installation

```bash
# Clone the repository
git clone https://github.com/gravitygo/resume-pipeline.git
cd resume-pipeline

# Install dependencies
npm install

# Copy environment example and configure
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

## Configuration

Create a `.env` file with your configuration:

### Using OpenAI (default)

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
THEME=modern
```

### Using Azure OpenAI / Azure AI Foundry

```env
AI_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-azure-api-key-here
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-01
THEME=modern
```

Alternative Azure AI Foundry naming is also supported:

```env
AI_PROVIDER=azure
AZURE_AI_ENDPOINT=https://your-resource.services.ai.azure.com
AZURE_AI_API_KEY=your-azure-ai-key-here
AZURE_AI_DEPLOYMENT=your-model-deployment
```

## Usage

### Generate a Resume

```bash
# Build and generate with default settings
npm run generate

# Generate with a specific theme
npm run generate -- --theme=classic

# Generate with custom input file
npm run generate -- --input=path/to/input.json

# Generate with debug HTML output
npm run generate -- --debug

# Generate with timestamp in filename
npm run generate -- --timestamp
```

### List Available Themes

```bash
npm run build && node dist/cli.js themes
```

### Validate Input Data

```bash
npm run build && node dist/cli.js validate --input=data/input.json
```

## Input Data Format

Create a JSON file with your resume data:

```json
{
  "name": "John Doe",
  "title": "Senior Software Engineer",
  "contact": {
    "email": "john.doe@email.com",
    "phone": "+1 (555) 123-4567",
    "location": "San Francisco, CA"
  },
  "links": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.dev"
  },
  "experiences": [
    {
      "company": "Tech Corp",
      "job": "Senior Software Engineer",
      "job_description": "Led development of microservices architecture. Mentored junior developers. Reduced API response time by 40%.",
      "location": "San Francisco, CA",
      "start_date": "Jan 2022",
      "end_date": "Present"
    }
  ],
  "education": [
    {
      "institution": "University of California, Berkeley",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "location": "Berkeley, CA",
      "end_date": "May 2017",
      "gpa": "3.8/4.0"
    }
  ],
  "skills": ["TypeScript", "React", "Node.js"],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "Mar 2023"
    }
  ],
  "projects": [
    {
      "name": "Open Source Project",
      "description": "Built an analytics dashboard used by 500+ developers.",
      "technologies": ["React", "Node.js"],
      "url": "https://github.com/johndoe/project"
    }
  ],
  "languages": [
    { "language": "English", "proficiency": "Native" },
    { "language": "Spanish", "proficiency": "Intermediate" }
  ]
}
```

### Required Fields

- `name` - Candidate's full name
- `experiences` - Array of work experiences (at least one required)
  - `company`, `job`, `job_description` are required per experience

### Optional Fields

- `title` - Professional title
- `contact` - Contact information (email, phone, location)
- `links` - Professional links (linkedin, github, portfolio, website)
- `education` - Academic background
- `skills` - Array of skills
- `certifications` - Array of certifications (string or detailed object)
- `projects` - Notable projects
- `languages` - Language proficiencies
- `volunteer` - Volunteer experience
- `awards` - Awards and recognition

## Project Structure

```
resume-pipeline/
├── src/                    # TypeScript source code
│   ├── cli.ts              # CLI interface
│   ├── config.ts           # Configuration handling
│   ├── context.ts          # Context file loading
│   ├── index.ts            # Main exports
│   ├── llm.ts              # OpenAI integration
│   ├── markdown.ts         # Markdown parsing/validation
│   ├── pdf.ts              # PDF rendering
│   ├── pipeline.ts         # Main pipeline orchestration
│   ├── styles.ts           # JSON to CSS conversion
│   ├── template.ts         # HTML templating
│   └── types.ts            # TypeScript types and schemas
├── context/                # LLM context files
│   ├── project.md          # Project overview
│   ├── rules.md            # Resume generation rules
│   └── templates.md        # Template documentation
├── templates/              # HTML templates and styles
│   ├── resume.html         # Main HTML template
│   └── styles/             # Theme JSON files
│       ├── modern.json
│       ├── classic.json
│       └── compact.json
├── data/                   # Input data
│   └── input.json          # Sample input file
├── output/                 # Generated files (PDF, debug HTML)
└── .github/workflows/      # GitHub Actions
    └── generate-resume.yml
```

## Themes

### Modern (default)

- Clean, contemporary design
- Blue accent colors
- Sans-serif typography

### Classic

- Traditional, timeless look
- Black and white color scheme
- Serif typography

### Compact

- Space-efficient layout
- Smaller font sizes
- Ideal for lengthy resumes

## GitHub Actions

The repository includes a GitHub Actions workflow that:

1. Triggers on push to `main` (when `data/input.json` changes)
2. Triggers manually via workflow dispatch
3. Generates a resume PDF
4. Uploads the PDF as an artifact

### Setup

1. Add your OpenAI API key as a repository secret named `OPENAI_API_KEY`
2. Push changes to `data/input.json` or trigger manually

## Development

```bash
# Build the project
npm run build

# Run the CLI directly
node dist/cli.js generate

# Watch mode (requires additional setup)
npx tsc --watch
```

## Pipeline Flow

```
Input Data → Context Cache → LLM → Markdown → HTML → PDF
```

1. **Input Validation**: Validates input against Zod schema
2. **Context Loading**: Loads relevant context files for LLM
3. **Markdown Generation**: OpenAI generates structured Markdown
4. **Markdown Validation**: Ensures correct heading hierarchy
5. **HTML Conversion**: Converts Markdown to HTML using marked
6. **Style Application**: Converts JSON theme to CSS
7. **Template Rendering**: Injects HTML and CSS into template
8. **PDF Generation**: Renders PDF using Puppeteer

## License

ISC
