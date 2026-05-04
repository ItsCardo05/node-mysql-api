import nodemailer from 'nodemailer';
import config from '../config.json';

export async function sendEmail({ to, subject, html, from = config.emailFrom }: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const transporter = nodemailer.createTransport(config.smtpOptions as any);
  await transporter.sendMail({ from, to, subject, html });
}
