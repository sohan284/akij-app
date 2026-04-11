import prisma from '@/lib/prisma';

export const testService = {
  /**
   * Fetch all exams with their question count
   */
  async getAllExams() {
    return prisma.exam.findMany({
      include: {
        questions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Fetch a single exam by ID
   */
  async getExamById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });
  },

  /**
   * Fetch all candidates for a specific exam
   */
  async getCandidatesByExamId(examId: string) {
    return prisma.candidate.findMany({
      where: { examId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Create a new exam with questions
   */
  async createExam(data: any) {
    const {
      title,
      totalCandidates,
      totalSlots,
      questionSets,
      questionType,
      startTime,
      endTime,
      duration,
      questions
    } = data;

    return prisma.exam.create({
      data: {
        title,
        totalCandidates: Number(totalCandidates),
        totalSlots: Number(totalSlots),
        questionSets: Number(questionSets),
        questionType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: Number(duration),
        questions: {
          create: questions.map((q: any) => ({
            title: q.title,
            type: q.type,
            score: q.score || 1,
            options: q.options || [],
            correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(',') : q.correctAnswer,
          })),
        },
      },
      include: {
        questions: true,
      },
    });
  },

  /**
   * Submit an exam result for a candidate
   */
  async submitExamResult(examId: string, candidateData: any) {
    const { name, email, score, totalQuestions, answers } = candidateData;
    
    return prisma.candidate.create({
      data: {
        examId,
        name,
        email,
        score,
        status: 'completed',
        attendedAt: new Date(),
        // In a real app, you might want to store answers in a separate table
      },
    });
  }
};
