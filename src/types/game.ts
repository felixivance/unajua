export type Question = {
  id: string;
  category_id: string;
  prompt: string;
  image_url: string | null;
  accepted_answer: string;
  alternative_answers: string[];
  explanation: string | null;
  source_name: string | null;
  source_url: string | null;
  difficulty: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type AnsweredQuestion = {
  question: Question;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
};
