export interface Dashboard {
  sessions: DashboardSession[];
}

export interface DashboardSession {
  sessionId: string;
  quizTopicName: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: string;
}
