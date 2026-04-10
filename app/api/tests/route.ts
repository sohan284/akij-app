import { NextResponse } from 'next/server';
import { exams } from '@/lib/db';

export async function GET() {
  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  const exam = await request.json();
  const newExam = {
    ...exam,
    id: Math.random().toString(36).substr(2, 9),
  };
  exams.push(newExam);
  return NextResponse.json(newExam, { status: 201 });
}
