import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LogSymptomPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [intensity, setIntensity] = useState([5]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call
    toast({
      title: "Symptom Logged",
      description: "Your symptom has been recorded. Our AI is analyzing the data.",
    });
    navigate("/assistant");
  };

  const getIntensityColor = () => {
    if (intensity[0] <= 3) return "text-primary";
    if (intensity[0] <= 6) return "text-secondary";
    return "text-destructive";
  };

  const getIntensityLabel = () => {
    if (intensity[0] <= 3) return "Mild";
    if (intensity[0] <= 6) return "Moderate";
    return "Severe";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Activity className="h-10 w-10 text-secondary" />
              Log Symptoms
            </h1>
            <p className="text-muted-foreground text-lg">Tell us how you're feeling today</p>
          </div>

          <Card className="p-8 gradient-card shadow-card animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="description">Describe Your Symptoms *</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., I've been experiencing a mild headache since this morning. It's a dull ache on the right side of my head..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Be as specific as possible. Include when it started, where you feel it, and what makes it better or worse.
                </p>
              </div>

              <div className="space-y-4">
                <Label>Symptom Intensity *</Label>
                <div className="space-y-4 p-6 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Intensity Level</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-bold ${getIntensityColor()}`}>{intensity[0]}</span>
                      <span className="text-sm text-muted-foreground">/ 10</span>
                    </div>
                  </div>
                  <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    min={1}
                    max={10}
                    step={1}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mild</span>
                    <span className={`font-semibold ${getIntensityColor()}`}>{getIntensityLabel()}</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>

              <div className="bg-sky-light/50 rounded-xl p-4 border border-secondary/20">
                <p className="text-sm text-foreground">
                  <strong>What happens next?</strong> Our AI will analyze your symptoms in context with your medications and health history. You'll receive personalized insights and recommendations.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 shadow-soft hover:shadow-lg transition-all">
                  Log Symptom
                </Button>
              </div>
            </form>
          </Card>

          {/* Emergency Notice */}
          <Card className="p-6 bg-destructive/10 border-destructive/20">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-white font-bold">!</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Emergency Symptoms?</h3>
                <p className="text-sm text-muted-foreground">
                  If you're experiencing severe chest pain, difficulty breathing, sudden weakness, or other emergency symptoms, please call emergency services immediately or go to the nearest emergency room.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LogSymptomPage;
