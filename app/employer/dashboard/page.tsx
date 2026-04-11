'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Users, LayoutDashboard, Clock, Calendar, FileText, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setExams } from '@/lib/redux/slices/testSlice';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import noTestImg from '@/app/assets/noTest.png';

export default function EmployerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto p-6 max-w-[1244px]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-[#1E293B]">Online Tests</h1>

          <div className="relative w-full md:w-[452px]">
            <Input
              placeholder="Search by exam title"
              className="h-[44px] pl-4 pr-10 rounded-lg border-slate-200 bg-white shadow-sm focus:border-primary focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#F1F5F9] rounded-md text-slate-400">
              <Search size={18} />
            </div>
          </div>

          <Link
            href="/employer/create-test"
            className={cn(
              buttonVariants(),
              "bg-primary hover:bg-primary/90 text-white px-6 h-[44px] rounded-lg font-semibold shadow-md border-none"
            )}
          >
            Create Online Test
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[250px] w-full rounded-xl" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="flex mt-20 bg-white h-[270px] flex-col items-center justify-center py-20 animate-in fade-in rounded-lg transition-all duration-500">
            <div className="relative w-full max-w-[400px] mb-8">
              <Image
                src={noTestImg}
                alt="No Tests"
                className="w-40 h-32 mx-auto object-contain"
              />
            </div>
            <h3 className="text-[22px] font-bold text-[#1E293B] mb-3">
              {searchQuery ? 'No Results Found' : 'No assessment yet?'}
            </h3>
            <p className="text-[#64748B] text-center max-w-[480px] leading-relaxed mb-10">
              {searchQuery
                ? `We couldn't find any assessments matching "${searchQuery}". Please try a different search term.`
                : 'Your created assessments will appear here. Start by creating a new online test to evaluate your candidates.'}
            </p>
            {!searchQuery && (
              <Link
                href="/employer/create-test"
                className={cn(
                  buttonVariants(),
                  "bg-primary hover:bg-primary/90 text-white px-10 h-[50px] rounded-xl font-bold shadow-lg shadow-indigo-100 border-none transition-all hover:scale-[1.02]"
                )}
              >
                Create Now
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="bg-white rounded-[16px] p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col h-full gap-6">
                  <CardTitle className="text-xl font-bold text-[#1E293B] line-clamp-2 min-h-[56px] leading-[1.4]">
                    {exam.title}
                  </CardTitle>

                  <div className="flex items-center justify-between text-[#64748B] text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-slate-300" />
                      <span>Candidates: <span className="text-[#1E293B] font-medium">{exam.totalCandidates || 'Not Set'}</span></span>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <FileText size={18} className="text-slate-300" />
                      <span>Question Set: <span className="text-[#1E293B] font-medium">{exam.questions?.length || 0}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-slate-300" />
                      <span>Exam Slots: <span className="text-[#1E293B] font-medium">{exam.duration ? Math.ceil(exam.duration / 30) : 'Not Set'}</span></span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-white rounded-lg px-6 h-[40px] font-semibold transition-all"
                    >
                      View Candidates
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredExams.length > 0 && (
          <div className="mt-12 flex justify-between items-center pt-6 text-sm text-[#64748B]">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-slate-200">
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" className="h-8 w-8 rounded-md bg-slate-50 font-semibold text-[#1E293B]">
                1
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-slate-200">
                <ChevronRight size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs">Online Test Per Page</span>
              <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-1.5 bg-white cursor-pointer min-w-[60px] justify-between">
                <span className="font-semibold text-[#1E293B]">8</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
