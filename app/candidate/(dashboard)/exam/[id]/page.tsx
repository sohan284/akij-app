import ExamInterface from '@/components/candidate/ExamInterface';
import { testService } from '@/lib/services/test-service';
import { verifySession } from '@/lib/dal';
import { notFound } from 'next/navigation';

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifySession();
  const exam = await testService.getExamById(id);

  if (!exam) {
    notFound();
  }

  return <ExamInterface exam={exam as any} user={session?.user || null} />;
}
