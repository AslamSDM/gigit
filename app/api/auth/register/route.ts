import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.enum(["WORKER", "BUSINESS"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, userType, firstName, lastName, companyName } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with transaction
    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user (email not verified yet)
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          userType,
          name: userType === "WORKER"
            ? `${firstName} ${lastName}`.trim()
            : companyName,
          emailVerified: null, // Not verified yet
        },
      });

      // Create profile based on user type
      if (userType === "WORKER" && firstName && lastName) {
        await tx.workerProfile.create({
          data: {
            userId: newUser.id,
            firstName,
            lastName,
          },
        });
      } else if (userType === "BUSINESS" && companyName) {
        await tx.businessProfile.create({
          data: {
            userId: newUser.id,
            companyName,
          },
        });
      }

      // Create verification token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpires,
        },
      });

      return newUser;
    });

    // Send verification email
    const userName = userType === "WORKER"
      ? `${firstName} ${lastName}`.trim()
      : companyName;

    await sendVerificationEmail(email, verificationToken, userName);

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
