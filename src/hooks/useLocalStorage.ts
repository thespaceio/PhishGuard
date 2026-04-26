import { useState, useEffect, useCallback } from 'react';

interface StorageData {
  progress: QuizProgress;
  settings: UserSettings;
  timestamp: number;
}

interface QuizProgress {
  totalAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  byCategory: Record<string, { correct: number; total: number }>;
  byDifficulty: Record<string, { correct: number; total: number }>;
  history: QuizResult[];
}

interface UserSettings {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  categories: string[];
  soundEnabled: boolean;
}

interface QuizResult {
  emailId: string;
  isCorrect: boolean;
  difficulty: string;
  category: string;
  timestamp: number;
  timeSpent: number;
}

const STORAGE_KEY = 'phishguard_data';
const MAX_HISTORY_ITEMS = 100;

const defaultProgress: QuizProgress = {
  totalAnswered: 0,
  correctAnswers: 0,
  currentStreak: 0,
  bestStreak: 0,
  byCategory: {},
  byDifficulty: {},
  history: [],
};

const defaultSettings: UserSettings = {
  difficulty: 'beginner',
  categories: ['banking', 'corporate', 'retail', 'entertainment'],
  soundEnabled: true,
};

export function useLocalStorage() {
  const [data, setData] = useState<StorageData>({
    progress: defaultProgress,
    settings: defaultSettings,
    timestamp: Date.now(),
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData({
          progress: { ...defaultProgress, ...parsed.progress },
          settings: { ...defaultSettings, ...parsed.settings },
          timestamp: parsed.timestamp || Date.now(),
        });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        // Handle quota exceeded
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          // Clear old history items
          const trimmedData = {
            ...data,
            progress: {
              ...data.progress,
              history: data.progress.history.slice(-50),
            },
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedData));
        }
      }
    }
  }, [data, isLoaded]);

  const updateProgress = useCallback((result: QuizResult) => {
    setData((prev) => {
      const newProgress = { ...prev.progress };
      
      // Update basic stats
      newProgress.totalAnswered += 1;
      if (result.isCorrect) {
        newProgress.correctAnswers += 1;
        newProgress.currentStreak += 1;
        newProgress.bestStreak = Math.max(newProgress.bestStreak, newProgress.currentStreak);
      } else {
        newProgress.currentStreak = 0;
      }

      // Update category stats
      if (!newProgress.byCategory[result.category]) {
        newProgress.byCategory[result.category] = { correct: 0, total: 0 };
      }
      newProgress.byCategory[result.category].total += 1;
      if (result.isCorrect) {
        newProgress.byCategory[result.category].correct += 1;
      }

      // Update difficulty stats
      if (!newProgress.byDifficulty[result.difficulty]) {
        newProgress.byDifficulty[result.difficulty] = { correct: 0, total: 0 };
      }
      newProgress.byDifficulty[result.difficulty].total += 1;
      if (result.isCorrect) {
        newProgress.byDifficulty[result.difficulty].correct += 1;
      }

      // Add to history
      newProgress.history = [...newProgress.history, result].slice(-MAX_HISTORY_ITEMS);

      return {
        ...prev,
        progress: newProgress,
        timestamp: Date.now(),
      };
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
      timestamp: Date.now(),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setData((prev) => ({
      ...prev,
      progress: defaultProgress,
      timestamp: Date.now(),
    }));
  }, []);

  const clearAllData = useCallback(() => {
    setData({
      progress: defaultProgress,
      settings: defaultSettings,
      timestamp: Date.now(),
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress: data.progress,
    settings: data.settings,
    isLoaded,
    updateProgress,
    updateSettings,
    resetProgress,
    clearAllData,
  };
}

export type { QuizProgress, UserSettings, QuizResult };
