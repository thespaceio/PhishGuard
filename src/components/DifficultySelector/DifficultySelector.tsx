import { useState } from 'react';
import { motion } from 'framer-motion';
import { Baby, Brain, Trophy, Check, Filter, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty, categories: string[]) => void;
}

const difficulties: { 
  id: Difficulty; 
  name: string; 
  description: string; 
  icon: React.ReactNode;
  color: string;
  features: string[];
}[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Learn the basics of identifying phishing emails',
    icon: <Baby className="w-6 h-6" />,
    color: 'bg-green-500',
    features: [
      'Obvious phishing indicators',
      'Common scam patterns',
      'Basic red flag identification',
      'Banking & retail focused',
    ],
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Challenge yourself with more realistic examples',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-blue-500',
    features: [
      'Subtle phishing techniques',
      'Corporate & business scams',
      'Mixed legitimate and phishing',
      'Social engineering tactics',
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Master-level detection of sophisticated attacks',
    icon: <Trophy className="w-6 h-6" />,
    color: 'bg-purple-500',
    features: [
      'Highly sophisticated attacks',
      'Spear phishing examples',
      'Brand impersonation',
      'Document & cloud service scams',
    ],
  },
];

const categories = [
  { id: 'banking', name: 'Banking & Finance', description: 'Bank alerts, payment notifications' },
  { id: 'corporate', name: 'Corporate', description: 'Work emails, IT requests' },
  { id: 'retail', name: 'Retail', description: 'Shopping, delivery notifications' },
  { id: 'entertainment', name: 'Entertainment', description: 'Streaming, gaming services' },
  { id: 'technology', name: 'Technology', description: 'Cloud services, software' },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('beginner');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const withoutAll = prev.filter(id => id !== 'all');
        if (prev.includes(categoryId)) {
          const newSelection = withoutAll.filter(id => id !== categoryId);
          return newSelection.length === 0 ? ['all'] : newSelection;
        } else {
          return [...withoutAll, categoryId];
        }
      });
    }
  };

  const handleStart = () => {
    onSelect(
      selectedDifficulty,
      selectedCategories.includes('all') ? [] : selectedCategories
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Challenge</h1>
        <p className="text-gray-600">Select a difficulty level to start training</p>
      </motion.div>

      {/* Difficulty Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {difficulties.map((diff, index) => (
          <motion.div
            key={diff.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedDifficulty === diff.id
                  ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedDifficulty(diff.id)}
            >
              <CardHeader className={`${diff.color} text-white rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {diff.icon}
                    <CardTitle className="text-lg">{diff.name}</CardTitle>
                  </div>
                  {selectedDifficulty === diff.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-gray-900" />
                    </motion.div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardDescription className="text-gray-600 mb-4">
                  {diff.description}
                </CardDescription>
                <ul className="space-y-2">
                  {diff.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg">Filter by Category</CardTitle>
            </div>
            <CardDescription>
              Select which types of emails you want to practice with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge
                variant={selectedCategories.includes('all') ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => handleCategoryToggle('all')}
              >
                All Categories
              </Badge>
              <Separator orientation="vertical" className="h-8" />
              {categories.map(cat => (
                <Badge
                  key={cat.id}
                  variant={selectedCategories.includes(cat.id) ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => handleCategoryToggle(cat.id)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <Button
          size="lg"
          onClick={handleStart}
          className="px-12 py-6 text-lg gap-3"
        >
          <Play className="w-5 h-5" />
          Start Training
        </Button>
      </motion.div>
    </div>
  );
};

export default DifficultySelector;
