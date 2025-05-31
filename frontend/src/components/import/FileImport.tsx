
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

interface FileImportProps {
  onImport: (content: string, metadata: { title: string; chapterId: string }) => void;
}

export function FileImport({ onImport }: FileImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      // Use filename (without extension) as default title
      setTitle(files[0].name.replace(/\.[^/.]+$/, ""));
      setError(null);
    }
  };
  
  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }
    
    if (!title) {
      setError("Please provide a title for the content.");
      return;
    }
    
    if (!chapterId) {
      setError("Please select or create a chapter.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Read file content as text
      const content = await file.text();
      
      // Process the content (in a real app, you might want to do more processing here)
      onImport(content, {
        title,
        chapterId,
      });
      
      // Reset form
      setFile(null);
      setTitle("");
      setError(null);
      
      // Reset the file input by clearing its value
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (err) {
      setError("Failed to import file. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock chapter data (in a real app, this would come from state or context)
  const chapters = [
    { id: "chapter1", title: "Chapter 1: Introduction" },
    { id: "chapter2", title: "Chapter 2: Basic Expressions" },
    { id: "chapter3", title: "Chapter 3: Daily Conversation" },
  ];

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Select Document</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            accept=".txt,.doc,.docx"
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Supported formats: .txt, .doc, .docx
        </p>
      </div>
      
      {file && (
        <>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this content"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chapter">Chapter</Label>
            <Select value={chapterId} onValueChange={setChapterId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a chapter" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleImport}
        disabled={!file || !title || !chapterId || isLoading}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? "Importing..." : "Import Content"}
      </Button>
    </div>
  );
}
