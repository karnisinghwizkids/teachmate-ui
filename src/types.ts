export type ContentType = 'Text' | 'Audio' | 'Image' | 'Video';
export type ContentStyle = 'Narrative' | 'Descriptive' | 'Expository' | 'Persuasive' | 'Gamified';
export type Subject = 'Science' | 'Technology' | 'Entrepreneurship' | 'Arts' | 'Mathematics' | 'Self Development';
export type LessonStatus = 'Draft' | 'Submitted' | 'Pending' | 'Approved';
export type BlockType = 'Learning' | 'Mastery' | 'Evaluation';
export type EvaluationType = 'Quiz' | 'AI Evaluation';
export type QuestionType = 'single' | 'multiple' | 'text';

export interface QuizQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswers?: string[];
  explanation?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
  passingScore?: number;
}

export interface AIEvaluationContent {
  prompt: string;
  instructions: string;
}

export interface AITutorConfig {
  enabled: boolean;
  instructions: string;
}

export interface Topic {
  id: string;
  name: string;
  level: string;
  subject: Subject;
}

export interface kitem {
  id: string;
  level: string;
  subject: Subject;
  topic: string;
  blockType: BlockType;
  contentType?: ContentType;
  contentStyle?: ContentStyle;
  content: string;
  evaluationType?: EvaluationType;
  aiEvaluation?: AIEvaluationContent;
  quiz?: Quiz;
  aiTutor?: AITutorConfig;
}

export interface Lesson {
  id: string;
  name: string;
  level: string;
  subject: Subject;
  topic: string;
  createdAt: string;
  kitems: kitem[];
  status: LessonStatus;
  approvedBy?: string;
  approvedAt?: string;
}