'use client';

import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { login } from '@/lib/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function EmployerLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'employer@akij.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', data);
      dispatch(login(response.data));
      router.push('/employer/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 bg-[#f8f9fa]">
        <h2 className="text-3xl font-bold text-slate-700 mb-8">Sign In</h2>
        <Card 
          className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 bg-white flex flex-col w-[343px] h-[341px] md:w-[571px] md:h-[373px] rounded-[16px] pt-[24px] px-[16px] pb-[24px] md:pt-[32px] md:px-[32px] md:pb-[40px] gap-[10px]"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
            <CardContent className="p-0 flex flex-col" style={{ gap: '10px' }}>
              {error && (
                <Alert variant="destructive" className="rounded-lg py-2 mb-2">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-[14px] font-semibold text-slate-700 ml-0.5">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your primary email address"
                  {...register('email')}
                  className={cn(
                    "h-[56px] rounded-lg border-slate-200 focus:border-[#6366f1] focus:ring-[#6366f1] transition-all px-4 text-[16px] placeholder:text-slate-400",
                    errors.email ? 'border-destructive' : ''
                  )}
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5 ml-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5 pt-1">
                <Label htmlFor="password" className="text-[14px] font-semibold text-slate-700 ml-0.5">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className={cn(
                    "h-[56px] rounded-lg border-slate-200 focus:border-[#6366f1] focus:ring-[#6366f1] transition-all px-4 text-[16px] placeholder:text-slate-400",
                    errors.password ? 'border-destructive' : ''
                  )}
                />
                <div className="flex justify-end mt-1">
                  <Link href="#" className="text-sm font-semibold text-slate-500 hover:text-[#6366f1] transition-colors">
                    Forget Password?
                  </Link>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5 ml-1">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-0 mt-auto">
              <Button 
                type="submit" 
                className="w-full h-[60px] text-[18px] font-bold bg-[#6366f1] hover:bg-[#5a5cd8] text-white rounded-lg shadow-lg shadow-indigo-100 transition-all hover:scale-[0.99]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </>
  );
}
