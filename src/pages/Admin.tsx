import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [students, setStudents] = useState<any[]>([]);
  const [nccDetails, setNccDetails] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    fetchAllData();
  }, [user, isAdmin, authLoading, navigate, toast]);

  const fetchAllData = async () => {
    setLoadingData(true);
    const { data: studentsData } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    const { data: nccData } = await supabase.from("ncc_details").select("*, students(name, email)").order("created_at", { ascending: false });
    const { data: expData } = await supabase.from("placements_internships").select("*, students(name, email)").order("created_at", { ascending: false });

    setStudents(studentsData || []);
    setNccDetails(nccData || []);
    setExperiences(expData || []);
    setLoadingData(false);
  };

  if (authLoading || !isAdmin) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} isAdmin={isAdmin} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and view all student records</p>
        </div>
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="ncc">NCC Details ({nccDetails.length})</TabsTrigger>
            <TabsTrigger value="experience">Experiences ({experiences.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <Card>
              <CardHeader><CardTitle>All Students</CardTitle><CardDescription>Complete student records</CardDescription></CardHeader>
              <CardContent>
                {loadingData ? <p className="text-center text-muted-foreground">Loading data...</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Roll No</TableHead><TableHead>Branch</TableHead><TableHead>Year</TableHead><TableHead>Phone</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {students.map((s) => (<TableRow key={s.student_id}><TableCell className="font-medium">{s.name}</TableCell><TableCell>{s.email}</TableCell>
                        <TableCell>{s.roll_no || "N/A"}</TableCell><TableCell>{s.branch || "N/A"}</TableCell><TableCell>{s.year || "N/A"}</TableCell><TableCell>{s.phone_number || "N/A"}</TableCell></TableRow>))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="ncc">
            <Card>
              <CardHeader><CardTitle>NCC Details</CardTitle><CardDescription>All NCC enrollments</CardDescription></CardHeader>
              <CardContent>
                {loadingData ? <p className="text-center text-muted-foreground">Loading data...</p> : (
                   <div className="overflow-x-auto">
                    <Table>
                      {/* Updated table header to include new columns */}
                      <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Reg. Number</TableHead><TableHead>Rank</TableHead><TableHead>Certification</TableHead><TableHead>Camps</TableHead><TableHead>Awards</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {/* Updated table body to display new data */}
                        {nccDetails.map((ncc: any) => (<TableRow key={ncc.ncc_id}><TableCell className="font-medium">{ncc.students?.name || "Unknown"}</TableCell><TableCell>{ncc.regimental_number || "N/A"}</TableCell><TableCell>{ncc.cadet_rank || "N/A"}</TableCell><TableCell>{ncc.my_ncc_certification || "N/A"}</TableCell><TableCell>{ncc.camps_attended ?? "0"}</TableCell><TableCell>{ncc.awards_received_in_national_camp ?? "0"}</TableCell></TableRow>))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="experience">
            <Card>
              <CardHeader><CardTitle>Placements & Internships</CardTitle><CardDescription>All student experiences</CardDescription></CardHeader>
              <CardContent>
                {loadingData ? <p className="text-center text-muted-foreground">Loading data...</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Type</TableHead><TableHead>Company</TableHead><TableHead>Role</TableHead><TableHead>Duration</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {experiences.map((exp: any) => (<TableRow key={exp.experience_id}><TableCell className="font-medium">{exp.students?.name || "Unknown"}</TableCell><TableCell><Badge variant={exp.experience === "placement" ? "default" : "secondary"}>{exp.experience}</Badge></TableCell><TableCell>{exp.company_name}</TableCell><TableCell>{exp.role || "N/A"}</TableCell><TableCell>{exp.start_date ? `${exp.start_date} to ${exp.end_date || "Present"}` : "N/A"}</TableCell></TableRow>))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;