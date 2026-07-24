import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT),
  secure: Number(config.SMTP_PORT) === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export async function sendResetPasswordEmail(to, resetUrl) {
  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to,
    subject: "Reset your password",
    html: `
            <p>You requested a password reset.</p>
            <p><a href="${resetUrl}">Click here to reset your password</a></p>
            <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
        `,
  });
}
