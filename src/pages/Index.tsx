import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  Users, 
  Globe, 
  BarChart3, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Play
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

interface IndexProps {
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
}

export default function Index({ onLanguageChange, currentLanguage }: IndexProps) {
  const navigate = useNavigate();
  const getTexts = (lang: string) => {
    const texts = {
      de: {
        hero: {
          title: "ALINA - Dein digitaler Ausbildungs-Buddy",
          subtitle: "KI-gestützte Lernbegleitung für die überbetriebliche Ausbildung",
          description: "ALINA unterstützt Auszubildende mit personalisierten Lernpfaden, mehrsprachigem Support und intelligenter Prüfungsvorbereitung.",
          cta: "Jetzt starten",
          demo: "Demo ansehen"
        },
        features: {
          title: "Intelligente Lernbegleitung für das Handwerk",
          aiChat: {
            title: "KI-Chat Assistant",
            description: "Mehrsprachiger Chatbot der komplexe Fachinhalte verständlich erklärt"
          },
          personalized: {
            title: "Personalisierte Lernpfade",
            description: "Individuelle Ausbildungspläne basierend auf deinem Fortschritt"
          },
          multilingual: {
            title: "Mehrsprachiger Support", 
            description: "Unterstützung in Deutsch, Englisch, Arabisch und Ukrainisch"
          },
          analytics: {
            title: "Fortschritts-Tracking",
            description: "Detaillierte Übersicht über deinen Lernfortschritt"
          },
          security: {
            title: "DSGVO-konform",
            description: "Höchste Datenschutz- und Sicherheitsstandards"
          },
          fast: {
            title: "Schnell & Effizient",
            description: "Sofortige Antworten und optimierte Lernprozesse"
          }
        },
        benefits: {
          title: "Für Auszubildende & Ausbilder",
          students: "Auszubildende",
          instructors: "Ausbilder",
          studentBenefits: [
            "Individuelle Lernunterstützung 24/7",
            "Interaktive Prüfungsvorbereitung",
            "Mehrsprachige Hilfe bei Verständnisproblemen",
            "Praktische Übungsaufgaben"
          ],
          instructorBenefits: [
            "Echtzeit-Einblick in Lernfortschritte",
            "Automatisierte Aufgabenerstellung",
            "Frühzeitige Erkennung von Problemen",
            "Effiziente Verwaltung mehrerer Azubis"
          ]
        },
        cta: {
          title: "Bereit für die Zukunft der Ausbildung?",
          description: "Starte noch heute mit ALINA und erlebe, wie KI deine Ausbildung revolutioniert.",
          button: "Kostenlos registrieren"
        }
      },
      en: {
        hero: {
          title: "ALINA - Your Digital Training Buddy",
          subtitle: "AI-powered learning companion for vocational training",
          description: "ALINA supports apprentices with personalized learning paths, multilingual support and intelligent exam preparation.",
          cta: "Get Started",
          demo: "Watch Demo"
        },
        features: {
          title: "Intelligent Learning Support for Trades",
          aiChat: {
            title: "AI Chat Assistant",
            description: "Multilingual chatbot that explains complex topics clearly"
          },
          personalized: {
            title: "Personalized Learning",
            description: "Individual training plans based on your progress"
          },
          multilingual: {
            title: "Multilingual Support",
            description: "Support in German, English, Arabic and Ukrainian"
          },
          analytics: {
            title: "Progress Tracking",
            description: "Detailed overview of your learning progress"
          },
          security: {
            title: "GDPR Compliant",
            description: "Highest data protection and security standards"
          },
          fast: {
            title: "Fast & Efficient", 
            description: "Instant answers and optimized learning processes"
          }
        },
        benefits: {
          title: "For Students & Instructors",
          students: "Students",
          instructors: "Instructors",
          studentBenefits: [
            "Individual learning support 24/7",
            "Interactive exam preparation",
            "Multilingual help with comprehension",
            "Practical exercises"
          ],
          instructorBenefits: [
            "Real-time insight into learning progress", 
            "Automated task creation",
            "Early problem detection",
            "Efficient management of multiple apprentices"
          ]
        },
        cta: {
          title: "Ready for the Future of Education?",
          description: "Start with ALINA today and experience how AI revolutionizes your training.",
          button: "Register for Free"
        }
      }
    };
    return texts[lang as keyof typeof texts] || texts.de;
  };

  const t = getTexts(currentLanguage);

  const features = [
    {
      icon: MessageSquare,
      title: t.features.aiChat.title,
      description: t.features.aiChat.description,
      color: "text-primary"
    },
    {
      icon: Users,
      title: t.features.personalized.title,
      description: t.features.personalized.description,
      color: "text-secondary"
    },
    {
      icon: Globe,
      title: t.features.multilingual.title,
      description: t.features.multilingual.description,
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: t.features.analytics.title,
      description: t.features.analytics.description,
      color: "text-info"
    },
    {
      icon: Shield,
      title: t.features.security.title,
      description: t.features.security.description,
      color: "text-success"
    },
    {
      icon: Zap,
      title: t.features.fast.title,
      description: t.features.fast.description,
      color: "text-warning"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex space-x-2">
          {["de", "en", "ar", "uk"].map((lang) => (
            <Button
              key={lang}
              variant={currentLanguage === lang ? "default" : "ghost"}
              size="sm"
              onClick={() => onLanguageChange(lang)}
              className="text-xs"
            >
              {lang.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="ALINA Learning Platform"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero/80" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-float">
              <div>
                <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
                  🤖 KI-powered • 🌍 Mehrsprachig • 🎯 Personalisiert
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t.hero.title}
                </h1>
                <p className="text-xl lg:text-2xl mb-4 text-primary-foreground/90">
                  {t.hero.subtitle}
                </p>
                <p className="text-lg text-primary-foreground/80 leading-relaxed">
                  {t.hero.description}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="text-lg px-8 py-4 shadow-large hover:shadow-glow transition-bounce"
                >
                  {t.hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {t.hero.demo}
                </Button>
              </div>
            </div>
            
            <div className="lg:block">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-large">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="mr-2 h-6 w-6" />
                    ALINA Demo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/90 text-sm">
                      "Hallo! Ich bin ALINA. Wie kann ich dir bei deiner Kfz-Ausbildung helfen?"
                    </p>
                  </div>
                  <div className="bg-primary/20 rounded-lg p-4 ml-8">
                    <p className="text-white/90 text-sm">
                      "Erkläre mir bitte das Vierventil-System"
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/90 text-sm">
                      "Gerne! Das Vierventil-System verwendet pro Zylinder zwei Ein- und zwei Auslassventile..."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t.features.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Entdecke, wie ALINA mit modernster KI-Technologie deine Ausbildung revolutioniert
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth border-0 bg-gradient-to-br from-card to-muted/30">
                <CardHeader>
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t.benefits.title}
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Students */}
            <Card className="shadow-medium border-0">
              <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-2xl text-center">
                  👨‍🎓 {t.benefits.students}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {t.benefits.studentBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Instructors */}
            <Card className="shadow-medium border-0">
              <CardHeader className="bg-gradient-secondary text-secondary-foreground rounded-t-lg">
                <CardTitle className="text-2xl text-center">
                  👨‍🏫 {t.benefits.instructors}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {t.benefits.instructorBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-success mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            {t.cta.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/login")}
              className="text-lg px-12 py-4 shadow-large hover:shadow-glow transition-bounce"
            >
              {t.cta.button}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-12 flex justify-center items-center space-x-6 text-primary-foreground/80">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span>KI-powered</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-400 mr-1" />
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-blue-400 mr-1" />
              <span>Mehrsprachig</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">ALINA</h3>
            <p className="text-muted-foreground mb-4">
              Adaptiver Lernassistent für intelligente Nachwuchsausbildung
            </p>
            <Badge variant="secondary" className="text-xs">
              Entwickelt für die Zukunft der beruflichen Bildung
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}
