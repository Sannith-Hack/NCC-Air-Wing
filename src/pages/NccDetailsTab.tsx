import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NccDetailsTabProps {
  nccForm: any;
  setNccForm: (data: any) => void;
  handleNccSubmit: (e: React.FormEvent) => void;
  nccDetails: any[];
}

export const NccDetailsTab = ({ nccForm, setNccForm, handleNccSubmit, nccDetails }: NccDetailsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NCC Details</CardTitle>
        <CardDescription>Add your NCC enrollment information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleNccSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
          <Button type="submit" className="w-full">Add NCC Details</Button>
        </form>

        {nccDetails.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Your NCC Records</h3>
            {nccDetails.map((ncc) => (
              <Card key={ncc.ncc_id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Wing:</span> {ncc.ncc_wing}</div>
                    <div><span className="font-medium">Rank:</span> {ncc.cadet_rank || "N/A"}</div>
                    <div className="col-span-2"><span className="font-medium">Reg No:</span> {ncc.regimental_number || "N/A"}</div>
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