
export interface Subtopic {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface Subject {
  id: string;
  name: string;
  syllabus: Topic[];
}

export interface Question {
  id: string;
  text: string;
  allottedMarks: number;
  obtainedMarks: number;
  mappedTopicId: string;
  mappedSubtopicId?: string;
}

export interface ExamPaper {
  id: string;
  subjectId: string;
  name: string;
  questions: Question[];
  date: string;
}

export interface AnalysisResult {
  topicId: string;
  topicName: string;
  totalAllotted: number;
  totalObtained: number;
  percentage: number;
  status: 'Weak' | 'Average' | 'Strong';
}

export interface StudyRecommendation {
  topicId: string;
  suggestion: string;
  priority: 'High' | 'Medium' | 'Low';
}
