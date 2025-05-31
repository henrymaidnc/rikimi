
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Volume2, CheckCircle, XCircle } from "lucide-react";

// Mock Minna no Nihongo vocabulary data
const VOCABULARY_DATA = [
  {
    japanese: "わたし",
    romaji: "watashi",
    english: "I, me",
    lesson: "Lesson 1",
    category: "pronouns",
    example: "わたしは学生です。(I am a student.)"
  },
  {
    japanese: "がくせい",
    romaji: "gakusei", 
    english: "student",
    lesson: "Lesson 1",
    category: "occupations",
    example: "わたしは大学生です。(I am a university student.)"
  },
  {
    japanese: "せんせい",
    romaji: "sensei",
    english: "teacher",
    lesson: "Lesson 1", 
    category: "occupations",
    example: "田中先生は英語の先生です。(Tanaka-sensei is an English teacher.)"
  },
  {
    japanese: "たべます",
    romaji: "tabemasu",
    english: "to eat",
    lesson: "Lesson 2",
    category: "verbs",
    example: "朝ごはんを食べます。(I eat breakfast.)"
  },
  {
    japanese: "のみます",
    romaji: "nomimasu", 
    english: "to drink",
    lesson: "Lesson 2",
    category: "verbs",
    example: "コーヒーを飲みます。(I drink coffee.)"
  }
];

const GRAMMAR_PATTERNS = [
  {
    pattern: "です/である",
    meaning: "to be (polite/casual)",
    usage: "Used to state facts or describe things",
    example: "わたしは学生です。(I am a student.)",
    lesson: "Lesson 1"
  },
  {
    pattern: "を + verb",
    meaning: "object marker",
    usage: "Marks the direct object of an action",
    example: "本を読みます。(I read a book.)",
    lesson: "Lesson 2"
  },
  {
    pattern: "に + verb",
    meaning: "direction/time marker", 
    usage: "Indicates direction, destination, or specific time",
    example: "学校に行きます。(I go to school.)",
    lesson: "Lesson 2"
  }
];

interface VocabularyPracticeProps {
  onExit: () => void;
}

export function VocabularyPractice({ onExit }: VocabularyPracticeProps) {
  const [currentVocab, setCurrentVocab] = useState(0);
  const [currentGrammar, setCurrentGrammar] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [practiceMode, setPracticeMode] = useState<"jp-to-en" | "en-to-jp">("jp-to-en");
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const checkAnswer = () => {
    const vocab = VOCABULARY_DATA[currentVocab];
    const correct = practiceMode === "jp-to-en" 
      ? userInput.toLowerCase() === vocab.english.toLowerCase()
      : userInput.toLowerCase() === vocab.japanese.toLowerCase() || userInput.toLowerCase() === vocab.romaji.toLowerCase();
    
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
    
    setShowAnswer(true);
    
    setTimeout(() => {
      nextVocab();
    }, 2000);
  };

  const nextVocab = () => {
    setCurrentVocab(prev => (prev + 1) % VOCABULARY_DATA.length);
    setUserInput("");
    setShowAnswer(false);
  };

  const nextGrammar = () => {
    setCurrentGrammar(prev => (prev + 1) % GRAMMAR_PATTERNS.length);
  };

  const prevGrammar = () => {
    setCurrentGrammar(prev => prev === 0 ? GRAMMAR_PATTERNS.length - 1 : prev - 1);
  };

  const resetScore = () => {
    setScore({ correct: 0, total: 0 });
  };

  const vocab = VOCABULARY_DATA[currentVocab];
  const grammar = GRAMMAR_PATTERNS[currentGrammar];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="vocabulary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vocabulary">Vocabulary Practice</TabsTrigger>
          <TabsTrigger value="grammar">Grammar Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="space-y-6">
          {/* Score and Settings */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Badge variant="outline" className="bg-green-50">
                Score: {score.correct}/{score.total}
              </Badge>
              <Badge variant="outline">
                {vocab.lesson}
              </Badge>
              <Badge variant="outline" className="bg-blue-50">
                {vocab.category}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPracticeMode(practiceMode === "jp-to-en" ? "en-to-jp" : "jp-to-en")}
              >
                Switch Mode
              </Button>
              <Button variant="outline" size="sm" onClick={resetScore}>
                Reset Score
              </Button>
            </div>
          </div>

          {/* Practice Card */}
          <Card className="min-h-[400px] bg-gradient-to-br from-sakura-50 to-white">
            <CardContent className="p-8 flex flex-col items-center justify-center space-y-6">
              <Badge variant="outline" className="mb-4">
                {practiceMode === "jp-to-en" ? "Japanese → English" : "English → Japanese"}
              </Badge>
              
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-ink-800">
                  {practiceMode === "jp-to-en" ? vocab.japanese : vocab.english}
                </div>
                
                {practiceMode === "jp-to-en" && (
                  <div className="text-lg text-muted-foreground">
                    ({vocab.romaji})
                  </div>
                )}
              </div>

              {!showAnswer ? (
                <div className="w-full max-w-md space-y-4">
                  <Label className="text-center block">
                    Enter the {practiceMode === "jp-to-en" ? "English" : "Japanese"} translation:
                  </Label>
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && userInput && checkAnswer()}
                    placeholder={practiceMode === "jp-to-en" ? "English translation" : "Japanese or romaji"}
                    className="text-center text-lg"
                    autoFocus
                  />
                  <Button 
                    onClick={checkAnswer}
                    disabled={!userInput}
                    className="w-full bg-sakura-500 hover:bg-sakura-600"
                  >
                    Check Answer
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className={`text-xl font-semibold ${
                    (practiceMode === "jp-to-en" 
                      ? userInput.toLowerCase() === vocab.english.toLowerCase()
                      : userInput.toLowerCase() === vocab.japanese.toLowerCase() || userInput.toLowerCase() === vocab.romaji.toLowerCase()
                    ) ? "text-green-600" : "text-red-600"
                  }`}>
                    {(practiceMode === "jp-to-en" 
                      ? userInput.toLowerCase() === vocab.english.toLowerCase()
                      : userInput.toLowerCase() === vocab.japanese.toLowerCase() || userInput.toLowerCase() === vocab.romaji.toLowerCase()
                    ) ? (
                      <><CheckCircle className="inline h-5 w-5 mr-2" />Correct!</>
                    ) : (
                      <><XCircle className="inline h-5 w-5 mr-2" />Incorrect</>
                    )}
                  </div>
                  
                  <div className="bg-white/80 p-4 rounded-lg space-y-2">
                    <p><strong>Japanese:</strong> {vocab.japanese}</p>
                    <p><strong>Romaji:</strong> {vocab.romaji}</p>
                    <p><strong>English:</strong> {vocab.english}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Example:</strong> {vocab.example}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={nextVocab}>
              Skip
            </Button>
            <Button onClick={onExit} variant="ghost">
              Exit Practice
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="grammar" className="space-y-6">
          {/* Grammar Pattern Card */}
          <Card className="bg-gradient-to-br from-bamboo-50 to-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-ink-800">
                  Grammar Pattern: {grammar.pattern}
                </CardTitle>
                <Badge variant="outline">{grammar.lesson}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-ink-700 mb-2">Meaning:</h4>
                    <p className="text-ink-600">{grammar.meaning}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-ink-700 mb-2">Usage:</h4>
                    <p className="text-ink-600">{grammar.usage}</p>
                  </div>
                </div>
                
                <div className="bg-white/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-ink-700 mb-2">Example:</h4>
                  <p className="text-lg text-ink-800">{grammar.example}</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <Volume2 className="h-4 w-4 mr-1" />
                    Listen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={prevGrammar}>
              Previous Pattern
            </Button>
            
            <Badge variant="outline">
              {currentGrammar + 1} / {GRAMMAR_PATTERNS.length}
            </Badge>
            
            <Button variant="outline" onClick={nextGrammar}>
              Next Pattern
            </Button>
          </div>

          <div className="text-center">
            <Button onClick={onExit} variant="ghost">
              Exit Practice
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
