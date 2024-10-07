import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  console.log('Received POST request to /api/generate-pdf');
  
  try {
    const formData = await req.formData();
    console.log('Parsed form data:', formData);

    const title = formData.get('title') as string;
    const slides = parseInt(formData.get('slides') as string);
    const context = formData.get('context') as string;
    const screenshot = formData.get('screenshot') as File | null;
    const additionalFiles = formData.getAll('files') as File[];

    if (!title || !slides || !context) {
      throw new Error('Missing required fields');
    }

    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await generatePDF(title, slides, context, screenshot, additionalFiles);

    console.log('PDF generated successfully');
    // Send PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=linkedin-carousel.pdf',
      },
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return new NextResponse(JSON.stringify({ error: 'Error generating PDF' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function generatePDF(title: string, slides: number, context: string, screenshot: File | null, additionalFiles: File[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    // Generate PDF content
    doc.fontSize(24).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Number of slides: ${slides}`);
    doc.moveDown();
    doc.text(`Context: ${context}`);
    doc.moveDown();

    // Add screenshot
    if (screenshot) {
      doc.text('Screenshot: ' + screenshot.name);
      // Note: We can't directly add the image here as we don't have the file path
      // You might need to save the file temporarily or use a different approach
    }

    // Add information about additional files
    if (additionalFiles && additionalFiles.length > 0) {
      doc.moveDown();
      doc.text('Additional Files:');
      additionalFiles.forEach((file) => {
        doc.text(`- ${file.name}`);
      });
    }

    doc.end();
  });
}