// Mock database
import { Exam } from "@/lib/redux/slices/testSlice";

export const exams: Exam[] = [
  {
    id: '1',
    title: 'Frontend Developer Basic Assessment',
    totalCandidates: 50,
    totalSlots: 10,
    questionSets: 1,
    questionType: 'Multiple Choice',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    duration: 60,
    questions: [
      {
        id: 'q1',
        title: 'What is React?',
        type: 'radio',
        options: ['A Library', 'A Framework', 'A Language', 'A Database'],
        correctAnswer: 'A Library',
      },
      {
        id: 'q2',
        title: 'Which hook is used for side effects?',
        type: 'radio',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 'useEffect',
      }
    ],
  }
];

export const users = [
  { id: '1', email: 'employer@akij.com', password: 'password123', role: 'employer' },
  { id: '2', email: 'candidate@akij.com', password: 'password123', role: 'candidate' },
];
