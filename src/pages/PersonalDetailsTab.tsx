import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalDetailsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  handleStudentSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const PersonalDetailsTab = ({ formData, setFormData, handleStudentSubmit, loading }: PersonalDetailsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
        <CardDescription>Update your personal and contact details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="CSD">CSD</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="MECH">MECH</SelectItem>
                  <SelectItem value="EEE">EEE</SelectItem>
                  <SelectItem value="ECE">ECE</SelectItem>
                  <SelectItem value="CIVIL">CIVIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Add Roll Number input field */}
            <div>
              <Label htmlFor="roll_no">Roll Number</Label>
              <Input id="roll_no" value={formData.roll_no} onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="parent_phone">Parent's Phone</Label>
              <Input id="parent_phone" value={formData.parents_phone_number} onChange={(e) => setFormData({ ...formData, parents_phone_number: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input id="aadhaar" value={formData.aadhaar_number} onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })} maxLength={12} />
            </div>
            <div>
              <Label htmlFor="pan">PAN Number</Label>
              <Input id="pan" value={formData.pan_number} onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })} maxLength={10} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="account">Account Number</Label>
              <Input id="account" value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  ); //
};