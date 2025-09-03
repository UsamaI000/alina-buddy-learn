import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  Clock,
  Award,
  AlertCircle
} from "lucide-react";
import alinaAvatar from "@/assets/alina-avatar.jpg";

interface DashboardProps {
  user: {
    name: string;
    role: "student" | "instructor" | "admin";
    apprenticeship: string;
  };
  language: string;
}

export default function Dashboard({ user, language }: DashboardProps) {
  const getTexts = (lang: string) => {
    const texts = {
      de: {
        welcome: "Willkommen zurück",
        progress: "Lernfortschritt",
        nextLessons: "Nächste Lektionen",
        recentActivity: "Letzte Aktivitäten",
        chatWithAlina: "Chat mit ALINA",
        weeklyGoal: "Wochenziel",
        upcomingExam: "Nächste Prüfung",
        achievements: "Erfolge",
        quickActions: "Schnellaktionen",
        askAlina: "ALINA fragen",
        viewSchedule: "Stundenplan",
        practiceQuiz: "Übungsquiz"
      },
      en: {
        welcome: "Welcome back",
        progress: "Learning Progress",
        nextLessons: "Next Lessons",
        recentActivity: "Recent Activity",
        chatWithAlina: "Chat with ALINA",
        weeklyGoal: "Weekly Goal",
        upcomingExam: "Upcoming Exam",
        achievements: "Achievements",
        quickActions: "Quick Actions",
        askAlina: "Ask ALINA",
        viewSchedule: "View Schedule",
        practiceQuiz: "Practice Quiz"
      }
    };
    return texts[lang as keyof typeof texts] || texts.de;
  };

  const t = getTexts(language);

  const upcomingLessons = [
    { title: "Motordiagnose", time: "09:00", date: "Morgen", type: "practical" },
    { title: "Elektrische Systeme", time: "14:00", date: "Mittwoch", type: "theory" },
    { title: "Bremssysteme", time: "10:00", date: "Donnerstag", type: "workshop" }
  ];

  const recentActivities = [
    { action: "Übungsquiz abgeschlossen", subject: "Hydraulik", score: 85, time: "vor 2 Stunden" },
    { action: "Chat mit ALINA", subject: "Motoröl-Arten", time: "vor 4 Stunden" },
    { action: "Lektion beendet", subject: "Getriebe", score: 92, time: "gestern" }
  ];

  const achievements = [
    { title: "Quiz-Meister", description: "10 Quizze in Folge bestanden", icon: "🏆" },
    { title: "Früher Vogel", description: "7 Tage hintereinander pünktlich", icon: "⏰" },
    { title: "ALINA-Freund", description: "50 Nachrichten mit ALINA", icon: "🤖" }
  ];

  if (user.role === "instructor") {
    return <InstructorDashboard user={user} language={language} />;
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.welcome}, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {user.apprenticeship} · Ausbildung läuft
          </p>
        </div>
        <Button variant="hero" className="animate-pulse-glow">
          <MessageSquare className="h-4 w-4 mr-2" />
          {t.chatWithAlina}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.progress}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <Progress value={72} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              +5% seit letzter Woche
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.weeklyGoal}
            </CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/10</div>
            <Progress value={80} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Lektionen diese Woche
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.upcomingExam}
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-2">
              Tage bis zur Zwischenprüfung
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.achievements}
            </CardTitle>
            <Award className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground mt-2">
              Errungenschaften freigeschaltet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Lessons */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              {t.nextLessons}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingLessons.map((lesson, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-smooth">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    lesson.type === "practical" ? "bg-success" :
                    lesson.type === "theory" ? "bg-info" : "bg-accent"
                  }`} />
                  <div>
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {lesson.date} um {lesson.time}
                    </p>
                  </div>
                </div>
                <Badge variant={lesson.type === "practical" ? "default" : "secondary"}>
                  {lesson.type === "practical" ? "Praxis" : 
                   lesson.type === "theory" ? "Theorie" : "Workshop"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ALINA Chat Preview */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={alinaAvatar} alt="ALINA" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              {t.chatWithAlina}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">
                "Hast du Fragen zur morgigen Motordiagnose-Stunde? Ich kann dir dabei helfen!"
              </p>
              <p className="text-xs text-muted-foreground mt-1">ALINA · vor 5 Min</p>
            </div>
            <Button variant="gradient" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat öffnen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>{t.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.subject} {activity.score && `· ${activity.score}%`} · {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t.askAlina}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              {t.viewSchedule}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              {t.practiceQuiz}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>{t.achievements}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="p-4 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-soft transition-smooth">
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h4 className="font-medium">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Instructor Dashboard Component
function InstructorDashboard({ user, language }: DashboardProps) {
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Ausbilder Dashboard
          </h1>
          <p className="text-muted-foreground">
            Willkommen zurück, {user.name}
          </p>
        </div>
        <Badge variant="secondary">
          {user.apprenticeship}
        </Badge>
      </div>

      {/* Instructor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Azubis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 seit letztem Monat
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Ø Fortschritt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              ALINA Anfragen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Diese Woche
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Benötigt Hilfe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              3
              <AlertCircle className="h-4 w-4 text-warning ml-1" />
            </div>
            <p className="text-xs text-muted-foreground">
              Azubis mit Problemen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructor specific content would go here */}
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Weitere Ausbilder-Features werden implementiert...
        </p>
      </div>
    </div>
  );
}