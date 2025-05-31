import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { InputTest } from "@/components/practice/InputTest";
import { JLPTStyleTest } from "@/components/practice/JLPTStyleTest";
import { FlashcardGame } from "@/components/kanji/FlashcardGame";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, PenTool, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from '@/config';

const GAME_COMPONENTS: any = {
  "input-test-kanji": InputTest,
  "input-test-vocabulary": InputTest,
  "input-test-grammar": InputTest,
  "jlpt-test-kanji": JLPTStyleTest,
  "jlpt-test-vocabulary": JLPTStyleTest,
  "jlpt-test-grammar": JLPTStyleTest,
  "jlpt-test-jlpt": JLPTStyleTest,
  "flashcards": FlashcardGame,
};

const GAME_LABELS: Record<string, string> = {
  "input-test-kanji": "Kanji Input Test",
  "input-test-vocabulary": "Vocabulary Input Test",
  "input-test-grammar": "Grammar Input Test",
  "jlpt-test-kanji": "Kanji JLPT-Style Test",
  "jlpt-test-vocabulary": "Vocabulary JLPT-Style Test",
  "jlpt-test-grammar": "Grammar JLPT-Style Test",
  "jlpt-test-jlpt": "JLPT-Style Test",
  "flashcards": "Flashcards",
};

const TYPE_ICONS: Record<string, JSX.Element> = {
  kanji: <Brain className="h-6 w-6 text-bamboo-700" />,
  vocabulary: <BookOpen className="h-6 w-6 text-sakura-700" />,
  grammar: <PenTool className="h-6 w-6 text-indigo-700" />,
};

export default function PracticeGamePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const type = params.get("type");
  const game = params.get("game");
  const book = params.get("book");
  const chapterNumber = params.get("chapter");
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const GameComponent = game ? GAME_COMPONENTS[game] : null;

  useEffect(() => {
    console.log('PracticeGamePage Params:', { type, game, book, chapterNumber });
    if (!type || !game || !book || !chapterNumber) {
      setError("Missing or invalid parameters. Please go back and select all options.");
      return;
    }
    // Only fetch chapterId for non-JLPT games
    if (type !== "jlpt") {
      setLoading(true);
      setError(null);
      fetch(`${API_BASE_URL}/chapters/?book_name=${encodeURIComponent(book)}&chapter_number=${chapterNumber}`)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            setChapterId(data.results[0].id);
          } else {
            setError("Chapter not found.");
          }
        })
        .catch(() => setError("Failed to fetch chapter info."))
        .finally(() => setLoading(false));
    }
  }, [type, game, book, chapterNumber]);

  // Helper for title
  const getTitle = () => {
    if (!type || !game) return "Practice";
    let label = GAME_LABELS[game] || game;
    let typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    return `${label} - ${typeLabel}`;
  };

  // Helper for icon
  const getTypeIcon = () => {
    if (!type) return null;
    return TYPE_ICONS[type] || null;
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <span className="text-lg text-muted-foreground">Loading...</span>
        </div>
      </MainLayout>
    );
  }

  if (!GameComponent) {
    return null;
  }

  // For JLPT, do not pass chapterId
  if (type === "jlpt") {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center gap-3 mb-6">
            {getTypeIcon()}
            <h1 className="text-2xl font-bold">{getTitle()}</h1>
          </div>
          <JLPTStyleTest onExit={() => navigate(-1)} bookName={book} chapterNumber={chapterNumber} />
        </div>
      </MainLayout>
    );
  }

  // For other types, pass chapterId
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-3 mb-6">
          {getTypeIcon()}
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
        </div>
        <GameComponent
          chapterId={chapterId}
          questionType={type}
          onExit={() => navigate(-1)}
          bookName={book}
          chapterNumber={chapterNumber}
        />
      </div>
    </MainLayout>
  );
} 