import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, BarChart3, Play, Info, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster, toast } from 'sonner';
import QuizInterface from './components/QuizInterface/QuizInterface';
import DifficultySelector from './components/DifficultySelector/DifficultySelector';
import ProgressDashboard from './components/ProgressDashboard/ProgressDashboard';
import { useQuizLogic } from './hooks/useQuizLogic';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

type View = 'menu' | 'quiz' | 'progress' | 'about';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

function App() {
  const [currentView, setCurrentView] = useState<View>('menu');
  const [quizConfig, setQuizConfig] = useState<{
    difficulty: Difficulty;
    categories: string[];
  } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { progress, updateProgress, resetProgress, isLoaded } = useLocalStorage();

  const {
    currentEmail,
    currentIndex,
    isComplete,
    results,
    submitAnswer,
    skipQuestion,
    resetQuiz,
  } = useQuizLogic({
    difficulty: quizConfig?.difficulty || 'beginner',
    categories: quizConfig?.categories || [],
    questionCount: 10,
  });

  const handleStartQuiz = useCallback((difficulty: Difficulty, categories: string[]) => {
    setQuizConfig({ difficulty, categories });
    setCurrentView('quiz');
    resetQuiz();
  }, [resetQuiz]);

  const handleAnswer = useCallback((isPhishing: boolean) => {
    if (currentEmail) {
      submitAnswer(isPhishing);
      
      // Update progress in localStorage
      const isCorrect = isPhishing === currentEmail.is_phishing;
      updateProgress({
        emailId: currentEmail.id,
        isCorrect,
        difficulty: currentEmail.difficulty,
        category: currentEmail.category,
        timestamp: Date.now(),
        timeSpent: 0,
      });

      // Show toast notification
      if (isCorrect) {
        toast.success('Correct! Great job spotting the signs.', {
          duration: 2000,
        });
      } else {
        toast.error('Incorrect. Review the explanation to learn more.', {
          duration: 2000,
        });
      }
    }
  }, [currentEmail, submitAnswer, updateProgress]);

  const handleSkip = useCallback(() => {
    if (currentEmail) {
      skipQuestion();
      updateProgress({
        emailId: currentEmail.id,
        isCorrect: false,
        difficulty: currentEmail.difficulty,
        category: currentEmail.category,
        timestamp: Date.now(),
        timeSpent: 0,
      });
    }
  }, [currentEmail, skipQuestion, updateProgress]);

  const handleResetProgress = useCallback(() => {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      resetProgress();
      toast.success('Progress reset successfully');
    }
  }, [resetProgress]);

  const renderContent = () => {
    switch (currentView) {
      case 'quiz':
        if (isComplete) {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                <p className="text-gray-600 mb-6">Here's how you performed:</p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-blue-600">{results.score}</p>
                    <p className="text-sm text-gray-600">Correct</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-purple-600">{results.total}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-3xl font-bold text-green-600">{results.percentage}%</p>
                    <p className="text-sm text-gray-600">Accuracy</p>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => setCurrentView('progress')}>
                    View Progress
                  </Button>
                  <Button onClick={() => setCurrentView('menu')}>
                    Start New Quiz
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        }

        return (
          <QuizInterface
            email={currentEmail}
            currentIndex={currentIndex}
            totalQuestions={10}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
          />
        );

      case 'progress':
        return (
          <ProgressDashboard
            progress={progress}
            onStartNewQuiz={() => setCurrentView('menu')}
            onResetProgress={handleResetProgress}
          />
        );

      case 'about':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About PhishGuard</h2>
              
              <div className="space-y-6 text-gray-600">
                <p>
                  PhishGuard is an interactive training platform designed to help you recognize 
                  and avoid phishing attacks. With the rise of sophisticated cyber threats, 
                  learning to identify phishing emails has become an essential skill.
                </p>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {[
                      'Identify suspicious sender email addresses',
                      'Recognize urgency tactics and threats',
                      'Spot fake links and malicious URLs',
                      'Understand social engineering techniques',
                      'Learn to verify legitimate communications',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="font-semibold text-green-900 mb-3">How It Works</h3>
                  <ol className="space-y-2">
                    {[
                      'Choose your difficulty level',
                      'Review each email carefully',
                      'Decide if it\'s legitimate or phishing',
                      'Learn from detailed feedback',
                      'Track your progress over time',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="text-sm text-gray-500">
                  PhishGuard is designed for educational purposes. All emails shown are 
                  simulated examples based on real-world phishing patterns. No actual 
                  phishing emails are used in this training.
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 'menu':
      default:
        return (
          <DifficultySelector onSelect={handleStartQuiz} />
        );
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => setCurrentView('menu')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PhishGuard
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'menu', label: 'Quiz', icon: Play },
                { id: 'progress', label: 'Progress', icon: BarChart3 },
                { id: 'about', label: 'About', icon: Info },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView(item.id as View)}
                  className="gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  {[
                    { id: 'menu', label: 'New Quiz', icon: Play },
                    { id: 'progress', label: 'My Progress', icon: BarChart3 },
                    { id: 'about', label: 'About', icon: Info },
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={currentView === item.id ? 'default' : 'ghost'}
                      onClick={() => {
                        setCurrentView(item.id as View);
                        setIsMenuOpen(false);
                      }}
                      className="justify-start gap-3"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 PhishGuard. Educational phishing awareness training.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                Safe & Secure
              </span>
              <span>•</span>
              <span>Practice Makes Perfect</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
