import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Award, PlusCircle, Send } from 'lucide-react';
import achievementsData from '@/data/achievements.json';

const Achievements = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleShareClick = () => {
    if (user) {
      setIsModalOpen(true);
    } else {
      toast({
        title: "Login Required",
        description: "Please log in to share your achievement.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend/Supabase
    console.log("Achievement submitted!");
    toast({
      title: "Submission Successful!",
      description: "Thank you for sharing your achievement. It will be reviewed by an admin.",
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              🏆 Achievements
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              Celebrating the hard work, dedication, and accomplishments of our cadets.
            </p>
            <div className="mt-4 mx-auto h-1.5 w-24 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full"></div>
          </div>

          {/* Achievements Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {achievementsData.map((item, index) => (
              <Card key={item.id} className="card-fade-in flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-2xl" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="p-0">
                  <img src={item.image} alt={item.achievementTitle} className="w-full h-48 object-cover" />
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <div className="flex items-center mb-3">
                    <Award className="h-6 w-6 text-yellow-500 mr-3" />
                    <h2 className="text-xl font-bold text-gray-800">{item.achievementTitle}</h2>
                  </div>
                  <p className="text-sm font-semibold text-blue-600">{item.cadetName}, {item.rank}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.event}, {item.year}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="mt-16 text-center">
            <Button onClick={handleShareClick} size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusCircle className="mr-2 h-5 w-5" /> Share Your Achievement
            </Button>
          </div>
        </div>
      </div>
      
      {/* Submission Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Achievement</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your achievement for review.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Cadet Name</Label>
                <Input id="name" value={user?.user_metadata?.full_name || 'Cadet'} readOnly className="col-span-3 bg-gray-100" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Achievement</Label>
                <Input id="title" placeholder="e.g., Best Cadet Award" required className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event" className="text-right">Event / Year</Label>
                <Input id="event" placeholder="e.g., Annual Training Camp, 2025" required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                 <Textarea id="description" placeholder="(Optional) Add a short description of your achievement." className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" /> Submit for Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Achievements;