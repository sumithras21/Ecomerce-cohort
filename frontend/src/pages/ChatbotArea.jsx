import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BotMessageSquare, SendHorizontal, Sparkles, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function ChatbotArea() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I have access to your current Ecommerce dataset. Try asking me *'What are our top 3 best-selling products by quantity?'*" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Send chat context to the backend 
      // Using direct axios call to backend
      const res = await axios.post("/api/v1/chat/", {
        message: userMsg
      });

      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Sorry, I encountered an error. Please ensure your GROQ_API_KEY is configured in the backend environment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex h-full flex-col gap-4" aria-label="AI chat assistant">
      <Card className="border-blue-600/20 bg-gradient-to-r from-blue-600/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotMessageSquare className="h-5 w-5 text-blue-600" />
            AI Chat Assistant
          </CardTitle>
          <CardDescription>
            Ask natural-language questions about revenue, customers, and products. The assistant reasons over your dataset and returns instant insights.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="flex min-h-[60vh] flex-1 flex-col overflow-hidden">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Conversation">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role !== "user" && (
                <span className="mt-1 rounded-full bg-blue-600/10 p-2 text-blue-600">
                  <Sparkles className="h-4 w-4" />
                </span>
              )}
              <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
              }`}>
                {m.content}
              </div>
              {m.role === "user" && (
                <span className="mt-1 rounded-full bg-blue-600 p-2 text-white">
                  <UserRound className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="mr-auto flex max-w-[80%] rounded-xl bg-[hsl(var(--muted))] p-3 text-[hsl(var(--muted-foreground))] shadow-sm">
              <span className="text-sm italic">Thinking...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[hsl(var(--border))] p-3">
          <Input
            placeholder="Type your question..."
            aria-label="Message input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
            Send
          </Button>
        </form>
      </Card>
    </section>
  );
}