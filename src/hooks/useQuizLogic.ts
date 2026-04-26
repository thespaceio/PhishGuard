import { useState, useCallback, useEffect, useRef } from 'react';

export interface Email {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  date: string;
  body: string;
  is_phishing: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  red_flags: {
    element: string;
    description: string;
    location: string;
  }[];
  explanation: string;
}

interface QuizState {
  emails: Email[];
  currentIndex: number;
  score: number;
  answers: {
    emailId: string;
    userAnswer: boolean;
    correct: boolean;
    timeSpent: number;
  }[];
  isComplete: boolean;
  startTime: number;
  questionStartTime: number;
}

interface UseQuizLogicProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  categories: string[];
  questionCount: number;
}

export function useQuizLogic({ difficulty, categories, questionCount }: UseQuizLogicProps) {
  const [state, setState] = useState<QuizState>({
    emails: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    isComplete: false,
    startTime: Date.now(),
    questionStartTime: Date.now(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // Load emails from JSON files
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadEmails = async () => {
      try {
        setIsLoading(true);
        const allEmails: Email[] = [];

        // Load emails based on difficulty
        const files: string[] = [];
        
        if (difficulty === 'beginner') {
          files.push('/emails/beginner/phishing_bank.json');
          files.push('/emails/beginner/legitimate_samples.json');
        } else if (difficulty === 'intermediate') {
          files.push('/emails/intermediate/phishing_corporate.json');
          files.push('/emails/beginner/legitimate_samples.json');
        } else {
          files.push('/emails/advanced/phishing_advanced.json');
          files.push('/emails/beginner/legitimate_samples.json');
          files.push('/emails/intermediate/phishing_corporate.json');
        }

        for (const file of files) {
          try {
            const response = await fetch(file);
            if (response.ok) {
              const emails: Email[] = await response.json();
              allEmails.push(...emails);
            }
          } catch (err) {
            console.warn(`Failed to load ${file}:`, err);
          }
        }

        // Filter by categories if specified
        let filteredEmails = allEmails;
        if (categories.length > 0 && !categories.includes('all')) {
          filteredEmails = allEmails.filter(email => categories.includes(email.category));
        }

        // Shuffle and limit to questionCount
        const shuffled = shuffleArray(filteredEmails).slice(0, questionCount);
        
        setState(prev => ({
          ...prev,
          emails: shuffled,
          questionStartTime: Date.now(),
        }));
      } catch (err) {
        setError('Failed to load quiz questions. Please try again.');
        console.error('Error loading emails:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmails();
  }, [difficulty, categories, questionCount]);

  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const submitAnswer = useCallback((isPhishing: boolean) => {
    setState(prev => {
      const currentEmail = prev.emails[prev.currentIndex];
      if (!currentEmail) return prev;

      const timeSpent = Math.floor((Date.now() - prev.questionStartTime) / 1000);
      const isCorrect = isPhishing === currentEmail.is_phishing;

      const newAnswers = [...prev.answers, {
        emailId: currentEmail.id,
        userAnswer: isPhishing,
        correct: isCorrect,
        timeSpent,
      }];

      const isComplete = prev.currentIndex >= prev.emails.length - 1;

      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        answers: newAnswers,
        currentIndex: isComplete ? prev.currentIndex : prev.currentIndex + 1,
        isComplete,
        questionStartTime: Date.now(),
      };
    });
  }, []);

  const skipQuestion = useCallback(() => {
    setState(prev => {
      const currentEmail = prev.emails[prev.currentIndex];
      if (!currentEmail) return prev;

      const timeSpent = Math.floor((Date.now() - prev.questionStartTime) / 1000);

      const newAnswers = [...prev.answers, {
        emailId: currentEmail.id,
        userAnswer: false,
        correct: false,
        timeSpent,
      }];

      const isComplete = prev.currentIndex >= prev.emails.length - 1;

      return {
        ...prev,
        answers: newAnswers,
        currentIndex: isComplete ? prev.currentIndex : prev.currentIndex + 1,
        isComplete,
        questionStartTime: Date.now(),
      };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      emails: [],
      currentIndex: 0,
      score: 0,
      answers: [],
      isComplete: false,
      startTime: Date.now(),
      questionStartTime: Date.now(),
    });
    loadedRef.current = false;
  }, []);

  const getCurrentEmail = useCallback(() => {
    return state.emails[state.currentIndex];
  }, [state.emails, state.currentIndex]);

  const getProgress = useCallback(() => {
    return {
      current: state.currentIndex + 1,
      total: state.emails.length,
      percentage: state.emails.length > 0 ? ((state.currentIndex + 1) / state.emails.length) * 100 : 0,
    };
  }, [state.currentIndex, state.emails.length]);

  const getResults = useCallback(() => {
    return {
      score: state.score,
      total: state.emails.length,
      percentage: state.emails.length > 0 ? Math.round((state.score / state.emails.length) * 100) : 0,
      answers: state.answers,
      timeSpent: Math.floor((Date.now() - state.startTime) / 1000),
    };
  }, [state.score, state.emails.length, state.answers, state.startTime]);

  return {
    currentEmail: getCurrentEmail(),
    currentIndex: state.currentIndex,
    isComplete: state.isComplete,
    isLoading,
    error,
    progress: getProgress(),
    results: getResults(),
    submitAnswer,
    skipQuestion,
    resetQuiz,
  };
}

export default useQuizLogic;
