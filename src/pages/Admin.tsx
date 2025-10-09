import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/use-toast";
import { Download, Edit, Trash2 } from "lucide-react";

// Helper to format dates for input fields
const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [students, setStudents] = useState<any[]>([]);
  const [nccDetails, setNccDetails] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // State for the Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editingType, setEditingType] = useState<'student' | 'ncc' | 'experience' | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      toast({ title: "Access Denied", description: "You don't have admin privileges.", variant: "destructive" });
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

  // --- CRUD Handlers ---

  const handleUpdate = async (id: string, data: any, type: string) => {
    let tableName = '';
    let idColumn = '';

    switch(type) {
        case 'student':
            tableName = 'students';
            idColumn = 'student_id';
            break;
        case 'ncc':
            tableName = 'ncc_details';
            idColumn = 'ncc_id';
            break;
        case 'experience':
            tableName = 'placements_internships';
            idColumn = 'experience_id';
            break;
        default: return;
    }
    
    // Remove read-only/relational fields before update
    const { created_at, students, ...updatePayload } = data;
    const { [idColumn]: pk, ...finalPayload } = updatePayload;

    const { error } = await supabase.from(tableName).update(finalPayload).eq(idColumn, id);

    if (error) { toast({ title: `Error updating ${type}`, description: error.message, variant: "destructive" }); }
    else { toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} record updated.` }); }

    await fetchAllData();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, type: string) => {
     if (!window.confirm(`Are you sure you want to delete this ${type} record? This action cannot be undone.`)) return;

    let tableName = '';
    let idColumn = '';
     switch(type) {
        case 'student':
            tableName = 'students';
            idColumn = 'student_id';
            break;
        case 'ncc':
            tableName = 'ncc_details';
            idColumn = 'ncc_id';
            break;
        case 'experience':
            tableName = 'placements_internships';
            idColumn = 'experience_id';
            break;
        default: return;
    }

    const { error } = await supabase.from(tableName).delete().eq(idColumn, id);
    if (error) { toast({ title: `Error deleting ${type}`, description: error.message, variant: "destructive" }); }
    else { toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} record deleted.` }); }

    await fetchAllData();
    setIsModalOpen(false);
  };

  const handleEditClick = (record: any, type: 'student' | 'ncc' | 'experience') => {
    setEditingType(type);
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDownloadExcel = () => {
    const studentsSheet = students.map(({ user_id, student_id, role, ...rest }) => rest);
    const nccSheet = nccDetails.map(ncc => ({ "Student Name": ncc.students?.name || 'N/A', "Student Email": ncc.students?.email || 'N/A', "NCC Wing": ncc.ncc_wing, "Regimental Number": ncc.regimental_number, "Cadet Rank": ncc.cadet_rank, "Certification": ncc.my_ncc_certification, "Camps Attended": ncc.camps_attended, "National Camp Awards": ncc.awards_received_in_national_camp, "Enrollment Date": ncc.enrollment_date, }));
    const experiencesSheet = experiences.map(exp => ({ "Student Name": exp.students?.name || 'N/A', "Student Email": exp.students?.email || 'N/A', "Type": exp.experience, "Company Name": exp.company_name, "Role": exp.role, "Start Date": exp.start_date, "End Date": exp.end_date, }));
    const wb = XLSX.utils.book_new();
    const wsStudents = XLSX.utils.json_to_sheet(studentsSheet);
    const wsNcc = XLSX.utils.json_to_sheet(nccSheet);
    const wsExp = XLSX.utils.json_to_sheet(experiencesSheet);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Students");
    XLSX.utils.book_append_sheet(wb, wsNcc, "NCC Details");
    XLSX.utils.book_append_sheet(wb, wsExp, "Experiences");
    XLSX.writeFile(wb, "StudentData.xlsx");
  };

  if (authLoading || !isAdmin) return <div className="min-h-screen bg-background" />;

  return (
    <>
    <div className="min-h-screen bg-background">
      <Navbar user={user} isAdmin={isAdmin} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and view all student records</p>
          </div>
          <Button onClick={handleDownloadExcel} disabled={loadingData}> <Download className="mr-2 h-4 w-4" /> Download as Excel </Button>
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
                      <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Roll No</TableHead><TableHead>Branch</TableHead><TableHead>Year</TableHead><TableHead>Phone</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {students.map((s) => (<TableRow key={s.student_id}><TableCell className="font-medium">{s.name}</TableCell><TableCell>{s.email}</TableCell><TableCell>{s.roll_no || "N/A"}</TableCell><TableCell>{s.branch || "N/A"}</TableCell><TableCell>{s.year || "N/A"}</TableCell><TableCell>{s.phone_number || "N/A"}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleEditClick(s, 'student')}><Edit className="h-4 w-4" /></Button></TableCell></TableRow>))}
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
                      <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Reg. Number</TableHead><TableHead>Rank</TableHead><TableHead>Certification</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {nccDetails.map((ncc: any) => (<TableRow key={ncc.ncc_id}><TableCell className="font-medium">{ncc.students?.name || "Unknown"}</TableCell><TableCell>{ncc.regimental_number || "N/A"}</TableCell><TableCell>{ncc.cadet_rank || "N/A"}</TableCell><TableCell>{ncc.my_ncc_certification || "N/A"}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleEditClick(ncc, 'ncc')}><Edit className="h-4 w-4" /></Button></TableCell></TableRow>))}
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
                      <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Type</TableHead><TableHead>Company</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {experiences.map((exp: any) => (<TableRow key={exp.experience_id}><TableCell className="font-medium">{exp.students?.name || "Unknown"}</TableCell><TableCell><Badge variant={exp.experience === "placement" ? "default" : "secondary"}>{exp.experience}</Badge></TableCell><TableCell>{exp.company_name}</TableCell><TableCell>{exp.role || "N/A"}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleEditClick(exp, 'experience')}><Edit className="h-4 w-4" /></Button></TableCell></TableRow>))}
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

    {/* --- Universal Edit Modal --- */}
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit {editingType} Record</DialogTitle>
                <DialogDescription>Make changes to the record below. Click save when you're done.</DialogDescription>
            </DialogHeader>
            
            {editingRecord && editingType === 'student' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" value={editingRecord.name} onChange={(e) => setEditingRecord({...editingRecord, name: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" value={editingRecord.email} onChange={(e) => setEditingRecord({...editingRecord, email: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="roll_no" className="text-right">Roll No</Label><Input id="roll_no" value={editingRecord.roll_no} onChange={(e) => setEditingRecord({...editingRecord, roll_no: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="branch" className="text-right">Branch</Label><Input id="branch" value={editingRecord.branch} onChange={(e) => setEditingRecord({...editingRecord, branch: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="year" className="text-right">Year</Label><Input id="year" type="number" value={editingRecord.year} onChange={(e) => setEditingRecord({...editingRecord, year: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Phone</Label><Input id="phone" value={editingRecord.phone_number} onChange={(e) => setEditingRecord({...editingRecord, phone_number: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            {editingRecord && editingType === 'ncc' && (
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Student</Label><p className="col-span-3 font-semibold">{editingRecord.students?.name}</p></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="reg_no" className="text-right">Reg. Number</Label><Input id="reg_no" value={editingRecord.regimental_number} onChange={(e) => setEditingRecord({...editingRecord, regimental_number: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="rank" className="text-right">Rank</Label><Input id="rank" value={editingRecord.cadet_rank} onChange={(e) => setEditingRecord({...editingRecord, cadet_rank: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Certification</Label><Select value={editingRecord.my_ncc_certification} onValueChange={(value) => setEditingRecord({ ...editingRecord, my_ncc_certification: value })}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="N/D">N/D</SelectItem><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                </div>
            )}
            
            {editingRecord && editingType === 'experience' && (
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Student</Label><p className="col-span-3 font-semibold">{editingRecord.students?.name}</p></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Type</Label><Select value={editingRecord.experience} onValueChange={(value) => setEditingRecord({ ...editingRecord, experience: value })}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="internship">Internship</SelectItem><SelectItem value="placement">Placement</SelectItem></SelectContent></Select></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="company" className="text-right">Company</Label><Input id="company" value={editingRecord.company_name} onChange={(e) => setEditingRecord({...editingRecord, company_name: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="role" className="text-right">Role</Label><Input id="role" value={editingRecord.role} onChange={(e) => setEditingRecord({...editingRecord, role: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            <DialogFooter className="sm:justify-between">
                <Button variant="destructive" onClick={() => handleDelete(editingRecord[editingType === 'student' ? 'student_id' : editingType === 'ncc' ? 'ncc_id' : 'experience_id'], editingType!)} className="sm:mr-auto"> <Trash2 className="h-4 w-4 mr-2"/> Delete </Button>
                <div>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleUpdate(editingRecord[editingType === 'student' ? 'student_id' : editingType === 'ncc' ? 'ncc_id' : 'experience_id'], editingRecord, editingType!)}>Save Changes</Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
};

export default Admin;