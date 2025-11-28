import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Pill, Stethoscope, TrendingUp, MessageSquare, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Log Medication",
    to: "/log-medication",
    icon: Pill,
  },
  {
    name: "Log Symptoms",
    to: "/log-symptom",
    icon: Stethoscope,
  },
  {
    name: "Insights",
    to: "/insights",
    icon: TrendingUp,
  },
  {
    name: "AI Assistant",
    to: "/assistant",
    icon: MessageSquare,
  },
  {
    name: "Consultation",
    to: "/consultation",
    icon: Calendar,
  },
];

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-card border-r shadow-card flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-soft">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-foreground">MedAware</h1>
            <p className="text-xs text-muted-foreground">Your Health Companion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
            activeClassName="bg-primary/10 text-primary font-medium hover:bg-primary/15"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start space-x-3">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
