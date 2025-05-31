
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { StudyContent } from "@/components/study/StudyContent";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Check, Plus } from "lucide-react";
import { DailyStudy, Exercise, Note } from "@/types";

// Mock data - in a real app, this would come from localStorage or an API
const MOCK_DAILY_STUDIES: DailyStudy[] = [
  {
    id: "study1",
    date: new Date(2025, 3, 21).toISOString(), // April 21, 2025
    exerciseIds: ["ex1"],
    noteIds: ["note1"],
    completed: true,
    chapterId: "chapter1",
  },
  {
    id: "study2",
    date: new Date(2025, 3, 22).toISOString(), // April 22, 2025
    exerciseIds: ["ex2"],
    noteIds: ["note2"],
    completed: false,
    chapterId: "chapter1",
  },
];

const MOCK_EXERCISES: Exercise[] = [
  {
    id: "ex1",
    title: "Basic Greetings",
    content: `
      <h3>Greetings in Japanese</h3>
      <p>In this exercise, we'll learn basic greetings in Japanese:</p>
      <ul>
        <li><strong>おはようございます</strong> (Ohayou gozaimasu) - Good morning</li>
        <li><strong>こんにちは</strong> (Konnichiwa) - Hello/Good afternoon</li>
        <li><strong>こんばんは</strong> (Konbanwa) - Good evening</li>
        <li><strong>さようなら</strong> (Sayounara) - Goodbye</li>
        <li><strong>おやすみなさい</strong> (Oyasumi nasai) - Good night</li>
      </ul>
      <p>Practice saying these greetings out loud and use them in the appropriate situations.</p>
    `,
    chapterId: "chapter1",
  },
  {
    id: "ex2",
    title: "Self Introduction",
    content: `
      <h3>Introducing Yourself in Japanese</h3>
      <p>Learn how to introduce yourself in Japanese:</p>
      <ul>
        <li><strong>はじめまして</strong> (Hajimemashite) - Nice to meet you</li>
        <li><strong>私の名前は〇〇です</strong> (Watashi no namae wa ___ desu) - My name is ___</li>
        <li><strong>どうぞよろしく</strong> (Douzo yoroshiku) - Please treat me well/Nice to meet you</li>
      </ul>
      <p>Practice creating a full self-introduction using these phrases.</p>
    `,
    chapterId: "chapter1",
  },
];

const MOCK_NOTES: Note[] = [
  {
    id: "note1",
    content: "In casual settings, 'ohayou' without 'gozaimasu' can be used among friends.",
    dateCreated: new Date(2025, 3, 21).toISOString(),
    category: "culture",
    exerciseId: "ex1",
    chapterId: "chapter1",
  },
  {
    id: "note2",
    content: "When introducing yourself formally, add 'と申します' (to moushimasu) instead of 'です' (desu) for extra politeness.",
    dateCreated: new Date(2025, 3, 22).toISOString(),
    category: "grammar",
    exerciseId: "ex2",
    chapterId: "chapter1",
  },
];

export default function DailyView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [dailyStudy, setDailyStudy] = useState<DailyStudy | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState("exercises");
  
  // For new daily study
  const isNewStudy = id === "new";
  const dateParam = searchParams.get("date");
  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  
  useEffect(() => {
    if (isNewStudy) {
      // Creating a new daily study
      setDailyStudy({
        id: "new",
        date: selectedDate.toISOString(),
        exerciseIds: [],
        noteIds: [],
        completed: false,
      });
      setExercises([]);
      setNotes([]);
    } else {
      // Find existing daily study
      const study = MOCK_DAILY_STUDIES.find(s => s.id === id);
      if (study) {
        setDailyStudy(study);
        
        // Get exercises for this study
        const studyExercises = MOCK_EXERCISES.filter(ex => 
          study.exerciseIds.includes(ex.id)
        );
        setExercises(studyExercises);
        
        // Get notes for this study
        const studyNotes = MOCK_NOTES.filter(note => 
          study.noteIds.includes(note.id)
        );
        setNotes(studyNotes);
      }
    }
  }, [id, isNewStudy, dateParam]);

  // Handle adding a new note
  const handleAddNote = (noteData: Omit<Note, "id" | "dateCreated">) => {
    // In a real app, this would save to an API or localStorage
    const newNote: Note = {
      id: `note${MOCK_NOTES.length + 1}`,
      dateCreated: new Date().toISOString(),
      ...noteData,
    };
    
    setNotes(prevNotes => [...prevNotes, newNote]);
    
    // Update daily study note IDs
    if (dailyStudy) {
      const updatedStudy = {
        ...dailyStudy,
        noteIds: [...dailyStudy.noteIds, newNote.id]
      };
      setDailyStudy(updatedStudy);
    }
  };
  
  // Handle marking study as complete
  const handleMarkComplete = () => {
    if (dailyStudy) {
      const updatedStudy = {
        ...dailyStudy,
        completed: true
      };
      setDailyStudy(updatedStudy);
      
      // In a real app, save the updated study
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  if (!dailyStudy) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <p>Study session not found.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Back to Calendar
          </Button>
        </div>
      </MainLayout>
    );
  }

  const studyDate = new Date(dailyStudy.date);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-ink-900">
                {format(studyDate, "MMMM d, yyyy")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {dailyStudy.chapterId ? `Chapter: ${dailyStudy.chapterId}` : "No chapter assigned"}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isNewStudy && !dailyStudy.completed && (
              <Button
                onClick={handleMarkComplete}
                className="bg-bamboo-500 hover:bg-bamboo-600"
              >
                <Check className="mr-1 h-4 w-4" />
                Complete
              </Button>
            )}
            {dailyStudy.completed && (
              <div className="bg-bamboo-100 text-bamboo-800 px-3 py-1 rounded-md flex items-center">
                <Check className="mr-1 h-4 w-4" />
                Completed
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="exercises">
              <BookOpen className="h-4 w-4 mr-1" />
              Exercises ({exercises.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercises" className="space-y-4">
            {exercises.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-md">
                <p className="text-muted-foreground">No exercises added yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => navigate("/import")}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Exercises
                </Button>
              </div>
            ) : (
              exercises.map((exercise) => (
                <StudyContent
                  key={exercise.id}
                  exercise={exercise}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <NoteEditor 
              onSave={handleAddNote}
            />
            
            {notes.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-md">
                <p className="text-muted-foreground">No notes added yet. Use the form above to add your first note.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                {notes.map((note) => (
                  <div 
                    key={note.id}
                    className="p-4 border border-border rounded-md bg-white"
                  >
                    <div className="flex justify-between mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full 
                        ${note.category === 'vocabulary' ? 'bg-sakura-100 text-sakura-800' : 
                          note.category === 'grammar' ? 'bg-ink-100 text-ink-800' :
                          note.category === 'culture' ? 'bg-bamboo-100 text-bamboo-800' :
                          'bg-secondary text-secondary-foreground'}`}
                      >
                        {note.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.dateCreated), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
