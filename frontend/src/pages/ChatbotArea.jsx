import { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  BotMessageSquare,
  Check,
  Copy,
  RefreshCcw,
  SendHorizontal,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";

const SUGGESTED_PROMPTS = [
  "What are our top 5 products by revenue?",
  "Show monthly revenue trend.",
  "Which country drives the most orders?",
  "How many unique customers do we have?",
];

const INITIAL_ASSISTANT = {
  role: "assistant",
  content:
    "Hi! I have access to your current ecommerce dataset. Try asking me _'What are our top 3 best-selling products by quantity?'_",
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy");
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handle}
      aria-label="Copy message"
      className="h-7 w-7"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export default function ChatbotArea() {
  const [messages, setMessages] = useState([INITIAL_ASSISTANT]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await axios.post("/api/v1/chat/", { message: userMsg });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response, source: userMsg },
      ]);
    } catch (err) {
      console.error(err);
      const description =
        err?.response?.data?.detail ||
        "Please ensure GROQ_API_KEY is configured in the backend environment.";
      toast.error("Chat request failed", { description });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          isError: true,
          source: userMsg,
          content: `**Sorry, I encountered an error.**\n\n${description}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([INITIAL_ASSISTANT]);
  };

  const retry = (sourceMessage) => {
    if (!sourceMessage) return;
    sendMessage(sourceMessage);
  };

  const showSuggestions = useMemo(
    () => messages.filter((m) => m.role === "user").length === 0,
    [messages]
  );

  return (
    <section className="flex h-full flex-col gap-4" aria-label="AI chat assistant">
      <PageHeader
        title="AI Chat Assistant"
        description="Ask natural-language questions about revenue, customers, and products."
        icon={BotMessageSquare}
        actions={
          messages.length > 1 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear chat
            </Button>
          )
        }
      />

      <Card className="border-blue-600/20 bg-gradient-to-r from-blue-600/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Powered by your dataset
          </CardTitle>
          <CardDescription>
            The assistant reasons over your data and returns instant insights using a Pandas-aware LLM agent.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="flex min-h-[60vh] flex-1 flex-col overflow-hidden">
        <CardContent
          className="flex-1 space-y-4 overflow-y-auto p-4"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role !== "user" && (
                <span
                  className={`mt-1 rounded-full p-2 ${
                    m.isError
                      ? "bg-red-500/10 text-red-600"
                      : "bg-blue-600/10 text-blue-600"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                </span>
              )}
              <div
                className={`group max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : m.isError
                    ? "bg-red-500/10 text-red-700 dark:text-red-300"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-2 prose-pre:rounded-lg prose-pre:bg-black/40 prose-pre:p-3 prose-code:text-[12.5px]">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
                {m.role === "assistant" && (
                  <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <CopyButton text={m.content} />
                    {m.isError && m.source && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => retry(m.source)}
                        className="h-7 w-7"
                        aria-label="Retry"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <span className="mt-1 rounded-full bg-blue-600 p-2 text-white">
                  <UserRound className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="mr-auto flex max-w-[80%] items-center gap-2 rounded-xl bg-[hsl(var(--muted))] p-3 text-[hsl(var(--muted-foreground))] shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              <span className="text-sm italic">Thinking...</span>
            </div>
          )}
          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <Badge
                  key={p}
                  asButton
                  variant="outline"
                  onClick={() => sendMessage(p)}
                  className="cursor-pointer"
                >
                  {p}
                </Badge>
              ))}
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
          <Button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
            <SendHorizontal className="h-4 w-4" />
            Send
          </Button>
        </form>
      </Card>
    </section>
  );
}
