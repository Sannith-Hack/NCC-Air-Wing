import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const Verify = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Email Verified!",
      description: "Your account has been successfully verified.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <CardTitle className="text-2xl mt-4">Verification Successful</CardTitle>
          <CardDescription>Your email has been verified. You can now sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/auth")} className="w-full">
            Proceed to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;