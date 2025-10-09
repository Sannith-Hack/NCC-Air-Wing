import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Edit, Trash2 } from "lucide-react";

interface ExperienceTabProps {
  expForm: any;
  setExpForm: (data: any) => void;
  handleExpSubmit: (e: React.FormEvent) => void;
  experiences: any[];
  isLimitReached: boolean;
  handleExpDelete: (experienceId: string) => void;
  handleExpUpdate: (experienceId: string, updatedData: any) => void;
}

export const ExperienceTab = ({ 
    expForm, 
    setExpForm, 
    handleExpSubmit, 
    experiences, 
    isLimitReached,
    handleExpDelete,
    handleExpUpdate
}: ExperienceTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any | null>(null);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
  }

  const handleEditClick = (expRecord: any) => {
    const formattedRecord = {
      ...expRecord,
      start_date: formatDateForInput(expRecord.start_date),
      end_date: formatDateForInput(expRecord.end_date),
    };
    setEditingExp(formattedRecord);
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    if (editingExp) {
      handleExpUpdate(editingExp.experience_id, editingExp);
      setIsModalOpen(false);
      setEditingExp(null);
    }
  };
  
  const handleDeleteFromModal = () => {
    if(editingExp) {
      handleExpDelete(editingExp.experience_id);
      setIsModalOpen(false);
      setEditingExp(null);
    }
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Placements & Internships</CardTitle>
        <CardDescription>
          {isLimitReached
            ? "You have reached the maximum of 10 experience records."
            : "Add your work experience"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLimitReached && (
          <form onSubmit={handleExpSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exp_type">Type</Label>
                <Select value={expForm.experience} onValueChange={(value) => setExpForm({ ...expForm, experience: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="placement">Placement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input id="company" value={expForm.company_name} onChange={(e) => setExpForm({ ...expForm, company_name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={expForm.role} onChange={(e) => setExpForm({ ...expForm, role: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" value={expForm.end_date} onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="w-full">Add Experience</Button>
          </form>
        )}

        {experiences.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Your Experience Records ({experiences.length}/10)</h3>
            {experiences.map((exp) => (
              <Card key={exp.experience_id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-base">{exp.company_name}</p>
                    <div><span className="capitalize font-medium text-muted-foreground">{exp.experience}:</span> {exp.role || "N/A"}</div>
                    {exp.start_date && (
                      <div className="text-xs text-muted-foreground">
                        {formatDateForInput(exp.start_date)} to {exp.end_date ? formatDateForInput(exp.end_date) : "Present"}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(exp)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Experience</DialogTitle>
                <DialogDescription>Make changes to your experience record here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            {editingExp && (
                 <div className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="edit-exp_type">Type</Label>
                        <Select value={editingExp.experience} onValueChange={(value) => setEditingExp({ ...editingExp, experience: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="internship">Internship</SelectItem>
                                <SelectItem value="placement">Placement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="edit-company">Company Name *</Label>
                        <Input id="edit-company" value={editingExp.company_name} onChange={(e) => setEditingExp({ ...editingExp, company_name: e.target.value })} required />
                    </div>
                    <div>
                        <Label htmlFor="edit-role">Role</Label>
                        <Input id="edit-role" value={editingExp.role} onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="edit-start_date">Start Date</Label>
                        <Input id="edit-start_date" type="date" value={editingExp.start_date} onChange={(e) => setEditingExp({ ...editingExp, start_date: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="edit-end_date">End Date</Label>
                        <Input id="edit-end_date" type="date" value={editingExp.end_date} onChange={(e) => setEditingExp({ ...editingExp, end_date: e.target.value })} />
                    </div>
                 </div>
            )}
            <DialogFooter className="sm:justify-between">
                <Button variant="destructive" onClick={handleDeleteFromModal} className="sm:mr-auto">
                    <Trash2 className="h-4 w-4 mr-2"/>
                    Delete
                </Button>
                <div>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
};