export interface QuizSummary {
  id: number;
  topicName: string;
  description: string;
  questionCount: number;
}

export interface QuizDetail {
  id: number;
  topicName: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  orderIndex: number;
  answerOptions: AnswerOption[];
}

export interface AnswerOption {
  id: number;
  text: string;
  isCorrect?: boolean;
}

export interface QuizSession {
  id: string;
  quizId: number;
  startedAt: string;
}

export interface SubmitAnswerRequest {
  questionId: number;
  selectedAnswerOptionId: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswerOptionId: number;
}

export interface QuizResult {
  sessionId: string;
  quizTopicName: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
  elapsedTimeSeconds: number;
  completedAt: string;
}
