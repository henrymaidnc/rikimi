import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from '@/config';

interface Chapter {
  id: number;
  book_name: string;
  chapter_number: number;
  level: string;
}

interface ChapterSelectorProps {
  onSelect: (selectedChapters: Chapter[]) => void;
  onCancel: () => void;
}

export function ChapterSelector({ onSelect, onCancel }: ChapterSelectorProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chapters/`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chapters');
        }

        const data = await response.json();
        setChapters(data.results || []);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  const handleChapterToggle = (chapterId: number) => {
    setSelectedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedChapters.size === chapters.length) {
      setSelectedChapters(new Set());
    } else {
      setSelectedChapters(new Set(chapters.map(c => c.id)));
    }
  };

  const handleStart = () => {
    const selected = chapters.filter(c => selectedChapters.has(c.id));
    onSelect(selected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Chapters for Practice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="select-all"
              checked={selectedChapters.size === chapters.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select All Chapters</Label>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`chapter-${chapter.id}`}
                  checked={selectedChapters.has(chapter.id)}
                  onCheckedChange={() => handleChapterToggle(chapter.id)}
                />
                <Label htmlFor={`chapter-${chapter.id}`} className="flex-1">
                  {chapter.book_name} - Chapter {chapter.chapter_number} ({chapter.level})
                </Label>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleStart}
              disabled={selectedChapters.size === 0}
            >
              Start Practice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 