import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, BookOpen, Edit, Plus, Pencil, Trash2, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { API_BASE_URL } from '@/config';


interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  example?: string;
}

interface Grammar {
  id: number;
  pattern: string;
  explanation: string;
  examples: string[];
}

export default function ChapterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get("highlight")?.toLowerCase();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedChapter, setEditedChapter] = useState<Partial<any>>({});
  const [editWordDialogOpen, setEditWordDialogOpen] = useState(false);
  const [editedWord, setEditedWord] = useState<Partial<Vocabulary>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vocabCollapsed, setVocabCollapsed] = useState(false);
  const [grammarCollapsed, setGrammarCollapsed] = useState(false);
  const [grammarDialogOpen, setGrammarDialogOpen] = useState(false);
  const [newGrammar, setNewGrammar] = useState<Partial<Grammar>>({
    pattern: "",
    explanation: "",
    examples: [""]
  });
  const [editGrammarDialogOpen, setEditGrammarDialogOpen] = useState(false);
  const [editedGrammar, setEditedGrammar] = useState<Partial<Grammar>>({});
  const [addWordDialogOpen, setAddWordDialogOpen] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", meaning: "", example: "" });
  const vocabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const grammarRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chapters/${id}/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chapter: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched chapter:', data);

        // Transform the API data to match our frontend Chapter type
        const transformedChapter = {
          ...data,
          bookName: data.book_name,
          chapterNumber: data.order,
          words: data.vocabularies || [],
          exercises: [],
          grammar_patterns: data.grammar_patterns || []
        };
        setChapter(transformedChapter);
        setEditedChapter(transformedChapter);
      } catch (error) {
        console.error("Error fetching chapter:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [id]);

  useEffect(() => {
    if (!loading && highlight) {
      // Try to scroll to the first highlighted vocab
      const vocabIndex = chapter?.words?.findIndex((word: any) => word.word.toLowerCase() === highlight);
      if (vocabIndex !== undefined && vocabIndex >= 0 && vocabRefs.current[vocabIndex]) {
        vocabRefs.current[vocabIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      // If not found in vocab, try grammar
      const grammarIndex = chapter?.grammar_patterns?.findIndex((g: any) => g.pattern.toLowerCase() === highlight);
      if (grammarIndex !== undefined && grammarIndex >= 0 && grammarRefs.current[grammarIndex]) {
        grammarRefs.current[grammarIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [loading, highlight, chapter]);

  const handleEditChapter = async () => {
    if (!editedChapter.bookName || !editedChapter.chapterNumber || !editedChapter.level) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const chapterData = {
        title: `${editedChapter.bookName} - Chapter ${editedChapter.chapterNumber}`,
        description: editedChapter.description || "",
        level: editedChapter.level,
        book_name: editedChapter.bookName,
        order: Number(editedChapter.chapterNumber),
        chapter_number: Number(editedChapter.chapterNumber),
      };

      const response = await fetch(`${API_BASE_URL}/chapters/${id}/`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(chapterData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update chapter: ${response.status}`);
      }

      const updatedChapter = await response.json();
      setChapter({
        ...updatedChapter,
        bookName: updatedChapter.book_name,
        chapterNumber: updatedChapter.order,
        words: updatedChapter.vocabularies || [],
        exercises: [],
        grammar_patterns: updatedChapter.grammar_patterns || []
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating chapter:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditWord = async () => {
    if (!editedWord.word || !editedWord.meaning) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vocabularies/${editedWord.id}/`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          word: editedWord.word,
          meaning: editedWord.meaning,
          example: editedWord.example || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update word: ${response.status}`);
      }

      const updatedWord = await response.json();
      
      // Update the word in the chapter's words array
      setChapter(prevChapter => {
        if (!prevChapter) return null;
        return {
          ...prevChapter,
          words: prevChapter.words.map(w => 
            w.id === updatedWord.id ? updatedWord : w
          )
        };
      });
      
      setEditWordDialogOpen(false);
    } catch (error) {
      console.error("Error updating word:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteChapter = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chapters/${id}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete chapter: ${response.status}`);
      }

      // Navigate back to chapters list after successful deletion
      navigate('/chapters');
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddGrammar = async () => {
    if (!newGrammar.pattern || !newGrammar.explanation) {
      alert("Please fill in the pattern and explanation");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/grammar_patterns/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          chapter: id,
          pattern: newGrammar.pattern,
          explanation: newGrammar.explanation,
          examples: newGrammar.examples?.filter(ex => ex.trim() !== "")
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add grammar: ${response.status}`);
      }

      const addedGrammar = await response.json();
      
      // Update the chapter's grammar array
      setChapter(prevChapter => {
        if (!prevChapter) return null;
        return {
          ...prevChapter,
          grammar_patterns: [...(prevChapter.grammar_patterns || []), addedGrammar]
        };
      });

      setGrammarDialogOpen(false);
      setNewGrammar({
        pattern: "",
        explanation: "",
        examples: [""]
      });
    } catch (error) {
      console.error("Error adding grammar:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditGrammar = async () => {
    if (!editedGrammar.pattern || !editedGrammar.explanation) {
      alert("Please fill in the pattern and explanation");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/grammar_patterns/${editedGrammar.id}/`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pattern: editedGrammar.pattern,
          explanation: editedGrammar.explanation,
          examples: editedGrammar.examples?.filter(ex => ex.trim() !== "")
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update grammar: ${response.status}`);
      }

      const updatedGrammar = await response.json();
      
      // Update the grammar in the chapter's grammar array
      setChapter(prevChapter => {
        if (!prevChapter) return null;
        return {
          ...prevChapter,
          grammar_patterns: prevChapter.grammar_patterns?.map(g => 
            g.id === updatedGrammar.id ? updatedGrammar : g
          ) || []
        };
      });

      setEditGrammarDialogOpen(false);
    } catch (error) {
      console.error("Error updating grammar:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteGrammar = async (grammarId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grammar_patterns/${grammarId}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete grammar: ${response.status}`);
      }

      // Remove the grammar from the chapter's grammar array
      setChapter(prevChapter => {
        if (!prevChapter) return null;
        return {
          ...prevChapter,
          grammar_patterns: prevChapter.grammar_patterns?.filter(g => g.id !== grammarId) || []
        };
      });
    } catch (error) {
      console.error("Error deleting grammar:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const addExampleField = () => {
    setNewGrammar(prev => ({
      ...prev,
      examples: [...(prev.examples || []), ""]
    }));
  };

  const updateExample = (index: number, value: string) => {
    setNewGrammar(prev => ({
      ...prev,
      examples: prev.examples?.map((ex, i) => i === index ? value : ex)
    }));
  };

  const removeExample = (index: number) => {
    setNewGrammar(prev => ({
      ...prev,
      examples: prev.examples?.filter((_, i) => i !== index)
    }));
  };

  const handleAddWord = async () => {
    if (!newWord.word || !newWord.meaning) {
      alert("Please fill in at least the word and its meaning");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vocabularies/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          word: newWord.word.trim(),
          meaning: newWord.meaning.trim(),
          example: newWord.example.trim(),
          chapter: chapter?.id
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add word: ${response.status}`);
      }

      const addedWord = await response.json();
      
      // Update the chapter's vocabulary list
      if (chapter) {
        setChapter({
          ...chapter,
          words: [...(chapter.words || []), addedWord]
        });
      }

      // Reset form and close dialog
      setNewWord({ word: "", meaning: "", example: "" });
      setAddWordDialogOpen(false);
    } catch (error) {
      console.error("Error adding word:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div>Loading chapter details...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !chapter) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {error || "Chapter not found"}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/chapters')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-ink-900">
                {chapter.bookName} - Chapter {chapter.chapterNumber} - {chapter.level}
              </h1>
              <p className="text-sm text-muted-foreground">{chapter.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddWordDialogOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Word
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGrammarDialogOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Grammar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Chapter
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Chapter
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <Collapsible open={!vocabCollapsed} onOpenChange={(open) => setVocabCollapsed(!open)}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold p-0 h-auto hover:bg-transparent">
                      <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${vocabCollapsed ? '' : 'rotate-90'}`} />
                      Vocabulary
                      <span className="ml-2 px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">
                        {chapter.words?.length || 0} words
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-4">
                  {chapter.words && chapter.words.length > 0 ? (
                    <div className="space-y-4">
                      {chapter.words.map((word, index) => (
                        <div
                          key={index}
                          ref={el => vocabRefs.current[index] = el}
                          className={`p-4 bg-secondary/20 rounded-lg ${highlight && word.word.toLowerCase() === highlight ? "ring-2 ring-yellow-300 bg-yellow-100" : ""}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium">{word.word}</h3>
                              <p className="text-muted-foreground">{word.meaning}</p>
                              {word.example && (
                                <p className="mt-2 text-sm italic text-muted-foreground">
                                  Example: {word.example}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditedWord(word);
                                setEditWordDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No vocabulary items added yet.
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <Collapsible open={!grammarCollapsed} onOpenChange={(open) => setGrammarCollapsed(!open)}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold p-0 h-auto hover:bg-transparent">
                      <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${grammarCollapsed ? '' : 'rotate-90'}`} />
                      Grammar
                      <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                        {chapter.grammar_patterns?.length || 0} grammars
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-4">
                  {chapter?.grammar_patterns && chapter.grammar_patterns.length > 0 ? (
                    <div className="space-y-4">
                      {chapter.grammar_patterns.map((grammar, index) => (
                        <div
                          key={index}
                          ref={el => grammarRefs.current[index] = el}
                          className={`p-4 bg-secondary/20 rounded-lg ${highlight && grammar.pattern.toLowerCase() === highlight ? "ring-2 ring-yellow-300 bg-yellow-100" : ""}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium">{grammar.pattern}</h3>
                              <p className="text-muted-foreground mt-1">{grammar.explanation}</p>
                              {grammar.examples && grammar.examples.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {grammar.examples.map((example, i) => (
                                    <p key={i} className="text-sm italic text-muted-foreground">
                                      Example {i + 1}: {example}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditedGrammar(grammar);
                                  setEditGrammarDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteGrammar(grammar.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No grammar patterns added yet.
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Edit Chapter</DialogTitle>
              <DialogDescription>
                Update chapter details and content.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select 
                    value={editedChapter.level as "N5" | "N4" | "N3" | "N2" | "N1"} 
                    onValueChange={(value: "N5" | "N4" | "N3" | "N2" | "N1") => 
                      setEditedChapter({ ...editedChapter, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N5">N5</SelectItem>
                      <SelectItem value="N4">N4</SelectItem>
                      <SelectItem value="N3">N3</SelectItem>
                      <SelectItem value="N2">N2</SelectItem>
                      <SelectItem value="N1">N1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bookName">Book Name</Label>
                  <Input
                    id="bookName"
                    value={editedChapter.bookName}
                    onChange={(e) => setEditedChapter({ ...editedChapter, bookName: e.target.value })}
                    placeholder="e.g., Minna no Nihongo 1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapterNumber">Chapter Number</Label>
                <Input
                  id="chapterNumber"
                  type="number"
                  value={editedChapter.chapterNumber?.toString()}
                  onChange={(e) => setEditedChapter({ 
                    ...editedChapter, 
                    chapterNumber: Number(e.target.value) 
                  })}
                  placeholder="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedChapter.description}
                  onChange={(e) => setEditedChapter({ ...editedChapter, description: e.target.value })}
                  placeholder="Brief description of chapter content"
                />
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditChapter}
                className="w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editWordDialogOpen} onOpenChange={setEditWordDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Edit Word</DialogTitle>
              <DialogDescription>
                Update word details and content.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="word">Word</Label>
                <Input
                  id="word"
                  value={editedWord.word}
                  onChange={(e) => setEditedWord({ ...editedWord, word: e.target.value })}
                  placeholder="Enter word"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meaning">Meaning</Label>
                <Input
                  id="meaning"
                  value={editedWord.meaning}
                  onChange={(e) => setEditedWord({ ...editedWord, meaning: e.target.value })}
                  placeholder="Enter meaning"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="example">Example (Optional)</Label>
                <Textarea
                  id="example"
                  value={editedWord.example}
                  onChange={(e) => setEditedWord({ ...editedWord, example: e.target.value })}
                  placeholder="Enter example sentence"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditWordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditWord}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the chapter
                and all its associated vocabulary words.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChapter}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={grammarDialogOpen} onOpenChange={setGrammarDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Add Grammar Pattern</DialogTitle>
              <DialogDescription>
                Add a new grammar pattern with explanation and examples.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern</Label>
                <Input
                  id="pattern"
                  value={newGrammar.pattern}
                  onChange={(e) => setNewGrammar({ ...newGrammar, pattern: e.target.value })}
                  placeholder="e.g., 〜てください"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={newGrammar.explanation}
                  onChange={(e) => setNewGrammar({ ...newGrammar, explanation: e.target.value })}
                  placeholder="Explain the grammar pattern and its usage"
                />
              </div>

              <div className="space-y-2">
                <Label>Examples</Label>
                {newGrammar.examples?.map((example, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={example}
                      onChange={(e) => updateExample(index, e.target.value)}
                      placeholder={`Example ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExample(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addExampleField}
                >
                  Add Example
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setGrammarDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddGrammar}>
                Add Grammar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editGrammarDialogOpen} onOpenChange={setEditGrammarDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Edit Grammar Pattern</DialogTitle>
              <DialogDescription>
                Edit the grammar pattern, explanation, and examples.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editPattern">Pattern</Label>
                <Input
                  id="editPattern"
                  value={editedGrammar.pattern}
                  onChange={(e) => setEditedGrammar({ ...editedGrammar, pattern: e.target.value })}
                  placeholder="e.g., 〜てください"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editExplanation">Explanation</Label>
                <Textarea
                  id="editExplanation"
                  value={editedGrammar.explanation}
                  onChange={(e) => setEditedGrammar({ ...editedGrammar, explanation: e.target.value })}
                  placeholder="Explain the grammar pattern and its usage"
                />
              </div>

              <div className="space-y-2">
                <Label>Examples</Label>
                {editedGrammar.examples?.map((example, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={example}
                      onChange={(e) => setEditedGrammar({
                        ...editedGrammar,
                        examples: editedGrammar.examples?.map((ex, i) => 
                          i === index ? e.target.value : ex
                        )
                      })}
                      placeholder={`Example ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditedGrammar({
                        ...editedGrammar,
                        examples: editedGrammar.examples?.filter((_, i) => i !== index)
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditedGrammar({
                    ...editedGrammar,
                    examples: [...(editedGrammar.examples || []), ""]
                  })}
                >
                  Add Example
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditGrammarDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditGrammar}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addWordDialogOpen} onOpenChange={setAddWordDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Word</DialogTitle>
              <DialogDescription>
                Add a new vocabulary word to this chapter.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="word">Word (Japanese) *</Label>
                <Input
                  id="word"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  placeholder="Enter Japanese word"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meaning">Meaning (English) *</Label>
                <Input
                  id="meaning"
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                  placeholder="Enter English meaning"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="example">Example Sentence (Optional)</Label>
                <Input
                  id="example"
                  value={newWord.example}
                  onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                  placeholder="Enter example sentence"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAddWordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddWord}
                disabled={!newWord.word || !newWord.meaning}
              >
                Add Word
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
} 