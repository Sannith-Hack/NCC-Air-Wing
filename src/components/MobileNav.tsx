import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogIn, LogOut, UserCircle, ShieldCheck, Home } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import nccLogo from "@/assets/ncc-logo.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useAuthModal } from '@/hooks/use-auth-modal';
import { isExternal } from "util/types";

interface MobileNavProps {
  user: User | null;
  isAdmin: boolean;
}

const MobileNav = ({ user, isAdmin }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pathname } = useLocation(); // 1. Get current page path
  const authModal = useAuthModal();

  const handleLogout = async () => {
    setIsOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error", description: "Failed to logout.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Logged out successfully" });
    }
  };

  // 2. Define navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/announcements", label: "Announcements" },
    { href: "/achievements", label: "Achievements" },
    { href: "/gallery", label: "Gallery" },
  ];

  // 3. Function to determine link styling
  const getLinkClass = (href: string) => {
    return `px-3 py-2 rounded-md font-medium text-lg hover:bg-[#3A70B8] transition-colors flex items-center ${
      pathname === href ? 'bg-[#3A70B8]' : ''
    }`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6 text-gray-100" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-[#0A2240] text-white p-0 border-r-0 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <img src={nccLogo} alt="NCC Logo" className="h-10 w-10" />
            <span className="font-bold text-lg">NCC Air Wing</span>
          </Link>
        </div>
        <nav className="flex flex-col space-y-2 p-4 flex-grow">
          {/* 4. Map over the links and apply conditional styling */}
          {navLinks.map(link => (
             <Link key={link.href} to={link.href} className={getLinkClass(link.href)} onClick={() => setIsOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 space-y-3">
          {isAdmin && (
            <Button variant="outline" className="w-full justify-start bg-blue-500/20 border-blue-400 text-white hover:bg-[#3A70B8]" onClick={() => { navigate('/admin'); setIsOpen(false); }}>
              <ShieldCheck className="mr-2 h-5 w-5" /> Admin Panel
            </Button>
          )}
          {user ? (
            <>
              <Button variant="outline" className="w-full justify-start bg-transparent text-white hover:bg-[#3A70B8]" onClick={() => { navigate('/profile'); setIsOpen(false); }}>
                <UserCircle className="mr-2 h-5 w-5" /> My Profile
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" /> Sign Out
              </Button>
            </>
          ) : (
            <Button variant="secondary" className="w-full justify-start" onClick={() => { authModal.onOpen(); setIsOpen(false); }}>
              <LogIn className="mr-2 h-5 w-5" /> Sign In
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;