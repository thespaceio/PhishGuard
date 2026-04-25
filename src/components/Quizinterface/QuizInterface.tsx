import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, SkipForward, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import EmailViewer from '../EmailViewer/EmailViewer';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import type { Email } from '@/hooks/useQuizLogic';

interface QuizInterfaceProps {
  email: Email | null;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (isPhishing: boolean) => void;
  onSkip: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  email,
  currentIndex,
  totalQuestions,
  onAnswer,
  onSkip,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && !showFeedback) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, showFeedback]);

  // Reset timer when email changes
  useEffect(() => {
    setTimer(0);
    setShowFeedback(false);
    setLastAnswer(null);
    setIsCorrect(null);
    setIsTimerRunning(true);
  }, [email?.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback || !email) return;
      
      if (e.key === 'l' || e.key === 'L') {
        handleAnswer(false); // Legitimate
      } else if (e.key === 'p' || e.key === 'P') {
        handleAnswer(true); // Phishing
      } else if (e.key === 's' || e.key === 'S') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, email]);

  const handleAnswer = useCallback((isPhishing: boolean) => {
    if (!email) return;
    
    const correct = isPhishing === email.is_phishing;
    setLastAnswer(isPhishing);
    setIsCorrect(correct);
    setShowFeedback(true);
    setIsTimerRunning(false);
  }, [email]);

  const handleSkip = useCallback(() => {
    if (!email) return;
    
    setLastAnswer(null);
    setIsCorrect(false);
    setShowFeedback(true);
    setIsTimerRunning(false);
  }, [email]);

  const handleFeedbackClose = useCallback(() => {
    if (lastAnswer !== null) {
      onAnswer(lastAnswer);
    } else {
      onSkip();
    }
    setShowFeedback(false);
  }, [lastAnswer, onAnswer, onSkip]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  if (!email) {
    return (
      <Card className="w-full p-8 text-center">
        <CardContent>
          <p className="text-gray-500">Loading email...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          <Timer className="w-4 h-4" />
          <span className="font-mono text-sm">{formatTime(timer)}</span>
        </div>
      </div>

      {/* Email Viewer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={email.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <EmailViewer
            sender={email.sender}
            subject={email.subject}
            date={email.date}
            body={email.body}
            showRedFlags={false}
            redFlags={email.red_flags}
          />
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-14 text-lg font-semibold border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 transition-all"
          onClick={() => handleAnswer(false)}
          disabled={showFeedback}
        >
          <Shield className="w-5 h-5 mr-2" />
          Legitimate (L)
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-14 text-lg font-semibold border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 transition-all"
          onClick={() => handleAnswer(true)}
          disabled={showFeedback}
        >
          <ShieldAlert className="w-5 h-5 mr-2" />
          Phishing (P)
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          className="h-14 px-6 text-gray-500 hover:text-gray-700"
          onClick={handleSkip}
          disabled={showFeedback}
        >
          <SkipForward className="w-5 h-5 mr-2" />
          Skip (S)
        </Button>
      </motion.div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex justify-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">L</kbd>
          Legitimate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">P</kbd>
          Phishing
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">S</kbd>
          Skip
        </span>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        isCorrect={isCorrect || false}
        userAnswer={lastAnswer}
        correctAnswer={email.is_phishing}
        explanation={email.explanation}
        redFlags={email.red_flags}
        email={email}
      />
    </div>
  );
};

export default QuizInterface;
