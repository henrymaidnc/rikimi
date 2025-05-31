
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StudyContentProps {
  exercise: Exercise;
  onComplete?: () => void;
  onEdit?: () => void;
}

export function StudyContent({ exercise, onComplete, onEdit }: StudyContentProps) {
  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-ink-800">{exercise.title}</CardTitle>
            <CardDescription>Chapter: {exercise.chapterId}</CardDescription>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button 
                variant="outline" 
                onClick={onEdit}
                size="sm"
              >
                Edit
              </Button>
            )}
            {onComplete && (
              <Button
                onClick={onComplete}
                size="sm"
                className="bg-bamboo-500 hover:bg-bamboo-600"
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: exercise.content }}
        />
      </CardContent>
    </Card>
  );
}
