import LoginForm from '@/components/auth/LoginForm';

export default function CandidateLoginPage() {
  return (
    <div className="flex flex-col bg-[#f8f9fa]">
      <main className="flex-1 flex flex-col items-center justify-center p-4 mt-20">
        <h2 className="text-3xl font-bold text-slate-700 mb-8">Sign In</h2>
        <LoginForm
          role="candidate"
          defaultEmail="candidate@akij.com"
          redirectPath="/candidate/dashboard"
        />
      </main>
    </div>
  );
}
