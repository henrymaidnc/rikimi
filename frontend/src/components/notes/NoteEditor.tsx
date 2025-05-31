import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Note } from "@/types";

interface NoteEditorProps {
  initialNote?: Note;
  onSave: (note: Omit<Note, "id" | "dateCreated">) => void;
  onCancel?: () => void;
}

export function NoteEditor({ initialNote, onSave, onCancel }: NoteEditorProps) {
  const [content, setContent] = useState<string>(initialNote?.content || "");
  const [category, setCategory] = useState<Note["category"]>(initialNote?.category || "general");
  
  useEffect(() => {
    setContent(initialNote?.content || "");
    setCategory(initialNote?.category || "general");
  }, [initialNote]);

  const handleSave = () => {
    if (content.trim()) {
      onSave({
        content,
        category,
        chapterId: initialNote?.chapterId,
        exerciseId: initialNote?.exerciseId,
      });
      
      // Clear the content if it's a new note
      if (!initialNote) {
        setContent("");
      }
    }
  };

  return (
    <div className="space-y-3 p-4 border border-border/40 rounded-md bg-white">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium text-ink-800">
          {initialNote ? "Edit Note" : "New Note"}
        </h3>
        <Select 
          value={category} 
          onValueChange={(value) => setCategory(value as Note["category"])}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vocabulary">Vocabulary</SelectItem>
            <SelectItem value="grammar">Grammar</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note here..."
        className="min-h-[150px] resize-y"
      />
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSave}
          disabled={content.trim().length === 0}
        >
          Save Note
        </Button>
      </div>
    </div>
  );
}
