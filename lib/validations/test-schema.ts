import { z } from 'zod';

export const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
});

export const questionSchema = z.object({
  title: z.string().min(1, 'Question title is required'),
  type: z.enum(['radio', 'checkbox', 'text']),
  score: z.coerce.number().min(1).default(1),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
}).refine((data) => {
  if (data.type !== 'text') {
    return (data.options?.length ?? 0) >= 2;
  }
  return true;
}, {
  message: "At least 2 options are required for MCQ/Checkbox questions",
  path: ["options"],
});

export const examSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalCandidates: z.coerce.number().min(1),
  totalSlots: z.coerce.number().min(1),
  questionSets: z.coerce.number().min(1),
  questionType: z.string().min(1, 'Question type is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  duration: z.coerce.number().min(1),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
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
