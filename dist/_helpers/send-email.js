"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY || require("../config.json").resendApiKey);
const emailFrom = process.env.EMAIL_FROM || require("../config.json").emailFrom;
async function sendEmail({ to, subject, html, from = emailFrom }) {
    await resend.emails.send({
        from,
        to,
        subject,
        html
    });
}
