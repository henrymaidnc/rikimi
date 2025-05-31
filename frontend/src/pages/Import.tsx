
import { MainLayout } from "@/components/layout/MainLayout";
import { FileImport } from "@/components/import/FileImport";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Import() {
  const navigate = useNavigate();
  
  const handleImport = (content: string, metadata: { title: string; chapterId: string }) => {
    // In a real app, this would save the content to an API or localStorage
    console.log("Imported content:", { content, metadata });
    
    // Show success message and navigate back
    alert(`Successfully imported "${metadata.title}"`);
    navigate("/");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-ink-900">
            Import Content
          </h1>
        </div>
        
        <div className="mx-auto">
          <div className="bg-white p-6 rounded-md border border-border">
            <h2 className="text-xl font-medium text-ink-800 mb-4">
              Import Study Materials
            </h2>
            
            <p className="mb-6 text-muted-foreground">
              Import your lessons, vocabulary lists, or exercises from text or document files. 
              The content will be added to your study materials.
            </p>
            
            <FileImport onImport={handleImport} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
