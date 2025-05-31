import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, PenTool } from "lucide-react";
import { InputTest } from "@/components/practice/InputTest";
import { JLPTStyleTest } from "@/components/practice/JLPTStyleTest";
import { FlashcardGame } from "@/components/kanji/FlashcardGame";
import { MixedTestGame } from "@/components/kanji/MixedTestGame";
import { API_BASE_URL } from '@/config';


interface Book {
  id: number;
  name: string;
}

interface Chapter {
  id: number;
  chapter_number: string;
  book_name: string;
  title?: string;
}

type PracticeType = "kanji" | "vocabulary" | "grammar" | "jlpt";

interface GameMode {
  id: string;
  label: string;
  component: React.ComponentType<any>;
}

const PRACTICE_TYPES = [
  { id: "kanji" as PracticeType, label: "Kanji", icon: <Brain className="h-6 w-6" /> },
  { id: "vocabulary" as PracticeType, label: "Vocabulary", icon: <BookOpen className="h-6 w-6" /> },
  { id: "grammar" as PracticeType, label: "Grammar", icon: <PenTool className="h-6 w-6" /> },
  { id: "jlpt" as PracticeType, label: "JLPT", icon: <span className="text-lg font-bold text-indigo-700">JLPT</span> },
];

const GAME_MODES: Record<PracticeType, GameMode[]> = {
  kanji: [
    { id: "flashcards", label: "Flashcards", component: FlashcardGame },
    { id: "input-test-kanji", label: "Input Test", component: InputTest },
    { id: "jlpt-test-kanji", label: "JLPT-Style Test", component: JLPTStyleTest },
    { id: "mixed-test-kanji", label: "Mixed Test", component: MixedTestGame },
  ],
  vocabulary: [
    { id: "flashcards", label: "Flashcards", component: FlashcardGame },
    { id: "input-test-vocabulary", label: "Input Test", component: InputTest },
    { id: "jlpt-test-vocabulary", label: "JLPT-Style Test", component: JLPTStyleTest },
    { id: "mixed-test-vocabulary", label: "Mixed Test", component: MixedTestGame },
  ],
  grammar: [
    { id: "flashcards", label: "Flashcards", component: FlashcardGame },
    { id: "input-test-grammar", label: "Input Test", component: InputTest },
    { id: "jlpt-test-grammar", label: "JLPT-Style Test", component: JLPTStyleTest },
    { id: "mixed-test-grammar", label: "Mixed Test", component: MixedTestGame },
  ],
  jlpt: [
    { id: "jlpt-test-jlpt", label: "JLPT-Style Test", component: JLPTStyleTest },
  ],
};

export default function Practice() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<PracticeType | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch books
  useEffect(() => {
    fetch(`${API_BASE_URL}/chapters/`)
      .then(res => res.json())
      .then(data => {
        // Get unique book names
        const bookNames = Array.from(new Set(data.results.map((c: any) => c.book_name)));
        // Map to objects with id and name (use name as id if no real id)
        const uniqueBooks = bookNames.map((name: string, idx: number) => ({ id: idx, name: String(name) }));
        setBooks(uniqueBooks);
      });
  }, []);

  // Fetch chapters for selected book
  useEffect(() => {
    if (!selectedBook) return;
    fetch(`${API_BASE_URL}/chapters/?book_name=${encodeURIComponent(selectedBook)}`)
      .then(res => res.json())
      .then(data => setChapters(data.results));
  }, [selectedBook]);

  // Reset selections on type/game/book change
  useEffect(() => { setSelectedGame(null); }, [selectedType]);
  useEffect(() => { setSelectedBook(null); setSelectedChapter(null); }, [selectedType, selectedGame]);
  useEffect(() => { setSelectedChapter(null); }, [selectedBook]);

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleStartPractice = () => {
    if (selectedType && selectedGame && selectedBook && selectedChapter) {
      navigate(`/practice/play?type=${selectedType}&game=${selectedGame}&book=${selectedBook}&chapter=${selectedChapter}`);
    }
  };

  return (
    <MainLayout>
      <div className="w-full min-h-[80vh] flex items-start sm:items-center justify-center bg-gradient-to-br from-sakura-50 via-bamboo-50 to-white py-8 px-2 sm:px-6 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl bg-white/90 border border-green-100 p-6 sm:p-8 space-y-8">
          <h1 className="text-3xl font-bold text-green-900 text-center">Practice Hub</h1>
          
          {/* Step 1: Select Type */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg text-green-800">1. Select Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PRACTICE_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex flex-col items-center gap-2 min-h-[120px] p-6 rounded-xl transition-all duration-300 ${
                    selectedType === type.id 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-white hover:bg-green-50 border-2 border-green-200'
                  }`}
                >
                  <div className={`p-3 rounded-full ${
                    selectedType === type.id ? 'bg-white/20' : 'bg-green-100'
                  }`}>
                    {type.icon}
                  </div>
                  <span className="text-lg font-medium">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Game Mode */}
          {selectedType && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg text-green-800">2. Select Game Mode</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {GAME_MODES[selectedType].map((mode) => (
                  <Button
                    key={mode.id}
                    variant={selectedGame === mode.id ? "default" : "outline"}
                    onClick={() => handleGameSelect(mode.id)}
                    className={`flex flex-col items-center gap-2 min-h-[100px] p-4 rounded-xl transition-all duration-300 ${
                      selectedGame === mode.id 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-white hover:bg-green-50 border-2 border-green-200'
                    }`}
                  >
                    <span className="text-lg font-medium">{mode.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Book and Chapter */}
          {selectedType && selectedGame && (
            <div className="space-y-6">
              <div>
                <h2 className="font-semibold text-lg text-green-800 mb-3">3. Select Book</h2>
                <select
                  className="w-full p-3 rounded-lg border-2 border-green-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  value={selectedBook || ""}
                  onChange={e => setSelectedBook(e.target.value)}
                >
                  <option value="">Select Book</option>
                  {books.map((book, idx) => (
                    <option key={book.id ?? book.name ?? idx} value={book.name}>{book.name}</option>
                  ))}
                </select>
              </div>
              {selectedBook && (
                <div>
                  <h2 className="font-semibold text-lg text-green-800 mb-3">4. Select Chapter</h2>
                  <select
                    className="w-full p-3 rounded-lg border-2 border-green-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 disabled:opacity-50"
                    value={selectedChapter || ""}
                    onChange={e => setSelectedChapter(e.target.value)}
                    disabled={!selectedBook}
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((chap, idx) => (
                      <option key={chap.id ?? chap.chapter_number ?? idx} value={chap.chapter_number}>
                        {chap.title ? chap.title : `Chapter ${chap.chapter_number}`} (#{chap.chapter_number})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Start Practice */}
          {selectedType && selectedGame && selectedBook && selectedChapter && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleStartPractice}
                className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Practice
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
