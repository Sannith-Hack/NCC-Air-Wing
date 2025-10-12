import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { PersonalDetailsTab } from "./PersonalDetailsTab";
import { NccDetailsTab } from "./NccDetailsTab";
import { ExperienceTab } from "./ExperienceTab";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type NccInsert = Database['public']['Tables']['ncc_details']['Insert'];
type ExperienceInsert = Database['public']['Tables']['placements_internships']['Insert'];

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth(); // Use authLoading as the primary gate
  
  // This 'loading' state is now only for data fetching, not auth.
  const [dataLoading, setDataLoading] = useState(true); 
  const [studentData, setStudentData] = useState<any>(null);
  const [nccDetails, setNccDetails] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);

  const query = new URLSearchParams(location.search);
  const initialTab = query.get("tab") || "personal";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [formData, setFormData] = useState({
    name: "", email: "", branch: "", year: "", roll_no: "", address: "",
    phone_number: "", parents_phone_number: "", aadhaar_number: "",
    pan_number: "", account_number: "",
  });

  const [nccForm, setNccForm] = useState({
    ncc_wing: "air", regimental_number: "", enrollment_date: "", cadet_rank: "",
    my_ncc_certification: "N/D", camps_attended: "", awards_received_in_national_camp: "",
  });

  const [expForm, setExpForm] = useState({
    experience: "internship", company_name: "", role: "", start_date: "", end_date: "",
  });

  useEffect(() => {
    // This effect runs when auth state is resolved.
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else {
        fetchStudentData();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchStudentData = async () => {
    if (!user) return;
    setDataLoading(true);
    const { data: student, error: studentError } = await supabase.from("students").select("*").eq("user_id", user.id).maybeSingle();

    if (studentError) {
      toast({ title: "Database Error", description: `Could not fetch profile: ${studentError.message}`, variant: "destructive" });
      setDataLoading(false);
      return;
    }
    
    if (student) {
      setStudentData(student);
      setFormData({
        name: student.name || "", email: student.email || "", branch: student.branch || "",
        year: student.year?.toString() || "", roll_no: student.roll_no || "", address: student.address || "",
        phone_number: student.phone_number || "", parents_phone_number: student.parents_phone_number || "",
        aadhaar_number: student.aadhaar_number || "", pan_number: student.pan_number || "", account_number: student.account_number || "",
      });

      const { data: ncc } = await supabase.from("ncc_details").select("*").eq("student_id", student.student_id);
      setNccDetails(ncc || []);

      const { data: exp } = await supabase.from("placements_internships").select("*").eq("student_id", student.student_id);
      setExperiences(exp || []);
      
      if (initialTab !== 'personal') setActiveTab(initialTab);

    } else {
      setFormData((prev) => ({ ...prev, name: user.user_metadata?.full_name || user.email || "", email: user.email || "" }));
      setActiveTab('personal');
    }
    setDataLoading(false);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setDataLoading(true);

    const studentPayload = {
        name: formData.name, email: formData.email, branch: formData.branch || null,
        year: formData.year ? parseInt(formData.year) : null, roll_no: formData.roll_no || null,
        address: formData.address || null, phone_number: formData.phone_number || null,
        parents_phone_number: formData.parents_phone_number || null, aadhaar_number: formData.aadhaar_number || null,
        pan_number: formData.pan_number || null, account_number: formData.account_number || null,
    };

    if (studentData) {
      const { error } = await supabase.from("students").update(studentPayload).eq("user_id", user.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Success", description: "Profile updated successfully" }); await fetchStudentData(); }
    } else {
      const { error } = await supabase.from("students").insert([{ ...studentPayload, user_id: user.id }]);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Success", description: "Profile created! You can now add NCC & Experience details." }); await fetchStudentData(); }
    }
    setDataLoading(false);
  };
  
  const handleNccSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nccDetails.length >= 10) { toast({ title: "Limit Reached", description: "You cannot add more than 10 NCC detail records.", variant: "destructive" }); return; }
    if (!studentData) { toast({ title: "Error", description: "Please save your student details first", variant: "destructive" }); return; }

    const nccPayload: NccInsert = {
      student_id: studentData.student_id, ncc_wing: 'air',
      regimental_number: nccForm.regimental_number || null, enrollment_date: nccForm.enrollment_date || null,
      cadet_rank: nccForm.cadet_rank || null, my_ncc_certification: nccForm.my_ncc_certification as NccInsert['my_ncc_certification'],
      camps_attended: nccForm.camps_attended ? parseInt(nccForm.camps_attended, 10) : null,
      awards_received_in_national_camp: nccForm.awards_received_in_national_camp ? parseInt(nccForm.awards_received_in_national_camp, 10) : null,
    };
    
    const { error } = await supabase.from("ncc_details").insert([nccPayload]);

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Success", description: "NCC details added successfully" }); setNccForm({ ncc_wing: "air", regimental_number: "", enrollment_date: "", cadet_rank: "", my_ncc_certification: "N/D", camps_attended: "", awards_received_in_national_camp: "" }); await fetchStudentData(); }
  };
  
  const handleNccDelete = async (nccId: string) => { /* ... your logic ... */ };
  const handleNccUpdate = async (nccId: string, updatedData: any) => { /* ... your logic ... */ };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (experiences.length >= 10) { toast({ title: "Limit Reached", description: "You cannot add more than 10 experience records.", variant: "destructive" }); return; }
    if (!studentData) { toast({ title: "Error", description: "Please save your personal details first.", variant: "destructive" }); return; }

    const expPayload: ExperienceInsert = {
        student_id: studentData.student_id, experience: expForm.experience as ExperienceInsert['experience'],
        company_name: expForm.company_name, role: expForm.role || null,
        start_date: expForm.start_date || null, end_date: expForm.end_date || null,
    };
    
    const { error } = await supabase.from("placements_internships").insert([expPayload]);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Success", description: "Experience added successfully" }); setExpForm({ experience: "internship", company_name: "", role: "", start_date: "", end_date: "" }); await fetchStudentData(); }
  };
  
  const handleExpDelete = async (experienceId: string) => { /* ... your logic ... */ };
  const handleExpUpdate = async (experienceId: string, updatedData: any) => { /* ... your logic ... */ };

  // This is now the main loading guard for the entire page.
  if (authLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Loading user profile...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">My Profile</h1>
      
      {!studentData && !dataLoading && (
        <Alert className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Welcome!</AlertTitle>
          <AlertDescription>
            Please save your personal details to unlock the NCC and Experience tabs.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="ncc" disabled={!studentData}>NCC Details</TabsTrigger>
          <TabsTrigger value="experience" disabled={!studentData}>Experience</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <PersonalDetailsTab formData={formData} setFormData={setFormData} handleStudentSubmit={handleStudentSubmit} loading={dataLoading} />
        </TabsContent>
        <TabsContent value="ncc">
          <NccDetailsTab
            nccForm={nccForm} setNccForm={setNccForm} handleNccSubmit={handleNccSubmit} nccDetails={nccDetails}
            isLimitReached={nccDetails.length >= 10} handleNccDelete={handleNccDelete} handleNccUpdate={handleNccUpdate}
          />
        </TabsContent>
        <TabsContent value="experience">
          <ExperienceTab
            expForm={expForm} setExpForm={setExpForm} handleExpSubmit={handleExpSubmit} experiences={experiences}
            isLimitReached={experiences.length >= 10} handleExpDelete={handleExpDelete} handleExpUpdate={handleExpUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;