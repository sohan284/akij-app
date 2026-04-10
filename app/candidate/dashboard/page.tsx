'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BookOpen, AlertCircle, PlayCircle, Search, FileText, ChevronLeft, ChevronRight, ChevronDown, XCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { setExams } from '@/lib/redux/slices/testSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CandidateDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const { exams } = useSelector((state: RootState) => state.tests);
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('8');

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
      <main className="flex-1 container mx-auto p-6 flex flex-col min-h-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Online Tests</h1>
          <div className="relative w-full md:w-96 group">
            <Input 
              placeholder="Search by exam title" 
              className="pl-4 pr-10 h-11 border-slate-200 rounded-lg focus-visible:ring-[#6366f1] focus-visible:border-[#6366f1] transition-all bg-white text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center">
              <Search className="h-4 w-4 text-[#6366f1]" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[220px] w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <Card className="text-center py-24 border-none shadow-sm bg-muted/5 flex-1 flex flex-col items-center justify-center">
            <CardContent>
              <Search className="mx-auto h-16 w-16 text-slate-200 mb-6" />
              <h3 className="text-2xl font-bold text-slate-400">No assessments found.</h3>
              <p className="max-w-md mx-auto mt-2 text-slate-400/80">
                Try adjusting your search criteria or check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="overflow-hidden border border-slate-100 bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 rounded-2xl flex flex-col p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-[1.35rem] font-bold text-slate-800 leading-tight">
                    {exam.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 mb-6">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px]">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Duration: <span className="text-slate-800">{exam.duration} min</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Question: <span className="text-slate-800">{exam.questions?.length || 0}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <XCircle className="w-4 h-4 text-slate-400" />
                      <span>Negative Marking: <span className="text-slate-800">{exam.negativeMarking ? "-0.25/wrong" : "No"}</span></span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-0 mt-auto">
                  <Link 
                    href={`/candidate/exam/${exam.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }), 
                      "h-11 px-10 text-[15px] font-bold border-indigo-100 text-[#6366f1] hover:bg-indigo-50 hover:text-[#6366f1] hover:border-indigo-200 rounded-xl transition-all"
                    )}
                  >
                    Start
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Footer: Pagination and Per Page */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-slate-50 opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-slate-400 font-medium bg-slate-50 shadow-xs border border-slate-200/50">
              1
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border border-slate-50">
              <ChevronRight className="h-4 w-4 text-[#6366f1]" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
            <span>Online Test Per Page</span>
            <Select value={itemsPerPage} onValueChange={(v) => { if (v) setItemsPerPage(v); }}>
              <SelectTrigger className="w-[70px] h-9 bg-white border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-[#6366f1]">
                <SelectValue placeholder="8" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </main>
    </>
  );
}
