import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'text';
  options?: string[];
  correctAnswer?: string | string[];
}

export interface Exam {
  id: string;
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  questions: Question[];
  negativeMarking?: boolean;
}

interface TestState {
  exams: Exam[];
}

const initialState: TestState = {
  exams: [],
};

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    setExams: (state, action: PayloadAction<Exam[]>) => {
      state.exams = action.payload;
    },
    addExam: (state, action: PayloadAction<Exam>) => {
      state.exams.push(action.payload);
    },
    updateExam: (state, action: PayloadAction<Exam>) => {
      const index = state.exams.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.exams[index] = action.payload;
      }
    },
    deleteExam: (state, action: PayloadAction<string>) => {
      state.exams = state.exams.filter((e) => e.id !== action.payload);
    },
  },
});

export const { setExams, addExam, updateExam, deleteExam } = testSlice.actions;
export default testSlice.reducer;
