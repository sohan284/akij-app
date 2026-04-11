'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Exam } from '@/lib/redux/slices/testSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/shared/Navbar';
import { ChevronLeft, Undo2, Redo2, Bold, Italic, Underline, List, ChevronDown } from 'lucide-react';
import { useExamTracking } from '@/hooks/useExamTracking';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import Image from 'next/image';
import successIcon from '@/app/assets/success.png';
import timeupIcon from '@/app/assets/timeup.png';

export default function ExamScreen() {
  const user = useSelector((state: RootState) => state.auth.user);

  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const { tabSwitches, fullscreenExits, enterFullscreen } = useExamTracking();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get('/api/tests');
        const foundExam = response.data.find((e: Exam) => e.id === id);
        if (foundExam) {
          setExam(foundExam);
          setTimeLeft(foundExam.duration * 60);
        }
      } catch (error) {
        console.error('Failed to fetch exam', error);
      }
    };
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (tabSwitches > 0) {
      toast.warning(`Warning: Tab switch detected! (${tabSwitches})`, {
        description: 'Suspicious behavior is being tracked.',
      });
    }
  }, [tabSwitches]);

  useEffect(() => {
    if (fullscreenExits > 0) {
      toast.error('Fullscreen exited!', {
        description: 'Please maintain fullscreen during the exam.',
      });
    }
  }, [fullscreenExits]);

  const submitToServer = useCallback(async () => {
    try {
      await axios.post(`/api/tests/${id}/submit`, {
        candidateEmail: user?.email || 'candidate@akij.com',
        answers,
        tabSwitches,
        fullscreenExits,
      });
    } catch (error) {
      console.error('Failed to submit exam', error);
    }
  }, [id, answers, tabSwitches, fullscreenExits, user]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);
    await submitToServer();
    toast.success('Assessment submitted successfully!');
  }, [submitToServer]);

  const handleTimeout = useCallback(async () => {
    setIsTimedOut(true);
    await submitToServer();
  }, [submitToServer]);

  useEffect(() => {
    if (!exam || isSubmitted || isTimedOut) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, isSubmitted, isTimedOut, handleTimeout]);

  if (!exam) return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-slate-500 text-[14px] md:text-[16px]">Loading assessment...</div>
    </div>
  );

  // Test Completed page (manual submit)
  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-[1200px] border border-slate-100 shadow-sm rounded-2xl px-8 py-10 text-center">
            <div className="flex justify-center mb-5">
              <Image src={successIcon} alt="Success" width={72} height={72} />
            </div>
            <h2 className="text-[18px] md:text-[20px] font-bold text-slate-800 mb-3">Test Completed</h2>
            <p className="text-[14px] md:text-[16px] text-slate-500 max-w-md mx-auto mb-8">
              Congratulations! {user?.email?.split('@')[0] ?? 'Candidate'}, You have completed your exam for <span className="font-semibold text-slate-700">{exam.title}</span>. Thank you for participating.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/candidate/dashboard')}
              className="h-10 px-8 text-[14px] md:text-[16px] w-fit mx-auto rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />

      {/* Header Bar */}
      <div className="container mx-auto pt-10 px-4">
        <div className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-[14px] md:text-[16px] font-bold text-slate-700">Question ({currentQuestionIndex + 1}/{exam.questions.length})</span>
          </div>
          <div className="bg-[#f1f5f9] px-4 py-1.5 rounded-lg flex items-center gap-3">
            <span className="text-[14px] md:text-[16px] font-bold text-slate-800">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} left
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto py-4 px-4 flex flex-col pb-10">
        <Card className="bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-4 md:p-8 flex-1 flex flex-col">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-[14px] md:text-[16px] font-bold text-slate-800 leading-tight flex gap-2">
              <span>Q{currentQuestionIndex + 1}.</span>
              <div dangerouslySetInnerHTML={{ __html: currentQuestion.title }} />
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            {currentQuestion.type === 'radio' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
                className="grid gap-3"
              >
                {currentQuestion.options?.map((opt, i) => (
                  <div key={i} className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${answers[currentQuestion.id] === opt ? 'border-[#6366f1] bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-indigo-100'}`}>
                    <RadioGroupItem value={opt} id={`q-${currentQuestion.id}-opt-${i}`} className="h-5 w-5 border-2 text-[#6366f1]" />
                    <Label htmlFor={`q-${currentQuestion.id}-opt-${i}`} className="flex-1 cursor-pointer text-[14px] md:text-[16px] font-medium text-slate-700">
                      <div dangerouslySetInnerHTML={{ __html: opt }} />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'checkbox' && (
              <div className="grid gap-3">
                {currentQuestion.options?.map((opt, i) => {
                  const val = answers[currentQuestion.id];
                  const currentAnswers = Array.isArray(val) ? val : [];
                  const isChecked = currentAnswers.includes(opt);
                  return (
                    <div key={i} className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isChecked ? 'border-[#6366f1] bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-indigo-100'}`}>
                      <Checkbox
                        id={`q-${currentQuestion.id}-opt-${i}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const newAnswers = checked
                            ? [...currentAnswers, opt]
                            : currentAnswers.filter((a: string) => a !== opt);
                          setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
                        }}
                        className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]"
                      />
                      <Label htmlFor={`q-${currentQuestion.id}-opt-${i}`} className="flex-1 cursor-pointer text-[14px] md:text-[16px] font-medium text-slate-700">
                        {opt}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <div className="flex flex-col h-full min-h-[300px]">
                <div className="border border-slate-100 rounded-xl overflow-hidden flex flex-col h-full bg-[#fcfdfe]">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-white">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Undo2 size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Redo2 size={16} /></Button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <Button variant="ghost" className="h-8 gap-1 text-slate-600 text-[14px] font-medium px-2">
                      Normal text <ChevronLeft className="-rotate-90" size={12} />
                    </Button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><List size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><ChevronDown size={12} /></Button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700 font-bold"><Bold size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 italic"><Italic size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 underline"><Underline size={16} /></Button>
                  </div>
                  <Textarea
                    placeholder="Type your answer here.."
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-[14px] md:text-[16px] p-4 bg-transparent resize-none leading-relaxed text-slate-800"
                    value={answers[exam.questions[currentQuestionIndex].id] as string || ''}
                    onChange={(e) => setAnswers({ ...answers, [exam.questions[currentQuestionIndex].id]: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-0 mt-8 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="h-12 px-6 text-[14px] md:text-[16px] font-bold text-slate-600 border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Skip this Question
            </Button>

            <Button
              onClick={() => {
                if (currentQuestionIndex < exam.questions.length - 1) {
                  setCurrentQuestionIndex(prev => prev + 1);
                } else {
                  handleSubmit();
                }
              }}
              className="h-12 px-8 text-[14px] md:text-[16px] font-bold bg-[#6366f1] hover:bg-[#5355d8] text-white rounded-xl shadow-lg shadow-indigo-100 transition-all"
            >
              {currentQuestionIndex < exam.questions.length - 1 ? 'Save & Continue' : 'Finish & Submit'}
            </Button>
          </div>
        </Card>
      </main>

      {/* Timeout Modal Overlay */}
      {isTimedOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-10 max-w-sm w-full mx-4 text-center">
            <div className="flex justify-center mb-5">
              <Image src={timeupIcon} alt="Time Up" width={72} height={72} />
            </div>
            <h2 className="text-[18px] md:text-[20px] font-bold text-slate-800 mb-3">Timeout!</h2>
            <p className="text-[14px] md:text-[16px] text-slate-500 mb-8">
              Dear {user?.email?.split('@')[0] ?? 'Candidate'}, Your exam time has been finished. Thank you for participating.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/candidate/dashboard')}
              className="h-10 px-8 text-[14px] md:text-[16px] rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
