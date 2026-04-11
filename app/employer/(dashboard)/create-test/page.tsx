import CreateTestForm from '@/components/employer/CreateTestForm';

export default function CreateTestPage() {
  return (
    <>
      <main className="flex-1 bg-[#F9FAFB] pb-20 mt-6">
        <div className="container mx-auto p-4 md:p-6 max-w-[1244px]">
          <CreateTestForm />
        </div>
      </main>
    </>
  );
}
