import OpenAI, { AzureOpenAI } from "openai";
import { ResumeInput, TargetJob } from "./types";
import { Config } from "./config";

/**
 * Creates an AI client instance based on the configured provider
 */
export function createAIClient(config: Config): OpenAI {
  if (config.aiProvider === "azure" && config.azureConfig) {
    const { endpoint, apiKey, deploymentName } = config.azureConfig;

    return new OpenAI({
      apiKey: apiKey,
      baseURL: endpoint,
    });
  }

  // Default to OpenAI
  return new OpenAI({ apiKey: config.openaiApiKey });
}

/**
 * Gets the model/deployment name based on the configured provider
 */
export function getModelName(config: Config): string {
  if (config.aiProvider === "azure" && config.azureConfig) {
    return config.azureConfig.deploymentName;
  }
  return config.openaiModel;
}

/**
 * @deprecated Use createAIClient instead
 * Creates an OpenAI client instance
 */
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

/**
 * Builds the system prompt for resume generation
 */
function buildSystemPrompt(context: string, targetJob?: TargetJob): string {
  const targetJobInstructions = targetJob
    ? `
TARGET JOB TAILORING:
You are generating a resume tailored for a specific job application:
- Company: ${targetJob.company}
- Position: ${targetJob.title}
- Job Description: ${targetJob.description}

TAILORING RULES:
1. Emphasize experiences and skills that align with the target job requirements
2. Reframe accomplishments to highlight relevant transferable skills
3. If the candidate's experience differs from the target role, focus on transferable skills and adaptable qualities
4. Prioritize skills mentioned in the job description
5. Write a summary that positions the candidate as a strong fit for this specific role
6. Use keywords from the job description where naturally applicable
7. Do NOT fabricate or exaggerate experience - only reframe existing experience
8. If experience is limited for the role, emphasize learning ability, relevant projects, and passion
`
    : `
GENERAL RESUME:
Generate a comprehensive resume showcasing the candidate's full experience and skills.
Focus on their strongest achievements and most relevant qualifications.
`;

  return `You are a professional resume writer. Your task is to generate a well-structured Markdown resume based on the provided user data.

${context}
${targetJobInstructions}

IMPORTANT RULES:
1. Follow the exact Markdown structure specified below
2. Use # only for the candidate's name (once, at the top)
3. Use ## for major sections (Contact, Summary, Experience, Education, Skills, Projects, Certifications, Languages, Awards)
4. Use ### for job roles under Experience and degrees under Education
5. Use - for bullet points
6. Do NOT use any other heading levels
7. Do NOT include inline HTML or styling
8. Keep bullet points concise and impactful
9. Focus on achievements and quantifiable results
10. Generate a brief professional summary if not provided

SECTION ORDER (include only if data provided):
1. Contact (with professional title if provided)
2. Summary
3. Experience
4. Education
5. Skills
6. Projects
7. Certifications
8. Languages
9. Volunteer Experience
10. Awards

OUTPUT FORMAT:
\`\`\`markdown
# [Name]
[Professional Title if provided]

## Contact

[Location] | [Email] | [Phone]
[LinkedIn] | [GitHub] | [Portfolio]

## Summary

[2-3 sentence professional summary]

## Experience

### [Job Title] — [Company] | [Location]
[Start Date] - [End Date]

- [Achievement/responsibility with impact]
- [Achievement/responsibility with impact]

## Education

### [Degree] in [Field] — [Institution]
[Start Date] - [End Date] | [Location]
GPA: [GPA if provided]

- [Honors/relevant courses if any]

## Skills

- [Skill 1]
- [Skill 2]

## Projects

### [Project Name]
[Technologies used]

- [Description/achievements]

## Certifications

- [Certification Name] — [Issuer] ([Date])

## Languages

- [Language]: [Proficiency]
\`\`\`

Generate ONLY the Markdown content, no explanations or additional text.`;
}

/**
 * Formats contact information for the prompt
 */
function formatContact(input: ResumeInput): string {
  const parts: string[] = [];

  if (input.contact?.location)
    parts.push(`Location: ${input.contact.location}`);
  if (input.contact?.email) parts.push(`Email: ${input.contact.email}`);
  if (input.contact?.phone) parts.push(`Phone: ${input.contact.phone}`);

  return parts.length > 0 ? `CONTACT:\n${parts.join("\n")}` : "";
}

/**
 * Formats professional links for the prompt
 */
function formatLinks(input: ResumeInput): string {
  const parts: string[] = [];

  if (input.links?.linkedin) parts.push(`LinkedIn: ${input.links.linkedin}`);
  if (input.links?.github) parts.push(`GitHub: ${input.links.github}`);
  if (input.links?.portfolio) parts.push(`Portfolio: ${input.links.portfolio}`);
  if (input.links?.website) parts.push(`Website: ${input.links.website}`);
  if (input.links?.other) {
    input.links.other.forEach((link) =>
      parts.push(`${link.label}: ${link.url}`),
    );
  }

  return parts.length > 0 ? `PROFESSIONAL LINKS:\n${parts.join("\n")}` : "";
}

/**
 * Formats experiences for the prompt
 */
function formatExperiences(input: ResumeInput): string {
  return `EXPERIENCES:\n${input.experiences
    .map(
      (exp, i) => `
${i + 1}. Company: ${exp.company}
   Job Title: ${exp.job}
   ${exp.location ? `Location: ${exp.location}` : ""}
   ${exp.start_date ? `Start Date: ${exp.start_date}` : ""}
   ${exp.end_date ? `End Date: ${exp.end_date}` : ""}
   Description: ${exp.job_description}`,
    )
    .join("\n")}`;
}

/**
 * Formats education for the prompt
 */
function formatEducation(input: ResumeInput): string {
  if (!input.education?.length) return "";

  return `EDUCATION:\n${input.education
    .map(
      (edu, i) => `
${i + 1}. Institution: ${edu.institution}
   Degree: ${edu.degree}
   ${edu.field ? `Field of Study: ${edu.field}` : ""}
   ${edu.location ? `Location: ${edu.location}` : ""}
   ${edu.start_date ? `Start Date: ${edu.start_date}` : ""}
   ${edu.end_date ? `End Date: ${edu.end_date}` : ""}
   ${edu.gpa ? `GPA: ${edu.gpa}` : ""}
   ${edu.honors?.length ? `Honors: ${edu.honors.join(", ")}` : ""}
   ${edu.relevant_courses?.length ? `Relevant Courses: ${edu.relevant_courses.join(", ")}` : ""}`,
    )
    .join("\n")}`;
}

/**
 * Formats projects for the prompt
 */
function formatProjects(input: ResumeInput): string {
  if (!input.projects?.length) return "";

  return `PROJECTS:\n${input.projects
    .map(
      (proj, i) => `
${i + 1}. Name: ${proj.name}
   Description: ${proj.description}
   ${proj.technologies?.length ? `Technologies: ${proj.technologies.join(", ")}` : ""}
   ${proj.url ? `URL: ${proj.url}` : ""}
   ${proj.start_date ? `Start Date: ${proj.start_date}` : ""}
   ${proj.end_date ? `End Date: ${proj.end_date}` : ""}`,
    )
    .join("\n")}`;
}

/**
 * Formats certifications for the prompt
 */
function formatCertifications(input: ResumeInput): string {
  if (!input.certifications?.length) return "";

  const certs = input.certifications.map((cert) => {
    if (typeof cert === "string") {
      return `- ${cert}`;
    }
    const parts = [cert.name];
    if (cert.issuer) parts.push(`Issuer: ${cert.issuer}`);
    if (cert.date) parts.push(`Date: ${cert.date}`);
    if (cert.expiry_date) parts.push(`Expires: ${cert.expiry_date}`);
    if (cert.credential_id) parts.push(`Credential ID: ${cert.credential_id}`);
    return `- ${parts.join(" | ")}`;
  });

  return `CERTIFICATIONS:\n${certs.join("\n")}`;
}

/**
 * Formats languages for the prompt
 */
function formatLanguages(input: ResumeInput): string {
  if (!input.languages?.length) return "";

  return `LANGUAGES:\n${input.languages
    .map(
      (lang) =>
        `- ${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ""}`,
    )
    .join("\n")}`;
}

/**
 * Formats volunteer experience for the prompt
 */
function formatVolunteer(input: ResumeInput): string {
  if (!input.volunteer?.length) return "";

  return `VOLUNTEER EXPERIENCE:\n${input.volunteer
    .map(
      (vol, i) => `
${i + 1}. Organization: ${vol.organization}
   Role: ${vol.role}
   ${vol.description ? `Description: ${vol.description}` : ""}
   ${vol.start_date ? `Start Date: ${vol.start_date}` : ""}
   ${vol.end_date ? `End Date: ${vol.end_date}` : ""}`,
    )
    .join("\n")}`;
}

/**
 * Formats awards for the prompt
 */
function formatAwards(input: ResumeInput): string {
  if (!input.awards?.length) return "";

  return `AWARDS:\n${input.awards
    .map(
      (award) =>
        `- ${award.title}${award.issuer ? ` — ${award.issuer}` : ""}${award.date ? ` (${award.date})` : ""}${award.description ? `: ${award.description}` : ""}`,
    )
    .join("\n")}`;
}

/**
 * Builds the user prompt with resume input data
 */
function buildUserPrompt(input: ResumeInput): string {
  const sections: string[] = [
    `Generate a professional resume for the following candidate:`,
    `NAME: ${input.name}`,
    input.title ? `PROFESSIONAL TITLE: ${input.title}` : "",
    formatContact(input),
    formatLinks(input),
    input.summary ? `SUMMARY (use as provided):\n${input.summary}` : "",
    formatExperiences(input),
    formatEducation(input),
    input.skills?.length
      ? `SKILLS:\n${input.skills.map((s) => `- ${s}`).join("\n")}`
      : "",
    formatProjects(input),
    formatCertifications(input),
    formatLanguages(input),
    formatVolunteer(input),
    formatAwards(input),
    `\nGenerate the resume in Markdown format following the structure rules provided. Only include sections that have data.`,
  ];

  return sections.filter((s) => s.length > 0).join("\n\n");
}

/**
 * Generates a Markdown resume using the OpenAI API
 */
export async function generateMarkdownResume(
  client: OpenAI,
  model: string,
  input: ResumeInput,
  context: string,
  targetJob?: TargetJob,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context, targetJob);
  const userPrompt = buildUserPrompt(input);

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    // temperature: 0.3, // lower temperature for more consistent output
    // max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  // const content = response.output_text;

  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  // Clean up the response - remove markdown code blocks if present
  let markdown = content.trim();
  if (markdown.startsWith("```markdown")) {
    markdown = markdown.slice(11);
  } else if (markdown.startsWith("```md")) {
    markdown = markdown.slice(5);
  } else if (markdown.startsWith("```")) {
    markdown = markdown.slice(3);
  }
  if (markdown.endsWith("```")) {
    markdown = markdown.slice(0, -3);
  }

  return markdown.trim();
}
