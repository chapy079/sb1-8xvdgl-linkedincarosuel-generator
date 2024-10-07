'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import FileUpload from '@/components/FileUpload';
import CarouselPreview from '@/components/CarouselPreview';

const formSchema = z.object({
  title: z.string().min(2).max(100),
  slides: z.number().min(3).max(8),
  context: z.string().min(10),
  files: z.array(z.instanceof(File)).optional(),
  screenshot: z.instanceof(File).optional(),
});

export default function Generator() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slides: 3,
      context: '',
      files: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log('Form submitted with values:', values);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('slides', values.slides.toString());
      formData.append('context', values.context);
      
      if (values.screenshot) {
        formData.append('screenshot', values.screenshot);
      }
      
      if (values.files && values.files.length > 0) {
        values.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      console.log('Sending request to /api/generate-pdf');
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);
      
      toast({
        title: "Carousel generated!",
        description: "Your LinkedIn carousel has been created successfully.",
      });
    } catch (error) {
      console.error('Error generating carousel:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem generating your carousel.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Your LinkedIn Carousel</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* ... (rest of the form fields remain unchanged) ... */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Carousel'}
          </Button>
        </form>
      </Form>
      
      {pdfUrl && <CarouselPreview pdfUrl={pdfUrl} />}
    </div>
  );
}