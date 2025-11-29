import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download, Calendar, Loader2 } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { getSymptoms, type Symptom } from "@/services/symptomApi";
import { getSymptomPredictions, type SymptomPrediction } from "@/services/symptomApi";
import { getMedications, type Medication } from "@/services/medicationApi";
import { format, subWeeks, parseISO, isWithinInterval } from "date-fns";

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

const InsightsPage = () => {
  const { user, getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [predictions, setPredictions] = useState<SymptomPrediction[]>([]);

  // Stats
  const [totalSymptoms, setTotalSymptoms] = useState(0);
  const [activeMedications, setActiveMedications] = useState(0);
  const [aiInsights, setAiInsights] = useState(0);
  const [symptomTrendData, setSymptomTrendData] = useState<ChartDataPoint[]>([]);
  const [sideEffectData, setSideEffectData] = useState<PieDataPoint[]>([]);
  const [aiAdvice, setAiAdvice] = useState<Array<{ date: string; advice: string; priority: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await getIdToken();
        if (!token) return;

        const [symptomsData, medicationsData, predictionsData] = await Promise.all([
          getSymptoms(token, user.uid).catch(() => []),
          getMedications(token, user.uid).catch(() => []),
          getSymptomPredictions(token, user.uid).catch(() => []),
        ]);

        setSymptoms(symptomsData);
        setMedications(medicationsData);
        setPredictions(predictionsData);

        // Calculate stats
        setTotalSymptoms(symptomsData.length);
        setActiveMedications(medicationsData.length);
        setAiInsights(predictionsData.length);

        // Process symptom trend data (last 4 weeks)
        processSymptomTrendData(symptomsData);
        
        // Process side effect distribution from predictions
        processSideEffectData(predictionsData);
        
        // Process AI advice from predictions
        processAiAdvice(predictionsData);
      } catch (error) {
        console.error("Failed to fetch insights data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, getIdToken]);

  const processSymptomTrendData = (symptomsData: Symptom[]) => {
    const now = new Date();
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = subWeeks(now, i);
      weeks.push({
        week: `Week ${4 - i}`,
        start: weekStart,
        end: subWeeks(now, i - 1),
      });
    }

    // Group symptoms by common tags/descriptions
    const symptomGroups: { [key: string]: number[] } = {};
    
    symptomsData.forEach((symptom) => {
      const symptomDate = symptom.created_at ? parseISO(symptom.created_at) : new Date();
      const weekIndex = weeks.findIndex((w) =>
        isWithinInterval(symptomDate, { start: w.start, end: w.end })
      );
      
      if (weekIndex >= 0) {
        // Use tags or extract from description
        const tags = symptom.tags || [];
        if (tags.length > 0) {
          tags.forEach((tag) => {
            if (!symptomGroups[tag]) {
              symptomGroups[tag] = [0, 0, 0, 0];
            }
            symptomGroups[tag][weekIndex] += symptom.intensity || 0;
          });
        } else {
          // Extract keyword from description
          const desc = symptom.description.toLowerCase();
          let key = "other";
          if (desc.includes("headache")) key = "headache";
          else if (desc.includes("nausea")) key = "nausea";
          else if (desc.includes("fatigue") || desc.includes("tired")) key = "fatigue";
          else if (desc.includes("dizzy") || desc.includes("dizziness")) key = "dizziness";
          
          if (!symptomGroups[key]) {
            symptomGroups[key] = [0, 0, 0, 0];
          }
          symptomGroups[key][weekIndex] += symptom.intensity || 0;
        }
      }
    });

    // Calculate averages per week
    const weekCounts: { [key: string]: number[] } = {};
    symptomsData.forEach((symptom) => {
      const symptomDate = symptom.created_at ? parseISO(symptom.created_at) : new Date();
      const weekIndex = weeks.findIndex((w) =>
        isWithinInterval(symptomDate, { start: w.start, end: w.end })
      );
      
      if (weekIndex >= 0) {
        const tags = symptom.tags || [];
        const keys = tags.length > 0 ? tags : ["other"];
        keys.forEach((key) => {
          if (!weekCounts[key]) {
            weekCounts[key] = [0, 0, 0, 0];
          }
          weekCounts[key][weekIndex]++;
        });
      }
    });

    // Create chart data
    const chartData: ChartDataPoint[] = weeks.map((week, idx) => {
      const data: ChartDataPoint = { date: week.week };
      
      // Calculate average intensity per symptom type per week
      Object.keys(symptomGroups).forEach((key) => {
        const total = symptomGroups[key][idx];
        const count = weekCounts[key]?.[idx] || 1;
        data[key] = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
      });
      
      return data;
    });

    // Ensure we have at least the top 3 symptoms
    const topSymptoms = Object.keys(symptomGroups)
      .sort((a, b) => {
        const totalA = symptomGroups[a].reduce((sum, val) => sum + val, 0);
        const totalB = symptomGroups[b].reduce((sum, val) => sum + val, 0);
        return totalB - totalA;
      })
      .slice(0, 3);

    // Filter to top symptoms only
    const filteredData = chartData.map((point) => {
      const filtered: ChartDataPoint = { date: point.date };
      topSymptoms.forEach((key) => {
        filtered[key] = point[key] || 0;
      });
      return filtered;
    });

    setSymptomTrendData(filteredData.length > 0 ? filteredData : [
      { date: "Week 1", headache: 0, nausea: 0, fatigue: 0 },
      { date: "Week 2", headache: 0, nausea: 0, fatigue: 0 },
      { date: "Week 3", headache: 0, nausea: 0, fatigue: 0 },
      { date: "Week 4", headache: 0, nausea: 0, fatigue: 0 },
    ]);
  };

  const processSideEffectData = (predictionsData: SymptomPrediction[]) => {
    const sideEffectCounts: { [key: string]: number } = {};
    
    predictionsData.forEach((pred) => {
      pred.predictions?.forEach((p) => {
        const label = p.label.toLowerCase();
        sideEffectCounts[label] = (sideEffectCounts[label] || 0) + 1;
      });
    });

    const total = Object.values(sideEffectCounts).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
      setSideEffectData([
        { name: "No Data", value: 100, color: "hsl(var(--muted-foreground))" },
      ]);
      return;
    }

    const pieData: PieDataPoint[] = Object.entries(sideEffectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], index) => {
        const colors = [
          "hsl(var(--primary))",
          "hsl(var(--secondary))",
          "hsl(var(--accent))",
          "hsl(150 55% 75%)",
          "hsl(var(--muted-foreground))",
        ];
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: Math.round((count / total) * 100),
          color: colors[index % colors.length],
        };
      });

    setSideEffectData(pieData);
  };

  const processAiAdvice = (predictionsData: SymptomPrediction[]) => {
    const advice = predictionsData
      .slice(0, 10) // Last 10 predictions
      .map((pred) => {
        const date = pred.created_at
          ? format(parseISO(pred.created_at), "MMM d, yyyy")
          : format(new Date(), "MMM d, yyyy");
        
        const topPred = pred.predictions?.[0];
        const risk = pred.overall_risk || "LOW";
        
        let adviceText = `Based on your report "${pred.text}", our AI detected a pattern of ${topPred?.label || "symptoms"} with ${risk} risk level.`;
        
        if (risk === "HIGH") {
          adviceText += " Please consider discussing this with your healthcare provider.";
        } else if (risk === "MEDIUM") {
          adviceText += " Monitor this closely and track any changes.";
        } else {
          adviceText += " Continue tracking to identify any patterns.";
        }

        return {
          date,
          advice: adviceText,
          priority: risk === "HIGH" ? "high" : risk === "MEDIUM" ? "medium" : "positive",
        };
      })
      .reverse(); // Most recent first

    setAiAdvice(advice.length > 0 ? advice : []);
  };

  // Calculate percentage change (mock for now, can be improved with historical data)
  const calculatePercentageChange = () => {
    // This would require historical data comparison
    // For now, return a placeholder
    return "+0% from last month";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </main>
      </div>
    );
  }

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
              <div className="text-4xl font-bold text-primary mb-2">{totalSymptoms}</div>
              <div className="text-sm text-muted-foreground">{calculatePercentageChange()}</div>
            </Card>
            <Card className="p-6 gradient-card shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-sm text-muted-foreground mb-1">Active Medications</div>
              <div className="text-4xl font-bold text-secondary mb-2">{activeMedications}</div>
              <div className="text-sm text-muted-foreground">
                {activeMedications > 0 ? "All doses up to date" : "No medications logged"}
              </div>
            </Card>
            <Card className="p-6 gradient-card shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="text-sm text-muted-foreground mb-1">AI Insights Generated</div>
              <div className="text-4xl font-bold text-accent mb-2">{aiInsights}</div>
              <div className="text-sm text-muted-foreground">This month</div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-xl font-semibold mb-6 text-foreground">Symptom Intensity Over Time</h2>
              {symptomTrendData.length > 0 ? (
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
                    {Object.keys(symptomTrendData[0] || {})
                      .filter((key) => key !== "date")
                      .map((key, index) => {
                        const colors = [
                          "hsl(var(--primary))",
                          "hsl(var(--secondary))",
                          "hsl(var(--accent))",
                        ];
                        return (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            name={key.charAt(0).toUpperCase() + key.slice(1)}
                          />
                        );
                      })}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No symptom data available
                </div>
              )}
            </Card>

            {/* Pie Chart */}
            <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h2 className="text-xl font-semibold mb-6 text-foreground">Side Effect Distribution</h2>
              {sideEffectData.length > 0 && sideEffectData[0].name !== "No Data" ? (
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
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No prediction data available. Use the AI Assistant to generate insights.
                </div>
              )}
            </Card>
          </div>

          {/* AI Advice History */}
          <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">AI Advice History</h2>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            {aiAdvice.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No AI advice yet. Start chatting with the AI Assistant to generate insights.
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InsightsPage;
