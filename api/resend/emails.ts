import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailRequest {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string; // base64
    type: string;
    disposition?: string;
  }[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { from, to, subject, html, attachments }: EmailRequest = req.body;

    // Validación básica
    if (!from || !to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: from, to, subject, html' 
      });
    }

    const emailData: any = {
      from,
      to,
      subject,
      html,
    };

    // Procesar attachments si existen
    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        content_type: att.type,
      }));
    }

    const data = await resend.emails.send(emailData);

    res.status(200).json({ 
      success: true, 
      data,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: error.message,
        success: false 
      });
    } else {
      res.status(500).json({ 
        error: 'Unknown error occurred',
        success: false 
      });
    }
  }
}