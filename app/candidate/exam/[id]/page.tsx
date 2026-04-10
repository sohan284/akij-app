'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Exam } from '@/lib/redux/slices/testSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2, Undo2, Redo2, Bold, Italic, Underline, List, ListOrdered, Type, ArrowLeft, ChevronDown } from 'lucide-react';
import { useExamTracking } from '@/hooks/useExamTracking';
import { toast } from 'sonner';

export default function ExamScreen() {
  const { id } = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    if (fullscreenExits > 0 && isExamStarted) {
      toast.error('Fullscreen exited!', {
        description: 'Please maintain fullscreen during the exam.',
      });
    }
  }, [fullscreenExits, isExamStarted]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true);
    // In a real app, send answers to server
    toast.success('Assessment submitted successfully!');
    setTimeout(() => router.push('/candidate/dashboard'), 3000);
  }, [router]);

  useEffect(() => {
    if (!isExamStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, isSubmitted, handleSubmit]);

  const startExam = () => {
    setIsExamStarted(true);
    enterFullscreen();
  };

  if (!exam) return <div className="p-8 text-center">Loading assessment...</div>;

  if (!isExamStarted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-xl w-full border-none shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold">{exam.title}</CardTitle>
            <CardDescription className="text-lg">Instruction & Guidelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-bold">{exam.duration} Minutes</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-xl font-bold">{exam.questions.length} Sets</p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900">
              <h4 className="flex items-center gap-2 font-bold mb-2 text-amber-800 dark:text-amber-400">
                <AlertTriangle size={18} /> Important Rules
              </h4>
              <ul className="text-sm space-y-2 text-amber-700 dark:text-amber-500 list-disc pl-5">
                <li>Do NOT switch tabs. Each switch is tracked.</li>
                <li>Stay in Fullscreen mode throughout the exam.</li>
                <li>The exam will auto-submit when the timer hits zero.</li>
                <li>Ensure a stable internet connection.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startExam} className="w-full h-12 text-lg shadow-lg">
              I Understand, Start Exam
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="text-green-600 h-10 w-10" />
        </div>
        <h2 className="text-4xl font-bold mb-2">Well Done!</h2>
        <p className="text-muted-foreground text-xl">Your assessment has been submitted successfully.</p>
        <p className="text-sm text-muted-foreground mt-8">Redirecting to dashboard...</p>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-screen">
      {/* Header Bar */}
      <div className="container mx-auto pt-6 px-4">
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-slate-700">Question ({currentQuestionIndex + 1}/{exam.questions.length})</span>
          </div>
          <div className="bg-[#f1f5f9] px-6 py-2 rounded-xl flex items-center gap-3">
            <span className="text-xl font-bold text-slate-800">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} left
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto py-8 px-4 flex flex-col">
        <Card className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-8 md:p-12 flex-1 flex flex-col">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-2xl font-bold text-slate-800 leading-tight">
              Q{currentQuestionIndex + 1}. {currentQuestion.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            {currentQuestion.type === 'radio' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
                className="grid gap-4"
              >
                {currentQuestion.options?.map((opt, i) => (
                  <div key={i} className={`flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${answers[currentQuestion.id] === opt ? 'border-[#6366f1] bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-indigo-100'}`}>
                    <RadioGroupItem value={opt} id={`q-${currentQuestion.id}-opt-${i}`} className="h-5 w-5 border-2 text-[#6366f1]" />
                    <Label htmlFor={`q-${currentQuestion.id}-opt-${i}`} className="flex-1 cursor-pointer text-lg font-medium text-slate-700">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'checkbox' && (
              <div className="grid gap-4">
                {currentQuestion.options?.map((opt, i) => {
                  const val = answers[currentQuestion.id];
                  const currentAnswers = Array.isArray(val) ? val : [];
                  const isChecked = currentAnswers.includes(opt);
                  return (
                    <div key={i} className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${isChecked ? 'border-[#6366f1] bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-indigo-100'}`}>
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
                      <Label htmlFor={`q-${currentQuestion.id}-opt-${i}`} className="flex-1 cursor-pointer text-lg font-medium text-slate-700">
                        {opt}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <div className="flex flex-col h-full min-h-[400px]">
                <div className="border border-slate-100 rounded-2xl overflow-hidden flex flex-col h-full bg-[#fcfdfe]">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-white">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Undo2 size={18} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Redo2 size={18} /></Button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <Button variant="ghost" className="h-8 gap-1 text-slate-600 font-medium px-2">
                      Normal text <ChevronLeft className="-rotate-90" size={14} />
                    </Button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><List size={18} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><ChevronDown size={14} /></Button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700 font-bold"><Bold size={18} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 italic"><Italic size={18} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 underline"><Underline size={18} /></Button>
                  </div>
                  <Textarea
                    placeholder="Type questions here.."
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg p-6 bg-transparent resize-none leading-relaxed text-slate-800"
                    value={answers[exam.questions[currentQuestionIndex].id] as string || ''}
                    onChange={(e) => setAnswers({ ...answers, [exam.questions[currentQuestionIndex].id]: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-0 mt-12 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="h-14 px-8 text-lg font-bold text-slate-600 border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
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
              className="h-14 px-10 text-lg font-bold bg-[#6366f1] hover:bg-[#5355d8] text-white rounded-2xl shadow-xl shadow-indigo-100 transition-all"
            >
              {currentQuestionIndex < exam.questions.length - 1 ? 'Save & Continue' : 'Finish & Submit'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
