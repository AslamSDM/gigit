import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "GigIt <noreply@gigit.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your GigIt email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">GigIt</h1>
            </div>

            <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin-top: 0;">Verify your email address</h2>
              <p>Hi${name ? ` ${name}` : ""},</p>
              <p>Thanks for signing up for GigIt! Please verify your email address by clicking the button below:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email</a>
              </div>

              <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
              <p style="font-size: 14px; color: #2563eb; word-break: break-all;">${verifyUrl}</p>

              <p style="font-size: 14px; color: #666; margin-top: 20px;">This link will expire in 24 hours.</p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #999;">
              <p>If you didn't create an account with GigIt, you can safely ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} GigIt. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send verification email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name?: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your GigIt password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">GigIt</h1>
            </div>

            <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin-top: 0;">Reset your password</h2>
              <p>Hi${name ? ` ${name}` : ""},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
              </div>

              <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
              <p style="font-size: 14px; color: #2563eb; word-break: break-all;">${resetUrl}</p>

              <p style="font-size: 14px; color: #666; margin-top: 20px;">This link will expire in 1 hour.</p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #999;">
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
              <p>&copy; ${new Date().getFullYear()} GigIt. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to GigIt!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">GigIt</h1>
            </div>

            <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="margin-top: 0;">Welcome to GigIt!</h2>
              <p>Hi${name ? ` ${name}` : ""},</p>
              <p>Your email has been verified and your account is now active. You're all set to start using GigIt!</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/login" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to GigIt</a>
              </div>
            </div>

            <div style="text-align: center; font-size: 12px; color: #999;">
              <p>&copy; ${new Date().getFullYear()} GigIt. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}
