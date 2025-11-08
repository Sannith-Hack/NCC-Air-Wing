import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Achievements = () => {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data, error } = await supabase.from('achievements').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching achievements:', error);
      } else {
        setAchievements(data);
      }
    };

    fetchAchievements();
  }, []);

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
            {achievements.map((item, index) => (
              <Card key={item.id} className="card-fade-in flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-2xl" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="p-0">
                  <img src={item.image} alt={item.achievement_title} className="w-full h-48 object-cover" />
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <div className="flex items-center mb-3">
                    <Award className="h-6 w-6 text-yellow-500 mr-3" />
                    <h2 className="text-xl font-bold text-gray-800">{item.achievement_title}</h2>
                  </div>
                  <p className="text-sm font-semibold text-blue-600">{item.cadet_name}, {item.rank}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.event}, {item.year}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Achievements;