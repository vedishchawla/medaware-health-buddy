import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Pill, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { addMedication } from "@/services/medicationApi";

const LogMedicationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getIdToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user) {
      setError("You must be logged in to add medications");
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

      // Map frequency to readable format
      const frequencyMap: { [key: string]: string } = {
        "once-daily": "Once daily",
        "twice-daily": "Twice daily",
        "three-times-daily": "Three times daily",
        "as-needed": "As needed",
        "weekly": "Weekly",
        "monthly": "Monthly",
      };

      // Prepare data for API
      const medicationData = {
        user_id: user.uid,
        medication_name: formData.name,
        dosage: formData.dosage,
        frequency: frequencyMap[formData.frequency] || formData.frequency,
        start_date: formData.startDate,
        notes: formData.notes || "",
      };

      // Call API
      await addMedication(token, medicationData);

      // Success
      toast({
        title: "Medication Added",
        description: `${formData.name} has been added to your medication list.`,
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to add medication");
      toast({
        title: "Error",
        description: err.message || "Failed to add medication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Pill className="h-10 w-10 text-primary" />
              Log Medication
            </h1>
            <p className="text-muted-foreground text-lg">Add a new medication to your tracking list</p>
          </div>

          <Card className="p-8 gradient-card shadow-card animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Metformin"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    name="dosage"
                    type="text"
                    placeholder="e.g., 500mg"
                    value={formData.dosage}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    name="frequency"
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once-daily">Once daily</SelectItem>
                      <SelectItem value="twice-daily">Twice daily</SelectItem>
                      <SelectItem value="three-times-daily">Three times daily</SelectItem>
                      <SelectItem value="as-needed">As needed</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="e.g., Take after food, avoid alcohol, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescription">Upload Prescription (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-smooth cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                  <input type="file" id="prescription" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </div>

              <div className="bg-mint-light/50 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>Reminder:</strong> Always consult with your healthcare provider before starting or changing any medication.
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
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Medication"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LogMedicationPage;
