export interface CreateAnswerOptionRequest {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuestionRequest {
  text: string;
  answerOptions: CreateAnswerOptionRequest[];
}

export interface CreateQuizRequest {
  topicName: string;
  description: string;
  questions: CreateQuestionRequest[];
}

export interface UpdateQuizRequest {
  topicName: string;
  description: string;
  questions: CreateQuestionRequest[];
}
