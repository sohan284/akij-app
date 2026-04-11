'use client';

import { useEffect, useState, use } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Plus, Mail, User, Clock, CheckCircle2, AlertCircle, Search, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import axios from 'axios';

export default function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [exam, setExam] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, candidatesRes] = await Promise.all([
          axios.get('/api/tests'),
          axios.get(`/api/tests/${id}/candidates`)
        ]);
        const currentExam = examsRes.data.find((e: any) => e.id === id);
        setExam(currentExam);
        setCandidates(candidatesRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [id]);

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.email) return;

    try {
      const response = await axios.post(`/api/tests/${id}/candidates`, newCandidate);
      setCandidates(prev => [response.data, ...prev]);
      setNewCandidate({ name: '', email: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add candidate', error);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!exam) return <div className="p-8 text-center text-slate-500">Loading exam data...</div>;

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto p-6 max-w-[1244px]">
        {/* Back Link */}
        <Link href="/employer/dashboard" className="flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6 group">
          <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">{exam.title}</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and monitor candidate progress for this assessment.</p>
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 h-[44px] rounded-lg font-semibold shadow-md border-none">
                <Plus className="mr-2 h-4 w-4" /> Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>
                  Enter the details of the candidate you want to invite to this test.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleAddCandidate}>Invite Candidate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-[16px]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Candidates</p>
                  <h3 className="text-2xl font-bold text-[#1E293B] mt-1">{candidates.length}</h3>
                </div>
                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-[16px]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Completed</p>
                  <h3 className="text-2xl font-bold text-[#1E293B] mt-1">
                    {candidates.filter(c => c.status === 'completed').length}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-[16px]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending</p>
                  <h3 className="text-2xl font-bold text-[#1E293B] mt-1">
                    {candidates.filter(c => c.status === 'pending').length}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Clock size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[20px] overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-lg font-bold">Candidates List</CardTitle>
              <div className="relative w-full md:w-[320px]">
                <Input 
                  placeholder="Search by name or email" 
                  className="h-[40px] pl-10 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-50">
                  <TableHead className="py-4 pl-6 font-semibold text-slate-600">Candidate</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600">Email Status</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600">Score</TableHead>
                  <TableHead className="py-4 font-semibold text-slate-600">Attended At</TableHead>
                  <TableHead className="py-4 pr-6 text-right font-semibold text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle size={40} className="mb-2 opacity-20" />
                        <p>No candidates found matching your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                            {(candidate.name || 'C').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B]">{candidate.name}</p>
                            <p className="text-xs text-slate-500">{candidate.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 rounded-md font-medium px-2 py-0.5 pointer-events-none">
                          Sent
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {candidate.status === 'completed' ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                            <CheckCircle2 size={16} /> Completed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 font-medium text-sm">
                            <Clock size={16} /> Pending
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 font-bold text-[#1E293B]">
                        {candidate.score !== null && candidate.score !== undefined ? `${candidate.score}%` : '—'}
                      </TableCell>
                      <TableCell className="py-4 text-slate-500 text-sm">
                        {candidate.attendedAt ? new Date(candidate.attendedAt).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                          <MoreVertical size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
