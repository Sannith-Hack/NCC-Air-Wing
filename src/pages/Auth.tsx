import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const query = new URLSearchParams(location.search);
  const initialView = query.get("view") || 'sign-in';

  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  useEffect(() => {
    const newView = query.get("view") || 'sign-in';
    setView(newView);
  }, [location.search]);


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/verify` },
    });
    if (error) {
      toast({ title: "Sign Up Error", description: error.message, variant: "destructive" });
    } else if (data.user && data.user.identities?.length === 0) {
      toast({ title: "User already exists", description: "A user with this email already exists. Please sign in.", variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "A verification link has been sent to your email address." });
      setView('sign-in');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Sign In Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Signed in successfully." });
      navigate("/");
    }
    setLoading(false);
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Check your email", description: "A password reset link has been sent to your email." });
        setView('sign-in');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) {
      toast({ title: "Google Sign In Error", description: error.message, variant: "destructive" });
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'sign-up': return "Create an Account";
      case 'forgot-password': return "Reset Password";
      default: return "Portal Access";
    }
  };

  const getDescription = () => {
     switch (view) {
      case 'sign-up': return "Enter your details to get started";
      case 'forgot-password': return "Enter your email to receive a password reset link";
      default: return "Sign in to the NCC Air Wing Portal";
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 my-8">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {view === 'sign-in' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="space-y-1">
                <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Button variant="link" type="button" className="p-0 h-auto text-xs" onClick={() => setView('forgot-password')}>Forgot Password?</Button></div>
                <div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing In..." : "Sign In"}</Button>
              <div className="mt-4 text-center text-sm">Don't have an account? <Button variant="link" className="p-0 h-auto" type="button" onClick={() => setView('sign-up')}>Sign Up</Button></div>
            </form>
          )}
          {view === 'sign-up' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="email-signup">Email</Label><Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="space-y-2 relative"><Label htmlFor="password-signup">Password</Label><Input id="password-signup" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
              <div className="space-y-2 relative"><Label htmlFor="confirm-password">Confirm Password</Label><Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating Account..." : "Sign Up"}</Button>
              <div className="mt-4 text-center text-sm">Already have an account? <Button variant="link" className="p-0 h-auto" type="button" onClick={() => setView('sign-in')}>Sign In</Button></div>
            </form>
          )}
          {view === 'forgot-password' && (
             <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="email-reset">Email</Label><Input id="email-reset" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending..." : "Send Reset Link"}</Button>
              <div className="mt-4 text-center text-sm"><Button variant="link" className="p-0 h-auto" type="button" onClick={() => setView('sign-in')}>Back to Sign In</Button></div>
            </form>
          )}
          {view !== 'forgot-password' && (
              <><div className="relative my-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div></div>
              <Button onClick={handleGoogleLogin} className="w-full" variant="outline"><svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>Continue with Google</Button></>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;