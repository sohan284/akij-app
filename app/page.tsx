import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, LayoutDashboard, Clock } from 'lucide-react';

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <section className="py-24 px-4 bg-linear-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
              Online Assessment <br /> Made Simple
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A comprehensive platform for employers to create assessments and candidates to demonstrate their skills in a secure environment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/employer/login"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all")}
              >
                I am an Employer
              </Link>
              <Link
                href="/candidate/login"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full px-8 h-12 text-lg shadow-sm")}
              >
                I am a Candidate
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
