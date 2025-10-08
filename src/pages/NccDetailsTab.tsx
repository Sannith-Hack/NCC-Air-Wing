import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface NccDetailsTabProps {
  nccForm: any;
  setNccForm: (data: any) => void;
  handleNccSubmit: (e: React.FormEvent) => void;
  nccDetails: any[];
  isLimitReached: boolean; // Prop to indicate if the limit is met
}

export const NccDetailsTab = ({ nccForm, setNccForm, handleNccSubmit, nccDetails, isLimitReached }: NccDetailsTabProps) => {
  return (
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
        {/* Conditionally render the form or a "Limit Exceeded" message */}
        {!isLimitReached ? (
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
        ) : (
          <div className="p-4 mb-6 text-center bg-yellow-100/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20 rounded-md flex items-center justify-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Front-end Limit Exceeded: Cannot add more records.</p>
          </div>
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
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

