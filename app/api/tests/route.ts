import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        questions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(exams);
  } catch (error) {
    console.error('Fetch exams error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    } = body;

    const newExam = await prisma.exam.create({
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

    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
