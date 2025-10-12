import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, UserCircle, ShieldCheck } from "lucide-react";
import MobileNav from "./MobileNav";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface HeaderProps {
  user: any;
  isAdmin: boolean;
}

const Header = ({ user, isAdmin }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation(); // 1. Get the current page location

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error", description: "Failed to logout.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Logged out successfully" });
      navigate("/auth");
    }
  };

  // 2. Function to determine link style
  const getLinkClass = (path: string) => {
    return `px-3 py-2 font-medium hover:bg-[#3A70B8] rounded-md transition-colors ${
      location.pathname === path ? 'bg-[#3A70B8]' : ''
    }`;
  };

  return (
    <header className="font-[Arial,sans-serif] shadow-md">
      {/* Top Banner (hidden on mobile) */}
      <div className="bg-[#E6F2FF] py-2 px-4 relative hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="bg-[#dbeafe] p-1.5 rounded-lg"><img src="/img/Naac_A+.png" alt="NAAC Logo" className="h-14" /></div>
                <div className="bg-[#dbeafe] p-1.5 rounded-lg"><img src="/img/ku-logo.png" alt="KU Logo" className="h-14" /></div>
            </div>
            <div className="text-center mx-4">
                <h1 className="text-[#0d47a1] font-bold text-3xl">KU College of Engineering and Technology</h1>
                <h2 className="text-[#1565c0] font-semibold text-xl my-1">KAKATIYA UNIVERSITY</h2>
                <p className="text-sm text-[#444]">Warangal - 506009</p>
            </div>
            <div className="flex items-center space-x-2">
                <div className="bg-[#dbeafe] p-1.5 rounded-lg"><img src="/img/rudramadevi_statue.jpg" alt="Rudramadevi Statue" className="h-14" /></div>
                <div className="bg-[#dbeafe] p-1.5 rounded-lg"><img src="/img/ku-college-logo.png" alt="KU College Logo" className="h-14" /></div>
            </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#0A2240] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            <div className="flex-1 flex items-center md:justify-center">
              {/* Mobile Nav Trigger & Title */}
              <div className="md:hidden">
                <MobileNav user={user} isAdmin={isAdmin} />
              </div>
              <div className="md:hidden flex-1 text-center">
                <Link to="/" className="text-white font-bold text-lg">NCC Air Wing</Link>
              </div>

              {/* 3. Desktop Nav Links with active styling */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <Link to="/" className={getLinkClass('/')}>HOME</Link>
                <Link to="/achievements" className={getLinkClass('/achievements')}>ACHIEVEMENTS</Link>
                <Link to="/announcements" className={getLinkClass('/announcements')}>ANNOUNCEMENTS</Link>
                <Link to="/gallery" className={getLinkClass('/gallery')}>GALLERY</Link>
              </div>
            </div>
            
            {/* Auth Buttons (Right side) */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                 <Link to="/admin" className="hidden md:flex items-center px-3 py-2 text-sm font-medium bg-blue-500/50 hover:bg-[#3A70B8] rounded-md transition-colors">
                   <ShieldCheck className="mr-2 h-4 w-4"/>
                   ADMIN PANEL
                 </Link>
              )}
              {user ? (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-gray-700 text-white">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mr-4">
                    {/* 4. Added Username Label */}
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || "Cadet"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate('/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" onClick={() => navigate('/auth')} className="text-white hover:bg-[#3A70B8] hover:text-white">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;