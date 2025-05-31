import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chapters from "./pages/Chapters";
import ChapterDetail from "./pages/ChapterDetail";
import Notes from "./pages/Notes";
import Practice from "./pages/Practice";
import JLPTPlanner from "./pages/JLPTPlanner";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ManageInputTestQuestions from "./pages/ManageInputTestQuestions";
import PracticeGamePage from "./pages/PracticeGamePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chapters" element={<Chapters />} />
        <Route path="/chapters/:id" element={<ChapterDetail />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/play" element={<PracticeGamePage />} />
        <Route path="/jlpt-planner" element={<JLPTPlanner />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ManageInputTestQuestions" element={<ManageInputTestQuestions />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
