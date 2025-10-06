import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import nccLogo from "@/assets/ncc-logo.png";

interface NavbarProps {
  user: any;
  isAdmin: boolean;
}

export const Navbar = ({ user, isAdmin }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/auth");
    }
  };

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={nccLogo} alt="NCC Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">NCC Air Wing</h1>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  variant="secondary"
                  onClick={() => navigate("/admin")}
                  className="transition-all hover:scale-105"
                >
                  Admin Dashboard
                </Button>
              )}
              <Button
                variant="default"
                onClick={() => navigate("/profile")}
                className="transition-all hover:scale-105"
              >
                My Profile
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="transition-all hover:scale-105"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
