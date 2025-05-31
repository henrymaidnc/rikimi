import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Upload, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { API_BASE_URL } from '@/config';

function groupQuestions(questions: any[]) {
  // { [book_name]: { [chapter_number]: { [question_type]: [questions] } } }
  const grouped: any = {};
  for (const q of questions) {
    // Prefer direct fields, fallback to related chapter
    const book = q.book_name || (q.chapter && q.chapter.book_name) || "Unknown Book";
    const chapterNum = q.chapter_number || (q.chapter && q.chapter.chapter_number) || "Unknown Chapter";
    const type = q.question_type || "unknown";
    if (!grouped[book]) grouped[book] = {};
    if (!grouped[book][chapterNum]) grouped[book][chapterNum] = {};
    if (!grouped[book][chapterNum][type]) grouped[book][chapterNum][type] = [];
    grouped[book][chapterNum][type].push(q);
  }
  return grouped;
}

export default function ManageInputTestQuestions() {
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<any>({});
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<{[key: string]: boolean}>({});
  const [expandedTypes, setExpandedTypes] = useState<{[key: string]: boolean}>({});

  // Fetch all questions on mount and after import
  const fetchAllQuestions = async () => {
    let url = `${API_BASE_URL}/input-test-questions/`;
    let allQuestions: any[] = [];
    while (url) {
      const res = await fetch(url);
      const data = await res.json();
      allQuestions = allQuestions.concat(data.results || []);
      url = data.next;
    }
    setAllQuestions(allQuestions);
    setGrouped(groupQuestions(allQuestions));
  };
  useEffect(() => { fetchAllQuestions(); }, []);

  const handleImportQuestions = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const response = await fetch(`${API_BASE_URL}/input-test-questions/import_questions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to import questions");
      setImportResult(result.message);
      await fetchAllQuestions();
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleExportTemplate = () => {
    const template = {
      questions: [
        {
          question_text: "Example question?",
          correct_answer: "Correct answer",
          options: ["Option A", "Option B", "Option C", "Option D"],
          hint: "Optional hint",
          question_type: "vocabulary"
        }
      ],
      book_name: "Example Book",
      chapter_number: 1
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question_template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleChapter = (bookName: string, chapterNum: string) => {
    const key = `${bookName}-${chapterNum}`;
    setExpandedChapters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleType = (bookName: string, chapterNum: string, type: string) => {
    const key = `${bookName}-${chapterNum}-${type}`;
    setExpandedTypes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <MainLayout>
      <div className="mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Manage Questions</h1>
        <div className="flex gap-4 items-end">
          <Button variant="outline" onClick={handleExportTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Export Template
          </Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Questions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Questions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportQuestions}
                  disabled={importing}
                />
                {importError && (
                  <p className="text-sm text-red-500">{importError}</p>
                )}
                {importResult && (
                  <p className="text-sm text-green-600">{importResult}</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Questions (Grouped)</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(grouped).length === 0 ? (
              <p className="text-muted-foreground">No questions in the database yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([book, chapters]) => (
                  <div key={book} className="border rounded-lg p-4">
                    <h2 className="font-bold text-lg mb-2">Book: {book}</h2>
                    {Object.entries(chapters as any).map(([chapter, types]) => {
                      const chapterKey = `${book}-${chapter}`;
                      const isChapterExpanded = expandedChapters[chapterKey];
                      return (
                        <Collapsible
                          key={chapter}
                          open={isChapterExpanded}
                          onOpenChange={() => toggleChapter(book, chapter)}
                          className="ml-4"
                        >
                          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-accent p-2 rounded-md">
                            {isChapterExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <h3 className="font-semibold text-md">Chapter: {chapter}</h3>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="ml-6 mt-2">
                            {Object.entries(types as any).map(([type, qs]) => {
                              const typeKey = `${book}-${chapter}-${type}`;
                              const isTypeExpanded = expandedTypes[typeKey];
                              return (
                                <Collapsible
                                  key={type}
                                  open={isTypeExpanded}
                                  onOpenChange={() => toggleType(book, chapter, type)}
                                  className="mb-4"
                                >
                                  <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-accent p-2 rounded-md">
                                    {isTypeExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                    <h4 className="font-medium text-sm text-muted-foreground">Type: {type}</h4>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="ml-4 mt-2">
                                    <ul className="space-y-2">
                                      {(qs as any[]).map((q, i) => (
                                        <li key={q.id || i} className="border rounded-lg p-3 bg-card">
                                          <div className="space-y-2">
                                            <p className="font-medium">
                                              <span className="text-muted-foreground">Q{i + 1}:</span> {q.question_text}
                                            </p>
                                            <div className="text-sm space-y-1">
                                              <p>
                                                <span className="text-muted-foreground">Answer:</span> {q.correct_answer}
                                              </p>
                                              {q.hint && (
                                                <p className="text-muted-foreground">
                                                  <span className="italic">Hint:</span> {q.hint}
                                                </p>
                                              )}
                                              {Array.isArray(q.options) && q.options.length > 0 && (
                                                <div>
                                                  <p className="text-muted-foreground mb-1">Options:</p>
                                                  <ul className="list-disc list-inside ml-2">
                                                    {q.options.map((opt: string, idx: number) => (
                                                      <li key={idx} className={opt === q.correct_answer ? "text-green-600" : ""}>
                                                        {opt}
                                                        {opt === q.correct_answer && " ✓"}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 