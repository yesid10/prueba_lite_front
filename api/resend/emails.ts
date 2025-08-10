const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailRequest {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string;
    type: string;
    disposition?: string;
  }[];
}

module.exports = async (req: any, res: any) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY no configurada');
      return res.status(500).json({ 
        error: 'RESEND_API_KEY not configured' 
      });
    }

    const { from, to, subject, html, attachments }: EmailRequest = req.body;

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
};