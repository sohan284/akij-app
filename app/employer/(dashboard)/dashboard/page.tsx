import EmployerTestList from '@/components/employer/EmployerTestList';
import { testService } from '@/lib/services/test-service';

export default async function EmployerDashboard() {
  const exams = await testService.getAllExams();

  return (
    <>
      <main className="flex-1 container mx-auto p-6 max-w-[1244px]">
        <EmployerTestList initialExams={exams} />
      </main>
    </>
  );
}
