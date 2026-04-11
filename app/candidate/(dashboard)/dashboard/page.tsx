import Navbar from '@/components/shared/Navbar';
import CandidateTestList from '@/components/candidate/CandidateTestList';
import { testService } from '@/lib/services/test-service';

export default async function CandidateDashboard() {
  const exams = await testService.getAllExams();

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto p-6 flex flex-col min-h-0">
        <CandidateTestList initialExams={exams} />
      </main>
    </>
  );
}
