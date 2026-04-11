import { NextResponse } from 'next/server';
import { testService } from '@/lib/services/test-service';
import { candidateSchema } from '@/lib/validations/test-schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const candidates = await testService.getCandidatesByExamId(id);
    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Fetch candidates error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const result = candidateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: result.error.format() 
      }, { status: 400 });
    }

    const newCandidate = await testService.addCandidateToExam(id, result.data);
    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error) {
    console.error('Create candidate error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
