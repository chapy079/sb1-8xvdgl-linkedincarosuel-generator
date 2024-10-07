import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">LinkedIn Carousel Generator</h1>
      <div className="flex justify-center">
        <Link href="/generator">
          <Button size="lg">Create Carousel</Button>
        </Link>
      </div>
    </div>
  );
}