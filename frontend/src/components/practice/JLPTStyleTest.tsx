import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from '@/config';

interface JLPTStyleTestProps {
  onExit: () => void;
  bookName: string;
  chapterNumber: string;
}

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  hint?: string;
}

export function JLPTStyleTest({ onExit, bookName, chapterNumber }: JLPTStyleTestProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URL}/input-test-questions/?book_name=${encodeURIComponent(bookName)}&chapter_number=${chapterNumber}&question_type=jlpt`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        const mapped = (data.results || []).filter((q: any) => Array.isArray(q.options) && q.options.length > 0);
        setQuestions(mapped);
      } catch (err: any) {
        setError(err.message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [bookName, chapterNumber]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleFinishTest();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNext = () => {
    const answerIndex = parseInt(selectedAnswer);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      handleFinishTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]?.toString() || "");
    }
  };

  const handleFinishTest = () => {
    setIsActive(false);
    setShowResults(true);
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (String(answer) === String(questions[index].correct_answer) ? 1 : 0);
    }, 0);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers([]);
    setShowResults(false);
    setTimeLeft(1200);
    setIsActive(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 px-2">
        <span className="text-lg text-muted-foreground">Loading JLPT questions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">{error}</div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onExit}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questions.length && !loading && !error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">No JLPT questions found for this chapter.</div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">JLPT-Style Test Results 🎯</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🎉" : percentage >= 60 ? "😊" : "😿"}
            </div>
            <div className="text-3xl font-bold mb-2">
              {score}/{questions.length} ({percentage}%)
            </div>
            <div className="text-lg text-muted-foreground">
              {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep studying!"}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review:</h3>
            {questions.map((question, index) => {
              const isCorrect = String(answers[index]) === String(question.correct_answer);
              return (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-2 mb-2">
                    <span className={`text-2xl ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                      {isCorrect ? "✅" : "❌"}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{question.question_text}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your answer: {question.options[answers[index]] || "Not answered"}
                      </p>
                      <p className="text-sm text-green-600">
                        Correct answer: {question.options[question.correct_answer]}
                      </p>
                      {question.hint && (
                        <p className="text-sm text-blue-600 mt-2">{question.hint}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestart}>Try Again</Button>
            <Button variant="outline" onClick={onExit}>Back to Practice</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={timeLeft < 300 ? "text-red-500 font-bold" : ""}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="mx-auto">
        <CardHeader>
          <CardTitle className="text-center">🧪 JLPT-Style Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{question.question_text}</h3>
            
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentQuestion < questions.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleFinishTest}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finish Test
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
