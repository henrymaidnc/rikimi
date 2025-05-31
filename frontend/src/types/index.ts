export interface Chapter {
  id: string;
  title: string;
  description?: string;
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  bookName?: string;
  chapterNumber?: number;
  words?: WordData[];
  exercises: Exercise[];
  grammar_patterns?: Grammar[];
}

export interface WordData {
  id?: number;
  word: string;
  meaning: string;
  example?: string;
}

export interface Grammar {
  id: string;
  pattern: string;
  explanation: string;
  examples: string[];
}

export interface Exercise {
  id: string;
  title: string;
  content: string;
  chapterId: string;
}

export interface Note {
  id: string;
  content: string;
  dateCreated: string;
  chapterId?: string;
  exerciseId?: string;
  category?: 'vocabulary' | 'grammar' | 'culture' | 'general';
}

export interface DailyStudy {
  id: string;
  date: string;
  chapterId?: string;
  exerciseIds: string[];
  noteIds: string[];
  completed: boolean;
}

export interface KanjiCard {
  kanji: string;
  meaning: string;
  reading: string;
  example: string;
  lesson?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface VocabularyItem {
  japanese: string;
  romaji: string;
  english: string;
  lesson: string;
  category: string;
  example: string;
}

export interface GrammarPattern {
  pattern: string;
  meaning: string;
  usage: string;
  example: string;
  lesson: string;
}

export interface GameResult {
  score: number;
  totalQuestions: number;
  timeSpent?: number;
  correctAnswers: number[];
  gameType: 'flashcard' | 'timed' | 'mixed-test' | 'vocabulary' | 'input-test' | 'jlpt-style';
}
