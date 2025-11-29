import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Send, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { predictSymptom } from "@/api/symptomApi";
import { getAgentAdvice } from "@/api/agentApi";
import { useAuth } from "@/context/AuthContext";
import { getSymptoms } from "@/services/symptomApi";
import { getMedications } from "@/services/medicationApi";
import InsightsPanel from "@/components/InsightsPanel";

type Sender = "user" | "ai" | "system";

interface InsightsData {
  predictedSymptom: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  topPredictions: { label: string; score: number; risk: string }[];
  recentSymptoms: any[];
  relatedMedications: any[];
}

interface Message {
  id: number;
  text: string;
  sender: Sender;
  timestamp: Date;
  type?: "insights";
  insightsData?: InsightsData;
}

const AssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your MedAware AI assistant. I'm here to help you understand your symptoms and medications. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const { user } = useAuth();

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputMessage("");

    const loadingMessageId = Date.now() + 1;
    addMessage({
      id: loadingMessageId,
      text: "⚕️ Analyzing symptoms...",
      sender: "system",
      timestamp: new Date(),
    });

    try {
      const aiResult = await predictSymptom(userMessage.text, user?.uid);
      const top = (aiResult.top_predictions || []) as {
        label: string;
        score: number;
        risk?: string;
      }[];

      let messageText = "🧠 ClinicalBERT analyzed your message, but was unable to provide suggestions.";

      if (top.length > 0) {
        const formatted = top
          .map((p) => {
            const scoreStr =
              typeof p.score === "number" ? p.score.toFixed(2) : String(p.score);
            const riskTag = p.risk ? `, risk: ${p.risk}` : "";
            return `${p.label} (${scoreStr}${riskTag})`;
          })
          .join(", ");

        const overallRisk = aiResult.overall_risk || "LOW";
        const riskPrefix =
          overallRisk === "HIGH"
            ? "⚠️ High-risk pattern detected. "
            : overallRisk === "MEDIUM"
            ? "⚕️ Moderate-risk pattern detected. "
            : "";

        messageText = `${riskPrefix}🧠 ClinicalBERT suggestions: ${formatted}. These are not diagnoses, but patterns you may want to discuss with your clinician.`;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                text: messageText,
              }
            : msg
        )
      );

      // Call Mistral-based agent for higher-level advice
      try {
        const agent = await getAgentAdvice({
          user_id: user?.uid,
          recent_symptoms: [
            {
              description: userMessage.text,
              predicted_symptom:
                (top[0] && top[0].label) || aiResult.predicted_symptom || "unknown",
              risk: aiResult.overall_risk || "LOW",
            },
          ],
          // For now, let backend use default demo medications
          medications: [],
        });

        if (agent?.agent_message) {
          addMessage({
            id: Date.now() + 3,
            text: agent.agent_message,
            sender: "ai",
            timestamp: new Date(),
          });
        }

        // Fetch recent symptoms and medications for Insights Panel
        if (user?.uid) {
          try {
            const token = await user.getIdToken();
            const [recentSymptoms, medications] = await Promise.all([
              getSymptoms(token, user.uid).catch(() => []),
              getMedications(token, user.uid).catch(() => []),
            ]);

            // Add Insights Panel message
            const insightsMessage: Message = {
              id: Date.now() + 4,
              text: "", // Empty text for insights type
              sender: "system",
              timestamp: new Date(),
              type: "insights",
              insightsData: {
                predictedSymptom:
                  (top[0] && top[0].label) || aiResult.predicted_symptom || "Unknown",
                risk: (aiResult.overall_risk || "LOW") as "LOW" | "MEDIUM" | "HIGH",
                topPredictions: top.map((p) => ({
                  label: p.label,
                  score: typeof p.score === "number" ? p.score : 0,
                  risk: p.risk || "LOW",
                })),
                recentSymptoms: recentSymptoms || [],
                relatedMedications: medications || [],
              },
            };
            addMessage(insightsMessage);
          } catch (error) {
            // Silently ignore insights fetch errors
            console.error("Failed to fetch insights data:", error);
          }
        }
      } catch {
        // Silently ignore agent errors to avoid breaking chat flow
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                text: "⚠️ Unable to analyze symptoms right now.",
              }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-card shadow-card">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-accent animate-pulse-soft" />
                AI Health Assistant
              </h1>
              <p className="text-muted-foreground mt-1">Get personalized insights about your health</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <NavLink to="/insights">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Insights
                </NavLink>
              </Button>
              <Button size="sm" asChild>
                <NavLink to="/consultation">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </NavLink>
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((message) => {
              // Render Insights Panel for insights type messages
              if (message.type === "insights" && message.insightsData) {
                return (
                  <div key={message.id} className="flex justify-start animate-fade-in">
                    <div className="max-w-2xl w-full">
                      <InsightsPanel {...message.insightsData} />
                      <p className="text-xs text-muted-foreground mt-2 px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              }

              // Render regular chat messages
              return (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div className={`max-w-2xl ${message.sender === "user" ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-2xl px-6 py-4 shadow-card ${
                        message.sender === "user"
                          ? "gradient-hero text-white"
                          : "gradient-card border"
                      }`}
                    >
                      <p className={message.sender === "user" ? "text-white" : "text-foreground"}>
                        {message.text}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.sender === "ai" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-soft mr-3 order-1 flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {message.sender === "user" && (
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-soft ml-3 order-1 flex-shrink-0">
                      <span className="text-white font-semibold text-sm">You</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-card p-6 shadow-card">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your health, medications, or symptoms..."
                className="flex-1 h-12 text-base"
              />
              <Button type="submit" size="lg" className="px-8 shadow-soft hover:shadow-lg transition-all">
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              AI responses are for informational purposes only and do not replace professional medical advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssistantPage;
