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

// Function to get CSRF token from cookie
function getCSRFToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Function to fetch CSRF token
async function fetchCSRFToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    return getCSRFToken();
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
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
  const [pageSize] = useState(25); // 5 rows × 5 chapters per row
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
  const [importProgress, setImportProgress] = useState({
    currentSheet: 0,
    totalSheets: 0,
    currentWord: 0,
    totalWords: 0,
    status: ''
  });
  const [importing, setImporting] = useState(false);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  
  // Define fetchChapters function
  const fetchChapters = async () => {
    setLoading(true);
    try {
      console.log('Fetching all chapters...');
      let allChaptersData: any[] = [];
      let nextUrl = `${API_BASE_URL}/chapters/?ordering=book_name,chapter_number`;

      // Fetch all pages of chapters
      while (nextUrl) {
        console.log('Fetching from:', nextUrl);
        const response = await fetch(nextUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() || '',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chapters: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched page of chapters:', {
          count: data.count,
          results: data.results.length,
          next: data.next
        });

        // Transform the API data to match our frontend Chapter type
        const transformedChapters = data.results.map((chapter: any) => ({
          id: chapter.id,
          bookName: chapter.book_name,
          chapterNumber: chapter.chapter_number,
          level: chapter.level,
          description: chapter.description,
          words: chapter.vocabularies || [],
          exercises: [],
          grammar_patterns: chapter.grammar_patterns || []
        }));

        allChaptersData = [...allChaptersData, ...transformedChapters];
        nextUrl = data.next;
      }

      // Sort all chapters by book name and chapter number
      const sortedChapters = allChaptersData.sort((a, b) => {
        if (a.bookName !== b.bookName) {
          return a.bookName.localeCompare(b.bookName);
        }
        return a.chapterNumber - b.chapterNumber;
      });

      console.log('Total chapters fetched:', sortedChapters.length);
      console.log('Books found:', [...new Set(sortedChapters.map(c => c.bookName))]);
      
      setAllChapters(sortedChapters);
      setTotalPages(Math.ceil(sortedChapters.length / pageSize));
      updateDisplayedChapters(currentPage, sortedChapters);
      setLoadingProgress(100);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to update displayed chapters based on current page
  const updateDisplayedChapters = (page: number, chapters: any[] = allChapters) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageChapters = chapters.slice(startIndex, endIndex);
    setChapters(pageChapters);
    setCurrentPage(page);
    localStorage.setItem('chaptersPage', page.toString());
  };

  // Update useEffect to fetch all chapters on mount
  useEffect(() => {
    fetchChapters();
  }, []);

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

    try {
      // Fetch CSRF token first
      await fetchCSRFToken();
      const csrfToken = getCSRFToken();
      
      if (!csrfToken) {
        throw new Error('Failed to get CSRF token');
      }

      const chapterData = {
        level: newChapter.level,
        book_name: newChapter.bookName,
        chapter_number: parseInt(newChapter.chapterNumber),
        title: `${newChapter.bookName} - Chapter ${newChapter.chapterNumber}`,
        description: newChapter.description || "",
      };

      // Create the chapter
      console.log('Creating chapter with data:', chapterData);
      const chapterResponse = await fetch(`${API_BASE_URL}/chapters/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(chapterData),
      });

      if (!chapterResponse.ok) {
        const errorData = await chapterResponse.json();
        throw new Error(errorData.detail || 'Failed to create chapter');
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
              'X-CSRFToken': csrfToken,
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
      console.error('Error creating chapter:', error);
      throw error;
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
          'X-CSRFToken': getCSRFToken() || '',
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

  const calculateProgress = () => {
    if (importProgress.totalSheets === 0 || importProgress.totalWords === 0) return 0;
    
    const sheetProgress = (importProgress.currentSheet / importProgress.totalSheets) * 50;
    const wordProgress = (importProgress.currentWord / importProgress.totalWords) * 50;
    return Math.round(sheetProgress + wordProgress);
  };

  const handleImportVocabulary = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    setImporting(true);
    setImportProgress({
      currentSheet: 0,
      totalSheets: 0,
      currentWord: 0,
      totalWords: 0,
      status: 'Starting import...'
    });

    try {
      // Read the Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(fileData, { type: 'array' });
          
          console.log('Total sheets found:', workbook.SheetNames.length);
          console.log('Sheet names:', workbook.SheetNames);
          
          setImportProgress(prev => ({
            ...prev,
            totalSheets: workbook.SheetNames.length,
            status: 'Fetching existing chapters...'
          }));
          
          // First, get all existing chapters for this book
          const existingChaptersResponse = await fetch(
            `${API_BASE_URL}/chapters/?book_name=${encodeURIComponent(importingChapter.bookName)}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            }
          );
          
          if (!existingChaptersResponse.ok) {
            throw new Error('Failed to fetch existing chapters');
          }
          
          const existingChaptersData = await existingChaptersResponse.json();
          const existingChapters = existingChaptersData.results || [];
          console.log('Existing chapters:', existingChapters);
          
          let totalImported = 0;
          let totalWords = 0;
          let createdChapters = 0;
          let skippedSheets = 0;
          
          for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
            const sheetName = workbook.SheetNames[sheetIndex];
            console.log(`Processing sheet ${sheetIndex + 1}/${workbook.SheetNames.length}: ${sheetName}`);
            
            // Extract chapter number from sheet name (e.g., "Chapter 26" -> 26)
            const chapterNumberMatch = sheetName.match(/Chapter\s+(\d+)/i);
            const chapterNumber = chapterNumberMatch ? parseInt(chapterNumberMatch[1]) : sheetIndex + 1;
            console.log(`Extracted chapter number ${chapterNumber} from sheet name ${sheetName}`);
            
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            console.log(`Found ${jsonData.length} vocabulary entries in sheet ${sheetName}`);
            
            setImportProgress(prev => ({
              ...prev,
              currentSheet: sheetIndex + 1,
              totalWords: jsonData.length,
              currentWord: 0,
              status: `Processing sheet ${sheetName} (Chapter ${chapterNumber})`
            }));

            // Find or create chapter
            let createdChapter;
            const existingChapter = existingChapters.find(
              (chapter: any) => chapter.chapter_number === chapterNumber
            );

            if (existingChapter) {
              console.log(`Found existing chapter ${chapterNumber} (${sheetName}) with ID: ${existingChapter.id}`);
              createdChapter = existingChapter;
            } else {
              setImportProgress(prev => ({
                ...prev,
                status: `Creating new chapter ${chapterNumber} for sheet ${sheetName}`
              }));

              console.log(`Creating new chapter ${chapterNumber} for sheet ${sheetName}`);
              const chapterData = {
                level: importingChapter.level,
                book_name: importingChapter.bookName,
                chapter_number: chapterNumber,
                description: `${importingChapter.description || ""} - ${sheetName}`,
              };
              
              try {
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
                  console.warn(`Failed to create chapter ${chapterNumber} for sheet ${sheetName}: ${chapterResponse.status}`);
                  const errorData = await chapterResponse.json();
                  console.error('Chapter creation error:', errorData);
                  continue;
                }
                
                createdChapter = await chapterResponse.json();
                console.log(`Successfully created chapter ${chapterNumber} for sheet ${sheetName} with ID: ${createdChapter.id}`);
                createdChapters++;

                // Verify the chapter was created by fetching it
                const verifyResponse = await fetch(`${API_BASE_URL}/chapters/${createdChapter.id}/`, {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                });

                if (!verifyResponse.ok) {
                  console.warn(`Warning: Could not verify created chapter ${createdChapter.id}: ${verifyResponse.status}`);
                } else {
                  const verifiedChapter = await verifyResponse.json();
                  console.log('Verified chapter data:', verifiedChapter);
                }
              } catch (error) {
                console.warn(`Error creating chapter ${chapterNumber}: ${error.message}`);
                continue;
              }
            }

            // Process vocabulary entries
            let validEntries = 0;
            for (let i = 0; i < jsonData.length; i++) {
              const row = jsonData[i];
              setImportProgress(prev => ({
                ...prev,
                currentWord: i + 1,
                status: `Processing word ${i + 1}/${jsonData.length} in ${sheetName}`
              }));

              // Get all possible column names for word and meaning
              const wordColumn = Object.keys(row).find(key => 
                key.toLowerCase().includes('word') || 
                key.toLowerCase().includes('từ') ||
                key.toLowerCase().includes('vocabulary')
              );
              
              const meaningColumn = Object.keys(row).find(key => 
                key.toLowerCase().includes('meaning') || 
                key.toLowerCase().includes('nghĩa') ||
                key.toLowerCase().includes('definition')
              );

              const word = wordColumn ? row[wordColumn] : undefined;
              const meaning = meaningColumn ? row[meaningColumn] : undefined;

              console.log(`Processing row ${i + 1}:`, {
                word,
                meaning,
                wordColumn,
                meaningColumn,
                row: row,
                chapterId: createdChapter.id
              });

              if (!word || !meaning) {
                console.warn(`Skipping row ${i + 1} in ${sheetName} - missing required fields. Word: "${word}", Meaning: "${meaning}"`);
                continue;
              }

              try {
                const vocabularyData = {
                  chapter: createdChapter.id,
                  word: word.trim(),
                  meaning: meaning.trim(),
                  example: (row['Example'] || row['example'] || row['Ví dụ'] || row['ví dụ'] || '').trim(),
                  example_translation: (row['Translation'] || row['translation'] || row['Dịch'] || row['dịch'] || '').trim(),
                };

                console.log(`Creating vocabulary for word "${word}" in chapter ${chapterNumber} (ID: ${createdChapter.id}):`, vocabularyData);

                const vocabularyResponse = await fetch(`${API_BASE_URL}/vocabularies/`, {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify(vocabularyData),
                });

                if (!vocabularyResponse.ok) {
                  const errorData = await vocabularyResponse.json();
                  console.warn(`Failed to create vocabulary for word "${word}" in ${sheetName}:`, {
                    status: vocabularyResponse.status,
                    error: errorData,
                    chapterId: createdChapter.id
                  });
                  continue;
                }

                const createdVocabulary = await vocabularyResponse.json();
                console.log(`Successfully created vocabulary for word "${word}" in chapter ${chapterNumber} (ID: ${createdChapter.id}):`, createdVocabulary);

                validEntries++;
                totalImported++;
              } catch (error) {
                console.warn(`Error creating vocabulary for word "${word}" in ${sheetName}: ${error.message}`);
              }
            }

            if (validEntries === 0) {
              console.warn(`No valid vocabulary entries found in ${sheetName}. Total rows: ${jsonData.length}`);
              skippedSheets++;
            } else {
              console.log(`Successfully imported ${validEntries} vocabulary entries in chapter ${chapterNumber}`);
              totalWords += validEntries;
            }
          }

          // Show success message
          setImportProgress(prev => ({
            ...prev,
            status: `Import completed successfully! Imported ${totalImported} words across ${createdChapters} chapters. ${skippedSheets} sheets were skipped.`
          }));

          // Refresh the chapters list
          await fetchChapters();

          // Close the import dialog after a delay
          setTimeout(() => {
            setImportDialogOpen(false);
            setImporting(false);
            setImportProgress({
              currentSheet: 0,
              totalSheets: 0,
              currentWord: 0,
              totalWords: 0,
              status: ''
            });
          }, 3000);

        } catch (error) {
          console.error("Error importing vocabulary:", error);
          setImportProgress(prev => ({
            ...prev,
            status: `Error: ${error.message}`
          }));
          setImporting(false);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error reading file:", error);
      setImportProgress(prev => ({
        ...prev,
        status: `Error: ${error.message}`
      }));
      setImporting(false);
    }
  };

  // Function to handle navigation to chapter detail
  const handleViewChapter = (chapterId: number) => {
    navigate(`/chapters/${chapterId}`);
  };

  // Update pagination handlers
  const handlePreviousPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    updateDisplayedChapters(newPage);
  };

  const handleNextPage = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    updateDisplayedChapters(newPage);
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

                    {importing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{importProgress.status}</span>
                          <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
                        </div>
                        <Progress value={calculateProgress()} className="h-2" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="importFile">Excel File</Label>
                      <Input
                        id="importFile"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setImportDialogOpen(false);
                        setImporting(false);
                        setImportProgress({
                          currentSheet: 0,
                          totalSheets: 0,
                          currentWord: 0,
                          totalWords: 0,
                          status: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImportVocabulary}
                      disabled={!selectedFile || !importingChapter.bookName || !importingChapter.level || importing}
                    >
                      {importing ? 'Importing...' : 'Import'}
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
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
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
