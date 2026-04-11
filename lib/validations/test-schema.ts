import { z } from 'zod';

export const optionSchema = z.object({
  text: z.string().optional().or(z.literal('')),
  isCorrect: z.boolean().default(false),
});

export const questionSchema = z.object({
  title: z.string().min(1, 'Question title is required'),
  type: z.enum(['radio', 'checkbox', 'text']),
  score: z.coerce.number().min(0).default(1),
  options: z.array(z.string()).optional().default([]),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
});

export const examSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalCandidates: z.coerce.number().min(1, 'At least 1 candidate is required'),
  totalSlots: z.coerce.number().min(1, 'Total slots is required'),
  questionSets: z.coerce.number().min(1, 'Question sets is required'),
  questionType: z.string().min(1, 'Question type is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  duration: z.coerce.number().min(1, 'Duration is required'),
  questions: z.array(questionSchema).optional().default([]),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return new Date(data.endTime) > new Date(data.startTime);
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

export const examSubmissionSchema = z.object({
  candidateEmail: z.string().email(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  tabSwitches: z.coerce.number().default(0),
  fullscreenExits: z.coerce.number().default(0),
});

export type ExamSchema = z.infer<typeof examSchema>;
export type QuestionSchema = z.infer<typeof questionSchema>;
export type CandidateSchema = z.infer<typeof candidateSchema>;
export type ExamSubmissionSchema = z.infer<typeof examSubmissionSchema>;
