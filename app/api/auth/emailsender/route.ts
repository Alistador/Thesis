// http://localhost:8025 for Mailhog

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Constants
const DOMAIN = process.env.DOMAIN || "localhost:3000";
const PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";
const MAIL_SENDER = process.env.MAIL_SENDER || "noreply@yourdomain.com";

// Configure SMTP Transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025"),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

// Email validation function
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Types for email templates
type EmailTemplate =
  | "verification"
  | "reset-password"
  | "welcome"
  | "notification";

interface SendEmailRequest {
  to: string;
  subject?: string;
  template: EmailTemplate;
  data: {
    name?: string;
    token?: string;
    expiryHours?: number;
    [key: string]: any;
  };
}

// Generate HTML email content based on the template
const generateEmailContent = (
  template: EmailTemplate,
  data: any
): { subject: string; html: string } => {
  // Common email container style with gradient background
  const containerStyle = `
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: linear-gradient(to bottom right, #3B92F4, #3A91F4);
    color: #ffffff;
  `;

  // Button style with contrasting color to stand out against the gradient background
  const buttonStyle = `
    background-color: #ffffff;
    color: #3B92F4;
    padding: 12px 18px;
    text-decoration: none;
    border-radius: 5px;
    display: inline-block;
    font-weight: bold;
  `;

  // Link style for better visibility on gradient background
  const linkStyle = `color: #ffffff; font-weight: bold;`;

  // Secondary text style for better readability
  const secondaryTextStyle = `font-size: 12px; color: #e6e6e6;`;

  const emailTemplates: Record<
    EmailTemplate,
    () => { subject: string; html: string }
  > = {
    verification: () => {
      // The API endpoint remains the same - it uses the token in the route parameter
      // which is secure since it doesn't expose the email
      const verificationLink = `${PROTOCOL}://${DOMAIN}/api/auth/verify/${data.token}`;
      return {
        subject: "Verify Your Email Address",
        html: `
<div style="${containerStyle}">
  <h2 style="color:#ffffff;">Verify Your Email</h2>
  <p>Hello <strong>${data.name || "User"}</strong>,</p>
  <p>Thank you for registering! Please click the button below to verify your email address:</p>
  <p style="text-align:center;">
    <a href="${verificationLink}" style="${buttonStyle}">
      Verify Email
    </a>
  </p>
  <p>If you didn't create an account, you can safely ignore this email.</p>
  <p><strong>Note:</strong> This link will expire in ${
    data.expiryHours || 24
  } hours.</p>
  <hr style="border-color: rgba(255,255,255,0.3);" />
  <p style="${secondaryTextStyle}">If the button above doesn't work, copy and paste this URL into your browser: <br />
    <a href="${verificationLink}" style="${linkStyle} word-break:break-all;">${verificationLink}</a>
  </p>
</div>
        `,
      };
    },
    "reset-password": () => {
      // Update the reset password link to use token instead of revealing user info
      const resetLink = `${PROTOCOL}://${DOMAIN}/password-reset/${data.token}`;
      return {
        subject: "Reset Your Password",
        html: `
<div style="${containerStyle}">
  <h2 style="color:#ffffff;">Reset Your Password</h2>
  <p>Hello <strong>${data.name || "User"}</strong>,</p>
  <p>We received a request to reset your password. Click the button below to reset it:</p>
  <p style="text-align:center;">
    <a href="${resetLink}" style="${buttonStyle}">
      Reset Password
    </a>
  </p>
  <p>If you didn't request this reset, you can safely ignore this email.</p>
  <p><strong>Note:</strong> This link will expire in ${
    data.expiryHours || 4
  } hours.</p>
  <hr style="border-color: rgba(255,255,255,0.3);" />
  <p style="${secondaryTextStyle}">If the button above doesn't work, copy and paste this URL into your browser: <br />
    <a href="${resetLink}" style="${linkStyle} word-break:break-all;">${resetLink}</a>
  </p>
</div>
        `,
      };
    },
    welcome: () => ({
      subject: "Welcome to Our Platform",
      html: `
      <div style="${containerStyle}">
        <h2 style="color:#ffffff;">Welcome to Our Platform!</h2>
        <p>Hello${data.name ? ` <strong>${data.name}</strong>` : ""},</p>
        <p>Thank you for joining our platform. You can now log in and start using our services.</p>
      </div>
      `,
    }),
    notification: () => ({
      subject: data.title || "New Notification",
      html: `
      <div style="${containerStyle}">
        <h2 style="color:#ffffff;">${data.title || "New Notification"}</h2>
        <p>Hello${data.name ? ` <strong>${data.name}</strong>` : ""},</p>
        <p>${data.message || "You have a new notification."}</p>
        ${
          data.actionUrl
            ? `<p style="text-align:center;">
            <a href="${data.actionUrl}" style="${buttonStyle}">
              ${data.actionText || "View Details"}
            </a>
          </p>`
            : ""
        }
      </div>
      `,
    }),
  };

  return emailTemplates[template]();
};

// 🔹 Handle POST request for sending emails
export async function POST(req: Request) {
  try {
    const body: SendEmailRequest = await req.json();

    if (!body.to || !body.template) {
      return NextResponse.json(
        { error: "Recipient email and template type are required." },
        { status: 400 }
      );
    }

    const sanitizedEmail = body.to.trim().toLowerCase();

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const { subject, html } = generateEmailContent(body.template, body.data);

    try {
      await transporter.sendMail({
        from: MAIL_SENDER,
        to: sanitizedEmail,
        subject: body.subject || subject,
        html,
      });

      console.log(
        `Email sent successfully to: ${sanitizedEmail} (Template: ${body.template})`
      );
      return NextResponse.json(
        { message: "Email sent successfully." },
        { status: 200 }
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected Email API Error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
