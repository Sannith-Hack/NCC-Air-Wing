import { useEffect, useState, useRef } from "react";
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
  const { user, loading: authLoading } = useAuth();
  const hasFetched = useRef(false);
  
  const [dataLoading, setDataLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [nccDetails, setNccDetails] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);

  const query = new URLSearchParams(location.search);
  const initialTab = query.get("tab") || "personal";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", branch: "", year: "", roll_no: "", address: "",
    phone_number: "", parents_phone_number: "", aadhaar_number: "",
    pan_number: "", account_number: "",
  });

  const [nccForm, setNccForm] = useState<Partial<NccInsert>>({
    ncc_wing: "air", regimental_number: "", enrollment_date: "", cadet_rank: "",
    my_ncc_certification: "N/D", camps_attended: 0, awards_received_in_national_camp: 0,
  });

  const [expForm, setExpForm] = useState<Partial<ExperienceInsert>>({
    experience: "internship", company_name: "", role: "", start_date: "", end_date: "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        hasFetched.current = false;
      } else if (user && !hasFetched.current) {
        fetchStudentData();
        hasFetched.current = true;
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (originalFormData) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);
      setIsFormDirty(hasChanged);
    }
  }, [formData, originalFormData]);

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
      
      const originalData = {
        name: student.name || "", email: student.email || "", branch: student.branch || "",
        year: student.year?.toString() || "", roll_no: student.roll_no || "", address: student.address || "",
        phone_number: student.phone_number || "", parents_phone_number: student.parents_phone_number || "",
        aadhaar_number: student.aadhaar_number || "", pan_number: student.pan_number || "", account_number: student.account_number || "",
      };
      setFormData(originalData);
      setOriginalFormData(originalData); 

      const { data: ncc } = await supabase.from("ncc_details").select("*").eq("student_id", student.student_id);
      setNccDetails(ncc || []);

      const { data: exp } = await supabase.from("placements_internships").select("*").eq("student_id", student.student_id);
      setExperiences(exp || []);
      
      if (initialTab !== 'personal') setActiveTab(initialTab);

    } else {
      const initialDataForNewUser = {
        name: user.user_metadata?.full_name || user.email || "",
        email: user.email || "",
        branch: "", year: "", roll_no: "", address: "",
        phone_number: "", parents_phone_number: "", aadhaar_number: "",
        pan_number: "", account_number: "",
      };
      setFormData(initialDataForNewUser);
      setOriginalFormData(initialDataForNewUser); 
      setActiveTab('personal');
    }
    setDataLoading(false);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (studentData && !isFormDirty) {
      toast({ title: "No Changes", description: "You haven't made any changes to save." });
      return; 
    }

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
      if (error) {
        toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Profile updated successfully" });
        await fetchStudentData();
      }
    } else {
      const { error } = await supabase.from("students").insert([{ ...studentPayload, user_id: user.id }]);
      if (error) {
        toast({ title: "Error creating profile", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Profile created! You can now add NCC & Experience details." });
        await fetchStudentData();
      }
    }
    setDataLoading(false);
  };
  
  // --- THIS FUNCTION IS UPDATED ---
  const handleNccSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nccDetails.length >= 10) { toast({ title: "Limit Reached", description: "You cannot add more than 10 NCC records.", variant: "destructive" }); return; }
    if (!studentData) { toast({ title: "Error", description: "Please save your student details first", variant: "destructive" }); return; }

    // --- NEW ROBUST VALIDATION BLOCK ---
    // 1. Get raw value and normalize it (trim, and convert empty/whitespace string to null)
    const rawRegNum = nccForm.regimental_number;
    const finalRegNum = (rawRegNum && rawRegNum.trim() !== "") ? rawRegNum.trim() : null;

    // 2. Check if this normalized value already exists in our state
    const isDuplicate = nccDetails.some(
      (detail) => detail.regimental_number === finalRegNum
    );
    
    // 3. If it's a duplicate, show an error and stop
    if (isDuplicate) {
      toast({
        title: "Duplicate Record",
        description: finalRegNum
          ? "A record with this regimental number already exists."
          : "A record with no regimental number already exists.",
        variant: "destructive",
      });
      return; // Stop the submission
    }
    // --- END OF VALIDATION BLOCK ---

    // 4. Create payload using the normalized value
    const nccPayload: NccInsert = {
      student_id: studentData.student_id,
      ncc_wing: nccForm.ncc_wing || "air",
      regimental_number: finalRegNum, // Use the normalized value
      enrollment_date: nccForm.enrollment_date || null,
      cadet_rank: nccForm.cadet_rank || null,
      my_ncc_certification: nccForm.my_ncc_certification || "N/D",
      camps_attended: Number(nccForm.camps_attended) || 0,
      awards_received_in_national_camp: Number(nccForm.awards_received_in_national_camp) || 0,
    };

    const { error } = await supabase.from("ncc_details").insert([nccPayload]);

    if (error) {
      toast({ title: "Error adding NCC details", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "NCC details added successfully" });
      setNccForm({ ncc_wing: "air", regimental_number: "", enrollment_date: "", cadet_rank: "", my_ncc_certification: "N/D", camps_attended: 0, awards_received_in_national_camp: 0 });
      await fetchStudentData(); // Re-fetch to update the list
    }
  };
  
  const handleNccDelete = async (nccId: string) => {
    const { error } = await supabase.from("ncc_details").delete().eq("ncc_id", nccId);
    if (error) {
      toast({ title: "Error deleting record", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "NCC record deleted." });
      await fetchStudentData();
    }
  };

  // --- THIS FUNCTION IS ALSO UPDATED ---
  const handleNccUpdate = async (nccId: string, updatedData: any) => {
    // --- NEW VALIDATION BLOCK FOR UPDATES ---
    // 1. Normalize the incoming regimental number
    const rawRegNum = updatedData.regimental_number;
    const finalRegNum = (rawRegNum && rawRegNum.trim() !== "") ? rawRegNum.trim() : null;

    // 2. Check for duplicates *that are not the record we are currently editing*
    const isDuplicate = nccDetails.some(
      (detail) =>
        detail.regimental_number === finalRegNum && // It matches the new number
        detail.ncc_id !== nccId                       // AND it's not the same record
    );

    // 3. If duplicate, show error and stop
    if (isDuplicate) {
      toast({
        title: "Duplicate Record",
        description: "Another record with this regimental number already exists.",
        variant: "destructive",
      });
      return; // Stop the update
    }
    // --- END OF VALIDATION BLOCK ---

    // 4. Prepare payload
    const { ncc_id, student_id, created_at, ...payload } = updatedData;
    payload.regimental_number = finalRegNum; // Use the normalized value

    // 5. Submit update
    const { error } = await supabase.from("ncc_details").update(payload).eq("ncc_id", nccId);
    if (error) {
      toast({ title: "Error updating record", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "NCC record updated." });
      await fetchStudentData();
    }
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (experiences.length >= 10) { toast({ title: "Limit Reached", description: "You cannot add more than 10 experience records.", variant: "destructive" }); return; }
    if (!studentData) { toast({ title: "Error", description: "Please save your personal details first.", variant: "destructive" }); return; }

    const expPayload: ExperienceInsert = {
      student_id: studentData.student_id,
      experience: expForm.experience || "internship",
      company_name: expForm.company_name || null,
      role: expForm.role || null,
      start_date: expForm.start_date || null,
      end_date: expForm.end_date || null,
    };

    const { error } = await supabase.from("placements_internships").insert([expPayload]);
    if (error) {
      toast({ title: "Error adding experience", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Experience added successfully" });
      setExpForm({ experience: "internship", company_name: "", role: "", start_date: "", end_date: "" });
      await fetchStudentData();
    }
  };
  
  const handleExpDelete = async (experienceId: string) => {
    const { error } = await supabase.from("placements_internships").delete().eq("experience_id", experienceId);
    if (error) {
      toast({ title: "Error deleting record", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Experience record deleted." });
      await fetchStudentData();
    }
  };

  const handleExpUpdate = async (experienceId: string, updatedData: any) => {
    const { experience_id, student_id, created_at, ...payload } = updatedData;
    const { error } = await supabase.from("placements_internships").update(payload).eq("experience_id", experienceId);
    if (error) {
      toast({ title: "Error updating record", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Experience record updated." });
      await fetchStudentData();
    }
  };

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
          <PersonalDetailsTab
            formData={formData}
            setFormData={setFormData}
            handleStudentSubmit={handleStudentSubmit}
            loading={dataLoading}
            isDirty={isFormDirty}
            isNewUser={!studentData}
          />
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