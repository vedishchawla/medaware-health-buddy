import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-xl text-foreground">MedAware</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-foreground transition-smooth"
              activeClassName="text-primary font-medium"
            >
              Home
            </NavLink>
            {user && (
              <NavLink
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-smooth"
                activeClassName="text-primary font-medium"
              >
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <NavLink to="/login">Login</NavLink>
                </Button>
                <Button asChild className="shadow-soft">
                  <NavLink to="/signup">Get Started</NavLink>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <NavLink
              to="/"
              className="block py-2 text-muted-foreground hover:text-foreground transition-smooth"
              activeClassName="text-primary font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            {user && (
              <NavLink
                to="/dashboard"
                className="block py-2 text-muted-foreground hover:text-foreground transition-smooth"
                activeClassName="text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            )}
            <div className="pt-4 space-y-2 border-t">
              {user ? (
                <Button variant="ghost" className="w-full" onClick={() => { logout(); setIsMenuOpen(false); }}>
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full">
                    <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </NavLink>
                  </Button>
                  <Button asChild className="w-full shadow-soft">
                    <NavLink to="/signup" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </NavLink>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
