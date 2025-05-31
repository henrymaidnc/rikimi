import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, CheckCircle, XCircle, Eye } from "lucide-react";
import { API_BASE_URL } from '@/config';

interface FlashcardGameProps {
  onExit: () => void;
  bookName: string;
  chapterNumber: number;
  questionType: "vocabulary" | "grammar" | "kanji";
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function FlashcardGame({ onExit, bookName, chapterNumber, questionType }: FlashcardGameProps) {
  const [cardList, setCardList] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 1. Get chapter id
      const chapterRes = await fetch(
        `${API_BASE_URL}/chapters/?book_name=${encodeURIComponent(bookName)}&chapter_number=${chapterNumber}`
      );
      const chapterData = await chapterRes.json();
      if (!chapterData.results || !chapterData.results.length) {
        setCardList([]);
        setLoading(false);
        return;
      }
      const chapterId = chapterData.results[0].id;
      let cards: any[] = [];
      if (questionType === "vocabulary" || questionType === "kanji") {
        // Use vocabularies for both vocabulary and kanji flashcards
        const vocabRes = await fetch(
          `${API_BASE_URL}/vocabularies/?chapter=${chapterId}`
        );
        const vocabData = await vocabRes.json();
        cards = shuffleArray(vocabData.results || []);
        if (cards.length > 10) cards = cards.slice(0, 10);
      } else if (questionType === "grammar") {
        const grammarRes = await fetch(
          `${API_BASE_URL}/grammar_patterns/?chapter=${chapterId}`
        );
        const grammarData = await grammarRes.json();
        console.log('Fetched grammar patterns:', grammarData); // Debug log
        cards = shuffleArray(grammarData.results || []);
        if (cards.length > 10) cards = cards.slice(0, 10);
      }
      setCardList(cards);
      setLoading(false);
    };
    fetchData();
  }, [bookName, chapterNumber, questionType]);

  if (loading) {
    return <div>Loading flashcards...</div>;
  }
  if (!cardList.length) {
    return <div>No flashcards found for this chapter.</div>;
  }

  const currentCard = cardList[currentIndex];
  const progress = ((currentIndex + 1) / cardList.length) * 100;

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }
    setStudiedCards(prev => new Set(prev).add(currentIndex));
    setTimeout(() => {
      if (currentIndex < cardList.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      }
    }, 1000);
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setStudiedCards(new Set());
  };

  const nextCard = () => {
    if (currentIndex < cardList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  // Render front/back for each type
  const renderFront = () => {
    if (questionType === "vocabulary" || questionType === "kanji") {
      return (
        <>
          <div className="text-6xl font-bold text-ink-800 mb-4">
            {currentCard.word}
          </div>
          <p className="text-lg text-muted-foreground">
            What does this word mean?
          </p>
        </>
      );
    } else if (questionType === "grammar") {
      return (
        <>
          <div className="text-2xl font-bold text-ink-800 mb-4">
            {currentCard.pattern}
          </div>
          <p className="text-lg text-muted-foreground">
            What does this grammar mean?
          </p>
        </>
      );
    }
  };

  const renderBack = () => {
    if (questionType === "vocabulary" || questionType === "kanji") {
      return (
        <>
          <div className="text-4xl font-bold text-ink-800 mb-2">
            {currentCard.word}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-ink-700">Meaning:</p>
              <p className="text-xl text-ink-600">{currentCard.meaning}</p>
            </div>
            {currentCard.example && (
              <div>
                <p className="text-lg font-semibold text-ink-700">Example:</p>
                <p className="text-lg text-ink-600">{currentCard.example}</p>
              </div>
            )}
          </div>
        </>
      );
    } else if (questionType === "grammar") {
      return (
        <>
          <div className="text-2xl font-bold text-ink-800 mb-2">
            {currentCard.pattern}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-ink-700">Explanation:</p>
              <p className="text-xl text-ink-600">{currentCard.explanation}</p>
            </div>
            {currentCard.examples && currentCard.examples.length > 0 && (
              <div>
                <p className="text-lg font-semibold text-ink-700">Examples:</p>
                <ul className="text-lg text-ink-600 list-disc list-inside">
                  {currentCard.examples.map((ex: string, idx: number) => (
                    <li key={idx}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-2">
      {/* Progress and Stats */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-row space-x-4 w-full sm:w-auto justify-center sm:justify-start">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              ✓ {correctCount}
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              ✗ {incorrectCount}
            </Badge>
            <Badge variant="outline">
              {currentIndex + 1} / {cardList.length}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={resetGame} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <Card className="w-full min-h-[400px] bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
          {!showAnswer ? (
            <>
              {renderFront()}
              <Button 
                onClick={() => setShowAnswer(true)}
                className="bg-bamboo-500 hover:bg-bamboo-600"
                size="lg"
              >
                <Eye className="h-4 w-4 mr-2" />
                Show Answer
              </Button>
            </>
          ) : (
            <>
              {renderBack()}
              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-700"
                  size="lg"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Difficult
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  className="bg-green-500 hover:bg-green-600"
                  size="lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Got It!
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
        <Button 
          variant="outline" 
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto"
        >
          Previous
        </Button>
        <Button onClick={onExit} variant="ghost" className="w-full sm:w-auto">
          Exit Practice
        </Button>
        <Button 
          variant="outline" 
          onClick={nextCard}
          disabled={currentIndex === cardList.length - 1}
          className="w-full sm:w-auto"
        >
          Next
        </Button>
      </div>

      {/* Completion message */}
      {studiedCards.size === cardList.length && (
        <Card className="w-full bg-gradient-to-r from-green-50 to-bamboo-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              🎉 Great job! You've completed all flashcards!
            </h3>
            <p className="text-green-700 mb-4">
              Correct: {correctCount} | Need Review: {incorrectCount}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-x-0 sm:space-x-4 gap-2 sm:gap-0">
              <Button onClick={resetGame} className="bg-bamboo-500 hover:bg-bamboo-600 w-full sm:w-auto">
                Practice Again
              </Button>
              <Button onClick={onExit} variant="outline" className="w-full sm:w-auto">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
