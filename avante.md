# COPILOT INSTRUCTIONS — RESUME GENERATION PIPELINE

This file defines how Copilot should behave when generating, modifying, or maintaining code in this repository.

The system’s purpose is to:

- Transform structured user data into standardized resumes
- Generate Markdown resumes via an LLM
- Convert Markdown → HTML → PDF
- Maintain deterministic, consistent, and high-quality outputs

---

# 1. CORE PRINCIPLES

- Keep implementations simple and readable
- Avoid overengineering
- Prefer small, composable functions
- Ensure outputs are deterministic and reproducible
- Avoid unnecessary abstractions
- Optimize for maintainability over cleverness

---

# 2. CODE QUALITY STANDARDS

- Use TypeScript for all logic
- Prefer ES6+ syntax
- Avoid deeply nested logic
- Break down logic into small reusable functions
- Keep functions focused on a single responsibility
- Avoid side effects where possible
- Use explicit return types when helpful

---

# 3. PROJECT ARCHITECTURE

The pipeline follows this flow:

```txt
Input Data → Context Cache → LLM → Markdown → HTML → PDF
```

Modules should be separated into:

- LLM integration
- Context system (summarized knowledge cache)
- Markdown generation
- Markdown parsing
- HTML templating
- PDF rendering
- Configuration (themes, styles)

---

# 4. INPUT DATA CONTRACT

Input data will follow this structure:

```ts
type Experience = {
  company: string;
  job: string;
  job_description: string;
};

type ResumeInput = {
  name: string;
  experiences: Experience[];
  skills?: string[];
  certifications?: string[];
};
```

---

# 5. CONTEXT DIRECTORY SYSTEM (LLM CACHE)

## 5.1 Purpose

The `context/` directory acts as a **pre-summarized knowledge cache** for the LLM.

It is used to:

- Reduce token usage
- Improve response speed
- Provide consistent project understanding
- Avoid repeatedly sending large raw documents

---

## 5.2 Structure

```txt
context/
  project.md
  experiences.md
  skills.md
  templates.md
  rules.md
```

Each file contains **summarized, curated, and stable information**.

---

## 5.3 Rules for Context Files

- Must be concise and summarized
- No raw dumps of large data
- Must be human-readable
- Must avoid duplication
- Should represent stable knowledge
- Should not include dynamic or frequently changing data

---

## 5.4 Usage in LLM Prompts

The LLM prompt MUST include:

- User input
- Relevant context files (concatenated or selectively loaded)

Example:

```txt
System Context:
- project.md
- rules.md

User Input:
- Resume data (JSON)
```

---

## 5.5 Context Loading Strategy

- Only load relevant context files per task
- Avoid sending entire context directory when unnecessary
- Prefer selective inclusion based on task type

---

## 5.6 Updating Context

Context files should be updated when:

- New stable patterns are discovered
- Reusable knowledge is identified
- Prompt performance improves after summarization

---

## 5.7 Design Principle

> Context directory acts as a lightweight knowledge base for the LLM, not a data dump.

---

# 6. LLM USAGE GUIDELINES

- The LLM is responsible only for generating Markdown
- Do NOT let the LLM handle formatting, styling, or PDF generation
- Prompt should enforce strict Markdown structure
- Output must be deterministic and structured
- Always include relevant context files in prompts

---

# 7. MARKDOWN GENERATION RULES

- Markdown must follow a strict schema
- No inline HTML
- No styling in Markdown
- No deviation from heading hierarchy

---

# 8. RENDERING PIPELINE

All resumes must follow:

```txt
Markdown → HTML Template → CSS Injection → PDF
```

Steps:

1. Generate Markdown via LLM
2. Convert Markdown to HTML
3. Inject HTML into a template
4. Apply styles via CSS
5. Render PDF using a headless browser

---

# 9. PDF GENERATION

- Use a headless browser-based renderer
- Ensure print-friendly output
- Enable background graphics
- Use A4 format
- Ensure consistent spacing and margins

---

# 10. TEMPLATE SYSTEM

HTML templates must include:

```html
{{content}}
```

Markdown-generated HTML will be injected into this placeholder.

Templates should:

- Be minimal
- Be reusable
- Avoid hardcoded styles

---

# 11. STYLE SYSTEM

Styling must be defined via a centralized JSON configuration.

- No inline styling in Markdown
- No styling inside generated HTML content
- All styling controlled via style configuration

---

# 12. THEME SUPPORT

Support multiple themes via separate JSON files:

```txt
templates/styles/modern.json
templates/styles/classic.json
templates/styles/compact.json
```

Themes define:

- Typography
- Spacing
- Headings
- Lists
- Layout spacing

---

# 13. CLI BEHAVIOR

The system should expose a CLI:

```bash
npm run generate
npm run generate -- --theme=modern
```

CLI responsibilities:

- Accept input data
- Select theme
- Load context directory
- Trigger pipeline
- Output PDF

---

# 14. GITHUB ACTIONS SUPPORT

The system should support automation via GitHub Actions:

- Trigger on push or manual dispatch
- Use secrets for API keys
- Generate resume PDF as artifact

---

# 15. CONFIGURATION HANDLING

- Use environment variables for sensitive values
- Use `.env` for local development
- Never hardcode API keys
- Validate configuration at runtime

---

# 16. ERROR HANDLING

- Fail fast on invalid input
- Provide clear error messages
- Avoid silent failures
- Validate schemas using a runtime validator

---

# 17. DEPENDENCY GUIDELINES

Prefer lightweight dependencies:

- Markdown parser
- PDF renderer
- Schema validator

Avoid unnecessary heavy frameworks.

---

# 18. OUTPUT CONSISTENCY RULE

Given the same input:

- Markdown output must remain consistent
- HTML output must remain consistent
- PDF output must remain visually consistent

---

# 19. MARKDOWN STANDARDIZATION RULES (CRITICAL)

All resume content must follow a strict Markdown structure.

## 19.1 Markdown Structure Contract

```txt
# → Name (only once, top of document)
## → Sections
### → Sub-entries (job roles)
- → Bullet points
```

---

## 19.2 Section Rules

- `#` must only be used for the candidate name
- `##` must represent major sections
- `###` must represent roles under Experience
- `-` must represent bullet points
- No additional heading levels allowed

---

## 19.3 Required Sections

- Summary
- Experience
- Skills

Optional:

- Certifications
- Projects

---

## 19.4 Example Structure

```md
# John Doe

## Summary

Short professional summary.

## Experience

### Software Engineer — Company X

- Built feature X that improved Y by 40%
- Reduced latency by 25%

### Backend Engineer — Company Y

- Designed APIs
- Improved scalability

## Skills

- React
- Node.js

## Certifications

- AWS Certified Cloud Practitioner
```

---

# 20. STYLE CONFIG SYSTEM (JSON-DRIVEN)

Styling must NOT be embedded in Markdown.

A JSON configuration defines how HTML elements are styled.

---

## 20.1 Example Style Config

```json
{
  "h1": {
    "fontSize": "20pt",
    "fontWeight": "700",
    "marginBottom": "4px"
  },
  "h2": {
    "fontSize": "14pt",
    "fontWeight": "600",
    "borderBottom": "1px solid #ddd",
    "marginTop": "12px"
  },
  "h3": {
    "fontSize": "11pt",
    "fontWeight": "600"
  },
  "p": {
    "fontSize": "11pt",
    "lineHeight": "1.4"
  },
  "ul": {
    "marginLeft": "16px"
  },
  "li": {
    "marginBottom": "4px"
  }
}
```

---

## 20.2 Styling Rules

- All styling must come from JSON config
- Markdown must remain purely structural
- No inline styles allowed
- Themes must be swappable without modifying Markdown

---

# 21. RENDERING PIPELINE (MANDATORY)

All resumes must follow:

```txt
Markdown → HTML → CSS → PDF
```

---

## 21.1 Steps

1. Generate Markdown via LLM (with context files)
2. Convert Markdown → HTML
3. Inject HTML into template
4. Convert style JSON → CSS
5. Inject CSS into template
6. Render PDF using headless browser

---

## 21.2 Requirements

- Output must be ATS-friendly
- Text must be selectable
- Layout must be consistent
- Output must not vary across runs

---

# 22. THEME SUPPORT (OPTIONAL)

Support multiple themes:

```txt
modern.json
classic.json
compact.json
```

CLI selection:

```bash
npm run generate -- --theme=modern
```

---

# 23. CONSISTENCY RULE

All components must stay aligned:

- Markdown structure
- HTML template
- Style configuration
- Context system

Any change in one must be reflected in the others.

---

# 24. FINAL BEHAVIOR

Copilot must ensure:

- Markdown follows strict schema
- Context directory is used for LLM inputs
- Styling is handled only via JSON
- Rendering pipeline is preserved
- Code remains simple, modular, and maintainable
- Output resumes are consistent, clean, and professional
