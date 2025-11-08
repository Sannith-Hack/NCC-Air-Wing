import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
// REMOVED: import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/sonner"; // ADDED: Import toast from sonner
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { Download, Edit, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"; // ADDED: CalendarIcon

// ADDED: Imports for Calendar Date Picker
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const typeConfig = {
  student: { tableName: 'students', idColumn: 'student_id' },
  ncc: { tableName: 'ncc_details', idColumn: 'ncc_id' },
  experience: { tableName: 'placements_internships', idColumn: 'experience_id' },
  achievement: { tableName: 'achievements', idColumn: 'id' },
  announcement: { tableName: 'announcements', idColumn: 'id' },
  gallery: { tableName: 'gallery', idColumn: 'id' },
};

const Admin = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // REMOVED: const { toast } = useToast();
  // The imported `toast` function from sonner can be used directly.
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [students, setStudents] = useState<any[]>([]);
  const [nccDetails, setNccDetails] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentTab, setCurrentTab] = useState("students");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editingType, setEditingType] = useState<'student' | 'ncc' | 'experience' | 'achievement' | 'announcement' | 'gallery' | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingType, setAddingType] = useState<'achievement' | 'announcement' | 'gallery' | null>(null);
  const [newRecord, setNewRecord] = useState<any>({});

  const [isUploading, setIsUploading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; type: 'student' | 'ncc' | 'experience' | 'achievement' | 'announcement' | 'gallery' } | null>(null);


  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      // CHANGED: Updated toast call for sonner
      toast.error("Access Denied", { description: "You don't have admin privileges." });
      navigate("/");
      return;
    }
    fetchAllData();
  }, [user, isAdmin, authLoading, navigate]); // Removed toast from dependency array

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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'gallery' | 'achievement',
    mode: 'add' | 'edit'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // CHANGED: Updated toast call for sonner
    toast.info('Uploading image...');

    const bucket = type === 'gallery' ? 'gallery_images' : 'achievement_images';
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}.${fileExt}`; // Unique file name

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      if (!data.publicUrl) throw new Error('Could not get public URL.');

      const fieldName = type === 'gallery' ? 'src' : 'image';

      if (mode === 'add') {
        setNewRecord((prev: any) => ({ ...prev, [fieldName]: data.publicUrl }));
      } else {
        setEditingRecord((prev: any) => ({ ...prev, [fieldName]: data.publicUrl }));
      }

      // CHANGED: Updated toast call for sonner
      toast.success('Upload Successful', {
        description: 'Image URL has been set.',
      });
    } catch (error: any) {
      // CHANGED: Updated toast call for sonner
      toast.error('Upload Failed', {
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (id: string, data: any, type: 'student' | 'ncc' | 'experience' | 'achievement' | 'announcement' | 'gallery') => {
    const { created_at, students, ...updatePayload } = data;
    const { tableName, idColumn } = typeConfig[type];

    // Remove the id column from the payload
    const { [idColumn]: idValue, ...restOfPayload } = updatePayload;

    const { error } = await supabase.from(tableName).update(restOfPayload).eq(idColumn, id);

    if (error) {
      toast.error(`Error updating ${type}`, { description: error.message });
    }
    else {
      toast.success("Success", { description: `${type.charAt(0).toUpperCase() + type.slice(1)} record updated.` });
    }

    await fetchAllData();
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    const { id, type } = recordToDelete;
    const { tableName, idColumn } = typeConfig[type];

    const { error } = await supabase.from(tableName).delete().eq(idColumn, id);

    if (error) { 
      // CHANGED: Updated toast call for sonner
      toast.error(`Error deleting ${type}`, { description: error.message }); 
    }
    else { 
      // CHANGED: Updated toast call for sonner
      toast.success("Success", { description: `${type.charAt(0).toUpperCase() + type.slice(1)} record deleted.` }); 
    }

    await fetchAllData();
    setIsModalOpen(false);
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const handleCreate = async (data: any, type: 'achievement' | 'announcement' | 'gallery') => {
    const { tableName } = typeConfig[type];
    const { error } = await supabase.from(tableName).insert(data);

    if (error) {
        toast.error(`Error creating ${type}`, { description: error.message });
    }
    else {
      toast.success("Success", { description: `${type.charAt(0).toUpperCase() + type.slice(1)} record created.` });
    }

    await fetchAllData();
    setIsAddModalOpen(false);
    setNewRecord({});
  };

  // ... (handleEditClick, handleAddClick, handleDownloadExcel, and the main component layout remain the same)
  // ... (No changes needed in the main JSX part, only in the Dialogs below)

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

  const handleDeleteClick = (id: string, type: 'student' | 'ncc' | 'experience' | 'achievement' | 'announcement' | 'gallery') => {
    setRecordToDelete({ id, type });
    setIsDeleteDialogOpen(true);
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
        {/* ... (This whole section remains the same) ... */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and view all student records</p>
          </div>
          <Button onClick={handleDownloadExcel} disabled={loadingData}> <Download className="mr-2 h-4 w-4" /> Download as Excel </Button>
        </div>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        {isMobile ? (
            <Select onValueChange={setCurrentTab} defaultValue={currentTab}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">Students ({students.length})</SelectItem>
                <SelectItem value="ncc">NCC Details ({nccDetails.length})</SelectItem>
                <SelectItem value="experience">Experiences ({experiences.length})</SelectItem>
                <SelectItem value="achievements">Achievements ({achievements.length})</SelectItem>
                <SelectItem value="announcements">Announcements ({announcements.length})</SelectItem>
                <SelectItem value="gallery">Gallery ({gallery.length})</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
                <TabsTrigger value="ncc">NCC Details ({nccDetails.length})</TabsTrigger>
                <TabsTrigger value="experience">Experiences ({experiences.length})</TabsTrigger>
                <TabsTrigger value="achievements">Achievements ({achievements.length})</TabsTrigger>
                <TabsTrigger value="announcements">Announcements ({announcements.length})</TabsTrigger>
                <TabsTrigger value="gallery">Gallery ({gallery.length})</TabsTrigger>
              </TabsList>
            </div>
          )}
          
          {/* ... (TabsContent for students, ncc, experience, gallery, announcements, achievements remains the same) ... */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>A complete list of all registered students.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveTable
                  data={students}
                  columns={[
                    { key: "name", header: "Name" },
                    { key: "email", header: "Email" },
                    { key: "branch", header: "Branch" },
                    { key: "year", header: "Year" },
                    { key: "roll_no", header: "Roll No." },
                    {
                      key: "actions",
                      header: "Actions",
                      render: (student) => (
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(student, 'student')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                  renderCard={(student) => (
                    <div className="space-y-2">
                      <div className="font-semibold">{student.name}</div>
                      <div>{student.email}</div>
                      <div>{student.branch} - {student.year}</div>
                      <div>{student.roll_no}</div>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(student, 'student')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                />
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
                <ResponsiveTable
                  data={nccDetails}
                  columns={[
                    { key: "students", header: "Student", render: (ncc) => ncc.students?.name },
                    { key: "regimental_number", header: "Regimental No." },
                    { key: "cadet_rank", header: "Rank" },
                    {
                      key: "my_ncc_certification",
                      header: "Certification",
                      render: (ncc) => <Badge>{ncc.my_ncc_certification}</Badge>,
                    },
                    {
                      key: "actions",
                      header: "Actions",
                      render: (ncc) => (
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(ncc, 'ncc')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                  renderCard={(ncc) => (
                    <div className="space-y-2">
                      <div className="font-semibold">{ncc.students?.name}</div>
                      <div>{ncc.regimental_number}</div>
                      <div>{ncc.cadet_rank}</div>
                      <div><Badge>{ncc.my_ncc_certification}</Badge></div>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(ncc, 'ncc')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                />
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
                <ResponsiveTable
                  data={experiences}
                  columns={[
                    { key: "students", header: "Student", render: (exp) => exp.students?.name },
                    {
                      key: "experience",
                      header: "Type",
                      render: (exp) => <Badge variant={exp.experience === 'placement' ? 'default' : 'secondary'}>{exp.experience}</Badge>,
                    },
                    { key: "company_name", header: "Company" },
                    { key: "role", header: "Role" },
                    {
                      key: "actions",
                      header: "Actions",
                      render: (exp) => (
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(exp, 'experience')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                  renderCard={(exp) => (
                    <div className="space-y-2">
                      <div className="font-semibold">{exp.company_name}</div>
                      <div>{exp.students?.name}</div>
                      <div><Badge variant={exp.experience === 'placement' ? 'default' : 'secondary'}>{exp.experience}</Badge></div>
                      <div>{exp.role}</div>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(exp, 'experience')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                />
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
                <ResponsiveTable
                  data={gallery}
                  columns={[
                    { key: "event", header: "Event" },
                    { key: "date", header: "Date" },
                    {
                      key: "actions",
                      header: "Actions",
                      render: (item) => (
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(item, 'gallery')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                  renderCard={(item) => (
                    <div className="space-y-2">
                      <div className="font-semibold">{item.event}</div>
                      <div>{item.date}</div>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(item, 'gallery')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                />
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
                <ResponsiveTable
                  data={announcements}
                  columns={[
                    { key: "title", header: "Title" },
                    { key: "date", header: "Date" },
                    {
                      key: "actions",
                      header: "Actions",
                      render: (announcement) => (
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(announcement, 'announcement')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                  renderCard={(announcement) => (
                    <div className="space-y-2">
                      <div className="font-semibold">{announcement.title}</div>
                      <div>{announcement.date}</div>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(announcement, 'announcement')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                />
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
                <ResponsiveTable
                  data={achievements}
                  columns={[
                    { key: "achievement_title", header: "Title" },
                    { key: "cadet_name", header: "Cadet Name" },
                    {
                      key: "actions",
                      header: "Actions",
                      render: (achievement) => (
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(achievement, 'achievement')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      ),
                    },
                  ]}
                  renderCard={(achievement) => (
                    <div className="space-y-2">
                      <div className="font-semibold">{achievement.achievement_title}</div>
                      <div>{achievement.cadet_name}</div>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(achievement, 'achievement')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                />
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
            
            {/* ... (editingType 'student', 'ncc', 'experience' Dialogs remain the same) ... */}
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

            {/* ... (editingType 'achievement' Dialog remains the same) ... */}
            {editingRecord && editingType === 'achievement' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="achievement_title" className="text-right">Title</Label><Input id="achievement_title" value={editingRecord.achievement_title} onChange={(e) => setEditingRecord({...editingRecord, achievement_title: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="cadet_name" className="text-right">Cadet Name</Label><Input id="cadet_name" value={editingRecord.cadet_name} onChange={(e) => setEditingRecord({...editingRecord, cadet_name: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="rank" className="text-right">Rank</Label><Input id="rank" value={editingRecord.rank} onChange={(e) => setEditingRecord({...editingRecord, rank: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="event" className="text-right">Event</Label><Input id="event" value={editingRecord.event} onChange={(e) => setEditingRecord({...editingRecord, event: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="year" className="text-right">Year</Label><Input id="year" value={editingRecord.year} onChange={(e) => setEditingRecord({...editingRecord, year: e.target.value})} className="col-span-3"/></div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-edit-upload" className="text-right">Add Image</Label>
                      <Input 
                        id="image-edit-upload" 
                        type="file" 
                        onChange={(e) => handleImageUpload(e, 'achievement', 'edit')} 
                        disabled={isUploading}
                        className="col-span-3"
                        accept="image/png, image/jpeg, image/webp" 
                      />
                    </div>
                </div>
            )}

            {editingRecord && editingType === 'announcement' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={editingRecord.title} onChange={(e) => setEditingRecord({...editingRecord, title: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Input id="description" value={editingRecord.description} onChange={(e) => setEditingRecord({...editingRecord, description: e.target.value})} className="col-span-3"/></div>
                    
                    {/* CHANGED: Replaced Input with Calendar Popover */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "col-span-3 justify-start text-left font-normal",
                              !editingRecord.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editingRecord.date ? format(new Date(editingRecord.date), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={editingRecord.date ? new Date(editingRecord.date) : undefined}
                            onSelect={(date) => setEditingRecord({ ...editingRecord, date: date ? format(date, "yyyy-MM-dd") : '' })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="tag" className="text-right">Tag</Label><Input id="tag" value={editingRecord.tag} onChange={(e) => setEditingRecord({...editingRecord, tag: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            {editingRecord && editingType === 'gallery' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="src-edit-upload" className="text-right">Add Image</Label>
                      <Input 
                        id="src-edit-upload" 
                        type="file" 
                        onChange={(e) => handleImageUpload(e, 'gallery', 'edit')} 
                        disabled={isUploading}
                        className="col-span-3"
                        accept="image/png, image/jpeg, image/webp" 
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="event" className="text-right">Event</Label><Input id="event" value={editingRecord.event} onChange={(e) => setEditingRecord({...editingRecord, event: e.target.value})} className="col-span-3"/></div>
                    
                    {/* CHANGED: Replaced Input with Calendar Popover */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "col-span-3 justify-start text-left font-normal",
                              !editingRecord.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editingRecord.date ? format(new Date(editingRecord.date), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={editingRecord.date ? new Date(editingRecord.date) : undefined}
                            onSelect={(date) => setEditingRecord({ ...editingRecord, date: date ? format(date, "yyyy-MM-dd") : '' })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                </div>
            )}

            <DialogFooter className="sm:justify-between">
                {/* ... (DialogFooter remains the same) ... */}
                <Button variant="destructive" onClick={() => handleDeleteClick(editingRecord[typeConfig[editingType!].idColumn], editingType!)} className="sm:mr-auto"> <Trash2 className="h-4 w-4 mr-2"/> Delete </Button>
                <div>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={() => handleUpdate(editingRecord[typeConfig[editingType!].idColumn], editingRecord, editingType!)}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Save Changes"}
                    </Button>
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
            
            {/* ... (addingType 'achievement' Dialog remains the same) ... */}
            {addingType === 'achievement' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="achievement_title" className="text-right">Title</Label><Input id="achievement_title" value={newRecord.achievement_title || ''} onChange={(e) => setNewRecord({...newRecord, achievement_title: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="cadet_name" className="text-right">Cadet Name</Label><Input id="cadet_name" value={newRecord.cadet_name || ''} onChange={(e) => setNewRecord({...newRecord, cadet_name: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="rank" className="text-right">Rank</Label><Input id="rank" value={newRecord.rank || ''} onChange={(e) => setNewRecord({...newRecord, rank: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="event" className="text-right">Event</Label><Input id="event" value={newRecord.event || ''} onChange={(e) => setNewRecord({...newRecord, event: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="year" className="text-right">Year</Label><Input id="year" value={newRecord.year || ''} onChange={(e) => setNewRecord({...newRecord, year: e.target.value})} className="col-span-3"/></div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-add-upload" className="text-right">Add Image</Label>
                      <Input 
                        id="image-add-upload" 
                        type="file" 
                        onChange={(e) => handleImageUpload(e, 'achievement', 'add')} 
                        disabled={isUploading}
                        className="col-span-3"
                        accept="image/png, image/jpeg, image/webp" 
                      />
                    </div>
                </div>
            )}

            {addingType === 'announcement' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={newRecord.title || ''} onChange={(e) => setNewRecord({...newRecord, title: e.target.value})} className="col-span-3"/></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Input id="description" value={newRecord.description || ''} onChange={(e) => setNewRecord({...newRecord, description: e.target.value})} className="col-span-3"/></div>
                    
                    {/* CHANGED: Replaced Input with Calendar Popover */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "col-span-3 justify-start text-left font-normal",
                              !newRecord.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newRecord.date ? format(new Date(newRecord.date), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newRecord.date ? new Date(newRecord.date) : undefined}
                            onSelect={(date) => setNewRecord({ ...newRecord, date: date ? format(date, "yyyy-MM-dd") : '' })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="tag" className="text-right">Tag</Label><Input id="tag" value={newRecord.tag || ''} onChange={(e) => setNewRecord({...newRecord, tag: e.target.value})} className="col-span-3"/></div>
                </div>
            )}

            {addingType === 'gallery' && (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="src-add-upload" className="text-right">Add Image</Label>
                      <Input 
                        id="src-add-upload" 
                        type="file" 
                        onChange={(e) => handleImageUpload(e, 'gallery', 'add')} 
                        disabled={isUploading}
                        className="col-span-3"
                        accept="image/png, image/jpeg, image/webp" 
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="event" className="text-right">Event</Label><Input id="event" value={newRecord.event || ''} onChange={(e) => setNewRecord({...newRecord, event: e.target.value})} className="col-span-3"/></div>
                    
                    {/* CHANGED: Replaced Input with Calendar Popover */}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "col-span-3 justify-start text-left font-normal",
                              !newRecord.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newRecord.date ? format(new Date(newRecord.date), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newRecord.date ? new Date(newRecord.date) : undefined}
                            onSelect={(date) => setNewRecord({ ...newRecord, date: date ? format(date, "yyyy-MM-dd") : '' })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                </div>
            )}

            <DialogFooter>
                {/* ... (DialogFooter remains the same) ... */}
                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => {
                    console.log("Save Changes button clicked");
                    handleCreate(newRecord, addingType!)
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Save Changes"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the {recordToDelete?.type} record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default Admin;