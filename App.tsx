
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  BarChart3, 
  PlusCircle, 
  LayoutDashboard, 
  ClipboardList, 
  ChevronRight, 
  BrainCircuit, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Upload,
  FileText,
  X,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Subject, Topic, ExamPaper, Question, AnalysisResult, StudyRecommendation } from './types';
import { parseSyllabus, mapQuestionsToTopics, generateInsights } from './geminiService';

const App: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'papers' | 'analysis'>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSyllabusContent, setNewSyllabusContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist data
  useEffect(() => {
    const savedSubjects = localStorage.getItem('acad_subjects');
    const savedPapers = localStorage.getItem('acad_papers');
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedPapers) setPapers(JSON.parse(savedPapers));
  }, []);

  useEffect(() => {
    localStorage.setItem('acad_subjects', JSON.stringify(subjects));
    localStorage.setItem('acad_papers', JSON.stringify(papers));
  }, [subjects, papers]);

  const addSubject = async () => {
    if (!newSubjectName.trim()) return;
    setIsProcessing(true);
    try {
      const syllabus = await parseSyllabus(newSubjectName, newSyllabusContent);
      const newSub: Subject = {
        id: crypto.randomUUID(),
        name: newSubjectName,
        syllabus
      };
      setSubjects([...subjects, newSub]);
      setNewSubjectName('');
      setNewSyllabusContent('');
      setIsAddingSubject(false);
    } catch (err) {
      alert("Failed to fetch syllabus. Please check your API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewSyllabusContent(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setPapers(papers.filter(p => p.subjectId !== id));
    if (selectedSubjectId === id) setSelectedSubjectId(null);
  };

  const activeSubject = useMemo(() => 
    subjects.find(s => s.id === selectedSubjectId), 
  [subjects, selectedSubjectId]);

  const analysisData = useMemo(() => {
    if (!selectedSubjectId) return [];
    const subjectPapers = papers.filter(p => p.subjectId === selectedSubjectId);
    const subject = subjects.find(s => s.id === selectedSubjectId);
    if (!subject) return [];

    return subject.syllabus.map(topic => {
      let allotted = 0;
      let obtained = 0;

      subjectPapers.forEach(paper => {
        paper.questions
          .filter(q => q.mappedTopicId === topic.id)
          .forEach(q => {
            allotted += q.allottedMarks;
            obtained += q.obtainedMarks;
          });
      });

      const percentage = allotted > 0 ? (obtained / allotted) * 100 : 0;
      let status: 'Weak' | 'Average' | 'Strong' = 'Weak';
      if (percentage >= 75) status = 'Strong';
      else if (percentage >= 40) status = 'Average';

      return {
        topicId: topic.id,
        topicName: topic.name,
        totalAllotted: allotted,
        totalObtained: obtained,
        percentage,
        status
      } as AnalysisResult;
    });
  }, [selectedSubjectId, papers, subjects]);

  const COLORS = {
    Strong: '#10b981',
    Average: '#f59e0b',
    Weak: '#ef4444'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">AcademiSync</h1>
          </div>
          
          <nav className="flex gap-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'subjects', icon: BookOpen, label: 'Subjects' },
              { id: 'papers', icon: ClipboardList, label: 'Exams' },
              { id: 'analysis', icon: BarChart3, label: 'Analysis' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <p className="text-slate-500 text-sm font-medium">Enrolled Subjects</p>
                <p className="text-3xl font-bold">{subjects.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <p className="text-slate-500 text-sm font-medium">Processed Papers</p>
                <p className="text-3xl font-bold">{papers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <p className="text-slate-500 text-sm font-medium">Mapped Questions</p>
                <p className="text-3xl font-bold">{papers.reduce((acc, p) => acc + p.questions.length, 0)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Your Recent Activity</h2>
              {subjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                    <PlusCircle size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Start by adding a subject</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-1">Add your subjects to let AcademiSync break down your syllabus using AI.</p>
                  <button 
                    onClick={() => setActiveTab('subjects')}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700"
                  >
                    Go to Subjects
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map(s => (
                    <div key={s.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer group" onClick={() => {setSelectedSubjectId(s.id); setActiveTab('analysis');}}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-700">{s.name}</h4>
                        <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
                      </div>
                      <p className="text-xs text-slate-500">{s.syllabus.length} Topics • {papers.filter(p => p.subjectId === s.id).length} Papers</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Subjects</h2>
                <p className="text-slate-500">Manage your course syllabus</p>
              </div>
              <button 
                onClick={() => setIsAddingSubject(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
              >
                <PlusCircle size={18} /> Add Subject
              </button>
            </div>

            {isAddingSubject && (
              <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-md animate-in zoom-in-95 duration-200 relative">
                <button onClick={() => setIsAddingSubject(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
                <h3 className="font-bold text-lg mb-4">Add New Subject</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Distributed Systems, Molecular Biology..." 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700">Official Syllabus Content (Optional)</label>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <FileText size={12} /> Upload .txt
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".txt" 
                        onChange={handleFileUpload} 
                      />
                    </div>
                    <textarea 
                      placeholder="Paste your syllabus topics and subtopics here. If left empty, AI will generate a standard syllabus for you." 
                      className="w-full h-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                      value={newSyllabusContent}
                      onChange={(e) => setNewSyllabusContent(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      disabled={isProcessing || !newSubjectName}
                      onClick={addSubject}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Syllabus...
                        </span>
                      ) : (
                        "Create Subject"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                        <BookOpen size={20} />
                      </div>
                      <h3 className="text-xl font-bold">{s.name}</h3>
                    </div>
                    <button 
                      onClick={() => removeSubject(s.id)}
                      className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topics Breakdown</p>
                    <div className="space-y-2">
                      {s.syllabus.slice(0, 3).map(topic => (
                        <div key={topic.id} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="truncate">{topic.name}</span>
                        </div>
                      ))}
                      {s.syllabus.length > 3 && (
                        <p className="text-xs text-indigo-500 font-medium pl-2">+{s.syllabus.length - 3} more topics</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'papers' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Exam Papers</h2>
                <p className="text-slate-500">Map your question papers to syllabus topics</p>
              </div>
            </div>

            {subjects.length === 0 ? (
               <div className="bg-white border-dashed border-2 border-slate-200 rounded-2xl p-12 text-center">
                <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
                <h3 className="text-lg font-bold">No Subjects Found</h3>
                <p className="text-slate-500">Please add at least one subject first to upload question papers.</p>
               </div>
            ) : (
              <PaperManager 
                subjects={subjects} 
                papers={papers} 
                onAddPaper={(paper) => setPapers([...papers, paper])}
                onDeletePaper={(id) => setPapers(papers.filter(p => p.id !== id))}
              />
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Academic Performance Analysis</h2>
                <p className="text-slate-500">Topic-wise insights driven by AI</p>
              </div>
              
              <select 
                className="bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm outline-none font-medium"
                value={selectedSubjectId || ''}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="" disabled>Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {selectedSubjectId ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Performance Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Topic-wise Accuracy (%)</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysisData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis 
                            dataKey="topicName" 
                            type="category" 
                            width={120} 
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload as AnalysisResult;
                                return (
                                  <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                                    <p className="font-bold text-slate-800 mb-1">{data.topicName}</p>
                                    <p className="text-sm text-slate-500">Score: {data.totalObtained}/{data.totalAllotted} ({Math.round(data.percentage)}%)</p>
                                    <p className={`text-xs font-bold mt-1 ${
                                      data.status === 'Strong' ? 'text-emerald-500' :
                                      data.status === 'Average' ? 'text-amber-500' : 'text-red-500'
                                    }`}>{data.status} Area</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                            {analysisData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recommendation Engine */}
                  <StudyPlan subject={activeSubject!} analysis={analysisData} />
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Focus Summary</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Strong', value: analysisData.filter(d => d.status === 'Strong').length },
                              { name: 'Average', value: analysisData.filter(d => d.status === 'Average').length },
                              { name: 'Weak', value: analysisData.filter(d => d.status === 'Weak').length },
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill={COLORS.Strong} />
                            <Cell fill={COLORS.Average} />
                            <Cell fill={COLORS.Weak} />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {['Strong', 'Average', 'Weak'].map((type) => (
                        <div key={type} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-[${COLORS[type as 'Strong']}]`} 
                              style={{backgroundColor: COLORS[type as 'Strong']}} 
                            />
                            <span className="font-medium text-slate-700">{type} Topics</span>
                          </div>
                          <span className="font-bold">{analysisData.filter(d => d.status === type).length}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                    <TrendingUp className="mb-3 opacity-80" />
                    <h4 className="text-lg font-bold">Ready to improve?</h4>
                    <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
                      AI analyzes your weakest subtopics. Focus on <b>{analysisData.find(d => d.status === 'Weak')?.topicName || 'remaining topics'}</b> next for the highest score impact.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-dashed border-2 border-slate-200 rounded-3xl p-20 text-center">
                <BarChart3 size={64} className="mx-auto text-slate-300 mb-6" />
                <h3 className="text-xl font-bold text-slate-800">Select a subject to view analysis</h3>
                <p className="text-slate-500 mt-2">Pick a subject from the dropdown above to see how you're performing across topics.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 p-2 flex justify-around z-10">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'subjects', icon: BookOpen },
          { id: 'papers', icon: ClipboardList },
          { id: 'analysis', icon: BarChart3 }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`p-3 rounded-full ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            <tab.icon size={20} />
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Helper Components ---

interface PaperManagerProps {
  subjects: Subject[];
  papers: ExamPaper[];
  onAddPaper: (paper: ExamPaper) => void;
  onDeletePaper: (id: string) => void;
}

const PaperManager: React.FC<PaperManagerProps> = ({ subjects, papers, onAddPaper, onDeletePaper }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [paperName, setPaperName] = useState('');
  const [paperText, setPaperText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftQuestions, setDraftQuestions] = useState<Partial<Question>[]>([]);

  const liveSummary = useMemo(() => {
    const total = draftQuestions.reduce((acc, q) => acc + (q.allottedMarks || 0), 0);
    const scored = draftQuestions.reduce((acc, q) => acc + (q.obtainedMarks || 0), 0);
    const perc = total > 0 ? Math.round((scored / total) * 100) : 0;
    return { total, scored, perc };
  }, [draftQuestions]);

  const startMapping = async () => {
    if (!paperText.trim()) return;
    setIsProcessing(true);
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;
      const results = await mapQuestionsToTopics(paperText, subject.syllabus);
      setDraftQuestions(results.map(r => ({ ...r, obtainedMarks: 0 })));
    } catch (err) {
      alert("AI mapping failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const savePaper = () => {
    const paper: ExamPaper = {
      id: crypto.randomUUID(),
      subjectId,
      name: paperName || `Exam ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      questions: draftQuestions.map((q, idx) => ({
        id: crypto.randomUUID(),
        text: q.text || `Question ${idx + 1}`,
        allottedMarks: q.allottedMarks || 0,
        obtainedMarks: q.obtainedMarks || 0,
        mappedTopicId: q.mappedTopicId || '',
      }))
    };
    onAddPaper(paper);
    setIsAdding(false);
    setDraftQuestions([]);
    setPaperText('');
  };

  return (
    <div className="space-y-6">
      {isAdding ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
          {/* Left Panel: Input & Settings */}
          <div className="w-full md:w-2/5 p-6 border-r border-slate-100 bg-slate-50/30 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                Exam Details
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all font-medium"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Exam Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Unit Test 1, Final Semester..." 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                  value={paperName}
                  onChange={(e) => setPaperName(e.target.value)}
                />
              </div>

              <div className="flex flex-col flex-1 min-h-[250px]">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Paper Source Text</label>
                <div className="relative flex-1">
                  <textarea 
                    placeholder="Paste the raw text of your question paper here..." 
                    className="w-full h-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner resize-none font-mono text-sm leading-relaxed"
                    value={paperText}
                    onChange={(e) => setPaperText(e.target.value)}
                  />
                  {!paperText && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                      <Upload size={32} className="mb-2 text-slate-300" />
                      <p className="text-xs text-center px-8">AI will automatically identify questions, marks, and syllabus topics.</p>
                    </div>
                  )}
                </div>
                <button 
                  disabled={isProcessing || !paperText}
                  onClick={startMapping}
                  className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mapping Topics...
                    </span>
                  ) : (
                    <><BrainCircuit size={18} /> Process Paper with AI</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Grading Dashboard */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h3 className="text-lg font-bold">Grading Dashboard</h3>
                <p className="text-sm text-slate-500">{draftQuestions.length} questions identified</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-indigo-600">{liveSummary.scored}</span>
                    <span className="text-slate-400 font-bold">/ {liveSummary.total}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-xs ${
                  liveSummary.perc >= 75 ? 'border-emerald-500 text-emerald-600' : 
                  liveSummary.perc >= 40 ? 'border-amber-500 text-amber-600' : 
                  'border-red-500 text-red-600'
                }`}>
                  {liveSummary.perc}%
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
              {draftQuestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <GraduationCap size={64} className="mb-4 opacity-10" />
                  <p className="font-medium">No results to show yet</p>
                  <p className="text-sm">Process your paper text on the left to start grading.</p>
                </div>
              ) : (
                draftQuestions.map((q, idx) => {
                  const subject = subjects.find(s => s.id === subjectId);
                  const topic = subject?.syllabus.find(t => t.id === q.mappedTopicId);
                  const qPerc = q.allottedMarks && q.obtainedMarks ? (q.obtainedMarks / q.allottedMarks) * 100 : 0;
                  
                  return (
                    <div key={idx} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all overflow-hidden relative">
                      {/* Sub-Progress bar background */}
                      <div 
                        className="absolute bottom-0 left-0 h-1 bg-indigo-500/10 transition-all duration-500"
                        style={{ width: `${qPerc}%` }}
                      />
                      
                      <div className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          Q{idx + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-tighter rounded-full border border-indigo-100">
                              {topic?.name || 'Unmapped Topic'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-700 leading-snug line-clamp-2" title={q.text}>
                            {q.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                            <input 
                              type="number" 
                              className={`w-14 bg-white px-2 py-1 text-center font-bold text-lg rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
                                (q.obtainedMarks || 0) > (q.allottedMarks || 0) ? 'text-red-500 ring-2 ring-red-200' : 'text-slate-800'
                              }`} 
                              value={q.obtainedMarks}
                              min="0"
                              onChange={(e) => {
                                const newQ = [...draftQuestions];
                                newQ[idx].obtainedMarks = Number(e.target.value);
                                setDraftQuestions(newQ);
                              }}
                            />
                            <span className="px-2 text-slate-400 font-black">/</span>
                            <input 
                              type="number" 
                              className="w-14 bg-slate-50/50 px-2 py-1 text-center font-bold text-slate-500 rounded-lg border-none outline-none" 
                              value={q.allottedMarks}
                              min="0"
                              onChange={(e) => {
                                const newQ = [...draftQuestions];
                                newQ[idx].allottedMarks = Number(e.target.value);
                                setDraftQuestions(newQ);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 bg-slate-50/80 border-t border-slate-100">
              <button 
                disabled={draftQuestions.length === 0}
                onClick={savePaper}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale"
              >
                <Trophy size={24} className="group-hover:rotate-12 transition-transform" />
                Finalize Exam Results
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => setIsAdding(true)}
            className="border-2 border-dashed border-slate-300 rounded-3xl p-12 hover:border-indigo-400 hover:bg-indigo-50 transition-all group min-h-[220px] flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-all mb-4">
              <PlusCircle size={32} />
            </div>
            <h3 className="font-bold text-lg text-slate-500 group-hover:text-indigo-600">New Exam Record</h3>
            <p className="text-xs text-slate-400 mt-1">Upload a paper and enter your marks</p>
          </button>
          
          {papers.map(p => {
            const subject = subjects.find(s => s.id === p.subjectId);
            const score = p.questions.reduce((acc, q) => acc + q.obtainedMarks, 0);
            const total = p.questions.reduce((acc, q) => acc + q.allottedMarks, 0);
            const perc = total > 0 ? (score/total)*100 : 0;

            return (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all relative group overflow-hidden">
                <button 
                  onClick={() => onDeletePaper(p.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-50 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                    <ClipboardList size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 leading-tight truncate pr-8" title={p.name}>{p.name}</h3>
                    <p className="text-xs font-bold text-indigo-500/60 tracking-wider uppercase">{subject?.name}</p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Performance</p>
                    <p className="text-3xl font-black text-slate-700">{score}<span className="text-slate-300 text-xl font-medium"> / {total}</span></p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${
                    perc >= 75 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    perc >= 40 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                    'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {Math.round(perc)}%
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      perc >= 75 ? 'bg-emerald-500' : 
                      perc >= 40 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${perc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StudyPlan: React.FC<{ subject: Subject; analysis: AnalysisResult[] }> = ({ subject, analysis }) => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await generateInsights(analysis, subject.name);
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysis.length > 0) fetchInsights();
  }, [analysis, subject.id]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <BrainCircuit size={20} className="text-indigo-600" />
          AI Study Recommendations
        </h3>
        <button 
          onClick={fetchInsights}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full transition-colors"
        >
          {loading ? 'Thinking...' : 'Refresh AI'}
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec, idx) => {
            const topic = analysis.find(a => a.topicId === rec.topicId);
            return (
              <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white transition-all hover:shadow-sm">
                <div className={`flex-shrink-0 w-1.5 h-auto rounded-full ${
                  rec.priority === 'High' ? 'bg-red-500' : rec.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-800">{topic?.topicName || 'General'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                      rec.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                      rec.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>{rec.priority}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{rec.suggestion}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-bounce bg-indigo-100 p-3 rounded-full">
                  <BrainCircuit size={32} className="text-indigo-600" />
                </div>
                <p className="font-bold text-slate-500">AI is analyzing your patterns...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <GraduationCap size={48} className="opacity-10" />
                <p>Enter your exam marks to unlock personalized advice.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
