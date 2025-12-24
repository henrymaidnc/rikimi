import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Clock, Shuffle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FlashcardGame } from "@/components/kanji/FlashcardGame";
import { TimedKanjiGame } from "@/components/kanji/TimedKanjiGame";
import { MixedTestGame } from "@/components/kanji/MixedTestGame";
import { VocabularyPractice } from "@/components/kanji/VocabularyPractice";

export default function KanjiPractice() {
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const games = [
    {
      id: "flashcards",
      title: "Kanji Flashcards",
      description: "Practice individual kanji with meaning and reading",
      icon: Brain,
      color: "bg-gradient-to-br from-sakura-100 to-sakura-200",
      component: FlashcardGame
    },
    {
      id: "timed-game",
      title: "Timed Kanji Challenge",
      description: "Quick-fire kanji recognition under time pressure",
      icon: Clock,
      color: "bg-gradient-to-br from-bamboo-100 to-bamboo-200",
      component: TimedKanjiGame
    },
    {
      id: "mixed-test",
      title: "Mixed Review Test",
      description: "Test covering kanji from multiple lessons",
      icon: Shuffle,
      color: "bg-gradient-to-br from-ink-100 to-ink-200",
      component: MixedTestGame
    },
    {
      id: "vocabulary",
      title: "Vocabulary & Grammar",
      description: "Practice words and grammar from Minna no Nihongo",
      icon: BookOpen,
      color: "bg-gradient-to-br from-accent-100 to-accent-200",
      component: VocabularyPractice
    }
  ];

  if (currentGame) {
    const game = games.find(g => g.id === currentGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <MainLayout>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCurrentGame(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold text-ink-900">
                {game.title}
              </h1>
            </div>
            <GameComponent 
              onExit={() => setCurrentGame(null)} 
              questionType={currentGame === "vocabulary" ? "vocabulary" : "kanji"}
              bookName="Minna no Nihongo"
              chapterNumber="1"
            />
          </div>
        </MainLayout>
      );
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-ink-900">
              漢字練習 Kanji Practice
            </h1>
            <p className="text-muted-foreground mt-1">
              Interactive games to master kanji, vocabulary, and grammar
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Card 
                key={game.id} 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${game.color} border-0`}
                onClick={() => setCurrentGame(game.id)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-4">
                    <IconComponent className="h-8 w-8 text-ink-700" />
                  </div>
                  <CardTitle className="text-xl text-ink-800">{game.title}</CardTitle>
                  <CardDescription className="text-ink-600">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    className="w-full bg-white/90 text-ink-800 hover:bg-white border-0"
                    size="lg"
                  >
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-sakura-50 to-bamboo-50 p-6 rounded-lg border border-border/50">
          <h2 className="text-xl font-semibold text-ink-800 mb-2">
            📚 Study Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-ink-700">
            <div>
              <p className="font-medium mb-1">🎯 Daily Practice:</p>
              <p>Spend 15-20 minutes daily for consistent progress</p>
            </div>
            <div>
              <p className="font-medium mb-1">🔄 Spaced Repetition:</p>
              <p>Review difficult kanji more frequently</p>
            </div>
            <div>
              <p className="font-medium mb-1">⏰ Timed Practice:</p>
              <p>Build speed and confidence under pressure</p>
            </div>
            <div>
              <p className="font-medium mb-1">📝 Write Practice:</p>
              <p>Practice writing kanji by hand for better retention</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
