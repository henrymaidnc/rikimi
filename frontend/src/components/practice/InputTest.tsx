import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, HelpCircle, Loader2, Download, Upload, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { API_BASE_URL } from '@/config';

interface InputTestProps {
  chapterId: number;
  questionType: "vocabulary" | "grammar" | "kanji";
  onExit: () => void;
  bookName: string;
  chapterNumber: number;
}

interface Question {
  id?: number;
  question_text: string;
  correct_answer: string;
  hint?: string;
  question_type?: string;
  book_name?: string;
  chapter_number?: number;
  chapter?: {
    book_name?: string;
    chapter_number?: number;
  };
}

export function InputTest({ chapterId, questionType, onExit, bookName, chapterNumber }: InputTestProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    console.log("InputTest mounted with:", { chapterId, questionType });
    fetchQuestions();
  }, [chapterId, questionType]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/input-test-questions/?book_name=${encodeURIComponent(bookName)}&chapter_number=${chapterNumber}&question_type=${questionType}`;
      console.log('Fetching questions from:', url);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Fetched questions:', data);
      
      if (!data.results || data.results.length === 0) {
        // If no questions found, create some template questions
        const templateQuestions = [
          {
            id: -1,
            question_text: "食べる",
            correct_answer: "たべる",
            hint: "to eat"
          },
          {
            id: -2,
            question_text: "飲む",
            correct_answer: "のむ",
            hint: "to drink"
          }
        ];
        setQuestions(templateQuestions);
      } else {
        setQuestions(data.results);
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
          hint: "to eat"
        },
        {
          id: -2,
          question_text: "飲む",
          correct_answer: "のむ",
          hint: "to drink"
        }
      ];
      setQuestions(templateQuestions);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    setIsSubmitting(true);

    try {
      // Check if this is a template question (negative ID)
      if (currentQuestion.id && currentQuestion.id < 0) {
        // Handle template questions locally
        const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correct_answer.toLowerCase().trim();
        setFeedback({
          isCorrect,
          message: isCorrect
            ? "Correct! Well done! 🎉"
            : `Incorrect. The correct answer is: ${currentQuestion.correct_answer}`,
        });

        if (isCorrect) {
          setScore((prev) => prev + 1);
        }
      } else {
        // Handle API questions
        const response = await fetch(
          `${API_BASE_URL}/input-test-questions/${currentQuestion.id}/submit_answer/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ answer: userAnswer }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit answer");
        }

        const data = await response.json();
        setFeedback({
          isCorrect: data.is_correct,
          message: data.is_correct
            ? "Correct! Well done! 🎉"
            : `Incorrect. The correct answer is: ${data.correct_answer}`,
        });

        if (data.is_correct) {
          setScore((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setFeedback(null);
    setShowHint(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleExportResults = () => {
    const results = {
      chapterId,
      questionType,
      score,
      totalQuestions: questions.length,
      timestamp: new Date().toISOString(),
      questions: questions.map((q, index) => ({
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        hint: q.hint,
        question_type: q.question_type || questionType,
        userAnswer: index === currentQuestionIndex ? userAnswer : null,
      })),
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-results-${chapterId}-${questionType}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportToDatabase = async (questions: any[], importBookName: string, importChapterNumber: number) => {
    setImporting(true);
    setImportResult(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/input-test-questions/import_questions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            questions,
            book_name: importBookName,
            chapter_number: importChapterNumber,
            question_type: questionType,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to import questions");
      }

      setImportResult({
        success: true,
        message: data.message,
      });

      // Refresh questions after successful import
      fetchQuestions();
    } catch (err) {
      console.error("Error importing questions:", err);
      setImportResult({
        success: false,
        message: err.message,
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImportQuestions = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data.questions)) {
        throw new Error("Invalid question format");
      }

      // Assign question_type if missing
      const filteredQuestions = data.questions
        .map((q: any) => ({
          ...q,
          question_type: q.question_type || data.question_type || questionType
        }))
        .filter((q: any) => q.question_type === questionType);

      if (filteredQuestions.length === 0) {
        throw new Error(`No ${questionType} questions found in the file`);
      }

      // Import to database using file's book_name/chapter_number if present
      await handleImportToDatabase(
        filteredQuestions,
        data.book_name || bookName,
        data.chapter_number || chapterNumber
      );
      
      setShowImportDialog(false);
      setImportError(null);
    } catch (err) {
      setImportError(err.message);
    }
  };

  const handleUseTemplate = async () => {
    const templateQuestionsForType = [
      {
        question_text: "食べる",
        correct_answer: "たべる",
        hint: "to eat",
        question_type: questionType
      },
      {
        question_text: "飲む",
        correct_answer: "のむ",
        hint: "to drink",
        question_type: questionType
      }
    ];
    // Import template questions to database
    await handleImportToDatabase(templateQuestionsForType, bookName, chapterNumber);
    setShowImportDialog(false);
    setImportError(null);
  };

  const handleExportTemplate = () => {
    const template = {
      book_name: bookName || "Genki 1",
      chapter_number: chapterNumber || 1,
      question_type: questionType,
      questions: [
        {
          question_text: "食べる",
          correct_answer: "たべる",
          hint: "to eat"
        },
        {
          question_text: "飲む",
          correct_answer: "のむ",
          hint: "to drink"
        }
      ]
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `input-test-template-${questionType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 px-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onExit}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questions.length) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              No questions found for this chapter and type.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-muted-foreground">
            Score: {score} / {currentQuestionIndex + 1}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExportResults} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Import Questions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Questions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Import from JSON file</Label>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportQuestions}
                    disabled={importing}
                  />
                  {importError && (
                    <p className="text-sm text-red-500">{importError}</p>
                  )}
                </div>
                <Button variant="outline" onClick={handleExportTemplate} className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={onExit} className="w-full sm:w-auto">
            Exit Test
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="answer">Your Answer</Label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={feedback !== null || isSubmitting}
                className="text-lg w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !feedback && !isSubmitting) {
                    handleSubmit();
                  }
                }}
              />
              {currentQuestion.hint && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowHint(!showHint)}
                  disabled={feedback !== null || isSubmitting}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
            {showHint && currentQuestion.hint && (
              <p className="text-sm text-muted-foreground italic">
                Hint: {currentQuestion.hint}
              </p>
            )}
          </div>

          {feedback && (
            <Alert
              variant={feedback.isCorrect ? "default" : "destructive"}
              className="mt-4"
            >
              <div className="flex items-center gap-2">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{feedback.message}</AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
            {feedback ? (
              <Button 
                onClick={handleNext}
                className="min-w-[120px] w-full sm:w-auto"
              >
                {isLastQuestion ? "Finish Test" : "Next Question"}
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={!userAnswer.trim() || isSubmitting}
                className="min-w-[120px] w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
