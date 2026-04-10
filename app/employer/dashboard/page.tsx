'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, LayoutDashboard, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setExams } from '@/lib/redux/slices/testSlice';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const { exams } = useSelector((state: RootState) => state.tests);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get('/api/tests');
        dispatch(setExams(response.data));
      } catch (error) {
        console.error('Failed to fetch tests', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
            <p className="text-muted-foreground">Manage your online assessments and candidates.</p>
          </div>
          <Link href="/employer/create-test" className={cn(buttonVariants(), "shadow-md")}>
            <Plus className="mr-2 h-4 w-4" /> Create New Test
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[250px] w-full rounded-xl" />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl">
            <LayoutDashboard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No tests created yet</h3>
            <p className="text-muted-foreground mb-6">Create your first assessment to start evaluating candidates.</p>
            <Link href="/employer/create-test" className={buttonVariants()}>
              Create New Test
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam.id} className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-sm bg-card/60 backdrop-blur">
                <div className="h-2 bg-primary"></div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{exam.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(exam.startTime), 'MMM d, h:mm a')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users size={14} /> Candidates
                    </span>
                    <span className="font-semibold">{exam.totalCandidates}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <LayoutDashboard size={14} /> Question Sets
                    </span>
                    <span className="font-semibold">{exam.questionSets}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock size={14} /> Duration
                    </span>
                    <span className="font-semibold">{exam.duration} mins</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t pt-4">
                  <Button variant="secondary" className="w-full" size="sm">
                    View Candidates
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
