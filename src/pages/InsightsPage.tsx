import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download, Calendar } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const symptomTrendData = [
  { date: "Week 1", headache: 4, nausea: 2, fatigue: 3 },
  { date: "Week 2", headache: 5, nausea: 3, fatigue: 4 },
  { date: "Week 3", headache: 7, nausea: 4, fatigue: 5 },
  { date: "Week 4", headache: 6, nausea: 3, fatigue: 4 },
];

const sideEffectData = [
  { name: "Headaches", value: 35, color: "hsl(var(--primary))" },
  { name: "Nausea", value: 25, color: "hsl(var(--secondary))" },
  { name: "Fatigue", value: 20, color: "hsl(var(--accent))" },
  { name: "Dizziness", value: 15, color: "hsl(150 55% 75%)" },
  { name: "Other", value: 5, color: "hsl(var(--muted-foreground))" },
];

const aiAdvice = [
  {
    date: "Nov 24, 2024",
    advice: "Your headache intensity has increased by 40% over the past 2 weeks. Consider discussing with your doctor about adjusting your medication dosage.",
    priority: "high",
  },
  {
    date: "Nov 20, 2024",
    advice: "Good hydration habits detected! Maintaining 8 glasses of water daily is helping reduce fatigue symptoms.",
    priority: "positive",
  },
  {
    date: "Nov 18, 2024",
    advice: "Pattern detected: Nausea symptoms appear 2-3 hours after taking morning medication. Try taking it with food.",
    priority: "medium",
  },
];

const InsightsPage = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <TrendingUp className="h-10 w-10 text-accent" />
                Health Insights
              </h1>
              <p className="text-muted-foreground text-lg">Your personalized health analytics and trends</p>
            </div>
            <Button className="shadow-soft hover:shadow-lg transition-all">
              <Download className="h-5 w-5 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 gradient-card shadow-card animate-slide-up">
              <div className="text-sm text-muted-foreground mb-1">Total Symptoms Logged</div>
              <div className="text-4xl font-bold text-primary mb-2">47</div>
              <div className="text-sm text-muted-foreground">+12% from last month</div>
            </Card>
            <Card className="p-6 gradient-card shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-sm text-muted-foreground mb-1">Active Medications</div>
              <div className="text-4xl font-bold text-secondary mb-2">3</div>
              <div className="text-sm text-muted-foreground">All doses up to date</div>
            </Card>
            <Card className="p-6 gradient-card shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="text-sm text-muted-foreground mb-1">AI Insights Generated</div>
              <div className="text-4xl font-bold text-accent mb-2">28</div>
              <div className="text-sm text-muted-foreground">This month</div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-xl font-semibold mb-6 text-foreground">Symptom Intensity Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={symptomTrendData}>
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="headache"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Headache"
                  />
                  <Line
                    type="monotone"
                    dataKey="nausea"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    name="Nausea"
                  />
                  <Line
                    type="monotone"
                    dataKey="fatigue"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    name="Fatigue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart */}
            <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h2 className="text-xl font-semibold mb-6 text-foreground">Side Effect Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sideEffectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sideEffectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* AI Advice History */}
          <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">AI Advice History</h2>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {aiAdvice.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    item.priority === "high"
                      ? "bg-destructive/10 border-destructive"
                      : item.priority === "positive"
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary/10 border-secondary"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.priority === "high"
                          ? "bg-destructive text-white"
                          : item.priority === "positive"
                          ? "bg-primary text-white"
                          : "bg-secondary text-white"
                      }`}
                    >
                      {item.priority === "positive" ? "Good News" : item.priority === "high" ? "Important" : "Notice"}
                    </span>
                  </div>
                  <p className="text-foreground">{item.advice}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InsightsPage;
