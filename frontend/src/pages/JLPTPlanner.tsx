
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Trophy, Clock, BookOpen, Brain, PenTool, CheckCircle } from "lucide-react";

const jlptLevels = [
  {
    level: "N5",
    title: "Beginner",
    description: "Basic Japanese for everyday situations",
    requirements: {
      kanji: 100,
      vocabulary: 800,
      grammar: 80
    },
    passingScore: 80,
    timeLimit: "105 minutes",
    color: "from-green-100 to-green-200",
    difficulty: "Beginner"
  },
  {
    level: "N4", 
    title: "Elementary",
    description: "Basic conversation and reading",
    requirements: {
      kanji: 300,
      vocabulary: 1500,
      grammar: 200
    },
    passingScore: 90,
    timeLimit: "125 minutes",
    color: "from-blue-100 to-blue-200",
    difficulty: "Elementary"
  },
  {
    level: "N3",
    title: "Intermediate",
    description: "Daily life Japanese comprehension",
    requirements: {
      kanji: 650,
      vocabulary: 3750,
      grammar: 350
    },
    passingScore: 95,
    timeLimit: "140 minutes",
    color: "from-yellow-100 to-yellow-200",
    difficulty: "Intermediate"
  },
  {
    level: "N2",
    title: "Upper Intermediate",
    description: "Complex texts and abstract topics",
    requirements: {
      kanji: 1000,
      vocabulary: 6000,
      grammar: 500
    },
    passingScore: 90,
    timeLimit: "155 minutes",
    color: "from-orange-100 to-orange-200",
    difficulty: "Upper Intermediate"
  },
  {
    level: "N1",
    title: "Advanced",
    description: "Native-level comprehension",
    requirements: {
      kanji: 2000,
      vocabulary: 10000,
      grammar: 800
    },
    passingScore: 100,
    timeLimit: "170 minutes",
    color: "from-red-100 to-red-200",
    difficulty: "Advanced"
  }
];

// Mock current progress - in real app, this would come from user data
const currentProgress = {
  kanji: 89,
  vocabulary: 156,
  grammar: 23,
  currentLevel: "N5"
};

export default function JLPTPlanner() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-900">JLPT Study Planner</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Plan your journey from N5 to N1 proficiency
          </p>
        </div>

        {/* Current Progress Overview */}
        <Card className="bg-gradient-to-r from-sakura-50 to-bamboo-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Your Current Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-ink-800">{currentProgress.kanji}</div>
                <div className="text-sm text-muted-foreground">Kanji Learned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ink-800">{currentProgress.vocabulary}</div>
                <div className="text-sm text-muted-foreground">Vocabulary Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ink-800">{currentProgress.grammar}</div>
                <div className="text-sm text-muted-foreground">Grammar Points</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                Currently studying: {currentProgress.currentLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* JLPT Levels */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-ink-900">JLPT Levels Overview</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {jlptLevels.map((level) => (
              <JLPTLevelCard 
                key={level.level} 
                level={level} 
                currentProgress={currentProgress}
              />
            ))}
          </div>
        </div>

        {/* Study Tips */}
        <Card>
          <CardHeader>
            <CardTitle>📚 JLPT Study Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">📅 Planning</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Set realistic 3-6 month study goals</li>
                  <li>• Create a daily study schedule</li>
                  <li>• Track progress weekly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📖 Study Methods</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use spaced repetition for vocabulary</li>
                  <li>• Practice listening daily</li>
                  <li>• Take practice tests regularly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⏰ Time Management</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Allocate more time to weak areas</li>
                  <li>• Practice under timed conditions</li>
                  <li>• Review mistakes thoroughly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Test Strategy</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Focus on passing score, not perfection</li>
                  <li>• Skip difficult questions initially</li>
                  <li>• Manage time across all sections</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

interface JLPTLevelCardProps {
  level: typeof jlptLevels[0];
  currentProgress: typeof currentProgress;
}

function JLPTLevelCard({ level, currentProgress }: JLPTLevelCardProps) {
  const isCurrentLevel = level.level === currentProgress.currentLevel;
  const kanjiProgress = Math.min((currentProgress.kanji / level.requirements.kanji) * 100, 100);
  const vocabProgress = Math.min((currentProgress.vocabulary / level.requirements.vocabulary) * 100, 100);
  const grammarProgress = Math.min((currentProgress.grammar / level.requirements.grammar) * 100, 100);
  
  const isCompleted = kanjiProgress >= 100 && vocabProgress >= 100 && grammarProgress >= 100;

  return (
    <Card className={`bg-gradient-to-br ${level.color} ${isCurrentLevel ? 'ring-2 ring-sakura-500' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-xl">
              {isCompleted && <CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
              <Trophy className="h-5 w-5 mr-2" />
              JLPT {level.level}
            </CardTitle>
            <CardDescription className="text-base font-medium">
              {level.title} - {level.description}
            </CardDescription>
          </div>
          <Badge variant={isCurrentLevel ? "default" : "secondary"}>
            {level.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Requirements Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <Brain className="h-4 w-4 mr-1" />
              Kanji: {Math.min(currentProgress.kanji, level.requirements.kanji)}/{level.requirements.kanji}
            </span>
            <span>{Math.round(kanjiProgress)}%</span>
          </div>
          <Progress value={kanjiProgress} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Vocabulary: {Math.min(currentProgress.vocabulary, level.requirements.vocabulary)}/{level.requirements.vocabulary}
            </span>
            <span>{Math.round(vocabProgress)}%</span>
          </div>
          <Progress value={vocabProgress} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <PenTool className="h-4 w-4 mr-1" />
              Grammar: {Math.min(currentProgress.grammar, level.requirements.grammar)}/{level.requirements.grammar}
            </span>
            <span>{Math.round(grammarProgress)}%</span>
          </div>
          <Progress value={grammarProgress} className="h-2" />
        </div>

        {/* Test Info */}
        <div className="pt-2 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Passing Score:</span>
              <div>{level.passingScore}%</div>
            </div>
            <div>
              <span className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Time Limit:
              </span>
              <div>{level.timeLimit}</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full" 
          variant={isCurrentLevel ? "default" : "outline"}
          disabled={isCompleted}
        >
          {isCompleted ? "Completed ✓" : isCurrentLevel ? "Continue Study" : "Start Level"}
        </Button>
      </CardContent>
    </Card>
  );
}
