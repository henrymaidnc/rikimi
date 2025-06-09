import axios from 'axios';

const API_BASE_URL = 'http://localhost:8009/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const endpoints = {
  chapters: {
    list: '/chapters/',
    detail: (id: number) => `/chapters/${id}/`,
  },
  vocabularies: {
    list: '/vocabularies/',
    detail: (id: number) => `/vocabularies/${id}/`,
  },
  activities: {
    list: '/activities/',
    detail: (id: number) => `/activities/${id}/`,
    submitAnswer: (id: number) => `/activities/${id}/submit_answer/`,
  },
  progress: {
    list: '/progress/',
    detail: (id: number) => `/progress/${id}/`,
  },
  questions: {
    list: '/questions/',
    detail: (id: number) => `/questions/${id}/`,
  },
};

// API types
export interface Chapter {
  id: number;
  title: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  book_name: string;
  order: number;
  vocabularies: Vocabulary[];
  created_at: string;
  updated_at: string;
}

export interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  example: string;
  created_at: string;
  updated_at: string;
}

export interface PracticeActivity {
  id: number;
  chapter: number;
  activity_type: 'multiple_choice' | 'typing' | 'matching' | 'listening' | 'speaking' | 'writing';
  title: string;
  description: string;
  questions: PracticeQuestion[];
  progress: UserProgress[];
  created_at: string;
  updated_at: string;
}

export interface PracticeQuestion {
  id: number;
  activity: number;
  vocabulary: Vocabulary;
  question_text: string;
  correct_answer: string;
  options: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: number;
  user: number;
  activity: number;
  score: number;
  completed: boolean;
  last_attempt: string;
  created_at: string;
}

// API functions
export const apiClient = {
  // Chapters
  getChapters: async (params?: any) => {
    const response = await api.get(endpoints.chapters.list, { params });
    return response.data;
  },
  getChapter: async (id: number) => {
    const response = await api.get(endpoints.chapters.detail(id));
    return response.data;
  },

  // Vocabularies
  getVocabularies: async (params?: any) => {
    const response = await api.get(endpoints.vocabularies.list, { params });
    return response.data;
  },
  getVocabulary: async (id: number) => {
    const response = await api.get(endpoints.vocabularies.detail(id));
    return response.data;
  },

  // Activities
  getActivities: async (params?: any) => {
    const response = await api.get(endpoints.activities.list, { params });
    return response.data;
  },
  getActivity: async (id: number) => {
    const response = await api.get(endpoints.activities.detail(id));
    return response.data;
  },
  submitAnswer: async (activityId: number, questionId: number, answer: string) => {
    const response = await api.post(endpoints.activities.submitAnswer(activityId), {
      question_id: questionId,
      answer,
    });
    return response.data;
  },

  // Progress
  getProgress: async (params?: any) => {
    const response = await api.get(endpoints.progress.list, { params });
    return response.data;
  },
  getProgressDetail: async (id: number) => {
    const response = await api.get(endpoints.progress.detail(id));
    return response.data;
  },

  // Questions
  getQuestions: async (params?: any) => {
    const response = await api.get(endpoints.questions.list, { params });
    return response.data;
  },
  getQuestion: async (id: number) => {
    const response = await api.get(endpoints.questions.detail(id));
    return response.data;
  },
}; 