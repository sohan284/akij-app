'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  PencilLine,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import RichTextEditor from '@/components/shared/RichTextEditor';

// --- Schemas ---

const optionSchema = z.object({
  text: z.string().optional().or(z.literal('')),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  title: z.string().min(1, 'Question title is required'),
  type: z.enum(['radio', 'checkbox', 'text']),
  score: z.coerce.number().min(0).default(1),
  options: z.array(optionSchema).optional().default([]),
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalCandidates: z.coerce.number().min(1, 'At least 1 candidate is required'),
  totalSlots: z.string().optional().default(''),
  questionSets: z.string().optional().default(''),
  questionType: z.string().optional().default(''),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  duration: z.coerce.number().min(1, 'Duration is required'),
  questions: z.array(questionSchema).optional().default([]),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return new Date(data.endTime) > new Date(data.startTime);
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

type FormValues = z.infer<typeof formSchema>;

const stripHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// --- Components ---

interface QuestionCardProps {
  index: number;
  question: any;
  onEdit: () => void;
  onRemove: () => void;
}

function QuestionCard({ index, question, onEdit, onRemove }: QuestionCardProps) {
  return (
    <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[20px] bg-white overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <span className="text-lg font-bold text-slate-700">Question {index + 1}</span>
          <div className="flex items-center gap-2">
            <div className="bg-slate-50 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-md border border-slate-100 uppercase tracking-wider">
              {question.type === 'text' ? 'Subjective' : question.type === 'radio' ? 'MCQ' : 'Checkbox'}
            </div>
            <div className="bg-slate-50 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-md border border-slate-100 uppercase tracking-wider">
              {question.score} pt
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-md font-bold text-slate-800 leading-relaxed mb-6">
            <div dangerouslySetInnerHTML={{ __html: question.title }} />
          </h3>

          {question.type === 'text' ? (
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 text-sm text-slate-500 italic leading-relaxed">
              Subjective answer area...
            </div>
          ) : (
            <div className="space-y-3">
              {question.options?.map((opt: any, idx: number) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                    opt.isCorrect
                      ? "border-green-100 bg-green-50/30 ring-1 ring-green-100"
                      : "border-slate-50 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                    <div className="text-sm font-medium text-slate-600" dangerouslySetInnerHTML={{ __html: opt.text }} />
                  </div>
                  {opt.isCorrect && (
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check size={12} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/5"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-50"
            onClick={onRemove}
          >
            Remove From Exam
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function CreateTestPage() {
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [modalErrors, setModalErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      totalCandidates: 1,
      totalSlots: '',
      questionSets: '',
      questionType: '',
      startTime: '',
      endTime: '',
      duration: 60,
      questions: [],
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "questions"
  });

  const watchAllFields = watch();

  const [currentModalQuestion, setCurrentModalQuestion] = useState<any>({
    title: '',
    type: 'checkbox',
    score: 1,
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]
  });

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Updating online test...');

    try {
      const formattedData = {
        ...data,
        questions: data.questions.map(q => ({
          ...q,
          options: q.options?.map(o => o.text),
          correctAnswer: q.options?.filter(o => o.isCorrect).map(o => o.text)
        }))
      };
      await axios.post('/api/tests', formattedData);
      toast.success('Test updated successfully!', { id: toastId });
      router.push('/employer/dashboard');
    } catch (error: any) {
      console.error('Failed to update test', error);
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      toast.error(`Failed to update test: ${errorMessage}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingQuestionIndex(null);
    setModalErrors([]);
    setCurrentModalQuestion({
      title: '',
      type: 'checkbox',
      score: 1,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]
    });
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (addMore = false) => {
    const errors: string[] = [];
    if (!stripHtml(currentModalQuestion.title).trim()) {
      errors.push("Question title is required.");
    }

    if (errors.length > 0) {
      setModalErrors(errors);
      return;
    }

    setModalErrors([]);

    if (editingQuestionIndex !== null) {
      update(editingQuestionIndex, currentModalQuestion);
    } else {
      append(currentModalQuestion);
    }

    if (addMore) {
      setCurrentModalQuestion({
        title: '',
        type: 'checkbox',
        score: 1,
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ]
      });
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F9FAFB] pb-20 mt-6">
        <div className="container mx-auto p-4 md:p-6 max-w-[1244px]">

          {/* Header Card */}
          <Card className="mb-8 border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-[16px] overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col gap-6 w-full">
                <h1 className="text-xl font-bold text-[#1E293B]">Manage Online Test</h1>

                {/* Stepper */}
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      step >= 1 ? "bg-primary text-white" : "border-2 border-slate-200 text-slate-400"
                    )}>
                      {step > 1 ? <Check size={14} strokeWidth={3} /> : "1"}
                    </div>
                    <span className={cn("text-xs font-bold", step >= 1 ? "text-[#1E293B]" : "text-slate-400 uppercase tracking-wide")}>Basic Info</span>
                  </div>

                  <div className="h-[1px] w-12 bg-slate-200" />

                  <div className="flex items-center gap-2 shrink-0">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      step >= 2 ? "bg-primary text-white" : "border-2 border-slate-200 text-slate-400"
                    )}>
                      {step > 2 ? <Check size={14} strokeWidth={3} /> : "2"}
                    </div>
                    <span className={cn("text-xs font-bold", step >= 2 ? "text-[#1E293B]" : "text-slate-400 uppercase tracking-wide")}>Questions Sets</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/employer/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>

          {/* Form Content */}
          <div className="max-w-[1000px] mx-auto">

            {/* Step 1 Summary View - Visible when on Step 2 */}
            {step === 2 && (
              <Card className="mb-8 border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[20px] bg-white overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-[#1E293B]">Basic Information</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                      className="text-primary hover:bg-primary/5 gap-2"
                    >
                      <PencilLine size={16} /> Edit
                    </Button>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Online Test Title</span>
                      <p className="text-md font-bold text-slate-700">{watchAllFields.title || 'Psychometric Test for Management Trainee Officer'}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Candidates</span>
                        <p className="text-md font-bold text-slate-700">{watchAllFields.totalCandidates?.toLocaleString() || '10,000'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Slots</span>
                        <p className="text-md font-bold text-slate-700">{watchAllFields.totalSlots || '3'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Question Set</span>
                        <p className="text-md font-bold text-slate-700">{watchAllFields.questionSets || '2'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Duration Per Slots(Minutes)</span>
                        <p className="text-md font-bold text-slate-700">{watchAllFields.duration || '30'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Question Type</span>
                        <p className="text-md font-bold text-slate-700">{watchAllFields.questionType || 'MCQ'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[20px] overflow-hidden bg-white">
                  <div className="p-8">
                    <h2 className="text-lg font-bold text-[#1E293B] mb-8">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2 col-span-2">
                        <Label className="text-sm font-bold text-slate-700">Online Test Title <span className="text-red-500">*</span></Label>
                        <Input
                          {...register('title')}
                          placeholder="Enter online test title"
                          className="h-14 rounded-xl border-slate-200 focus:ring-primary focus:border-primary px-4"
                        />
                        {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Total Candidates <span className="text-red-500">*</span></Label>
                        <Input
                          type="number"
                          {...register('totalCandidates')}
                          placeholder="Enter total candidates"
                          className="h-14 w-full rounded-xl border-slate-200 focus:ring-primary focus:border-primary px-4"
                        />
                        {errors.totalCandidates && <p className="text-xs text-red-500 font-medium">{errors.totalCandidates.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Total Slots <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(v) => setValue('totalSlots', v as string)} defaultValue={watchAllFields.totalSlots}>
                          <SelectTrigger className="h-14 w-full rounded-xl border-slate-200 px-4 focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Select total slots" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Slots</SelectItem>
                            {/* <SelectItem value="2">2 Slots</SelectItem>
                            <SelectItem value="3">3 Slots</SelectItem>
                            <SelectItem value="4">4 Slots</SelectItem>
                            <SelectItem value="5">5 Slots</SelectItem>
                            <SelectItem value="10">10 Slots</SelectItem> */}
                          </SelectContent>
                        </Select>
                        {errors.totalSlots && <p className="text-xs text-red-500 font-medium">{errors.totalSlots.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Total Question Set <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(v) => setValue('questionSets', v as string)} defaultValue={watchAllFields.questionSets}>
                          <SelectTrigger className="h-14 w-full rounded-xl border-slate-200 px-4 focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Select total question set" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            {/* <SelectItem value="2">2</SelectItem> */}
                          </SelectContent>
                        </Select>
                        {errors.questionSets && <p className="text-xs text-red-500 font-medium">{errors.questionSets.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Question Type <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(v) => setValue('questionType', v as string)} defaultValue={watchAllFields.questionType}>
                          <SelectTrigger className="h-14 w-full rounded-xl border-slate-200 px-4 focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MCQ">MCQ</SelectItem>
                            {/* <SelectItem value="Checkbox">Checkbox</SelectItem>
                            <SelectItem value="Subjective">Subjective</SelectItem> */}
                          </SelectContent>
                        </Select>
                        {errors.questionType && <p className="text-xs text-red-500 font-medium">{errors.questionType.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Start Time <span className="text-red-500">*</span></Label>
                        <Input
                          type="datetime-local"
                          {...register('startTime')}
                          className="h-14 w-full rounded-xl border-slate-200 px-4"
                        />
                        {errors.startTime && <p className="text-xs text-red-500 font-medium">{errors.startTime.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">End Time <span className="text-red-500">*</span></Label>
                        <Input
                          type="datetime-local"
                          {...register('endTime')}
                          className="h-14 w-full rounded-xl border-slate-200 px-4"
                        />
                        {errors.endTime && <p className="text-xs text-red-500 font-medium">{errors.endTime.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Duration</Label>
                        <Input
                          type="number"
                          {...register('duration')}
                          placeholder="Duration Time"
                          className="h-14 w-full rounded-xl border-slate-200 bg-slate-50 px-4"
                        />
                        {errors.duration && <p className="text-xs text-red-500 font-medium">{errors.duration.message}</p>}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[20px] bg-white">
                  <div className="p-6 md:p-8 flex justify-between gap-4">
                    <Button
                      variant="outline"
                      size="xl"
                      className="flex-1"
                      onClick={() => router.push('/employer/dashboard')}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="xl"
                      className="flex-1"
                      disabled={isSubmitting}
                      onClick={async () => {
                        const isValid = await form.trigger(['title', 'totalCandidates', 'totalSlots', 'questionSets', 'questionType', 'startTime', 'endTime', 'duration']);
                        if (isValid) {
                          setStep(2);
                        } else {
                          console.log('Step 1 Errors:', errors);
                        }
                      }}
                    >
                      Save & Continue
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-8">

                {/* Detailed Question Cards */}
                {fields.map((field, index) => (
                  <QuestionCard
                    key={field.id}
                    index={index}
                    question={field}
                    onEdit={() => {
                      setEditingQuestionIndex(index);
                      setModalErrors([]);
                      setCurrentModalQuestion(field);
                      setIsModalOpen(true);
                    }}
                    onRemove={() => remove(index)}
                  />
                ))}

                {/* Add Question Button at the bottom */}
                <div className="pt-4">
                  <Button
                    variant="default"
                    size="xl"
                    className="w-full"
                    onClick={openAddModal}
                  >
                    <Plus className="mr-2" /> Add Question
                  </Button>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  {Object.keys(errors).length > 0 && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                      <AlertCircle size={18} className="shrink-0" />
                      <p>Please complete all Basic Information fields before saving the test.</p>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <Button
                      variant="outline"
                      size="xl"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="xl"
                      className="flex-1"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.preventDefault();
                        form.handleSubmit(onSubmit, (err) => {
                          console.error('Validation Errors:', err);
                        })();
                      }}
                    >
                      {isSubmitting ? 'Updating...' : 'Save & Continue'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Add Question Modal --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent style={{ maxWidth: '950px' }} className="p-0 rounded-[24px] overflow-hidden gap-0">
            <DialogHeader className="p-6 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-slate-200 text-slate-400 text-xs font-bold">
                  {editingQuestionIndex !== null ? editingQuestionIndex + 1 : fields.length + 1}
                </div>
                <DialogTitle className="text-xl font-bold text-slate-700">Question {editingQuestionIndex !== null ? editingQuestionIndex + 1 : fields.length + 1}</DialogTitle>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm font-bold text-slate-500">Score:</span>
                  <Input
                    type="number"
                    value={currentModalQuestion.score}
                    onChange={(e) => setCurrentModalQuestion({ ...currentModalQuestion, score: e.target.value })}
                    className="w-16 h-8 text-center bg-slate-50/50 rounded-md border-slate-200 font-bold"
                  />
                </div>

                <Select
                  value={currentModalQuestion.type}
                  onValueChange={(v) => {
                    const newOpts = [...currentModalQuestion.options];
                    if (v === 'radio') {
                      let foundCorrect = false;
                      newOpts.forEach(o => {
                        if (foundCorrect) o.isCorrect = false;
                        if (o.isCorrect) foundCorrect = true;
                      });
                    }
                    setCurrentModalQuestion({ ...currentModalQuestion, type: v, options: newOpts });
                  }}
                >
                  <SelectTrigger className="h-9 w-[130px] rounded-lg border-slate-200 text-slate-600 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="text">Subjective</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="text-slate-300">
                  <Trash2 size={20} />
                </Button>
              </div>
            </DialogHeader>

            <div className="p-6 pb-0">
              {modalErrors.length > 0 && (
                <div className="flex flex-col gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle size={18} />
                    <span>Requirement Missing</span>
                  </div>
                  <ul className="list-disc list-inside pl-1 space-y-1">
                    {modalErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">

              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary transition-all">
                <RichTextEditor
                  content={currentModalQuestion.title}
                  onChange={(content) => setCurrentModalQuestion({ ...currentModalQuestion, title: content })}
                  placeholder="Type your question here..."
                />
              </div>

              {currentModalQuestion.type !== 'text' && (
                <div className="space-y-6">
                  {currentModalQuestion.options.map((opt: any, idx: number) => (
                    <div key={idx} className="space-y-3 pl-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`opt-${idx}`}
                              checked={opt.isCorrect}
                              onCheckedChange={(checked) => {
                                const newOpts = currentModalQuestion.options.map((o: any, i: number) => ({
                                  ...o,
                                  isCorrect: currentModalQuestion.type === 'radio'
                                    ? (i === idx ? !!checked : false)
                                    : (i === idx ? !!checked : o.isCorrect)
                                }));
                                setCurrentModalQuestion({ ...currentModalQuestion, options: newOpts });
                              }}
                              className={cn(
                                "h-4 w-4 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                                currentModalQuestion.type === 'radio' && "rounded-full"
                              )}
                            />
                            <Label htmlFor={`opt-${idx}`} className="text-xs font-bold text-slate-500 cursor-pointer">Set as correct answer</Label>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-400" onClick={() => {
                          const newOpts = currentModalQuestion.options.filter((_: any, i: number) => i !== idx);
                          setCurrentModalQuestion({ ...currentModalQuestion, options: newOpts });
                        }}>
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:border-primary transition-all ml-10">
                        <RichTextEditor
                          content={opt.text}
                          onChange={(content) => {
                            const newOpts = [...currentModalQuestion.options];
                            newOpts[idx].text = content;
                            setCurrentModalQuestion({ ...currentModalQuestion, options: newOpts });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-10 text-primary hover:bg-primary/5 gap-2"
                    onClick={() => {
                      setCurrentModalQuestion({
                        ...currentModalQuestion,
                        options: [...currentModalQuestion.options, { text: '', isCorrect: false }]
                      });
                    }}
                  >
                    <Plus size={16} strokeWidth={3} /> Another options
                  </Button>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-3 bg-slate-50/30">
              <Button
                variant="outline"
                size="default"
                onClick={() => handleSaveQuestion(false)}
              >
                Save
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={() => handleSaveQuestion(true)}
              >
                Save & Add More
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
