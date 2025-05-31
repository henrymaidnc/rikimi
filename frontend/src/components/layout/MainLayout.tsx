import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, FileText, Brain, Target, User } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-green-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-green-200 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <img 
            src="/rikimi-default.png"            //src="https://riki.edu.vn/_nuxt/img/rikimo_jlpt.6f68626.png"
            alt="RIKIMI Mascot" 
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-green-900 font-bold text-xl">リキミ</span>
            {/* <span className="text-green-500 text-sm hidden sm:block">Japanese Learning Journey</span> */}
          </div>
        </div>

            <div className="w-full flex-1 md:w-auto md:flex-none">
              <GlobalSearch />
            </div>

        <div className="flex items-center space-x-2">
          <Link to="/profile" className="p-2 rounded-full hover:bg-green-100 transition-colors">
            <User className="h-5 w-5 text-green-700" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar - responsive */}
        <nav className="w-64 bg-white border-r border-green-200 p-4 hidden md:block shadow-sm">
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={<BarChart3 className="h-5 w-5" />}>
              Dashboard
            </NavItem>
            <NavItem to="/chapters" icon={<BookOpen className="h-5 w-5" />}>
              Books
            </NavItem>
            <NavItem to="/notes" icon={<FileText className="h-5 w-5" />}>
              Notes
            </NavItem>
            <NavItem to="/practice" icon={<Brain className="h-5 w-5" />}>
              Practice Hub
            </NavItem>
            <NavItem to="/jlpt-planner" icon={<Target className="h-5 w-5" />}>
              JLPT Planner
            </NavItem>
            <NavItem to="/ManageInputTestQuestions" icon={<FileText className="h-5 w-5" />}>
              Manage Questions
            </NavItem>
          </div>
        </nav>

        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-200 p-2 md:hidden z-50 shadow-lg">
          <div className="flex justify-around">
            <MobileNavItem to="/dashboard" icon={<BarChart3 className="h-5 w-5" />} label="Dashboard" />
            <MobileNavItem to="/chapters" icon={<BookOpen className="h-5 w-5" />} label="Books" />
            <MobileNavItem to="/notes" icon={<FileText className="h-5 w-5" />} label="Notes" />
            <MobileNavItem to="/practice" icon={<Brain className="h-5 w-5" />} label="Practice" />
            <MobileNavItem to="/jlpt-planner" icon={<Target className="h-5 w-5" />} label="JLPT" />
          <MobileNavItem to="/ManageInputTestQuestions" icon={<FileText className="h-5 w-5" />} label="Input Test" />
          </div>
        </div>

        {/* Page content */}
        <main
          className={cn(
            "flex-1 p-4 md:p-6 pb-32 md:pb-6 pt-20 overflow-y-auto",
            className
          )}
          style={{ maxHeight: 'calc(100vh - 4rem)' }} // 4rem = 64px header height
        >
          {children}
        </main>
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavItem({ to, icon, children }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200",
        isActive
          ? "bg-green-100 text-green-700 font-semibold"
          : "text-green-800 hover:bg-green-100 hover:text-green-700"
      )}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

interface MobileNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function MobileNavItem({ to, icon, label }: MobileNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors duration-200",
        isActive
          ? "bg-green-100 text-green-700 font-semibold"
          : "text-green-800 hover:bg-green-100 hover:text-green-700"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}