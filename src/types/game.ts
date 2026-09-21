export type PlayQuestion = {
  id: string;
  category_id: string;
  prompt: string;
  image_url: string | null;
  difficulty: number;
  letter_tiles: string[];
  answer_length: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type AnsweredQuestion = {
  question: PlayQuestion;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  acceptedAnswer: string;
  explanation: string | null;
  sourceName: string | null;
};
