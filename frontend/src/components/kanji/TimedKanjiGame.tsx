
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

// Mock kanji data with multiple choice options
const GAME_QUESTIONS = [
  {
    kanji: "水",
    question: "What does 水 mean?",
    options: ["water", "fire", "tree", "earth"],
    correct: 0
  },
  {
    kanji: "火",
    question: "What does 火 mean?",
    options: ["water", "fire", "wind", "metal"],
    correct: 1
  },
  {
    kanji: "学",
    question: "What does 学 mean?",
    options: ["house", "car", "study", "food"],
    correct: 2
  },
  {
    kanji: "人",
    question: "What does 人 mean?",
    options: ["animal", "person", "plant", "building"],
    correct: 1
  },
  {
    kanji: "本",
    question: "What does 本 mean?",
    options: ["book", "pen", "paper", "desk"],
    correct: 0
  }
];

interface TimedKanjiGameProps {
  onExit: () => void;
}

export function TimedKanjiGame({ onExit }: TimedKanjiGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [gameActive, setGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameActive && timeLeft > 0 && !gameCompleted) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameActive(false);
            setGameCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameActive, timeLeft, gameCompleted]);

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(60);
    setScore(0);
    setCurrentQuestion(0);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (!gameActive || showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === GAME_QUESTIONS[currentQuestion].correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion < GAME_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameActive(false);
        setGameCompleted(true);
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameActive(false);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(60);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / GAME_QUESTIONS.length) * 100;

  if (!gameActive && !gameCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-bamboo-50 to-bamboo-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-ink-800 flex items-center justify-center">
              <Timer className="h-6 w-6 mr-2" />
              Timed Kanji Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-6xl">⏰</div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-ink-700">Ready to test your speed?</h3>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-ink-600 mb-2">Game Rules:</p>
                <ul className="text-sm text-ink-600 space-y-1">
                  <li>• Answer as many questions as possible in 60 seconds</li>
                  <li>• Choose the correct meaning for each kanji</li>
                  <li>• Quick thinking = higher score!</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={startGame} 
              size="lg"
              className="bg-bamboo-500 hover:bg-bamboo-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameCompleted) {
    const percentage = Math.round((score / GAME_QUESTIONS.length) * 100);
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-green-50 to-bamboo-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-ink-800">Game Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-6xl">🎯</div>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-bamboo-600">
                {score} / {GAME_QUESTIONS.length}
              </div>
              <div className="text-xl text-ink-700">
                {percentage}% Accuracy
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-ink-600">
                  {percentage >= 80 ? "Excellent work! 🌟" :
                   percentage >= 60 ? "Good job! Keep practicing! 👍" :
                   "Keep studying! You'll improve! 💪"}
                </p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={resetGame} className="bg-bamboo-500 hover:bg-bamboo-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={onExit} variant="outline">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = GAME_QUESTIONS[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Game Stats */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Badge variant="outline" className="bg-bamboo-50">
            Score: {score}
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            Question {currentQuestion + 1}/{GAME_QUESTIONS.length}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Timer className="h-4 w-4 text-red-500" />
          <span className={`font-mono text-lg ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-ink-700'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card className="min-h-[400px]">
        <CardContent className="p-8 flex flex-col items-center justify-center space-y-8">
          <div className="text-8xl font-bold text-ink-800">
            {question.kanji}
          </div>
          
          <h3 className="text-xl font-semibold text-ink-700 text-center">
            {question.question}
          </h3>

          <div className="grid grid-cols-2 gap-4 w-full">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                variant="outline"
                size="lg"
                className={`h-16 text-lg ${
                  showResult
                    ? index === question.correct
                      ? 'bg-green-100 border-green-400 text-green-800'
                      : selectedAnswer === index
                      ? 'bg-red-100 border-red-400 text-red-800'
                      : ''
                    : 'hover:bg-bamboo-50'
                }`}
              >
                {option}
              </Button>
            ))}
          </div>

          {showResult && (
            <div className="text-center">
              {selectedAnswer === question.correct ? (
                <div className="text-green-600 font-semibold">✓ Correct!</div>
              ) : (
                <div className="text-red-600 font-semibold">
                  ✗ Wrong. Correct answer: {question.options[question.correct]}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
