import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Trash2, Search, Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Chapter } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '@/config';


interface WordData {
  word: string;
  meaning: string;
  example: string;
}

interface ImportedChapter {
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  bookName: string;
  chapterNumber: string;
  description?: string;
}

export default function Chapters() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    // Get the stored page from localStorage
    const storedPage = localStorage.getItem('chaptersPage');
    return storedPage ? parseInt(storedPage, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [newChapter, setNewChapter] = useState({
    description: "",
    level: "",
    bookName: "",
    chapterNumber: "",
    words: [] as WordData[]
  });
  const [currentWord, setCurrentWord] = useState({ word: "", meaning: "", example: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importingChapter, setImportingChapter] = useState<ImportedChapter>({
    level: "N5",
    bookName: "",
    chapterNumber: "",
    description: ""
  });
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  
  // Define fetchChapters function
  const fetchChapters = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chapters/?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched chapters:', data); // Debug log

      // Transform the API data to match our frontend Chapter type
      const transformedChapters = data.results.map((chapter: any) => ({
        ...chapter,
        bookName: chapter.book_name,
        chapterNumber: chapter.chapter_number,
        words: chapter.vocabularies || [], // Include vocabulary words
        exercises: []
      }));
      
      console.log('Transformed chapters:', transformedChapters); // Debug log
      setChapters(transformedChapters);
      setTotalPages(Math.ceil(data.count / pageSize));
      setCurrentPage(page);
      setLoadingProgress(100);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Add loading progress animation
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (loading) {
      setLoadingProgress(0);
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [loading]);

  // Fetch chapters when component mounts or page changes
  useEffect(() => {
    fetchChapters(currentPage);
  }, [currentPage]);

  // Update localStorage when page changes
  useEffect(() => {
    localStorage.setItem('chaptersPage', currentPage.toString());
  }, [currentPage]);

  const handleAddWord = () => {
    console.log('Adding word - Current state:', {
      currentWord,
      existingWords: newChapter.words
    });

    if (!currentWord.word || !currentWord.meaning) {
      console.log('Word not added - missing required fields');
      alert("Please fill in at least the word and its meaning");
      return;
    }

    const newWord = {
      word: currentWord.word.trim(),
      meaning: currentWord.meaning.trim(),
      example: currentWord.example.trim()
    };

    console.log('New word to add:', newWord);

    setNewChapter(prev => {
      const updated = {
        ...prev,
        words: [...prev.words, newWord]
      };
      console.log('Updated newChapter state:', updated);
      return updated;
    });

    // Clear the form
    setCurrentWord({ word: "", meaning: "", example: "" });
  };

  const handleRemoveWord = (index: number) => {
    console.log('Removing word at index:', index); // Debug log
    const updatedWords = newChapter.words.filter((_, i) => i !== index);
    console.log('Updated words after removal:', updatedWords); // Debug log
    setNewChapter({
      ...newChapter,
      words: updatedWords
    });
  };
  
  const handleCreateChapter = async () => {
    if (!newChapter.level || !newChapter.bookName || !newChapter.chapterNumber) {
      alert("Please fill in all required fields");
      return;
    }

    const chapterData = {
      level: newChapter.level,
      book_name: newChapter.bookName,
      chapter_number: parseInt(newChapter.chapterNumber),
      title: `${newChapter.bookName} - Chapter ${newChapter.chapterNumber}`,
      description: newChapter.description || "",
    };

    try {
      // Create the chapter
      console.log('Creating chapter with data:', chapterData);
      const chapterResponse = await fetch(`${API_BASE_URL}/chapters/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(chapterData),
      });

      if (!chapterResponse.ok) {
        const errorData = await chapterResponse.json();
        console.error('Chapter creation error:', errorData);
        throw new Error(`Failed to create chapter: ${chapterResponse.status} - ${JSON.stringify(errorData)}`);
      }

      const createdChapter = await chapterResponse.json();
      console.log('Chapter created successfully:', createdChapter);

      // Create vocabulary words if any
      console.log('Starting vocabulary creation. Words to create:', newChapter.words);
      
      if (newChapter.words && newChapter.words.length > 0) {
        const vocabPromises = newChapter.words.map(async (word) => {
          const vocabData = {
            word: word.word,
            meaning: word.meaning,
            example: word.example || "",
            chapter: createdChapter.id
          };
          
          console.log('Creating vocabulary with data:', vocabData);
          
          const vocabResponse = await fetch(`${API_BASE_URL}/vocabularies/`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(vocabData),
          });

          if (!vocabResponse.ok) {
            const errorData = await vocabResponse.json();
            console.error('Vocabulary creation error:', errorData);
            throw new Error(`Failed to create vocabulary word: ${word.word}`);
          }

          const createdVocab = await vocabResponse.json();
          console.log('Vocabulary created successfully:', createdVocab);
          return createdVocab;
        });

        try {
          const createdVocabs = await Promise.all(vocabPromises);
          console.log('All vocabulary words created successfully:', createdVocabs);
        } catch (error) {
          console.error('Error creating vocabulary words:', error);
          throw error;
        }
      } else {
        console.log('No words to create for this chapter');
      }

      // Fetch the updated chapter with its vocabulary
      console.log('Fetching updated chapter data...');
      const updatedChapterResponse = await fetch(`${API_BASE_URL}/chapters/${createdChapter.id}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!updatedChapterResponse.ok) {
        throw new Error('Failed to fetch updated chapter');
      }

      const updatedChapter = await updatedChapterResponse.json();
      console.log('Updated chapter with vocabulary:', updatedChapter);

      // Update the local state with the complete chapter data
      setChapters(prevChapters => [...prevChapters, {
        ...updatedChapter,
        bookName: updatedChapter.book_name,
        chapterNumber: updatedChapter.chapter_number,
        words: updatedChapter.vocabularies || [],
        exercises: []
      }]);

      // Reset form
      setNewChapter({ 
        description: "", 
        level: "", 
        bookName: "", 
        chapterNumber: "",
        words: []
      });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error in chapter creation process:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chapters/${chapterToDelete.id}/`, {
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

      // Remove the deleted chapter from the list
      setChapters(chapters.filter(chapter => chapter.id !== chapterToDelete.id));
      setDeleteDialogOpen(false);
      setChapterToDelete(null);
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Add search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vocabularies/?search=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to search: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error searching vocabulary:", error);
      setError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Add effect to handle search when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Function to export template
  const handleExportTemplate = () => {
    // Vocabulary sheet data
    const vocabData = [
      ['Word (Japanese)', 'Meaning (English)', 'Example (Optional)'],
      ['こんにちは', 'Hello', 'こんにちは、田中です。'],
      ['はじめまして', 'Nice to meet you', 'はじめまして、よろしくお願いします。']
    ];

    // Grammar sheet data
    const grammarData = [
      ['Pattern', 'Explanation', 'Example 1', 'Example 2'],
      ['〜てください', 'Please do ~ (polite request)', 'ドアを開けてください。', '静かにしてください。'],
      ['〜てもいいですか', 'May I ~? (asking permission)', 'トイレに行ってもいいですか。', 'ここで写真を撮ってもいいですか。']
    ];

    // Create worksheets
    const vocabSheet = XLSX.utils.aoa_to_sheet(vocabData);
    const grammarSheet = XLSX.utils.aoa_to_sheet(grammarData);

    // Create workbook and append sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, vocabSheet, 'Vocabulary');
    XLSX.utils.book_append_sheet(wb, grammarSheet, 'Grammar');

    // Save file
    XLSX.writeFile(wb, 'chapter_import_template.xlsx');
  };

  // Function to handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Function to extract chapter number from sheet name
  function extractChapterNumber(sheetName: string): number | null {
    // First, try to extract any number from the sheet name
    const anyNumber = sheetName.match(/\d+/);
    if (anyNumber) {
      const number = parseInt(anyNumber[0]);
      if (!isNaN(number)) {
        console.log(`Extracted chapter number ${number} from sheet name: ${sheetName}`);
        return number;
      }
    }
    console.warn(`Could not extract chapter number from sheet name: ${sheetName}`);
    return null;
  }

  // Function to import vocabulary
  const handleImportVocabulary = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    // Validate required fields
    if (!importingChapter.level || !importingChapter.bookName) {
      alert("Please select a level and enter a book name");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Read the Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(fileData, { type: 'array' });
          
          console.log('Total sheets found:', workbook.SheetNames.length);
          console.log('Sheet names:', workbook.SheetNames);
          
          let totalImported = 0;
          let totalWords = 0;
          let createdChapters = 0;
          let skippedSheets = 0;
          
          // Process each sheet as a separate chapter
          for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
            const sheetName = workbook.SheetNames[sheetIndex];
            console.log(`\nProcessing sheet ${sheetIndex + 1}/${workbook.SheetNames.length}: ${sheetName}`);
            
            // Update progress based on sheet processing
            setImportProgress((sheetIndex / workbook.SheetNames.length) * 100);
            
            // Extract chapter number from sheet name
            const chapterNumber = extractChapterNumber(sheetName);
            if (!chapterNumber) {
              console.warn(`Could not extract chapter number from sheet name: ${sheetName}, skipping...`);
              skippedSheets++;
              continue;
            }

            console.log(`Processing chapter ${chapterNumber} for book ${importingChapter.bookName}`);

            // Always create a new chapter for each sheet
            console.log(`Creating new chapter for sheet ${sheetName}`);
            const chapterData = {
              level: importingChapter.level,
              book_name: importingChapter.bookName,
              chapter_number: chapterNumber,
              title: `${importingChapter.bookName} - Chapter ${chapterNumber}`,
              description: `${importingChapter.description || ""} - ${sheetName}`,
            };

            console.log('Creating chapter with data:', chapterData);

            const chapterResponse = await fetch(`${API_BASE_URL}/chapters/`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(chapterData),
            });

            if (!chapterResponse.ok) {
              const errorData = await chapterResponse.json();
              console.error('Chapter creation error:', errorData);
              throw new Error(`Failed to create chapter: ${chapterResponse.status} - ${JSON.stringify(errorData)}`);
            }

            const createdChapter = await chapterResponse.json();
            console.log(`Created new chapter for sheet ${sheetName} with ID: ${createdChapter.id}`);
            createdChapters++;

            // Process vocabulary from the sheet
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            console.log(`Found ${jsonData.length} vocabulary entries in sheet ${sheetName}`);
            totalWords += jsonData.length;

            // Create vocabulary words for this chapter
            const vocabPromises = jsonData.map(async (row: any, index: number) => {
              // Update progress for each word being processed
              setImportProgress((sheetIndex / workbook.SheetNames.length) * 100 + 
                ((index / jsonData.length) * (100 / workbook.SheetNames.length)));

              // Sanitize and validate the data
              let word = row['Word (Japanese)']?.trim();
              let meaning = row['Meaning (English)']?.trim();
              let example = row['Example (Optional)']?.trim() || "";

              if (!word || !meaning) {
                console.warn(`Skipping invalid vocabulary entry: ${JSON.stringify(row)}`);
                return null;
              }

              // Clean the word field
              word = word.replace(/\[.*?\]/g, '').trim();
              word = word.replace(/「.*?」/g, '').trim();
              const japanesePart = word.split('(')[0].trim();
              if (japanesePart) {
                word = japanesePart;
              }
              const beforeHyphen = word.split('-')[0].trim();
              if (beforeHyphen) {
                word = beforeHyphen;
              }
              word = word.replace(/\s+/g, ' ').trim();

              // Clean the example field
              example = example.replace(/<br>/g, '\n');
              example = example.replace(/<[^>]*>/g, '');
              example = example.replace(/\s+/g, ' ').trim();

              if (!word || word.length === 0) {
                console.warn(`Skipping entry with empty word after cleaning: ${JSON.stringify(row)}`);
                return null;
              }

              const vocabData = {
                word: word,
                meaning: meaning,
                example: example,
                chapter: createdChapter.id
              };

              try {
                console.log('Creating vocabulary with data:', vocabData);
                const vocabResponse = await fetch(`${API_BASE_URL}/vocabularies/`, {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify(vocabData),
                });

                if (!vocabResponse.ok) {
                  const errorData = await vocabResponse.json();
                  console.error('Vocabulary creation error:', errorData);
                  throw new Error(`Failed to create vocabulary word: ${word}`);
                }

                return vocabResponse.json();
              } catch (error) {
                console.error(`Error creating vocabulary for word "${word}":`, error);
                return null;
              }
            });

            // Filter out null results from failed imports
            const results = await Promise.all(vocabPromises);
            const successfulImports = results.filter(result => result !== null);
            totalImported += successfulImports.length;
            console.log(`Successfully imported ${successfulImports.length}/${jsonData.length} words for chapter ${chapterNumber} (${sheetName})`);
          }

          // Set progress to 100% when complete
          setImportProgress(100);
          
          // Refresh chapters list after import
          console.log('Refreshing chapters list...');
          await fetchChapters();
          
          // Close dialog and reset states
          setImportDialogOpen(false);
          setSelectedFile(null);
          setImportingChapter({
            level: "N5",
            bookName: "",
            chapterNumber: "",
            description: ""
          });
          
          alert(`Successfully imported ${totalImported}/${totalWords} words across ${createdChapters} chapters! (${skippedSheets} sheets skipped)`);
        } catch (error) {
          console.error("Error importing vocabulary:", error);
          alert(`Error: ${error.message}`);
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error in import process:", error);
      alert(`Error: ${error.message}`);
      setIsImporting(false);
    }
  };

  // Function to handle navigation to chapter detail
  const handleViewChapter = (chapterId: number) => {
    navigate(`/chapters/${chapterId}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-ink-900">Books & Chapters</h1>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleExportTemplate}
                className="flex-1 sm:flex-none"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Template
              </Button>
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Vocabulary
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Vocabulary</DialogTitle>
                    <DialogDescription>
                      Upload an Excel file with vocabulary words. First, download the template to see the required format.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="importLevel">Level</Label>
                        <Select 
                          value={importingChapter.level} 
                          onValueChange={(value) => setImportingChapter({ ...importingChapter, level: value as "N5" | "N4" | "N3" | "N2" | "N1" })}
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
                        <Label htmlFor="importBookName">Book Name</Label>
                        <Input
                          id="importBookName"
                          value={importingChapter.bookName}
                          onChange={(e) => setImportingChapter({ ...importingChapter, bookName: e.target.value })}
                          placeholder="e.g., Minna no Nihongo 1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="importChapterNumber">Chapter Number</Label>
                      <Input
                        id="importChapterNumber"
                        type="number"
                        min={1}
                        value={importingChapter.chapterNumber}
                        onChange={(e) => setImportingChapter({ ...importingChapter, chapterNumber: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="importDescription">Description</Label>
                      <Textarea
                        id="importDescription"
                        value={importingChapter.description}
                        onChange={(e) => setImportingChapter({ ...importingChapter, description: e.target.value })}
                        placeholder="Brief description of chapter content"
                      />
                    </div>

                    {isImporting && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Importing vocabulary...</span>
                          <span className="text-sm text-muted-foreground">{Math.round(importProgress)}%</span>
                        </div>
                        <Progress value={importProgress} className="h-2" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="importFile">Excel File</Label>
                      <Input
                        id="importFile"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        disabled={isImporting}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setImportDialogOpen(false)}
                      disabled={isImporting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImportVocabulary}
                      disabled={isImporting || !selectedFile}
                    >
                      {isImporting ? 'Importing...' : 'Import'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 sm:flex-none">
                    <Plus className="mr-1 h-4 w-4" />
                    New Chapter
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Chapter</DialogTitle>
                    <DialogDescription>
                      Add a new chapter with vocabulary and content.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="level">Level</Label>
                        <Select value={newChapter.level} onValueChange={(value) => setNewChapter({ ...newChapter, level: value })}>
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
                          value={newChapter.bookName}
                          onChange={(e) => setNewChapter({ ...newChapter, bookName: e.target.value })}
                          placeholder="e.g., Minna no Nihongo 1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chapterNumber">Chapter Number</Label>
                      <Input
                        id="chapterNumber"
                        type="number"
                        min={1}
                        value={newChapter.chapterNumber}
                        onChange={(e) => setNewChapter({ ...newChapter, chapterNumber: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newChapter.description}
                        onChange={(e) => setNewChapter({ ...newChapter, description: e.target.value })}
                        placeholder="Brief description of chapter content"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Add Words</Label>
                        <span className="text-sm text-muted-foreground">
                          {newChapter.words.length} word{newChapter.words.length !== 1 ? 's' : ''} added
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Word (Japanese) *"
                          value={currentWord.word}
                          onChange={(e) => {
                            console.log('Word input changed:', e.target.value);
                            setCurrentWord(prev => ({ ...prev, word: e.target.value }));
                          }}
                        />
                        <Input
                          placeholder="Meaning (English) *"
                          value={currentWord.meaning}
                          onChange={(e) => {
                            console.log('Meaning input changed:', e.target.value);
                            setCurrentWord(prev => ({ ...prev, meaning: e.target.value }));
                          }}
                        />
                        <Input
                          placeholder="Example sentence (Optional)"
                          value={currentWord.example}
                          onChange={(e) => {
                            console.log('Example input changed:', e.target.value);
                            setCurrentWord(prev => ({ ...prev, example: e.target.value }));
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button" 
                          onClick={handleAddWord} 
                          variant="outline" 
                          size="sm"
                          disabled={!currentWord.word || !currentWord.meaning}
                        >
                          Add Word
                        </Button>
                        {currentWord.word || currentWord.meaning ? (
                          <span className="text-sm text-muted-foreground">
                            Click "Add Word" to add this word to the chapter
                          </span>
                        ) : null}
                      </div>

                      {newChapter.words.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          <div className="text-sm font-medium">Added Words:</div>
                          {newChapter.words.map((word, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                              <span className="text-sm">
                                <strong>{word.word}</strong> - {word.meaning}
                                {word.example && <em className="block text-xs text-muted-foreground">{word.example}</em>}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveWord(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateChapter}>
                      Create Chapter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vocabulary words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map((word) => (
                      <div
                        key={word.id}
                        className="p-3 hover:bg-secondary/20 cursor-pointer border-b last:border-b-0"
                        onClick={() => navigate(`/chapters/${word.chapter}`)}
                      >
                        <div className="font-medium">{word.word}</div>
                        <div className="text-sm text-muted-foreground">{word.meaning}</div>
                        {word.example && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            Example: {word.example}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Loading chapters...</span>
              <span className="text-sm text-muted-foreground">{Math.round(loadingProgress)}%</span>
            </div>
            <Progress value={loadingProgress} className="h-2" />
          </div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((chapter) => (
                <Card key={chapter.id} className="overflow-hidden">
                  <CardHeader className="bg-secondary/30">
                    <CardTitle className="text-base">
                      {chapter.bookName ? (
                        <>
                          <span className="font-semibold">{chapter.bookName}</span>
                          {chapter.chapterNumber && (
                            <> - Chapter {chapter.chapterNumber}</>
                          )}
                          {chapter.level && (
                            <> - {chapter.level}</>
                          )}
                        </>
                      ) : (
                        chapter.title
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{chapter.description}</CardDescription>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                        {chapter.words?.length || 0} words
                      </span>
                      <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                        {chapter.grammar_patterns?.length || 0} grammars
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-2 text-sm mb-4">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {chapter.exercises.length} Exercise{chapter.exercises.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {chapter.words && chapter.words.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Sample Words:</h4>
                        {chapter.words.slice(0, 3).map((word, index) => (
                          <div key={index} className="p-2 bg-secondary/20 rounded-md text-sm">
                            <strong>{word.word}</strong> - {word.meaning}
                          </div>
                        ))}
                        {chapter.words.length > 3 && (
                          <div className="text-sm text-muted-foreground text-right">
                            +{chapter.words.length - 3} more words
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-white pt-0">
                    <div className="flex flex-wrap gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewChapter(chapter.id)}
                        className="flex-1 sm:flex-none"
                      >
                        View Chapter
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setChapterToDelete(chapter);
                          setDeleteDialogOpen(true);
                        }}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:w-full">
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
    </MainLayout>
  );
}
