import { useNavigate } from "react-router-dom";
import Header from "../components/Header"; // Assuming you are using the new Header
import Footer from "../components/Footer"; // Assuming you are using the new Footer
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../hooks/use-auth";
import heroBanner from "../assets/ncc-hero-banner.jpeg";
import nccLogo from "../assets/ncc-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  return (
    // The main div is already handled by your Layout component if you are using it
    <>
      <div
        className="relative h-96 flex items-center justify-center" // ✅ This already centers the content
        style={{
          // ✅ This linear-gradient provides the dark overlay for contrast
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center text-white z-10 px-4">
          {/* ✅ Reduced logo size from h-24 w-24 to h-20 w-20 */}
          <img src={nccLogo} alt="NCC Logo" className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">NCC Air Wing</h1>
          <p className="text-2xl mb-8">Student Information Portal</p>
          {!user && (
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8"
            >
              Sign In to Continue
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-elegant transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-primary">Student Portal</CardTitle>
              <CardDescription>Manage your profile and details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access and update your personal information, NCC details, and experience records.
              </p>
              {user && (
                <Button onClick={() => navigate("/profile")} className="w-full">
                  My Profile
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elegant transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-primary">NCC Details</CardTitle>
              <CardDescription>Track your NCC journey</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Record your NCC wing, regimental number, ranks, and enrollment information.
              </p>
              {user && (
                <Button onClick={() => navigate("/profile?tab=ncc")} variant="secondary" className="w-full">
                  Update Details
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elegant transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-primary">Experience</CardTitle>
              <CardDescription>Document your achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Add and manage your internship and placement records for future reference.
              </p>
              {user && (
                <Button onClick={() => navigate("/profile?tab=experience")} variant="secondary" className="w-full">
                    Add Experience
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {user && (
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Welcome, {user.email}</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Your student portal is ready. Keep your information up to date!
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Index;