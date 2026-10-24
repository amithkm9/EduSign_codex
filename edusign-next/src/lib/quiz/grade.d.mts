export type Quiz = {
  id: string;
  courseId: string;
  questions: {
    id: string;
    prompt: string;
    options: { id: string; text: string }[];
    correctOption: string;
    explanation: string;
  }[];
};
export type Answers = { questionId: string; choice: string }[];
export type QuizResult = {
  answers: { questionId: string; choice: string; correct: boolean }[];
  correct: number;
  totalQuestions: number;
  score: number;
};
export function gradeQuiz(quiz: Quiz, answers: unknown): QuizResult;
