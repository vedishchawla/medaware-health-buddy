import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, AlertCircle } from "lucide-react";

const ConsultationPage = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Calendar className="h-10 w-10 text-accent" />
              Teleconsultation
            </h1>
            <p className="text-muted-foreground text-lg">Connect with healthcare professionals remotely</p>
          </div>

          {/* AI Recommendation Alert */}
          <Card className="p-6 bg-accent/10 border-accent/20 shadow-card animate-slide-up">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground mb-2">AI Recommendation</h3>
                <p className="text-foreground mb-4">
                  Based on your recent symptom patterns and medication history, we recommend scheduling a consultation with a healthcare provider. Your headache intensity has increased significantly over the past two weeks.
                </p>
                <div className="flex gap-3">
                  <Button className="shadow-soft hover:shadow-lg transition-all">
                    Book Appointment Now
                  </Button>
                  <Button variant="outline">
                    View Full Analysis
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Consultation Options */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 gradient-card shadow-card hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-soft">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Video Consultation</h3>
              <p className="text-muted-foreground mb-4">
                Connect face-to-face with licensed healthcare providers via secure video call.
              </p>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>15-30 minute sessions</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Available 24/7</span>
                </div>
              </div>
              <Button className="w-full shadow-soft hover:shadow-lg transition-all">
                Schedule Video Call
              </Button>
            </Card>

            <Card className="p-6 gradient-card shadow-card hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4 shadow-soft">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">In-Person Appointment</h3>
              <p className="text-muted-foreground mb-4">
                Book an appointment at your preferred healthcare facility or clinic.
              </p>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Full examination</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Next day availability</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full shadow-soft hover:shadow-lg transition-all">
                Find Nearby Clinics
              </Button>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <Card className="p-6 gradient-card shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl font-semibold mb-6 text-foreground">Upcoming Appointments</h2>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">You don't have any upcoming appointments</p>
              <Button className="mt-6 shadow-soft hover:shadow-lg transition-all">
                Schedule Your First Consultation
              </Button>
            </div>
          </Card>

          {/* Information Card */}
          <Card className="p-6 bg-mint-light/50 border-primary/20">
            <h3 className="font-semibold text-lg text-foreground mb-3">What to Prepare for Your Consultation</h3>
            <ul className="space-y-2 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Your current medication list and dosages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Recent symptom history from MedAware</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Any questions or concerns you want to discuss</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Insurance information (if applicable)</span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ConsultationPage;
