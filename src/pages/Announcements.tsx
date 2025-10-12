import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import announcements from "@/data/announcements.json";

const Announcements = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            📢 All Announcements
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Stay updated with the latest news, events, and important notices from the NCC Air Wing.
          </p>
          <div className="mt-4 mx-auto h-1 w-24 bg-blue-600 rounded"></div>
        </div>

        {/* Announcements Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item) => (
            <Card key={item.id} className="flex flex-col transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-gray-800">{item.title}</CardTitle>
                  <Badge className={`${item.tagColor} text-xs font-semibold px-2.5 py-1`}>{item.tag}</Badge>
                </div>
                <CardDescription className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;