import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || require("../config.json").resendApiKey);
const emailFrom = process.env.EMAIL_FROM || require("../config.json").emailFrom;

export async function sendEmail({ to, subject, html, from = emailFrom }: {
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
