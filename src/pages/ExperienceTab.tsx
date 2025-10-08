import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExperienceTabProps {
  expForm: any;
  setExpForm: (data: any) => void;
  handleExpSubmit: (e: React.FormEvent) => void;
  experiences: any[];
  isLimitReached: boolean; // Prop to indicate if the limit is met
}

export const ExperienceTab = ({ expForm, setExpForm, handleExpSubmit, experiences, isLimitReached }: ExperienceTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Placements & Internships</CardTitle>
        <CardDescription>
          {/* Change description based on whether the limit is reached */}
          {isLimitReached
            ? "You have reached the maximum of 10 experience records."
            : "Add your work experience"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Conditionally render the form or a message */}
        {!isLimitReached ? (
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
        ) : (
          <div className="p-4 mb-6 text-center bg-muted/50 rounded-md">
            <p className="text-sm font-medium text-foreground">You cannot add more experience records.</p>
          </div>
        )}

        {experiences.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Your Experience</h3>
            {experiences.map((exp) => (
              <Card key={exp.experience_id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold text-base">{exp.company_name}</div>
                    <div><span className="font-medium">Type:</span> {exp.experience}</div>
                    {exp.role && <div><span className="font-medium">Role:</span> {exp.role}</div>}
                    {exp.start_date && (
                      <div>
                        <span className="font-medium">Duration:</span> {exp.start_date} to {exp.end_date || "Present"}
                      </div>
                    )}
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