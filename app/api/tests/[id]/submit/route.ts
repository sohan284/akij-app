import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: examId } = await params;
  try {
    const body = await request.json();
    const { candidateEmail, answers, tabSwitches, fullscreenExits } = body;

    // Find the candidate first
    const candidate = await prisma.candidate.findUnique({
      where: {
        examId_email: {
          examId,
          email: candidateEmail,
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ message: 'Candidate not found for this exam' }, { status: 404 });
    }

    // Save results and update candidate status in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.candidate.update({
        where: { id: candidate.id },
        data: {
          status: 'completed',
          attendedAt: new Date(),
        },
      });

      // Calculate score
      const exam = await tx.exam.findUnique({
        where: { id: examId },
        include: { questions: true },
      });

      if (exam) {
        let totalScore = 0;
        let earnedScore = 0;

        const resultPromises = exam.questions.map(async (q) => {
          const candidateAnswer = answers[q.id];
          let isCorrect = false;

          if (q.type === 'radio') {
            isCorrect = candidateAnswer === q.correctAnswer;
          } else if (q.type === 'checkbox') {
            const correctAnswers = (q.correctAnswer || '').split(',').sort();
            const candidateAnswers = Array.isArray(candidateAnswer) ? [...candidateAnswer].sort() : [];
            isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(candidateAnswers);
          } else if (q.type === 'text') {
            isCorrect = false; 
          }

          totalScore += q.score || 1;
          if (isCorrect) earnedScore += q.score || 1;

          return tx.result.create({
            data: {
              candidateId: candidate.id,
              questionId: q.id,
              answer: typeof candidateAnswer === 'string' ? candidateAnswer : JSON.stringify(candidateAnswer),
              isCorrect,
              tabSwitches: Number(tabSwitches),
              fullscreenExits: Number(fullscreenExits),
            },
          });
        });

        await Promise.all(resultPromises);

        // Update candidate with score (percentage)
        const scorePercentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
        await tx.candidate.update({
          where: { id: candidate.id },
          data: { score: scorePercentage },
        });
      }
    });

    return NextResponse.json({ message: 'Assessment submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Submit assessment error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
