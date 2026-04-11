'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login } from '@/lib/redux/slices/authSlice';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  role: 'candidate' | 'employer';
  defaultEmail: string;
  redirectPath: string;
}

export default function LoginForm({ role, defaultEmail, redirectPath }: LoginFormProps) {
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
      email: defaultEmail,
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', data);
      dispatch(login(response.data));
      router.push(redirectPath);
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
    <Card className="border border-slate-100 bg-white flex flex-col w-[80vw] h-[341px] md:w-[571px] md:h-[373px] rounded-[16px] pt-[24px] px-[16px] pb-[24px] md:pt-[32px] md:px-[32px] md:pb-[40px] gap-[10px] shadow-sm">
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
                "h-[56px] rounded-lg border-slate-200 focus:border-[#6366f1] focus:ring-[#6366f1] transition-all px-4 text-[16px] placeholder:text-slate-400 dark:bg-white",
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
                "h-[56px] rounded-lg border-slate-200 focus:border-[#6366f1] focus:ring-[#6366f1] transition-all px-4 text-[16px] placeholder:text-slate-400 dark:bg-white",
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
        <div className="p-0 mt-auto">
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full mb-4 md:my-10"
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
        </div>
      </form>
    </Card>
  );
}
