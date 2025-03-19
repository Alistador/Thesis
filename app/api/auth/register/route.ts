import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Constants
const DOMAIN = process.env.DOMAIN || "localhost:3000";
const PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";
const ACTIVATION_EXPIRY_HOURS = 24;

// Email validation regex
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Password validation
const validatePassword = (password: string) => {
  const errors = [];
  if (password.length < 6)
    errors.push("Password must be at least 6 characters long.");
  return errors;
};

// Helper function to send emails
const sendEmail = async (emailData: {
  to: string;
  template: string;
  data: any;
}) => {
  try {
    const response = await fetch(
      `${PROTOCOL}://${DOMAIN}/api/auth/emailsender`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Email API error: ${JSON.stringify(errorData)}`);
    }
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// User Registration (POST)
export async function POST(req: Request) {
  const requestId = randomUUID().slice(0, 8);
  console.log(`[REG-${requestId}] New registration request received`);

  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();
    const sanitizedName = name ? name.trim() : "";

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const passwordErrors = validatePassword(sanitizedPassword);
    if (passwordErrors.length > 0) {
      return NextResponse.json({ error: passwordErrors[0] }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        activateTokens: {
          where: { activatedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (existingUser) {
      if (existingUser.active) {
        return NextResponse.json(
          { error: "Account already exists. Please log in." },
          { status: 409 }
        );
      }

      const pendingActivation = existingUser.activateTokens[0];
      if (pendingActivation) {
        const tokenAgeHours =
          (Date.now() - pendingActivation.createdAt.getTime()) /
          (1000 * 60 * 60);
        if (tokenAgeHours < ACTIVATION_EXPIRY_HOURS) {
          // Create a UI token for the existing user
          const uiToken = randomUUID();
          await prisma.verificationPageToken.create({
            data: {
              token: uiToken,
              userId: existingUser.id,
              expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
              createdAt: new Date(),
            },
          });

          return NextResponse.json(
            {
              error:
                "Your account is pending activation. Please check your email.",
              unverifiedAccount: true,
              redirect: `/verify?token=${uiToken}`,
            },
            { status: 409 }
          );
        }

        await prisma.activateToken.deleteMany({
          where: { userId: existingUser.id },
        });
      }
    }

    const hashedPassword = await hash(sanitizedPassword, 12);
    const token = randomUUID();
    const uiToken = randomUUID();

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: sanitizedEmail,
          password: hashedPassword,
          name: sanitizedName,
          active: false,
        },
      });

      await tx.activateToken.create({
        data: {
          userId: user.id,
          token,
          createdAt: new Date(),
        },
      });

      // Create verification page token
      await tx.verificationPageToken.create({
        data: {
          token: uiToken,
          userId: user.id,
          expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
          createdAt: new Date(),
        },
      });

      return user;
    });

    const emailSent = await sendEmail({
      to: sanitizedEmail,
      template: "verification",
      data: {
        name: sanitizedName,
        token,
        expiryHours: ACTIVATION_EXPIRY_HOURS,
      },
    });

    if (!emailSent) {
      await prisma.user.delete({ where: { id: newUser.id } });
      return NextResponse.json(
        { error: "Failed to send verification email." },
        { status: 500 }
      );
    }

    // Use the UI token instead of the email in the redirect URL
    return NextResponse.json(
      {
        message:
          "Registration successful! Please check your email to verify your account",
        redirect: `/verify?token=${uiToken}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[REG-${requestId}] Registration Error:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// Resend Verification Email (PUT)
export async function PUT(req: Request) {
  const requestId = randomUUID().slice(0, 8);
  console.log(`[VERIFY-${requestId}] Verification resend request received`);

  try {
    const { email } = await req.json();
    if (!email || !isValidEmail(email.trim().toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account exists, a new verification email has been sent.",
        },
        { status: 200 }
      );
    }

    if (user.active) {
      return NextResponse.json(
        { message: "Your account is already verified. You can log in now." },
        { status: 200 }
      );
    }

    const token = randomUUID();
    const uiToken = randomUUID();

    await prisma.$transaction(async (tx) => {
      // Delete existing activation tokens
      await tx.activateToken.deleteMany({ where: { userId: user.id } });

      // Create new activation token
      await tx.activateToken.create({
        data: { userId: user.id, token, createdAt: new Date() },
      });

      // Delete existing verification page tokens
      await tx.verificationPageToken.deleteMany({ where: { userId: user.id } });

      // Create new verification page token
      await tx.verificationPageToken.create({
        data: {
          token: uiToken,
          userId: user.id,
          expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
          createdAt: new Date(),
        },
      });
    });

    const emailSent = await sendEmail({
      to: sanitizedEmail,
      template: "verification",
      data: { name: user.name, token, expiryHours: ACTIVATION_EXPIRY_HOURS },
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send verification email." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "A new verification email has been sent.",
        redirect: `/verify?token=${uiToken}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[VERIFY-${requestId}] Error:`, error);
    return NextResponse.json(
      { error: "Failed to send verification email." },
      { status: 500 }
    );
  }
}
