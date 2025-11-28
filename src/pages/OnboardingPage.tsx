import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    conditions: "",
    allergies: "",
    medications: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save onboarding data
    navigate("/dashboard");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-light via-background to-sky-light p-4">
      <Card className="w-full max-w-2xl p-8 shadow-soft gradient-card animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Let's Get to Know You</h1>
          <p className="text-muted-foreground">Help us personalize your MedAware experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="30"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Chronic Conditions</Label>
            <Textarea
              id="conditions"
              name="conditions"
              placeholder="e.g., Diabetes, Hypertension, Asthma (leave blank if none)"
              value={formData.conditions}
              onChange={handleChange}
              className="min-h-24"
            />
            <p className="text-sm text-muted-foreground">List any ongoing medical conditions</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              placeholder="e.g., Penicillin, Peanuts, Latex (leave blank if none)"
              value={formData.allergies}
              onChange={handleChange}
              className="min-h-24"
            />
            <p className="text-sm text-muted-foreground">List any known allergies</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea
              id="medications"
              name="medications"
              placeholder="e.g., Metformin 500mg, Aspirin 81mg (leave blank if none)"
              value={formData.medications}
              onChange={handleChange}
              className="min-h-24"
            />
            <p className="text-sm text-muted-foreground">List medications you're currently taking</p>
          </div>

          <div className="bg-mint-light/50 rounded-xl p-4 border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Privacy Note:</strong> Your medical information is encrypted and secure. We never share your data without your explicit consent.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button type="submit" className="flex-1 shadow-soft hover:shadow-lg transition-all">
              Save & Continue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OnboardingPage;
