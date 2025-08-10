import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Export como ES module sin tipos de Vercel
export default async function handler(req: any, res: any) {
  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY no configurada');
      res.status(500).json({ 
        error: 'RESEND_API_KEY not configured' 
      });
      return;
    }

    const { from, to, subject, html, attachments } = req.body;

    if (!from || !to || !subject || !html) {
      res.status(400).json({ 
        error: 'Missing required fields: from, to, subject, html' 
      });
      return;
    }

    const emailData: {
      from: any;
      to: any;
      subject: any;
      html: any;
      attachments?: any[];
    } = {
      from,
      to,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map((att: any) => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        content_type: att.type,
      }));
    }

    console.log('📧 Enviando email...');
    const data = await resend.emails.send(emailData);
    
    console.log('✅ Email enviado:', data);
    res.status(200).json({ 
      success: true, 
      data,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: errorMessage,
      success: false 
    });
  }
}