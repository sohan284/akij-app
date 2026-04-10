'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, useFieldArray, useWatch, Control, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const questionSchema = z.object({
  title: z.string().min(1, 'Question title is required'),
  type: z.enum(['radio', 'checkbox', 'text']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalCandidates: z.coerce.number().min(1),
  totalSlots: z.coerce.number().min(1),
  questionSets: z.coerce.number().min(1),
  questionType: z.string().min(1, 'Question type is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  duration: z.coerce.number().min(1),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

type FormValues = z.infer<typeof formSchema>;

function QuestionItem({ 
  index, 
  control, 
  register, 
  remove, 
  setValue, 
  field 
}: { 
  index: number; 
  control: Control<FormValues>; 
  register: UseFormRegister<FormValues>; 
  remove: (index: number) => void;
  setValue: UseFormSetValue<FormValues>;
  field: { type: 'radio' | 'checkbox' | 'text' };
}) {
  const type = useWatch({
    control,
    name: `questions.${index}.type`,
    defaultValue: field.type,
  });

  return (
    <div className="p-6 border rounded-xl bg-muted/20 relative group">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => remove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Question {index + 1}</Label>
          <Input {...register(`questions.${index}.title`)} placeholder="Enter question text..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              defaultValue={field.type}
              onValueChange={(v: 'radio' | 'checkbox' | 'text' | null) => {
                if (v) setValue(`questions.${index}.type`, v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="radio">Single Choice (Radio)</SelectItem>
                <SelectItem value="checkbox">Multiple Choice (Checkbox)</SelectItem>
                <SelectItem value="text">Short Answer (Text)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {type !== 'text' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {[0, 1, 2, 3].map((optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">{String.fromCharCode(65 + optIndex)}</span>
                <Input
                  {...register(`questions.${index}.options.${optIndex}`)}
                  placeholder={`Option ${optIndex + 1}`}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateTestPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      totalCandidates: 10,
      totalSlots: 1,
      questionSets: 1,
      questionType: 'Multiple Choice',
      startTime: '',
      endTime: '',
      duration: 60,
      questions: [{ title: '', type: 'radio', options: ['', '', '', ''], correctAnswer: '' }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await axios.post('/api/tests', data);
      router.push('/employer/dashboard');
    } catch (error) {
      console.error('Failed to create test', error);
    }
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="mb-8 overflow-hidden rounded-full bg-muted h-2 flex">
          <div className={`h-full bg-primary transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create Online Test</h1>
          <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
            Step {step} of 2
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 ? (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Configure the general settings for your assessment.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input id="title" {...register('title')} placeholder="e.g. Senior Frontend Assessment" />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalCandidates">Total Candidates</Label>
                  <Input id="totalCandidates" type="number" {...register('totalCandidates')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalSlots">Total Slots</Label>
                  <Input id="totalSlots" type="number" {...register('totalSlots')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questionSets">Question Sets</Label>
                  <Input id="questionSets" type="number" {...register('questionSets')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select onValueChange={(v) => { if (v) setValue('questionType', v); }} defaultValue="Multiple Choice">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Subjective">Subjective</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="datetime-local" {...register('startTime')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="datetime-local" {...register('endTime')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (mins)</Label>
                  <Input id="duration" type="number" {...register('duration')} />
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-6">
                <Button type="button" onClick={nextStep} className="group">
                  Next: Questions <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Question Sets</CardTitle>
                  <CardDescription>Add and manage questions for this assessment.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', type: 'radio', options: ['', '', '', ''], correctAnswer: '' })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </CardHeader>
              <CardContent className="space-y-8">
                {fields.map((field, index) => (
                  <QuestionItem 
                    key={field.id}
                    index={index}
                    control={control}
                    register={register}
                    remove={remove}
                    setValue={setValue}
                    field={field}
                  />
                ))}
              </CardContent>
              <CardFooter className="justify-between border-t pt-6">
                <Button type="button" variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back to Info
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Create Assessment
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </main>
    </>
  );
}
