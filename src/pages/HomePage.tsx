import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Shield, Brain, Clock, MessageSquare, TrendingUp, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import heroImage from "@/assets/hero-image.jpg";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced algorithms detect potential medication side effects early",
  },
  {
    icon: Clock,
    title: "Early Intervention",
    description: "Get timely alerts and recommendations before symptoms escalate",
  },
  {
    icon: MessageSquare,
    title: "Smart Assistant",
    description: "Chat with our AI to understand your symptoms and get guidance",
  },
  {
    icon: TrendingUp,
    title: "Health Insights",
    description: "Track trends and patterns in your medication response over time",
  },
  {
    icon: Users,
    title: "Teleconsultation",
    description: "Connect with healthcare professionals when you need expert advice",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is encrypted and protected with industry standards",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-mint-light rounded-full">
                <span className="text-sm font-medium text-primary">Your Smart Companion for Safe Medication</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">Welcome to </span>
                <span 
                  className="inline-block text-primary"
                  style={{
                    background: 'linear-gradient(135deg, hsl(150 65% 55%), hsl(200 70% 60%))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  MedAware
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Stay safe with AI-powered medication tracking, early side-effect detection, and personalized health insights. Your health journey, simplified.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild className="text-lg shadow-soft hover:shadow-lg transition-all">
                  <NavLink to="/signup">Get Started Free</NavLink>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg">
                  <NavLink to="/login">Sign In</NavLink>
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
              <img
                src={heroImage}
                alt="MedAware Health Platform"
                className="relative rounded-3xl shadow-soft w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-foreground">How MedAware Helps You</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to monitor, understand, and manage your medication journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 gradient-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-soft">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-12 gradient-hero text-center shadow-soft">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust MedAware for safer medication management
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg shadow-lg hover:shadow-xl transition-all">
              <NavLink to="/signup">Start Your Journey Today</NavLink>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-card">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-xl text-foreground">MedAware</span>
          </div>
          <p className="text-muted-foreground">© 2024 MedAware. Your health, our priority.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
