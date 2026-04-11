import 'server-only';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

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
   * Add a new candidate to an exam
   */
  async addCandidateToExam(examId: string, data: { name: string; email: string }) {
    return prisma.candidate.create({
      data: {
        examId,
        ...data,
        status: 'pending',
      },
    });
  },

  /**
   * Submit an exam result for a candidate with full scoring and tracking
   */
  async submitExamResult(examId: string, submission: { candidateEmail: string; answers: any; tabSwitches: number; fullscreenExits: number }) {
    const { candidateEmail, answers, tabSwitches, fullscreenExits } = submission;

    // Find the candidate first
    const candidate = await prisma.candidate.findUnique({
      where: {
        examId_email: {
          examId,
          email: candidateEmail,
        },
      },
    });

    if (!candidate) return null;

    // Save results and update candidate status in a transaction
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Fetch exam with questions for scoring
      const exam = await tx.exam.findUnique({
        where: { id: examId },
        include: { questions: true },
      });

      if (!exam) return null;

      let totalScore = 0;
      let earnedScore = 0;

      // Save each result and calculate score
      const resultPromises = exam.questions.map((q) => {
        const candidateAnswer = answers[q.id];
        let isCorrect = false;

        if (q.type === 'radio') {
          isCorrect = candidateAnswer === q.correctAnswer;
        } else if (q.type === 'checkbox') {
          const correctAnswers = (q.correctAnswer || '').split(',').sort();
          const candidateAnswers = Array.isArray(candidateAnswer) ? [...candidateAnswer].sort() : [];
          isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(candidateAnswers);
        } else if (q.type === 'text') {
          isCorrect = false; // Subjective needs manual marking
        }

        totalScore += q.score || 1;
        if (isCorrect) earnedScore += q.score || 1;

        return tx.result.create({
          data: {
            candidateId: candidate.id,
            questionId: q.id,
            answer: typeof candidateAnswer === 'string' ? candidateAnswer : JSON.stringify(candidateAnswer),
            isCorrect,
            tabSwitches,
            fullscreenExits,
          },
        });
      });

      await Promise.all(resultPromises);

      // Update candidate with score (percentage) and status
      const scorePercentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
      
      return tx.candidate.update({
        where: { id: candidate.id },
        data: { 
          score: scorePercentage,
          status: 'completed',
          attendedAt: new Date(),
        },
      });
    });
  }
};
