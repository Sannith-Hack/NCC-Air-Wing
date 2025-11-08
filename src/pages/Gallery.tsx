import { useEffect, useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { supabase } from '@/integrations/supabase/client';

const Gallery = () => {
  const [gallery, setGallery] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching gallery:', error);
      } else {
        setGallery(data);
      }
    };

    fetchGallery();
  }, []);

  const slides = gallery.map(item => ({ src: item.src }));

  const openLightbox = (imageIndex: number) => {
    setIndex(imageIndex);
    setOpen(true);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              📸 Gallery
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
              A glimpse into the life, training, and events of the NCC Air Wing cadets.
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery.map((item, idx) => (
              <div
                key={item.id}
                className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md aspect-square"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={item.src}
                  alt={item.event}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-end p-4">
                  <div className="translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-white text-lg font-bold">{item.event}</h3>
                    <p className="text-gray-200 text-sm">{item.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* "View More" is not needed on the main page, but you can add it to a homepage section if you like */}
        </div>
      </div>

      {/* Lightbox Component */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
      />
    </>
  );
};

export default Gallery;