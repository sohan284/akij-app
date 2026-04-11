import LoginForm from '@/components/auth/LoginForm';

export default function EmployerLoginPage() {
  return (
    <div className="flex flex-col bg-[#f8f9fa]">
      <main className="flex flex-col items-center justify-center p-4 mt-20">
        <h2 className="text-3xl font-bold text-slate-700 mb-8">Sign In</h2>
        <LoginForm
          role="employer"
          defaultEmail="employer@akij.com"
          redirectPath="/employer/dashboard"
        />
      </main>
    </div>
  );
}
