import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Pill, Activity, Brain, Plus, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMedications, type Medication } from "@/services/medicationApi";

const mockSymptomData = [
  { date: "Mon", intensity: 2 },
  { date: "Tue", intensity: 3 },
  { date: "Wed", intensity: 5 },
  { date: "Thu", intensity: 4 },
  { date: "Fri", intensity: 3 },
  { date: "Sat", intensity: 2 },
  { date: "Sun", intensity: 1 },
];

const mockInsights = [
  { title: "Symptom Alert", description: "Your headache intensity increased by 40% this week.", type: "warning" },
  { title: "Medication Reminder", description: "Don't forget your evening dose of Metformin.", type: "info" },
  { title: "Consultation Recommended", description: "Consider scheduling a check-up based on recent symptoms.", type: "recommendation" },
];

const DashboardPage = () => {
  const { user, getIdToken } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = await getIdToken();
        if (!token) {
          setError("Failed to get authentication token");
          setLoading(false);
          return;
        }

        const meds = await getMedications(token, user.uid);
        setMedications(meds);
      } catch (err: any) {
        setError(err.message || "Failed to fetch medications");
        console.error("Error fetching medications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [user, getIdToken]);
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back!</h1>
            <p className="text-muted-foreground text-lg">How are you feeling today?</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 animate-slide-up">
            <Button asChild size="lg" className="h-auto py-6 justify-start space-x-4 shadow-soft hover:shadow-lg transition-all">
              <NavLink to="/log-medication">
                <Plus className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-lg">Log Medication</div>
                  <div className="text-sm opacity-90">Add a new medication to your list</div>
                </div>
              </NavLink>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-auto py-6 justify-start space-x-4 shadow-soft hover:shadow-lg transition-all">
              <NavLink to="/log-symptom">
                <Activity className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-lg">Log Symptoms</div>
                  <div className="text-sm opacity-90">Record how you're feeling</div>
                </div>
              </NavLink>
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Medication Summary */}
            <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Active Medications
                </h2>
                <Button size="sm" variant="ghost" asChild>
                  <NavLink to="/log-medication">
                    <Plus className="h-4 w-4" />
                  </NavLink>
                </Button>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : error ? (
                  <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
                    {error}
                  </div>
                ) : medications.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-3 text-center">
                    No medications added yet. Click the + button to add one.
                  </div>
                ) : (
                  medications.map((med) => (
                    <div key={med._id} className="p-3 bg-muted rounded-lg">
                      <div className="font-medium text-foreground">{med.medication_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency}
                      </div>
                      {med.notes && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          {med.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Symptom Trends */}
            <Card className="lg:col-span-2 p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Symptom Intensity Trends
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockSymptomData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              AI Insights & Recommendations
            </h2>
            <div className="space-y-3">
              {mockInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === "warning"
                      ? "bg-destructive/10 border-destructive"
                      : insight.type === "info"
                      ? "bg-secondary/10 border-secondary"
                      : "bg-accent/10 border-accent"
                  }`}
                >
                  <div className="font-medium text-foreground">{insight.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{insight.description}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Chat with AI */}
          <Card className="p-8 gradient-hero text-center shadow-soft animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <MessageSquare className="h-12 w-12 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Need Help Understanding Your Symptoms?</h3>
            <p className="text-white/90 mb-6">Chat with our AI assistant for personalized guidance</p>
            <Button size="lg" variant="secondary" asChild className="shadow-lg hover:shadow-xl transition-all">
              <NavLink to="/assistant">Start Conversation</NavLink>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
