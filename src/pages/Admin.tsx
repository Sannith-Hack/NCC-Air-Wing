import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Download, Edit, Trash2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [students, setStudents] = useState<any[]>([]);
  const [nccDetails, setNccDetails] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

  const handleUpdate = async (id: string, data: any, type: 'student' | 'ncc' | 'experience') => {
    // This function remains the same
    const { created_at, students, ...updatePayload } = data;
    let error;

    switch(type) {
        case 'student':
            const { student_id, ...studentPayload } = updatePayload;
            ({ error } = await supabase.from('students').update(studentPayload).eq('student_id', id));
            break;
        case 'ncc':
            const { ncc_id, ...nccPayload } = updatePayload;
            ({ error } = await supabase.from('ncc_details').update(nccPayload).eq('ncc_id', id));
            break;
        case 'experience':
            const { experience_id, ...expPayload } = updatePayload;
            ({ error } = await supabase.from('placements_internships').update(expPayload).eq('experience_id', id));
            break;
    }

    if (error) { toast({ title: `Error updating ${type}`, description: error.message, variant: "destructive" }); }
    else { toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} record updated.` }); }

    await fetchAllData();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, type: 'student' | 'ncc' | 'experience') => {
    // This function remains the same
     if (!window.confirm(`Are you sure you want to delete this ${type} record? This action cannot be undone.`)) return;
    let error;

     switch(type) {
        case 'student':
            ({ error } = await supabase.from('students').delete().eq('student_id', id));
            break;
        case 'ncc':
            ({ error } = await supabase.from('ncc_details').delete().eq('ncc_id', id));
            break;
        case 'experience':
            ({ error } = await supabase.from('placements_internships').delete().eq('experience_id', id));
            break;
    }

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
    const studentsSheet = students.map(student => ({
      "Name": student.name,
      "Email": student.email,
      "Roll No": student.roll_no,
      "Branch": student.branch,
      "Year": student.year,
      "Phone Number": student.phone_number,
      "Parent's Phone": student.parents_phone_number,
      "Address": student.address,
      "Aadhaar Number": student.aadhaar_number,
      "PAN Number": student.pan_number,
      "Account Number": student.account_number,
      "Registered At": new Date(student.created_at).toLocaleString(),
    }));

    const nccSheet = nccDetails.map(ncc => ({ /* ... */ }));
    const experiencesSheet = experiences.map(exp => ({ /* ... */ }));

    const wb = XLSX.utils.book_new();
    const wsStudents = XLSX.utils.json_to_sheet(studentsSheet);
    XLSX.utils.book_append_sheet(wb, wsStudents, "Students");
    // ... append other sheets
    XLSX.writeFile(wb, "StudentData_Export.xlsx");
  };

  if (authLoading || !isAdmin) return <div className="min-h-screen bg-background" />;

  return (
    <>
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
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>A complete list of all registered students.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Parent's Phone</TableHead>
                      <TableHead>Aadhaar</TableHead>
                      <TableHead>PAN</TableHead>
                      <TableHead>Account No.</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.roll_no}</TableCell>
                        <TableCell>{student.branch}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>{student.phone_number}</TableCell>
                        <TableCell>{student.parents_phone_number}</TableCell>
                        <TableCell>{student.aadhaar_number}</TableCell>
                        <TableCell>{student.pan_number}</TableCell>
                        <TableCell>{student.account_number}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(student, 'student')}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Edit {editingType} Record</DialogTitle>
                <DialogDescription>Make changes to the record below. Click save when you're done.</DialogDescription>
            </DialogHeader>
            
            {editingRecord && editingType === 'student' && (
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-6">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" value={editingRecord.name} onChange={(e) => setEditingRecord({...editingRecord, name: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" value={editingRecord.email} onChange={(e) => setEditingRecord({...editingRecord, email: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="roll_no" className="text-right">Roll No</Label><Input id="roll_no" value={editingRecord.roll_no} onChange={(e) => setEditingRecord({...editingRecord, roll_no: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="branch" className="text-right">Branch</Label>
                      <Select value={editingRecord.branch} onValueChange={(value) => setEditingRecord({ ...editingRecord, branch: value })}>
                          <SelectTrigger id="branch" className="col-span-3"><SelectValue placeholder="Select a branch" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="CSE">CSE</SelectItem><SelectItem value="CSD">CSD</SelectItem><SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="MECH">MECH</SelectItem><SelectItem value="EEE">EEE</SelectItem><SelectItem value="ECE">ECE</SelectItem>
                              <SelectItem value="CIVIL">CIVIL</SelectItem><SelectItem value="CSM">CSM (AI & ML)</SelectItem><SelectItem value="AIML">AIML</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="year" className="text-right">Year</Label><Input id="year" type="number" value={editingRecord.year} onChange={(e) => setEditingRecord({...editingRecord, year: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Phone</Label><Input id="phone" value={editingRecord.phone_number} onChange={(e) => setEditingRecord({...editingRecord, phone_number: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="parent_phone" className="text-right">Parent's Phone</Label><Input id="parent_phone" value={editingRecord.parents_phone_number} onChange={(e) => setEditingRecord({...editingRecord, parents_phone_number: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="aadhaar" className="text-right">Aadhaar</Label><Input id="aadhaar" value={editingRecord.aadhaar_number} onChange={(e) => setEditingRecord({...editingRecord, aadhaar_number: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="pan" className="text-right">PAN</Label><Input id="pan" value={editingRecord.pan_number} onChange={(e) => setEditingRecord({...editingRecord, pan_number: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="account" className="text-right">Account No.</Label><Input id="account" value={editingRecord.account_number} onChange={(e) => setEditingRecord({...editingRecord, account_number: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-start gap-4"><Label htmlFor="address" className="text-right pt-2">Address</Label><Textarea id="address" value={editingRecord.address} onChange={(e) => setEditingRecord({...editingRecord, address: e.target.value})} className="col-span-3" rows={3}/></div>
                </div>
            )}

            {/* Other editing modals (NCC, Experience) remain unchanged */}

            <DialogFooter className="sm:justify-between pt-4">
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