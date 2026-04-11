'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Check,
  PencilLine,
  AlertCircle,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import RichTextEditor from '@/components/shared/RichTextEditor';

// --- Schemas ---

const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  title: z.string().min(1, 'Question title is required'),
  type: z.enum(['radio', 'checkbox', 'text']),
  score: z.coerce.number().min(1).default(1),
  options: z.array(optionSchema).optional(),
}).refine((data) => {
  if (data.type !== 'text') {
    return (data.options?.length ?? 0) >= 2;
  }
  return true;
}, {
  message: "At least 2 options are required for MCQ/Checkbox questions",
  path: ["options"],
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalCandidates: z.coerce.number().min(1),
  totalSlots: z.string().min(1, 'Total slots is required'),
  questionSets: z.string().min(1, 'Question sets is required'),
  questionType: z.string().min(1, 'Question type is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  duration: z.coerce.number().min(1),
  questions: z.array(questionSchema).min(0),
});

type FormValues = z.infer<typeof formSchema>;

const stripHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// --- Sub-Components ---

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

// --- Main Component ---

export default function CreateTestForm() {
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [modalErrors, setModalErrors] = useState<string[]>([]);
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
      router.push('/employer/dashboard');
    } catch (error) {
      console.error('Failed to create test', error);
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

    if (currentModalQuestion.type !== 'text') {
      const validOptions = currentModalQuestion.options.filter((o: any) => stripHtml(o.text).trim().length > 0);
      if (validOptions.length < 2) {
        errors.push("At least 2 options must have text for MCQ/Checkbox.");
      }
      const hasCorrect = currentModalQuestion.options.some((o: any) => o.isCorrect);
      if (!hasCorrect) {
        errors.push("Please select at least one correct answer.");
      }
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
    <div className="max-w-[1000px] mx-auto">
      {/* Header Info (Optional display based on step) */}
      <Card className="mb-8 border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-[16px] overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-6 w-full">
            <h1 className="text-xl font-bold text-[#1E293B]">Manage Online Test</h1>
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
            variant="outline"
            size="sm"
            onClick={() => router.push('/employer/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>

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
                <p className="text-md font-bold text-slate-700">{watchAllFields.title || 'Untitled Test'}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Candidates</span>
                  <p className="text-md font-bold text-slate-700">{watchAllFields.totalCandidates?.toLocaleString() || '1'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Slots</span>
                  <p className="text-md font-bold text-slate-700">{watchAllFields.totalSlots || '1'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Question Sets</span>
                  <p className="text-md font-bold text-slate-700">{watchAllFields.questionSets || '1'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Duration (Min)</span>
                  <p className="text-md font-bold text-slate-700">{watchAllFields.duration || '60'}</p>
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
                    className="h-14 rounded-xl border-slate-200 focus:ring-primary focus:border-primary"
                  />
                  {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Total Candidates <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    {...register('totalCandidates')}
                    className="h-14 rounded-xl border-slate-200 focus:ring-primary focus:border-primary"
                  />
                  {errors.totalCandidates && <p className="text-xs text-red-500 font-medium">{errors.totalCandidates.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Total Slots <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(v) => setValue('totalSlots', v ?? '')} defaultValue={watch('totalSlots') as string}>
                    <SelectTrigger className="h-14 rounded-xl border-slate-200 px-4">
                      <SelectValue placeholder="Select slots" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Slots</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.totalSlots && <p className="text-xs text-red-500 font-medium">{errors.totalSlots.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Question Sets <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(v) => setValue('questionSets', v ?? '')} defaultValue={watch('questionSets') as string}>
                    <SelectTrigger className="h-14 rounded-xl border-slate-200 px-4">
                      <SelectValue placeholder="Select sets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.questionSets && <p className="text-xs text-red-500 font-medium">{errors.questionSets.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Question Type <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(v) => setValue('questionType', v ?? '')} defaultValue={watch('questionType') as string}>
                    <SelectTrigger className="h-14 rounded-xl border-slate-200 px-4">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">MCQ</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.questionType && <p className="text-xs text-red-500 font-medium">{errors.questionType.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Start Time <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    {...register('startTime')}
                    className="h-14 rounded-xl border-slate-200"
                  />
                  {errors.startTime && <p className="text-xs text-red-500 font-medium">{errors.startTime.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">End Time <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    {...register('endTime')}
                    className="h-14 rounded-xl border-slate-200"
                  />
                  {errors.endTime && <p className="text-xs text-red-500 font-medium">{errors.endTime.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Duration (Min)</Label>
                  <Input
                    type="number"
                    {...register('duration')}
                    className="h-14 rounded-xl border-slate-200 bg-slate-50"
                  />
                  {errors.duration && <p className="text-xs text-red-500 font-medium">{errors.duration.message as string}</p>}
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[20px] bg-white">
            <div className="p-6 md:p-8 flex justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => router.push('/employer/dashboard')}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="lg"
                className="flex-1"
                onClick={async () => {
                  const isValid = await form.trigger(['title', 'totalCandidates', 'totalSlots', 'questionSets', 'questionType', 'startTime', 'endTime', 'duration']);
                  if (isValid) setStep(2);
                }}
              >
                Save & Continue
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
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

          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={openAddModal}
          >
            <Plus className="mr-2" /> Add Question
          </Button>

          <div className="flex flex-col gap-4 pt-4">
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>Please complete all Basic Information fields before saving.</p>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="lg"
                className="flex-1"
                onClick={handleSubmit(onSubmit)}
              >
                Create Test
              </Button>
            </div>
          </div>
        </div>
      )}

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
                onValueChange={(v) => setCurrentModalQuestion({ ...currentModalQuestion, type: v })}
              >
                <SelectTrigger className="h-9 w-[130px] rounded-lg border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="text">Subjective</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

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
                        <Checkbox
                          id={`opt-${idx}`}
                          checked={opt.isCorrect}
                          onCheckedChange={(checked) => {
                            const newOpts = currentModalQuestion.options.map((o: any, i: number) => ({
                              ...o,
                              isCorrect: currentModalQuestion.type === 'radio' ? i === idx && !!checked : (i === idx ? !!checked : o.isCorrect)
                            }));
                            setCurrentModalQuestion({ ...currentModalQuestion, options: newOpts });
                          }}
                        />
                        <Label htmlFor={`opt-${idx}`} className="text-xs font-bold text-slate-500">Correct Answer</Label>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => {
                        const newOpts = currentModalQuestion.options.filter((_: any, i: number) => i !== idx);
                        setCurrentModalQuestion({ ...currentModalQuestion, options: newOpts });
                      }}>
                        <Trash2 size={16} className="text-slate-300" />
                      </Button>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden ml-10">
                      <RichTextEditor
                        content={opt.text}
                        onChange={(content) => {
                          const newOpts = [...currentModalQuestion.options];
                          newOpts[idx].text = content;
                          setCurrentModalQuestion({ ...currentModalQuestion, options: newOpts });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />
                    </div>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="ml-10 text-primary hover:bg-primary/5"
                  onClick={() => setCurrentModalQuestion({...currentModalQuestion, options: [...currentModalQuestion.options, {text: '', isCorrect: false}]})}
                >
                  <Plus size={16} className="mr-2" /> Add Option
                </Button>
              </div>
            )}
          </div>

          <div className="p-6 border-t flex justify-end gap-3 bg-slate-50/30">
            <Button variant="outline" size="sm" onClick={() => handleSaveQuestion(false)}>Save</Button>
            <Button variant="default" size="sm" onClick={() => handleSaveQuestion(true)}>Save & Add More</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
