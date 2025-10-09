import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Edit, Trash2 } from "lucide-react";

interface NccDetailsTabProps {
  nccForm: any;
  setNccForm: (data: any) => void;
  handleNccSubmit: (e: React.FormEvent) => void;
  nccDetails: any[];
  isLimitReached: boolean;
  handleNccDelete: (nccId: string) => void;
  handleNccUpdate: (nccId: string, updatedData: any) => void;
}

export const NccDetailsTab = ({ 
    nccForm, 
    setNccForm, 
    handleNccSubmit, 
    nccDetails, 
    isLimitReached, 
    handleNccDelete, 
    handleNccUpdate 
}: NccDetailsTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNcc, setEditingNcc] = useState<any | null>(null);

  const handleEditClick = (nccRecord: any) => {
    // Dates from Supabase are strings; ensure they are in YYYY-MM-DD for the input
    const formattedRecord = {
      ...nccRecord,
      enrollment_date: nccRecord.enrollment_date ? new Date(nccRecord.enrollment_date).toISOString().split('T')[0] : "",
    };
    setEditingNcc(formattedRecord);
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    if (editingNcc) {
      handleNccUpdate(editingNcc.ncc_id, editingNcc);
      setIsModalOpen(false);
      setEditingNcc(null);
    }
  };
  
  const handleDeleteFromModal = () => {
    if(editingNcc) {
      handleNccDelete(editingNcc.ncc_id);
      setIsModalOpen(false);
      setEditingNcc(null);
    }
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>NCC Details</CardTitle>
        <CardDescription>
          {isLimitReached
            ? "You have reached the maximum of 10 NCC records."
            : "Add your NCC enrollment information and achievements"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLimitReached && (
          <form onSubmit={handleNccSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               <div>
                <Label htmlFor="ncc_wing">NCC Wing</Label>
                <Select value={nccForm.ncc_wing} onValueChange={(value) => setNccForm({ ...nccForm, ncc_wing: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="air">Air</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reg_number">Regimental Number</Label>
                <Input id="reg_number" value={nccForm.regimental_number} onChange={(e) => setNccForm({ ...nccForm, regimental_number: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="enrollment_date">Enrollment Date</Label>
                <Input id="enrollment_date" type="date" value={nccForm.enrollment_date} onChange={(e) => setNccForm({ ...nccForm, enrollment_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="cadet_rank">Cadet Rank</Label>
                <Input id="cadet_rank" value={nccForm.cadet_rank} onChange={(e) => setNccForm({ ...nccForm, cadet_rank: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="ncc_certification">NCC Certification</Label>
                <Select value={nccForm.my_ncc_certification} onValueChange={(value) => setNccForm({ ...nccForm, my_ncc_certification: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N/D">N/D</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="camps_attended">Camps Attended</Label>
                <Input id="camps_attended" type="number" value={nccForm.camps_attended} onChange={(e) => setNccForm({ ...nccForm, camps_attended: e.target.value })} placeholder="e.g., 2" />
              </div>
               <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="awards_received">Awards in National Camp</Label>
                <Input id="awards_received" type="number" value={nccForm.awards_received_in_national_camp} onChange={(e) => setNccForm({ ...nccForm, awards_received_in_national_camp: e.target.value })} placeholder="e.g., 1" />
              </div>
            </div>
            <Button type="submit" className="w-full">Add NCC Details</Button>
          </form>
        )}

        {nccDetails.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Your NCC Records ({nccDetails.length}/10)</h3>
            {nccDetails.map((ncc) => (
              <Card key={ncc.ncc_id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div><span className="font-medium text-muted-foreground">Wing:</span><p>{ncc.ncc_wing}</p></div>
                    <div><span className="font-medium text-muted-foreground">Rank:</span><p>{ncc.cadet_rank || "N/A"}</p></div>
                    <div><span className="font-medium text-muted-foreground">Certification:</span><p>{ncc.my_ncc_certification || "N/A"}</p></div>
                    <div className="col-span-2 md:col-span-3"><span className="font-medium text-muted-foreground">Reg No:</span><p>{ncc.regimental_number || "N/A"}</p></div>
                    <div><span className="font-medium text-muted-foreground">Camps:</span><p>{ncc.camps_attended ?? "0"}</p></div>
                    <div><span className="font-medium text-muted-foreground">Awards:</span><p>{ncc.awards_received_in_national_camp ?? "0"}</p></div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(ncc)}>
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
                <DialogTitle>Edit NCC Details</DialogTitle>
                <DialogDescription>Make changes to your NCC record here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            {editingNcc && (
                 <div className="grid gap-4 py-4">
                    {/* Re-using the form structure for editing */}
                     <div>
                        <Label htmlFor="edit-reg_number">Regimental Number</Label>
                        <Input id="edit-reg_number" value={editingNcc.regimental_number} onChange={(e) => setEditingNcc({ ...editingNcc, regimental_number: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="edit-enrollment_date">Enrollment Date</Label>
                        <Input id="edit-enrollment_date" type="date" value={editingNcc.enrollment_date} onChange={(e) => setEditingNcc({ ...editingNcc, enrollment_date: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="edit-cadet_rank">Cadet Rank</Label>
                        <Input id="edit-cadet_rank" value={editingNcc.cadet_rank} onChange={(e) => setEditingNcc({ ...editingNcc, cadet_rank: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="edit-ncc_certification">NCC Certification</Label>
                        <Select value={editingNcc.my_ncc_certification} onValueChange={(value) => setEditingNcc({ ...editingNcc, my_ncc_certification: value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="N/D">N/D</SelectItem>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="edit-camps_attended">Camps Attended</Label>
                        <Input id="edit-camps_attended" type="number" value={editingNcc.camps_attended} onChange={(e) => setEditingNcc({ ...editingNcc, camps_attended: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="edit-awards_received">Awards in National Camp</Label>
                        <Input id="edit-awards_received" type="number" value={editingNcc.awards_received_in_national_camp} onChange={(e) => setEditingNcc({ ...editingNcc, awards_received_in_national_camp: e.target.value })} />
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