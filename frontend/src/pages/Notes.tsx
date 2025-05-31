import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from '@/config';

export interface Note {
  id: number;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

// Custom hook for notes API operations
function useNotesAPI() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notes/`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data.results || data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: Omit<Note, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error('Failed to create note');
      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  };

  const updateNote = async (id: number, noteData: Partial<Note>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error('Failed to update note');
      const updated = await response.json();
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete note');
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return { notes, loading, error, createNote, updateNote, deleteNote };
}

// Custom hook for search and filtering
function useNotesFilter(notes: Note[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === "" || note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = notes.reduce((acc, note) => {
    const category = note.category || "general";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filteredNotes,
    categoryCounts
  };
}

// Category Filter Component
interface CategoryFilterProps {
  category: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function CategoryFilter({ category, count, active, onClick }: CategoryFilterProps) {
  const getActiveStyles = () => {
    if (!active) return 'bg-secondary/50 hover:bg-secondary text-secondary-foreground';
    
    switch (category) {
      case 'vocabulary': return 'bg-sakura-100 text-sakura-800';
      case 'grammar': return 'bg-ink-100 text-ink-800';
      case 'culture': return 'bg-bamboo-100 text-bamboo-800';
      case 'all': return 'bg-primary text-primary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <button
      className={`px-2 md:px-3 py-1 rounded-full text-xs transition-colors ${getActiveStyles()}`}
      onClick={onClick}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
    </button>
  );
}

// Search Bar Component
interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// Note Item Component
interface NoteItemProps {
  note: Note;
  isHighlighted: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
}

function NoteItem({ note, isHighlighted, onEdit, onDelete }: NoteItemProps) {
  const getCategoryStyles = (category?: string) => {
    switch (category) {
      case 'vocabulary': return 'bg-sakura-100 text-sakura-800';
      case 'grammar': return 'bg-ink-100 text-ink-800';
      case 'culture': return 'bg-bamboo-100 text-bamboo-800';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className={`p-3 md:p-4 bg-white rounded-md border border-border shadow-sm ${
      isHighlighted ? "ring-2 ring-yellow-300 bg-yellow-100" : ""
    }`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryStyles(note.category)}`}>
            {note.category || 'general'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(note.created_at), "MMM d, yyyy")}
        </span>
      </div>
      {/* <div className="font-semibold mb-1">{note.content}</div> */}
      {/* <div className="font-semibold mb-1">{note.title}</div> */}
      <p className="whitespace-pre-wrap mb-3 text-sm md:text-base">{note.content}</p>

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit({...note})}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(note.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

// Main Notes Component
export default function Notes() {
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotesAPI();
  const {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filteredNotes,
    categoryCounts
  } = useNotesFilter(notes);
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchParams] = useSearchParams();
  const noteRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle URL highlight parameter
  const rawHighlight = searchParams.get("highlight");
  const highlight = rawHighlight && rawHighlight !== "null" ? rawHighlight.toLowerCase() : null;

  const norm = (s: string | undefined | null) => (s ?? "").toLowerCase().trim();

  // Auto-scroll to highlighted note
  useEffect(() => {
    if (!loading && highlight) {
      const matchIndex = filteredNotes.findIndex(note =>
        norm(note.content).includes(norm(highlight))
      );
      if (matchIndex >= 0 && noteRefs.current[matchIndex]) {
        noteRefs.current[matchIndex]?.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }
    }
  }, [loading, highlight, filteredNotes]);

  // Handle save from NoteEditor
  const handleSaveNote = async (noteData: Omit<Note, "id" | "created_at" | "updated_at">) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          ...noteData,
          category: noteData.category || 'general'
        });
        setEditingNote(null);
      } else {
        await createNote({
          ...noteData,
          category: noteData.category || 'general'
        });
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote({
      ...note,
      category: note.category || 'general'
    });
  };

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-8 md:py-10 bg-white rounded-md border border-border shadow-sm">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold text-ink-900">Notes</h1>
        </div>

        {/* Search Bar - Uncomment if needed */}
        {/* <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} /> */}

        {/* Category Filters */}
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <CategoryFilter
              category="all"
              count={notes.length}
              active={filterCategory === "all"}
              onClick={() => setFilterCategory("all")}
            />
            {Object.entries(categoryCounts).map(([category, count]) => (
              <CategoryFilter
                key={category}
                category={category}
                count={count}
                active={filterCategory === category}
                onClick={() => setFilterCategory(category)}
              />
            ))}
          </div>
        </div>

        {/* Note Editor */}
        <div className="bg-white rounded-md border border-border shadow-sm">
          <div className="p-3 md:p-4 border-b border-border">
            <h2 className="text-base md:text-lg font-medium text-ink-800">
              {editingNote ? "Edit Note" : "Create New Note"}
            </h2>
          </div>
          <div className="p-3 md:p-4">
            <NoteEditor
              initialNote={editingNote || undefined}
              onSave={handleSaveNote}
              onCancel={editingNote ? () => setEditingNote(null) : undefined}
            />
          </div>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-8 md:py-10 bg-white rounded-md border border-border shadow-sm">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8 md:py-10 bg-white rounded-md border border-border shadow-sm">
            <p className="text-muted-foreground">No notes found</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredNotes.map((note, idx) => {
              const isHighlighted = !!highlight && norm(note.content).includes(norm(highlight));
              return (
                <div key={note.id} ref={el => noteRefs.current[idx] = el}>
                  <NoteItem
                    note={note}
                    isHighlighted={isHighlighted}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}