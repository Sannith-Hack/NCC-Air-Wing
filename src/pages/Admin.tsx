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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Download, Edit, Plus, Trash2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [students, setStudents] = useState<any[]>([]);
  const [nccDetails, setNccDetails] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editingType, setEditingType] = useState<'student' | 'ncc' | 'experience' | 'achievement' | 'announcement' | 'gallery' | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingType, setAddingType] = useState<'achievement' | 'announcement' | 'gallery' | null>(null);
  const [newRecord, setNewRecord] = useState<any>({});

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
    const { data: achievementsData } = await supabase.from("achievements").select("*").order("created_at", { ascending: false });
    const { data: announcementsData } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    const { data: galleryData } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });

    setStudents(studentsData || []);
    setNccDetails(nccData || []);
    setExperiences(expData || []);
    setAchievements(achievementsData || []);
    setAnnouncements(announcementsData || []);
    setGallery(galleryData || []);
    setLoadingData(false);
  };

  const handleUpdate = async (id: string, data: any, type: 'student' | 'ncc' | 'experience' | 'achievement' | 'announcement' | 'gallery') => {
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
        case 'achievement':
            const { id: achievementId, ...achievementPayload } = updatePayload;
            ({ error } = await supabase.from('achievements').update(achievementPayload).eq('id', id));
            break;
        case 'announcement':
            const { id: announcementId, ...announcementPayload } = updatePayload;
            ({ error } = await supabase.from('announcements').update(announcementPayload).eq('id', id));
            break;
        case 'gallery':
            const { id: galleryId, ...galleryPayload } = updatePayload;
            ({ error } = await supabase.from('gallery').update(galleryPayload).eq('id', id));
            break;
    }

    if (error) { toast({ title: `Error updating ${type}`, description: error.message, variant: "destructive" }); }
    else { toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} record updated.` }); }

    await fetchAllData();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, type: 'student' | 'ncc' | 'experience' | 'achievement' | 'announcement' | 'gallery') => {
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
        case 'achievement':
            ({ error } = await supabase.from('achievements').delete().eq('id', id));
            break;
        case 'announcement':
            ({ error } = await supabase.from('announcements').delete().eq('id', id));
            break;
        case 'gallery':
            ({ error } = await supabase.from('gallery').delete().eq('id', id));
            break;
    }

    if (error) { toast({ title: `Error deleting ${type}`, description: error.message, variant: "destructive" }); }
    else { toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} record deleted.` }); }

    await fetchAllData();
    setIsModalOpen(false);
  };

  const handleCreate = async (data: any, type: 'achievement' | 'announcement' | 'gallery') => {
    console.log("Creating new record:", data, "of type", type);
    let error;
    switch(type) {
        case 'achievement':
            ({ error } = await supabase.from('achievements').insert(data));
            break;
        case 'announcement':
            ({ error } = await supabase.from('announcements').insert(data));
            break;
        case 'gallery':
            ({ error } = await supabase.from('gallery').insert(data));
            break;
    }

    if (error) { 
        console.error("Error creating record:", error);
        toast({ title: `Error creating ${type}`, description: error.message, variant: "destructive" }); 
    }
    else { toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} record created.` }); }

    await fetchAllData();
    setIsAddModalOpen(false);
    setNewRecord({});
  };

  const handleEditClick = (record: any, type: 'student' | 'ncc' | 'experience' | 'achievement' | 'announcement' | 'gallery') => {
    setEditingType(type);
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleAddClick = (type: 'achievement' | 'announcement' | 'gallery') => {
    setAddingType(type);
    setNewRecord({});
    setIsAddModalOpen(true);
  };

  const handleDownloadExcel = () => {
    const studentsSheet = students.map(({ user_id, student_id, ...rest }) => rest);
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and view all student records</p>
          </div>
          <Button onClick={handleDownloadExcel} disabled={loadingData}> <Download className="mr-2 h-4 w-4" /> Download as Excel </Button>
        </div>
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="ncc">NCC Details ({nccDetails.length})</TabsTrigger>
            <TabsTrigger value="experience">Experiences ({experiences.length})</TabsTrigger>
            <TabsTrigger value="achievements">Achievements ({achievements.length})</TabsTrigger>
            <TabsTrigger value="announcements">Announcements ({announcements.length})</TabsTrigger>
            <TabsTrigger value="gallery">Gallery ({gallery.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>A complete list of all registered students.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.branch}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>{student.roll_no}</TableCell>
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

          <TabsContent value="ncc">
            <Card>
              <CardHeader>
                <CardTitle>NCC Details</CardTitle>
                <CardDescription>All recorded NCC details for students.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Regimental No.</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nccDetails.map((ncc) => (
                      <TableRow key={ncc.ncc_id}>
                        <TableCell>{ncc.students?.name}</TableCell>
                        <TableCell>{ncc.regimental_number}</TableCell>
                        <TableCell>{ncc.cadet_rank}</TableCell>
                        <TableCell><Badge>{ncc.my_ncc_certification}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(ncc, 'ncc')}>
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

          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle>Placements & Internships</CardTitle>
                <CardDescription>All recorded work experiences for students.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {experiences.map((exp) => (
                      <TableRow key={exp.experience_id}>
                        <TableCell>{exp.students?.name}</TableCell>
                        <TableCell><Badge variant={exp.experience === 'placement' ? 'default' : 'secondary'}>{exp.experience}</Badge></TableCell>
                        <TableCell>{exp.company_name}</TableCell>
                        <TableCell>{exp.role}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(exp, 'experience')}>
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

          <TabsContent value="gallery">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gallery</CardTitle>
                  <CardDescription>Manage the gallery images.</CardDescription>
                </div>
                <Button onClick={() => handleAddClick('gallery')}><Plus className="h-4 w-4 mr-2" /> Add</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gallery.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.event}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(item, 'gallery')}>
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

          <TabsContent value="announcements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Manage the announcements.</CardDescription>
                </div>
                <Button onClick={() => handleAddClick('announcement')}><Plus className="h-4 w-4 mr-2" /> Add</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>{announcement.title}</TableCell>
                        <TableCell>{announcement.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(announcement, 'announcement')}>
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

          <TabsContent value="achievements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Manage the achievements.</CardDescription>
                </div>
                <Button onClick={() => handleAddClick('achievement')}><Plus className="h-4 w-4 mr-2" /> Add</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Cadet Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {achievements.map((achievement) => (
                      <TableRow key={achievement.id}>
                        <TableCell>{achievement.achievement_title}</TableCell>
                        <TableCell>{achievement.cadet_name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(achievement, 'achievement')}>
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

            {editingRecord && editingType === 'achievement' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="achievement_title" className="text-right">Title</Label><Input id="achievement_title" value={editingRecord.achievement_title} onChange={(e) => setEditingRecord({...editingRecord, achievement_title: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="cadet_name" className="text-right">Cadet Name</Label><Input id="cadet_name" value={editingRecord.cadet_name} onChange={(e) => setEditingRecord({...editingRecord, cadet_name: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="rank" className="text-right">Rank</Label><Input id="rank" value={editingRecord.rank} onChange={(e) => setEditingRecord({...editingRecord, rank: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="event" className="text-right">Event</Label><Input id="event" value={editingRecord.event} onChange={(e) => setEditingRecord({...editingRecord, event: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="year" className="text-right">Year</Label><Input id="year" value={editingRecord.year} onChange={(e) => setEditingRecord({...editingRecord, year: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            {editingRecord && editingType === 'announcement' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={editingRecord.title} onChange={(e) => setEditingRecord({...editingRecord, title: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Input id="description" value={editingRecord.description} onChange={(e) => setEditingRecord({...editingRecord, description: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Date</Label><Input id="date" type="date" value={editingRecord.date} onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="tag" className="text-right">Tag</Label><Input id="tag" value={editingRecord.tag} onChange={(e) => setEditingRecord({...editingRecord, tag: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            {editingRecord && editingType === 'gallery' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="src" className="text-right">Image URL</Label><Input id="src" value={editingRecord.src} onChange={(e) => setEditingRecord({...editingRecord, src: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="event" className="text-right">Event</Label><Input id="event" value={editingRecord.event} onChange={(e) => setEditingRecord({...editingRecord, event: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Date</Label><Input id="date" value={editingRecord.date} onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            <DialogFooter className="sm:justify-between">
                <Button variant="destructive" onClick={() => handleDelete(editingRecord[editingType === 'student' ? 'student_id' : editingType === 'ncc' ? 'ncc_id' : editingType === 'experience' ? 'experience_id' : 'id'], editingType!)} className="sm:mr-auto"> <Trash2 className="h-4 w-4 mr-2"/> Delete </Button>
                <div>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleUpdate(editingRecord[editingType === 'student' ? 'student_id' : editingType === 'ncc' ? 'ncc_id' : editingType === 'experience' ? 'experience_id' : 'id'], editingRecord, editingType!)}>Save Changes</Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add {addingType} Record</DialogTitle>
                <DialogDescription>Fill in the details for the new record below. Click save when you're done.</DialogDescription>
            </DialogHeader>
            
            {addingType === 'achievement' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="achievement_title" className="text-right">Title</Label><Input id="achievement_title" value={newRecord.achievement_title || ''} onChange={(e) => setNewRecord({...newRecord, achievement_title: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="cadet_name" className="text-right">Cadet Name</Label><Input id="cadet_name" value={newRecord.cadet_name || ''} onChange={(e) => setNewRecord({...newRecord, cadet_name: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="rank" className="text-right">Rank</Label><Input id="rank" value={newRecord.rank || ''} onChange={(e) => setNewRecord({...newRecord, rank: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="event" className="text-right">Event</Label><Input id="event" value={newRecord.event || ''} onChange={(e) => setNewRecord({...newRecord, event: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="year" className="text-right">Year</Label><Input id="year" value={newRecord.year || ''} onChange={(e) => setNewRecord({...newRecord, year: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            {addingType === 'announcement' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={newRecord.title || ''} onChange={(e) => setNewRecord({...newRecord, title: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Input id="description" value={newRecord.description || ''} onChange={(e) => setNewRecord({...newRecord, description: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Date</Label><Input id="date" type="date" value={newRecord.date || ''} onChange={(e) => setNewRecord({...newRecord, date: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="tag" className="text-right">Tag</Label><Input id="tag" value={newRecord.tag || ''} onChange={(e) => setNewRecord({...newRecord, tag: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            {addingType === 'gallery' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="src" className="text-right">Image URL</Label><Input id="src" value={newRecord.src || ''} onChange={(e) => setNewRecord({...newRecord, src: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="event" className="text-right">Event</Label><Input id="event" value={newRecord.event || ''} onChange={(e) => setNewRecord({...newRecord, event: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Date</Label><Input id="date" type="date" value={newRecord.date || ''} onChange={(e) => setNewRecord({...newRecord, date: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                    console.log("Save Changes button clicked");
                    handleCreate(newRecord, addingType!)
                }}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
};

export default Admin;