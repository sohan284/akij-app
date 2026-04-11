'use client';

import { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users, FileText, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import noTestImg from '@/app/assets/noTest.png';

interface Exam {
  id: string;
  title: string;
  totalCandidates?: number;
  duration?: number;
  questions?: any[];
}

interface EmployerTestListProps {
  initialExams: Exam[];
}

export default function EmployerTestList({ initialExams }: EmployerTestListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredExams = initialExams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-[#1E293B]">Online Tests</h1>

        <div className="relative w-full md:w-[452px]">
          <Input
            placeholder="Search by exam title"
            className="h-[44px] pl-4 pr-10 rounded-lg border-slate-200 bg-white shadow-sm focus:border-primary focus:ring-primary"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#F1F5F9] rounded-md text-slate-400">
            <Search size={18} />
          </div>
        </div>

        <Link
          href="/employer/create-test"
          className={buttonVariants({ variant: "default", size: "default" })}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Online Test
        </Link>
      </div>

      {filteredExams.length === 0 ? (
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
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              Create Now
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentExams.map((exam) => (
            <Card key={exam.id} className="bg-white rounded-[20px] p-6 hover:shadow-md transition-shadow border border-slate-100 flex flex-col h-[200px]">
              <div className="flex flex-col h-full gap-5">
                <CardTitle className="text-xl font-bold text-[#1E293B] line-clamp-2 min-h-[56px] leading-[1.4]">
                  {exam.title}
                </CardTitle>

                <div className="flex items-center justify-between text-[#64748B] text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-slate-300" />
                    <span>Candidates: <span className="text-[#1E293B] font-medium">{exam.totalCandidates || '0'}</span></span>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <FileText size={18} className="text-slate-300" />
                    <span>Question Set: <span className="text-[#1E293B] font-medium">{exam.questions?.length || 0}</span></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-slate-300" />
                    <span>Exam Slots: <span className="text-[#1E293B] font-medium">{exam.duration ? Math.ceil(exam.duration / 30) : '0'}</span></span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    href={`/employer/dashboard/${exam.id}/candidates`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    View Candidates
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredExams.length > 0 && (
        <div className="mt-12 flex justify-between items-center pt-6 text-sm text-[#64748B]">
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
              className="border-slate-200"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs">Online Test Per Page</span>
            <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-1.5 bg-white cursor-pointer min-w-[60px] justify-between">
              <span className="font-semibold text-[#1E293B]">{itemsPerPage}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
