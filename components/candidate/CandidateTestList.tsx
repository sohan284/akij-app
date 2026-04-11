'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, FileText, XCircle, Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import noTestImg from '@/app/assets/noTest.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exam {
  id: string;
  title: string;
  duration: number;
  negativeMarking: boolean;
  questions?: any[];
}

interface CandidateTestListProps {
  initialExams: Exam[];
}

export default function CandidateTestList({ initialExams }: CandidateTestListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('8');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredExams = initialExams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExams.length / Number(itemsPerPage));
  const indexOfLastItem = currentPage * Number(itemsPerPage);
  const indexOfFirstItem = indexOfLastItem - Number(itemsPerPage);
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Online Tests</h1>
        <div className="relative w-full md:w-96 group">
          <Input
            placeholder="Search by exam title"
            className="pl-4 pr-10 h-11 border-slate-200 rounded-lg focus-visible:ring-primary focus-visible:border-primary transition-all bg-white text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center">
            <Search className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <div className="flex mt-8 bg-white h-[270px] flex-col items-center justify-center py-20 animate-in fade-in rounded-lg transition-all duration-500">
          <div className="relative w-full max-w-[400px] mb-8">
            <Image
              src={noTestImg}
              alt="No Tests"
              className="w-40 h-32 mx-auto object-contain"
            />
          </div>
          <h3 className="text-[22px] font-bold text-[#1E293B] mb-3">
            {searchQuery ? 'No Results Found' : 'No assessments yet?'}
          </h3>
          <p className="text-[#64748B] text-center max-w-[480px] leading-relaxed">
            {searchQuery
              ? `We couldn't find any assessments matching "${searchQuery}". Please try a different search term.`
              : 'Your assigned assessments will appear here. Please check back later or contact your employer.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {currentExams.map((exam) => (
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

              <div className="mt-auto">
                <Link
                  href={`/candidate/exam/${exam.id}`}
                  className={buttonVariants({ variant: "outline", size: "default" })}
                >
                  Start
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Footer: Pagination and Per Page */}
      {filteredExams.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon-xs" 
              className="border-slate-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button variant="default" size="xs">
              {currentPage}
            </Button>
            <Button 
              variant="outline" 
              size="icon-xs" 
              className="border-slate-200 text-primary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
            <span>Online Test Per Page</span>
            <Select value={itemsPerPage} onValueChange={(v) => { if (v) { setItemsPerPage(v); setCurrentPage(1); } }}>
              <SelectTrigger className="w-[70px] h-9 bg-white border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-primary">
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
      )}
    </div>
  );
}
