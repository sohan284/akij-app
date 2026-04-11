import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        examId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
    const { name, email } = body;

    const newCandidate = await prisma.candidate.create({
      data: {
        examId: id,
        name,
        email,
        status: 'pending',
      },
    });

    return NextResponse.json(newCandidate, { status: 201 });
  } catch (error) {
    console.error('Create candidate error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
