'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface CarouselPreviewProps {
  pdfUrl: string;
}

const CarouselPreview: React.FC<CarouselPreviewProps> = ({ pdfUrl }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Carousel Preview</h2>
      <div className="aspect-video mb-4">
        <iframe src={pdfUrl} className="w-full h-full border rounded-md"></iframe>
      </div>
      <Button asChild>
        <a href={pdfUrl} download="linkedin-carousel.pdf">Download PDF</a>
      </Button>
    </div>
  );
};

export default CarouselPreview;