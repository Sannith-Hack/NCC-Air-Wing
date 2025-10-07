import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { PersonalDetailsTab } from "./PersonalDetailsTab";
import { NccDetailsTab } from "./NccDetailsTab";
import { ExperienceTab } from "./ExperienceTab";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [studentData, setStudentData] = useState<any>(null);
  const [nccDetails, setNccDetails] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "", email: "", branch: "", year: "", address: "",
    phone_number: "", parents_phone_number: "", aadhaar_number: "",
    pan_number: "", account_number: "",
  });

  const [nccForm, setNccForm] = useState({
    ncc_wing: "air", regimental_number: "", enrollment_date: "", cadet_rank: "",
  });
  
  const [expForm, setExpForm] = useState({
    experience: "internship", company_name: "", role: "", start_date: "", end_date: "",
  });

  useEffect(() => {
    setLoadingAuth(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    checkAdmin();
    fetchStudentData();
  }, [user, navigate, loadingAuth]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("students")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const fetchStudentData = async () => {
    if (!user) return;
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (student) {
      setStudentData(student);
      setFormData({
        name: student.name || "",
        email: student.email || "",
        branch: student.branch || "",
        year: student.year?.toString() || "",
        address: student.address || "",
        phone_number: student.phone_number || "",
        parents_phone_number: student.parents_phone_number || "",
        aadhaar_number: student.aadhaar_number || "",
        pan_number: student.pan_number || "",
        account_number: student.account_number || "",
      });

      const { data: ncc } = await supabase.from("ncc_details").select("*").eq("student_id", student.student_id);
      setNccDetails(ncc || []);

      const { data: exp } = await supabase.from("placements_internships").select("*").eq("student_id", student.student_id);
      setExperiences(exp || []);
    } else {
      setFormData((prev) => ({ ...prev, email: user.email || "" }));
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // This is where the Zod validation would go

    const studentPayload = {
      name: formData.name,
      email: formData.email,
      branch: formData.branch || null,
      year: formData.year ? parseInt(formData.year) : null,
      address: formData.address || null,
      phone_number: formData.phone_number || null,
      parents_phone_number: formData.parents_phone_number || null,
      aadhaar_number: formData.aadhaar_number || null,
      pan_number: formData.pan_number || null,
      account_number: formData.account_number || null,
    };

    if (studentData) {
      const { error } = await supabase.from("students").update(studentPayload).eq("user_id", user.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Success", description: "Profile updated successfully" }); fetchStudentData(); }
    } else {
      const { error } = await supabase.from("students").insert({ ...studentPayload, user_id: user.id });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Success", description: "Profile created successfully" }); fetchStudentData(); }
    }
    setLoading(false);
  };

  const handleNccSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) {
      toast({ title: "Error", description: "Please save your student details first", variant: "destructive" });
      return;
    }
    // This is where the Zod validation would go
    const { error } = await supabase.from("ncc_details").insert([{ student_id: studentData.student_id, ...nccForm }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Success", description: "NCC details added successfully" });
      setNccForm({ ncc_wing: "air", regimental_number: "", enrollment_date: "", cadet_rank: "" });
      fetchStudentData();
    }
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) {
      toast({ title: "Error", description: "Please save your student details first", variant: "destructive" });
      return;
    }
    // This is where the Zod validation would go
    const { error } = await supabase.from("placements_internships").insert([{ student_id: studentData.student_id, ...expForm }]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Success", description: "Experience added successfully" });
      setExpForm({ experience: "internship", company_name: "", role: "", start_date: "", end_date: "" });
      fetchStudentData();
    }
  };

  if (loadingAuth || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} isAdmin={isAdmin} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My Profile</h1>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="ncc">NCC Details</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <PersonalDetailsTab formData={formData} setFormData={setFormData} handleStudentSubmit={handleStudentSubmit} loading={loading} />
          </TabsContent>
          <TabsContent value="ncc">
            <NccDetailsTab nccForm={nccForm} setNccForm={setNccForm} handleNccSubmit={handleNccSubmit} nccDetails={nccDetails} />
          </TabsContent>
          <TabsContent value="experience">
            <ExperienceTab expForm={expForm} setExpForm={setExpForm} handleExpSubmit={handleExpSubmit} experiences={experiences} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;