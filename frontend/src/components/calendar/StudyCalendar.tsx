
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DailyStudy } from "@/types";

interface StudyCalendarProps {
  dailyStudies: DailyStudy[];
  onSelectDate: (date: Date) => void;
}

export function StudyCalendar({ dailyStudies, onSelectDate }: StudyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Create an array of day names starting from Sunday
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Check if a specific date has a study session
  const hasStudySession = (date: Date): DailyStudy | undefined => {
    return dailyStudies.find(study => 
      isSameDay(new Date(study.date), date)
    );
  };

  return (
    <div className="w-full bg-white rounded-md shadow-sm border border-border/40 overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <h2 className="text-lg font-medium text-ink-800">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 text-sm">
        {/* Day names */}
        {dayNames.map((day) => (
          <div key={day} className="py-2 text-center font-medium text-ink-600">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, dayIdx) => {
          const study = hasStudySession(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          // Apply styling based on day status
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "h-20 p-1 border-t border-border/40",
                dayIdx % 7 !== 0 && "border-l border-border/40",
                !isCurrentMonth && "opacity-30 bg-secondary/20"
              )}
            >
              <button
                onClick={() => onSelectDate(day)}
                className="w-full h-full flex flex-col items-center rounded-md hover:bg-secondary/40 transition-colors"
              >
                <span
                  className={cn(
                    "flex items-center justify-center h-7 w-7 rounded-full text-sm",
                    isToday(day) && "bg-primary text-primary-foreground font-medium",
                    study && !isToday(day) && "font-medium"
                  )}
                >
                  {format(day, "d")}
                </span>
                
                {/* Display study status */}
                {study && (
                  <div 
                    className={cn(
                      "mt-1 px-1.5 py-0.5 text-xs rounded-full",
                      study.completed ? "bg-bamboo-100 text-bamboo-800" : "bg-sakura-100 text-sakura-800"
                    )}
                  >
                    {study.completed ? "Done" : "Study"}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
