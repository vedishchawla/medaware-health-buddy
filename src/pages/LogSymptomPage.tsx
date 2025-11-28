import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { addSymptom } from "@/services/symptomApi";
import { getMedications } from "@/services/medicationApi";

const LogSymptomPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getIdToken } = useAuth();
  const [description, setDescription] = useState("");
  const [intensity, setIntensity] = useState([5]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userMedications, setUserMedications] = useState<string[]>([]);

  // Fetch user's medications for med_context
  useEffect(() => {
    const fetchMedications = async () => {
      if (!user) return;

      try {
        const token = await getIdToken();
        if (!token) return;

        const medications = await getMedications(token, user.uid);
        // Extract medication names for med_context
        const medNames = medications.map((med) => med.medication_name);
        setUserMedications(medNames);
      } catch (err) {
        // Silently fail - med_context is optional
        console.error("Failed to fetch medications for context:", err);
      }
    };

    fetchMedications();
  }, [user, getIdToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user) {
      setError("You must be logged in to log symptoms");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError("Please describe your symptoms");
      setLoading(false);
      return;
    }

    try {
      // Get Firebase ID token
      const token = await getIdToken();
      if (!token) {
        setError("Failed to get authentication token");
        setLoading(false);
        return;
      }

      // Extract potential tags from description (simple keyword extraction)
      const commonTags = [
        "headache", "dizziness", "nausea", "fever", "pain", "fatigue",
        "cough", "sore throat", "rash", "swelling", "itchy", "burning",
        "stiffness", "weakness", "shortness of breath", "chest pain"
      ];
      const descriptionLower = description.toLowerCase();
      const extractedTags = commonTags.filter(tag => 
        descriptionLower.includes(tag)
      );

      // Prepare data for API
      const symptomData = {
        user_id: user.uid,
        description: description.trim(),
        intensity: intensity[0], // Convert array to number
        tags: extractedTags.length > 0 ? extractedTags : undefined,
        med_context: userMedications.length > 0 ? userMedications : undefined,
      };

      // Call API
      await addSymptom(token, symptomData);

      // Success
      toast({
        title: "Symptom Logged",
        description: "Your symptom has been recorded. Our AI is analyzing the data.",
      });

      // Navigate to assistant or dashboard
      navigate("/assistant");
    } catch (err: any) {
      setError(err.message || "Failed to log symptom");
      toast({
        title: "Error",
        description: err.message || "Failed to log symptom",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
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
                <Button 
                  type="submit" 
                  className="flex-1 shadow-soft hover:shadow-lg transition-all"
                  disabled={loading || !description.trim()}
                >
                  {loading ? "Logging..." : "Log Symptom"}
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
