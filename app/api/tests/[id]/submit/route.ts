import { NextResponse } from 'next/server';
import { testService } from '@/lib/services/test-service';
import { examSubmissionSchema } from '@/lib/validations/test-schema';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: examId } = await params;
  try {
    const body = await request.json();
    const result = examSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: result.error.format() 
      }, { status: 400 });
    }

    const updatedCandidate = await testService.submitExamResult(examId, result.data);

    if (!updatedCandidate) {
      return NextResponse.json({ message: 'Candidate or Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Assessment submitted successfully',
      score: updatedCandidate.score 
    }, { status: 201 });
  } catch (error) {
    console.error('Submit assessment error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
