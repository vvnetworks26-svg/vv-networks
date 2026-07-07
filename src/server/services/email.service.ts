/**
 * Email Service — stub implementation.
 * In Phase D.5 this will be replaced with a real transactional email provider
 * (Resend, SendGrid, or AWS SES). For now it logs to console in development.
 */
export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    // Development: log to stdout so engineers can see the token
    // eslint-disable-next-line no-console
    console.info(`[EmailStub] To: ${opts.to} | Subject: ${opts.subject}\n${opts.text}`);
  }
  // Production: integrate provider here
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const url = `${process.env.APP_URL ?? "http://localhost:4000"}/reset-password?token=${rawToken}`;
  await sendEmail({
    to,
    subject: "Reset your VV Networks password",
    text: `Click the link below to reset your password (expires in 1 hour):\n\n${url}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Click <a href="${url}">here</a> to reset your password (expires in 1 hour).</p>`,
  });
}

export async function sendVerificationEmail(to: string, rawToken: string): Promise<void> {
  const url = `${process.env.APP_URL ?? "http://localhost:4000"}/verify-email?token=${rawToken}`;
  await sendEmail({
    to,
    subject: "Verify your VV Networks email",
    text: `Click the link below to verify your email (expires in 24 hours):\n\n${url}`,
    html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
  });
}
