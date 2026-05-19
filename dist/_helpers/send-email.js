"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const config_json_1 = __importDefault(require("../config.json"));
const resend = new resend_1.Resend(config_json_1.default.resendApiKey);
async function sendEmail({ to, subject, html, from = config_json_1.default.emailFrom }) {
    await resend.emails.send({
        from,
        to,
        subject,
        html
    });
}
