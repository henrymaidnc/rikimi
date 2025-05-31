import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play } from "lucide-react";
import { API_BASE_URL } from '@/config';

interface Chapter {
  id: number;
  title: string;
  book_name: string;
  order: number;
  level: string;
  vocabularies: any[];
  grammar_patterns: any[];
}

interface ChapterSelectorProps {
  onChapterSelect: (book: string, chapter: string, chapterData: any) => void;
  practiceType: "kanji" | "vocabulary" | "grammar";
}

export function ChapterSelector({ onChapterSelect, practiceType }: ChapterSelectorProps) {
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chapters when component mounts
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chapters/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chapters: ${response.status}`);
        }

        const data = await response.json();
        setChapters(data.results);
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // Group chapters by book
  const books = chapters.reduce((acc: { [key: string]: Chapter[] }, chapter) => {
    const bookName = chapter.book_name;
    if (!acc[bookName]) {
      acc[bookName] = [];
    }
    acc[bookName].push(chapter);
    return acc;
  }, {});

  const selectedBookData = books[selectedBook];
  const selectedChapterData = selectedBookData?.find(ch => ch.id.toString() === selectedChapter);

  const getContentCount = (chapter: Chapter) => {
    switch (practiceType) {
      case "vocabulary": return chapter.vocabularies?.length || 0;
      case "grammar": return chapter.grammar_patterns?.length || 0;
      default: return 0;
    }
  };

  const handleStartPractice = () => {
    if (selectedBookData && selectedChapterData) {
      onChapterSelect(selectedBook, selectedChapter, selectedChapterData);
    }
  };

  if (loading) {
    return <div>Loading chapters...</div>;
  }

  if (error) {
    return <div>Error loading chapters: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Book</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a book" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(books).map((bookName) => (
                  <SelectItem key={bookName} value={bookName}>
                    {bookName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Chapter</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedChapter} 
              onValueChange={setSelectedChapter}
              disabled={!selectedBook}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a chapter" />
              </SelectTrigger>
              <SelectContent>
                {selectedBookData?.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id.toString()}>
                    <div className="flex items-center justify-between">
                      <span>{chapter.title}</span>
                      <Badge variant="secondary" className="ml-2">
                        {getContentCount(chapter)} {practiceType}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleStartPractice}
          disabled={!selectedBook || !selectedChapter}
          className="w-full md:w-auto"
        >
          <Play className="mr-2 h-4 w-4" />
          Start Practice
        </Button>
      </div>
    </div>
  );
}
