import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Flame,
  Award,
  BarChart3,
  PieChart,
  RotateCcw,
  Play,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface ProgressDashboardProps {
  progress: {
    totalAnswered: number;
    correctAnswers: number;
    currentStreak: number;
    bestStreak: number;
    byCategory: Record<string, { correct: number; total: number }>;
    byDifficulty: Record<string, { correct: number; total: number }>;
    history: {
      emailId: string;
      isCorrect: boolean;
      difficulty: string;
      category: string;
      timestamp: number;
      timeSpent: number;
    }[];
  };
  onStartNewQuiz: () => void;
  onResetProgress: () => void;
}

const COLORS = ['#10b981', '#ef4444'];

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  onStartNewQuiz,
  onResetProgress,
}) => {
  const accuracy = progress.totalAnswered > 0
    ? Math.round((progress.correctAnswers / progress.totalAnswered) * 100)
    : 0;

  // Prepare category data for chart
  const categoryData = Object.entries(progress.byCategory).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    correct: data.correct,
    incorrect: data.total - data.correct,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));

  // Prepare difficulty data for chart
  const difficultyData = Object.entries(progress.byDifficulty).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    correct: data.correct,
    total: data.total,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));

  // Overall accuracy pie chart data
  const accuracyData = [
    { name: 'Correct', value: progress.correctAnswers, color: '#10b981' },
    { name: 'Incorrect', value: progress.totalAnswered - progress.correctAnswers, color: '#ef4444' },
  ];

  // Recent history (last 10)
  const recentHistory = progress.history.slice(-10).map((item, index) => ({
    attempt: index + 1,
    correct: item.isCorrect ? 1 : 0,
  }));

  const getAccuracyBadge = (acc: number) => {
    if (acc >= 90) return { label: 'Expert', color: 'bg-purple-500' };
    if (acc >= 75) return { label: 'Advanced', color: 'bg-blue-500' };
    if (acc >= 60) return { label: 'Intermediate', color: 'bg-yellow-500' };
    return { label: 'Beginner', color: 'bg-green-500' };
  };

  const badge = getAccuracyBadge(accuracy);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Your Progress
          </h1>
          <p className="text-gray-600 mt-1">
            Track your phishing detection skills over time
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onResetProgress} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={onStartNewQuiz} className="gap-2">
            <Play className="w-4 h-4" />
            New Quiz
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <Target className="w-6 h-6 text-blue-500" />,
            label: 'Accuracy',
            value: `${accuracy}%`,
            subtext: `${progress.correctAnswers}/${progress.totalAnswered} correct`,
          },
          {
            icon: <Flame className="w-6 h-6 text-orange-500" />,
            label: 'Current Streak',
            value: progress.currentStreak,
            subtext: `Best: ${progress.bestStreak}`,
          },
          {
            icon: <Award className="w-6 h-6 text-purple-500" />,
            label: 'Level',
            value: badge.label,
            subtext: 'Based on accuracy',
            badge: true,
          },
          {
            icon: <Brain className="w-6 h-6 text-green-500" />,
            label: 'Questions',
            value: progress.totalAnswered,
            subtext: 'Total answered',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  {stat.icon}
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  {stat.badge ? (
                    <Badge className={`${badge.color} text-white text-lg px-3 py-1`}>
                      {stat.value}
                    </Badge>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Accuracy Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-lg">Overall Accuracy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {progress.totalAnswered > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={accuracyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {accuracyData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No data yet. Start a quiz!
                </div>
              )}
              <div className="flex justify-center gap-6 mt-4">
                {accuracyData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance by Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-lg">Performance by Category</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="correct" stackId="a" fill="#10b981" name="Correct" />
                    <Bar dataKey="incorrect" stackId="a" fill="#ef4444" name="Incorrect" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No category data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance by Difficulty */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-lg">Performance by Difficulty</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {difficultyData.length > 0 ? (
                <div className="space-y-4">
                  {difficultyData.map((diff) => (
                    <div key={diff.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{diff.name}</span>
                        <span className="text-gray-600">
                          {diff.correct}/{diff.total} ({diff.accuracy}%)
                        </span>
                      </div>
                      <Progress value={diff.accuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-400">
                  No difficulty data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Performance Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-lg">Recent Performance</CardTitle>
              </div>
              <CardDescription>Last 10 attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {recentHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={recentHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" hide />
                    <YAxis domain={[0, 1]} tickFormatter={(v) => (v === 1 ? '✓' : '✗')} />
                    <Tooltip
                      formatter={(value: number) => (value === 1 ? 'Correct' : 'Incorrect')}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="correct"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-400">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Keep Improving Your Skills
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Phishing attacks are constantly evolving. Here are some tips to stay sharp:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Always check the sender's email domain carefully
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Hover over links before clicking to see the real URL
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Be suspicious of urgent requests or threats
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    When in doubt, contact the company directly through official channels
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProgressDashboard;
