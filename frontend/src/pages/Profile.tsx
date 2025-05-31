
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Target, BookOpen, Brain } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState({
    name: "田中太郎",
    email: "tanaka@example.com",
    joinDate: "2024-01-15",
    targetLevel: "N4",
    studyStreak: 15,
    totalKanji: 245,
    totalVocabulary: 890,
    totalGrammar: 67
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-900">
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your learning progress and account settings
          </p>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="text-lg bg-sakura-100 text-sakura-700">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-semibold text-ink-900">{user.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <Badge variant="outline" className="bg-sakura-50">
                    <Target className="h-3 w-3 mr-1" />
                    Target: {user.targetLevel}
                  </Badge>
                  <Badge variant="outline" className="bg-bamboo-50">
                    🔥 {user.studyStreak} day streak
                  </Badge>
                </div>
              </div>
              
              <Button variant="outline">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-sakura-600" />
                Kanji Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink-900">{user.totalKanji}</div>
              <p className="text-sm text-muted-foreground">kanji learned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Brain className="h-4 w-4 mr-2 text-bamboo-600" />
                Vocabulary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink-900">{user.totalVocabulary}</div>
              <p className="text-sm text-muted-foreground">words learned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <User className="h-4 w-4 mr-2 text-accent-600" />
                Grammar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ink-900">{user.totalGrammar}</div>
              <p className="text-sm text-muted-foreground">patterns learned</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={user.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
