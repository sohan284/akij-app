import Navbar from '@/components/shared/Navbar';
import CandidateTable from '@/components/employer/CandidateTable';
import { testService } from '@/lib/services/test-service';
import { notFound } from 'next/navigation';

export default async function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [exam, candidates] = await Promise.all([
    testService.getExamById(id),
    testService.getCandidatesByExamId(id)
  ]);

  if (!exam) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto p-6 max-w-[1244px]">
        <CandidateTable exam={exam as any} initialCandidates={candidates as any} />
      </main>
    </>
  );
}

