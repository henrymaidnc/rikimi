import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, CheckCircle, RotateCcw } from "lucide-react";
import { API_BASE_URL } from '@/config';

interface MixedTestGameProps {
  onExit: () => void;
  questionType: string;
  bookName?: string;
  chapterNumber?: string;
}

export function MixedTestGame({ onExit, questionType, bookName, chapterNumber }: MixedTestGameProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('MixedTestGame mounted with props:', { questionType, bookName, chapterNumber });
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        let inputTestQuestions = [];
        let jlptTestQuestions = [];

        // Only fetch from API if bookName and chapterNumber are provided
        if (bookName && chapterNumber) {
          // First try to get questions from the input test endpoint
          const inputTestUrl = `${API_BASE_URL}/input-test-questions/?book_name=${encodeURIComponent(bookName)}&chapter_number=${chapterNumber}&question_type=${questionType}`;
          console.log('Fetching input test questions from:', inputTestUrl);
          const inputTestRes = await fetch(inputTestUrl);
          
          if (inputTestRes.ok) {
            const inputTestData = await inputTestRes.json();
            inputTestQuestions = inputTestData.results || [];
            console.log('Fetched input test questions:', inputTestQuestions);
          } else {
            console.error('Failed to fetch input test questions:', inputTestRes.statusText);
          }

          // Then try to get questions from the JLPT test endpoint
          const jlptTestUrl = `${API_BASE_URL}/jlpt-test-questions/?book_name=${encodeURIComponent(bookName)}&chapter_number=${chapterNumber}&question_type=${questionType}`;
          console.log('Fetching JLPT test questions from:', jlptTestUrl);
          const jlptTestRes = await fetch(jlptTestUrl);
          
          if (jlptTestRes.ok) {
            const jlptTestData = await jlptTestRes.json();
            jlptTestQuestions = jlptTestData.results || [];
            console.log('Fetched JLPT test questions:', jlptTestQuestions);
          } else {
            console.error('Failed to fetch JLPT test questions:', jlptTestRes.statusText);
          }
        }

        // Combine and shuffle all questions
        const allQuestions = [...inputTestQuestions, ...jlptTestQuestions];
        console.log('Total questions before template:', allQuestions.length);
        
        if (allQuestions.length === 0) {
          // If no questions found, create some template questions
          const templateQuestions = [
            {
              id: -1,
              question_text: "食べる",
              correct_answer: "たべる",
              hint: "to eat",
              options: ["たべる", "のむ", "いく", "くる"]
            },
            {
              id: -2,
              question_text: "飲む",
              correct_answer: "のむ",
              hint: "to drink",
              options: ["たべる", "のむ", "いく", "くる"]
            },
            {
              id: -3,
              question_text: "行く",
              correct_answer: "いく",
              hint: "to go",
              options: ["たべる", "のむ", "いく", "くる"]
            },
            {
              id: -4,
              question_text: "来る",
              correct_answer: "くる",
              hint: "to come",
              options: ["たべる", "のむ", "いく", "くる"]
            }
          ];
          console.log('Using template questions:', templateQuestions);
          setQuestions(templateQuestions);
        } else {
          // Shuffle the questions
          const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
          console.log('Using shuffled questions:', shuffledQuestions);
          setQuestions(shuffledQuestions);
        }
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError(err.message);
        // Set template questions as fallback
        const templateQuestions = [
          {
            id: -1,
            question_text: "食べる",
            correct_answer: "たべる",
            hint: "to eat",
            options: ["たべる", "のむ", "いく", "くる"]
          },
          {
            id: -2,
            question_text: "飲む",
            correct_answer: "のむ",
            hint: "to drink",
            options: ["たべる", "のむ", "いく", "くる"]
          },
          {
            id: -3,
            question_text: "行く",
            correct_answer: "いく",
            hint: "to go",
            options: ["たべる", "のむ", "いく", "くる"]
          },
          {
            id: -4,
            question_text: "来る",
            correct_answer: "くる",
            hint: "to come",
            options: ["たべる", "のむ", "いく", "くる"]
          }
        ];
        console.log('Using fallback template questions:', templateQuestions);
        setQuestions(templateQuestions);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [bookName, chapterNumber, questionType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onExit}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No questions found for this chapter.</p>
          <Button onClick={onExit}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setTestCompleted(true);
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (Array.isArray(q.options) && q.options.length > 0) {
        if (q.options[userAnswer] === q.correct_answer) correct++;
      } else {
        if (userAnswer && userAnswer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim()) correct++;
      }
    });
    return correct;
  };

  const resetTest = () => {
    // Shuffle questions before resetting
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions);
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(null));
    setTestCompleted(false);
    setShowResults(false);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-ink-800">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                {score} / {questions.length}
              </div>
              <div className="text-xl text-ink-700 mb-4">
                {percentage}% Score
              </div>
              <Progress value={percentage} className="h-3 mb-4" />
              <p className="text-ink-600">
                {percentage >= 90 ? "Outstanding! 🌟" :
                 percentage >= 75 ? "Great work! 👏" :
                 percentage >= 60 ? "Good effort! Keep practicing! 📚" :
                 "Keep studying! You'll improve! 💪"}
              </p>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink-800">Detailed Results:</h3>
              {questions.map((q, index) => {
                const userAnswer = answers[index];
                let isCorrect = false;
                
                if (Array.isArray(q.options) && q.options.length > 0) {
                  isCorrect = q.options[userAnswer] === q.correct_answer;
                } else {
                  isCorrect = userAnswer && userAnswer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
                }

                return (
                  <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-ink-800">Q{index + 1}: {q.question_text}</p>
                        <div className="mt-2 text-sm">
                          <p className="text-ink-600">
                            Your answer: <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              {Array.isArray(q.options) && q.options.length > 0
                                ? (userAnswer !== null && userAnswer !== undefined ? q.options[userAnswer] : "No answer")
                                : (userAnswer || "No answer")}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700">
                              Correct answer: {Array.isArray(q.options) && q.options.length > 0
                                ? q.correct_answer
                                : q.correct_answer}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`ml-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={resetTest} className="bg-indigo-500 hover:bg-indigo-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Test
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

  return (
    <div className="mx-auto space-y-6">
      {/* Exit Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onExit}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Exit Test
        </Button>
      </div>

      {/* Progress */}
      <div className="flex justify-between items-center">
        <Badge variant="outline">
          Question {currentQuestion + 1} of {questions.length}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card className="min-h-[400px]">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-xl font-semibold text-ink-800 text-center">
            {question.question_text}
          </h2>

          {/* Question Content Based on Data */}
          {Array.isArray(question.options) && question.options.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-3">
                {question.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    variant={answers[currentQuestion] === index ? "default" : "outline"}
                    className="justify-start h-12 text-left"
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Enter your answer:</Label>
              <Input
                value={answers[currentQuestion] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="text-center text-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <Button 
          onClick={nextQuestion}
          disabled={answers[currentQuestion] === null || answers[currentQuestion] === ""}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          {currentQuestion === questions.length - 1 ? "Finish Test" : "Next"}
        </Button>
      </div>
    </div>
  );
}
