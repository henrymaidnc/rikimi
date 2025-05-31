
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, TrendingUp, BookOpen, Brain, PenTool } from "lucide-react";

// Mock data - in a real app, this would come from your database
const mockProgress = {
  kanji: {
    total: 150,
    learned: 89,
    reviewing: 23,
    mastered: 66
  },
  vocabulary: {
    total: 300,
    learned: 156,
    reviewing: 45,
    mastered: 111
  },
  grammar: {
    total: 50,
    learned: 23,
    reviewing: 8,
    mastered: 15
  }
};

const recentKanji = [
  { kanji: "水", meaning: "water", reading: "みず/すい", status: "mastered", date: "2024-01-15" },
  { kanji: "火", meaning: "fire", reading: "ひ/か", status: "learning", date: "2024-01-14" },
  { kanji: "木", meaning: "tree", reading: "き/もく", status: "reviewing", date: "2024-01-13" },
  { kanji: "金", meaning: "gold", reading: "きん/かね", status: "mastered", date: "2024-01-12" },
  { kanji: "土", meaning: "earth", reading: "つち/ど", status: "learning", date: "2024-01-11" }
];

const recentVocabulary = [
  { word: "おはよう", romaji: "ohayou", meaning: "good morning", status: "mastered", lesson: "L1" },
  { word: "ありがとう", romaji: "arigatou", meaning: "thank you", status: "learning", lesson: "L1" },
  { word: "すみません", romaji: "sumimasen", meaning: "excuse me", status: "reviewing", lesson: "L2" },
  { word: "はじめまして", romaji: "hajimemashite", meaning: "nice to meet you", status: "mastered", lesson: "L1" },
  { word: "よろしく", romaji: "yoroshiku", meaning: "please treat me well", status: "learning", lesson: "L1" }
];

const recentGrammar = [
  { pattern: "です/である", meaning: "is/are (polite)", example: "学生です", status: "mastered", lesson: "L1" },
  { pattern: "の", meaning: "possessive particle", example: "私の本", status: "learning", lesson: "L2" },
  { pattern: "は (wa)", meaning: "topic marker", example: "私は学生です", status: "reviewing", lesson: "L1" },
  { pattern: "を (wo)", meaning: "object marker", example: "本を読みます", status: "learning", lesson: "L3" },
  { pattern: "に", meaning: "direction/time marker", example: "学校に行きます", status: "reviewing", lesson: "L4" }
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-900">Progress Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track your Japanese learning progress
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProgressCard
            title="Kanji"
            icon={<Brain className="h-5 w-5" />}
            progress={mockProgress.kanji}
            color="sakura"
          />
          <ProgressCard
            title="Vocabulary"
            icon={<BookOpen className="h-5 w-5" />}
            progress={mockProgress.vocabulary}
            color="bamboo"
          />
          <ProgressCard
            title="Grammar"
            icon={<PenTool className="h-5 w-5" />}
            progress={mockProgress.grammar}
            color="ink"
          />
        </div>

        {/* Detailed Progress */}
        <Tabs defaultValue="kanji" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kanji">Kanji Progress</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
          </TabsList>

          <TabsContent value="kanji" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Recent Kanji Study
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kanji</TableHead>
                        <TableHead>Meaning</TableHead>
                        <TableHead className="hidden sm:table-cell">Reading</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentKanji.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-bold text-2xl">{item.kanji}</TableCell>
                          <TableCell>{item.meaning}</TableCell>
                          <TableCell className="hidden sm:table-cell">{item.reading}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{item.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vocabulary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Recent Vocabulary Study
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Word</TableHead>
                        <TableHead className="hidden sm:table-cell">Romaji</TableHead>
                        <TableHead>Meaning</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Lesson</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentVocabulary.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.word}</TableCell>
                          <TableCell className="hidden sm:table-cell">{item.romaji}</TableCell>
                          <TableCell>{item.meaning}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{item.lesson}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grammar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PenTool className="h-5 w-5 mr-2" />
                  Recent Grammar Study
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pattern</TableHead>
                        <TableHead>Meaning</TableHead>
                        <TableHead className="hidden sm:table-cell">Example</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Lesson</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentGrammar.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.pattern}</TableCell>
                          <TableCell>{item.meaning}</TableCell>
                          <TableCell className="hidden sm:table-cell">{item.example}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{item.lesson}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

interface ProgressCardProps {
  title: string;
  icon: React.ReactNode;
  progress: {
    total: number;
    learned: number;
    reviewing: number;
    mastered: number;
  };
  color: string;
}

function ProgressCard({ title, icon, progress, color }: ProgressCardProps) {
  const percentage = Math.round((progress.learned / progress.total) * 100);
  
  return (
    <Card className={`bg-gradient-to-br from-${color}-50 to-${color}-100`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg">{progress.learned}</div>
            <div className="text-muted-foreground">Learned</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{progress.mastered}</div>
            <div className="text-muted-foreground">Mastered</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants = {
    mastered: "bg-green-100 text-green-800",
    learning: "bg-blue-100 text-blue-800",
    reviewing: "bg-orange-100 text-orange-800"
  };

  return (
    <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
      {status}
    </Badge>
  );
}
