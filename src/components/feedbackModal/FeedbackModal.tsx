import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Shield, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmailViewer from '../EmailViewer/EmailViewer';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCorrect: boolean;
  userAnswer: boolean | null;
  correctAnswer: boolean;
  explanation: string;
  redFlags: {
    element: string;
    description: string;
    location: string;
  }[];
  email: {
    sender: { name: string; email: string };
    subject: string;
    date: string;
    body: string;
    is_phishing: boolean;
    category: string;
    difficulty: string;
  };
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  isCorrect,
  userAnswer,
  correctAnswer,
  explanation,
  redFlags,
  email,
}) => {
  const getResultMessage = () => {
    if (userAnswer === null) {
      return {
        title: 'Question Skipped',
        icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    }
    
    if (isCorrect) {
      return {
        title: 'Correct! 🎉',
        icon: <CheckCircle className="w-12 h-12 text-green-500" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    }
    
    return {
      title: 'Incorrect',
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    };
  };

  const result = getResultMessage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">Quiz Feedback</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Result Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${result.bgColor} ${result.borderColor} border rounded-xl p-6 text-center`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex justify-center mb-4"
              >
                {result.icon}
              </motion.div>
              
              <h2 className={`text-2xl font-bold ${result.color} mb-2`}>
                {result.title}
              </h2>
              
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Your answer:</span>
                  {userAnswer === null ? (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      Skipped
                    </Badge>
                  ) : userAnswer ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Phishing
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Legitimate
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Correct answer:</span>
                  {correctAnswer ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Phishing
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Legitimate
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-5"
            >
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                What to Look For
              </h3>
              <p className="text-blue-800 leading-relaxed">{explanation}</p>
            </motion.div>

            {/* Red Flags */}
            {redFlags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  Red Flags in This Email
                </h3>
                
                <div className="grid gap-3">
                  {redFlags.map((flag, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-red-900">{flag.description}</p>
                          <p className="text-sm text-red-600 mt-1">
                            <span className="font-medium">Location:</span> {flag.location}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Email Review with Red Flags Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-gray-900">Email Review</h3>
              <EmailViewer
                sender={email.sender}
                subject={email.subject}
                date={email.date}
                body={email.body}
                showRedFlags={true}
                redFlags={redFlags}
              />
            </motion.div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <Button onClick={onClose} size="lg" className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
