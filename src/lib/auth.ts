import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
                const info = await transporter.sendMail({
                    from: '"Prisma Blog" <prismablog@ph.com>',
                    to: "snawazdigital@gmail.com",
                    subject: "Please verify your email",
                    html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <tr>
        <td style="background:#111827; padding:20px; text-align:center;">
          <h1 style="color:#ffffff; margin:0; font-size:24px;">Prisma Blog</h1>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="padding:30px;">
          <h2 style="margin-top:0; color:#111827;">Verify Your Email Address</h2>
          <p style="color:#4b5563; line-height:1.6;">
            Thank you for signing up! Please confirm your email address by clicking the button below.
          </p>

          <!-- Button -->
          <div style="text-align:center; margin:30px 0;">
            <a href="${verificationUrl}"
              style="
                background-color:#2563eb;
                color:#ffffff;
                padding:14px 28px;
                text-decoration:none;
                border-radius:6px;
                display:inline-block;
                font-weight:bold;
                font-size:16px;
              ">
              Verify Email
            </a>
          </div>

          <p style="color:#6b7280; font-size:14px; line-height:1.6;">
            If the button doesn’t work, copy and paste this link into your browser:
          </p>

          <p style="word-break:break-all; font-size:13px; color:#2563eb;">
            ${verificationUrl}
          </p>

          <p style="color:#9ca3af; font-size:13px; margin-top:30px;">
            If you did not create an account, you can safely ignore this email.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#9ca3af;">
          © ${new Date().getFullYear()} Prisma Blog. All rights reserved.
        </td>
      </tr>

    </table>
  </body>
  </html>
  `,
                });

                console.log("Message sent:", info.messageId);
            } catch (error) {
                console.error(error)
                throw error;
            }
        },
    }
});