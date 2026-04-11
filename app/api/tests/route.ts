import { NextResponse } from 'next/server';
import { testService } from '@/lib/services/test-service';
import { examSchema } from '@/lib/validations/test-schema';
import { z } from 'zod';

export async function GET() {
  try {
    const exams = await testService.getAllExams();
    return NextResponse.json(exams);
  } catch (error) {
    console.error('Fetch exams error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = examSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: result.error.format() 
      }, { status: 400 });
    }

    const newExam = await testService.createExam(result.data);
    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
