import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Mic, MicOff } from "lucide-react";
import alinaAvatar from "@/assets/alina-avatar.jpg";

interface Message {
  id: string;
  content: string;
  sender: "user" | "alina";
  timestamp: Date;
  type?: "text" | "image" | "file";
}

interface ChatInterfaceProps {
  language: string;
}

export default function ChatInterface({ language }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: getWelcomeMessage(language),
      sender: "alina",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function getWelcomeMessage(lang: string): string {
    const messages = {
      de: "Hallo! Ich bin ALINA, dein digitaler Ausbildungs-Buddy. Ich helfe dir bei deiner Ausbildung zum Kfz-Mechatroniker. Wie kann ich dir heute helfen?",
      en: "Hello! I'm ALINA, your digital training buddy. I help you with your automotive technician training. How can I help you today?",
      ar: "مرحبا! أنا ALINA، مساعد التدريب الرقمي الخاص بك. أساعدك في تدريبك لتصبح فني سيارات. كيف يمكنني مساعدتك اليوم؟",
      uk: "Привіт! Я ALINA, твій цифровий помічник у навчанні. Я допомагаю тобі у підготовці до професії автомеханіка. Як я можу допомогти тобі сьогодні?"
    };
    return messages[lang as keyof typeof messages] || messages.de;
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(newMessage, language),
        sender: "alina",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  function getAIResponse(userInput: string, lang: string): string {
    // Simple AI simulation - in real app, this would call your AI API
    const responses = {
      de: [
        "Das ist eine interessante Frage! Bei der Kfz-Mechatronik ist es wichtig zu verstehen...",
        "Lass mich dir dabei helfen. In der Praxis bedeutet das...",
        "Gute Frage! Hier ist eine schrittweise Erklärung..."
      ],
      en: [
        "That's an interesting question! In automotive technology, it's important to understand...",
        "Let me help you with that. In practice, this means...",
        "Good question! Here's a step-by-step explanation..."
      ]
    };
    
    const langResponses = responses[lang as keyof typeof responses] || responses.de;
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  }

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-chat">
      {/* Chat Header */}
      <div className="border-b bg-card p-4 shadow-soft">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={alinaAvatar} alt="ALINA" />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              AI
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">ALINA</h2>
            <p className="text-sm text-muted-foreground">
              Dein digitaler Ausbildungs-Buddy
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            Online
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-xs lg:max-w-md ${message.sender === "user" ? "order-2" : "order-1"}`}>
              {message.sender === "alina" && (
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={alinaAvatar} alt="ALINA" />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">ALINA</span>
                </div>
              )}
              
              <Card className={`p-3 ${
                message.sender === "user" 
                  ? "bg-primary text-primary-foreground ml-4" 
                  : "bg-card border shadow-soft mr-4"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === "user" 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md">
              <div className="flex items-center space-x-2 mb-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={alinaAvatar} alt="ALINA" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">ALINA tippt...</span>
              </div>
              <Card className="p-3 bg-card border shadow-soft mr-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-4 shadow-soft">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFileUpload}
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Schreibe deine Nachricht..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="pr-12"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVoice}
            className={`shrink-0 ${isListening ? "bg-accent text-accent-foreground" : ""}`}
          >
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            // Handle file upload
            console.log("File selected:", e.target.files?.[0]);
          }}
        />
      </div>
    </div>
  );
}