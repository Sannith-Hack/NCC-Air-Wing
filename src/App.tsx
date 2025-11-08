import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Achievements from "./pages/Achievements";
import Announcements from "./pages/Announcements";
import Gallery from "./pages/Gallery";
import ResetPassword from "./pages/ResetPassword";
import Verify from "./pages/Verify";
import ScrollToTop from "./components/ScrollToTop"; 
import { Toaster } from "@/components/ui/sonner"; 

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors closeButton />

    </AuthProvider>
  );
}

export default App;