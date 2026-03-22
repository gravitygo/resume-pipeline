import { z } from 'zod';

// Contact information schema
export const ContactSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  location: z.string().optional(), // City, State/Country
});

export type Contact = z.infer<typeof ContactSchema>;

// Professional links schema
export const LinksSchema = z.object({
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  website: z.string().url().optional(),
  other: z.array(z.object({
    label: z.string(),
    url: z.string().url(),
  })).optional(),
});

export type Links = z.infer<typeof LinksSchema>;

// Experience schema and type
export const ExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  job: z.string().min(1, 'Job title is required'),
  job_description: z.string().min(1, 'Job description is required'),
  location: z.string().optional(), // City, State/Country
  start_date: z.string().optional(), // e.g., "Jan 2020" or "2020-01"
  end_date: z.string().optional(), // e.g., "Dec 2023" or "Present"
});

export type Experience = z.infer<typeof ExperienceSchema>;

// Education schema
export const EducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'), // e.g., "Bachelor of Science"
  field: z.string().optional(), // e.g., "Computer Science"
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(), // Graduation date or expected
  gpa: z.string().optional(), // e.g., "3.8/4.0"
  honors: z.array(z.string()).optional(), // e.g., ["Magna Cum Laude", "Dean's List"]
  relevant_courses: z.array(z.string()).optional(),
});

export type Education = z.infer<typeof EducationSchema>;

// Project schema
export const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Project description is required'),
  technologies: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Target job schema - represents a job the user is applying to
export const TargetJobSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(1, 'Job description is required'),
});

export type TargetJob = z.infer<typeof TargetJobSchema>;

// Certification schema with more details
export const CertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().optional(), // e.g., "Amazon Web Services"
  date: z.string().optional(), // Issue date
  expiry_date: z.string().optional(),
  credential_id: z.string().optional(),
  url: z.string().url().optional(),
});

export type Certification = z.infer<typeof CertificationSchema>;

// Resume input schema and type
export const ResumeInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(), // Professional title, e.g., "Senior Software Engineer"
  contact: ContactSchema.optional(),
  links: LinksSchema.optional(),
  summary: z.string().optional(), // Optional pre-written summary
  experiences: z.array(ExperienceSchema).min(1, 'At least one experience is required'),
  education: z.array(EducationSchema).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.union([
    z.array(z.string()), // Simple string array for backward compatibility
    z.array(CertificationSchema), // Detailed certification objects
  ]).optional(),
  projects: z.array(ProjectSchema).optional(),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.string().optional(), // e.g., "Native", "Fluent", "Intermediate"
  })).optional(),
  volunteer: z.array(z.object({
    organization: z.string(),
    role: z.string(),
    description: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })).optional(),
  awards: z.array(z.object({
    title: z.string(),
    issuer: z.string().optional(),
    date: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  // Target jobs the user is applying to - generates tailored resume for each
  targetJobs: z.array(TargetJobSchema).optional(),
});

export type ResumeInput = z.infer<typeof ResumeInputSchema>;

// Style configuration types
export interface StyleProperties {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  borderBottom?: string;
  borderTop?: string;
  lineHeight?: string;
  textAlign?: string;
  textTransform?: string;
  letterSpacing?: string;
}

export interface StyleConfig {
  h1?: StyleProperties;
  h2?: StyleProperties;
  h3?: StyleProperties;
  p?: StyleProperties;
  ul?: StyleProperties;
  li?: StyleProperties;
  body?: StyleProperties;
  a?: StyleProperties;
}


