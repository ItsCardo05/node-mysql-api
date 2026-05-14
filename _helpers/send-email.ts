import { Resend } from 'resend';
import config from '../config.json';

const resend = new Resend((config as any).resendApiKey);

export async function sendEmail({ to, subject, html, from = config.emailFrom }: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  await resend.emails.send({
    from,
    to,
    subject,
    html
  });
}