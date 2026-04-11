import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, LayoutDashboard, Clock } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Navbar />
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

        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Multi-Step Tests",
                  description: "Create complex exams with multiple question sets and types.",
                  icon: <LayoutDashboard className="h-10 w-10 text-primary" />,
                },
                {
                  title: "Real-time Tracking",
                  description: "Monitor candidate behavior, including tab switches and exit fullscreen.",
                  icon: <Clock className="h-10 w-10 text-primary" />,
                },
                {
                  title: "Automated Grading",
                  description: "Instant results for objective questions with detailed reports.",
                  icon: <Briefcase className="h-10 w-10 text-primary" />,
                },
                {
                  title: "Candidate Management",
                  description: "Easily manage thousands of candidates and track their progress.",
                  icon: <Users className="h-10 w-10 text-primary" />,
                },
              ].map((feature, i) => (
                <Card key={i} className="border-none bg-card/50 backdrop-blur hover:bg-card transition-colors shadow-xs hover:shadow-md">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
