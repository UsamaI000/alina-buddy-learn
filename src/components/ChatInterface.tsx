import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    if (!newMessage.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = newMessage;
    setNewMessage("");
    setIsStreaming(true);

    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        'https://yaiwgrqucvmkeqhfzldk.supabase.co/functions/v1/alina-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
          },
          body: JSON.stringify({
            messages: [
              ...messages
                .filter(m => m.type === 'text' && m.id !== "1") // Exclude welcome message
                .map(m => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: m.content
                })),
              { role: 'user', content: currentInput }
            ],
          }),
        }
      );

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please wait a moment.",
            variant: "destructive",
          });
        } else if (response.status === 402) {
          toast({
            title: "Service Unavailable",
            description: "AI service requires payment. Contact support.",
            variant: "destructive",
          });
        } else {
          throw new Error('Failed to get response');
        }
        setIsStreaming(false);
        return;
      }

      // Create initial ALINA message
      const alinaMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: alinaMessageId,
        content: '',
        sender: 'alina',
        timestamp: new Date(),
        type: 'text',
      }]);

      // Stream response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let accumulatedContent = '';

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              accumulatedContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.findIndex(m => m.id === alinaMessageId);
                if (lastIndex >= 0) {
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: accumulatedContent
                  };
                }
                return newMessages;
              });
            }
          } catch {
            // Partial JSON, continue
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      setIsStreaming(false);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from ALINA. Please try again.",
        variant: "destructive",
      });
      setIsStreaming(false);
    }
  };

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
            {isStreaming ? "Denkt nach..." : "Online"}
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
            disabled={isStreaming}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Schreibe deine Nachricht..."
              onKeyPress={(e) => e.key === "Enter" && !isStreaming && handleSendMessage()}
              disabled={isStreaming}
              className="pr-12"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVoice}
            disabled={isStreaming}
            className={`shrink-0 ${isListening ? "bg-accent text-accent-foreground" : ""}`}
          >
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isStreaming}
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
