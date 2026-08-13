/**
 * Email Service.
 *
 * Sends via Resend (https://resend.com) when RESEND_API_KEY is configured.
 * Falls back to logging in development, and to a loud warning (not a thrown
 * error) in production when no key is set — a missing notification should
 * never take down a booking or contact-request submission.
 */
import { config } from "../config.js";
import logger from "../logger.js";
import type { Booking } from "./booking.service.js";
import type { z } from "zod";
import type { createContactRequestSchema } from "../api/schemas.js";

type ContactRequestData = z.infer<typeof createContactRequestSchema>;

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (!config.resendApiKey) {
    if (config.isDev) {
      // eslint-disable-next-line no-console
      console.info(`[EmailStub] To: ${opts.to} | Subject: ${opts.subject}\n${opts.text}`);
    } else {
      logger.warn("[Email] RESEND_API_KEY not set — notification not sent", { subject: opts.subject });
    }
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    config.notifyEmailFrom,
      to:      [opts.to],
      subject: opts.subject,
      text:    opts.text,
      html:    opts.html ?? `<pre>${opts.text}</pre>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error("[Email] Resend API error", { status: res.status, body });
  }
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const url = `${config.appUrl}/reset-password?token=${rawToken}`;
  await sendEmail({
    to,
    subject: "Reset your VV Networks password",
    text: `Click the link below to reset your password (expires in 1 hour):\n\n${url}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Click <a href="${url}">here</a> to reset your password (expires in 1 hour).</p>`,
  });
}

export async function sendVerificationEmail(to: string, rawToken: string): Promise<void> {
  const url = `${config.appUrl}/verify-email?token=${rawToken}`;
  await sendEmail({
    to,
    subject: "Verify your VV Networks email",
    text: `Click the link below to verify your email (expires in 24 hours):\n\n${url}`,
    html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
  });
}

/** Notifies the team inbox when someone books a demo through the site. */
export async function sendNewBookingNotification(booking: Booking): Promise<void> {
  await sendEmail({
    to: config.notifyEmailTo,
    subject: `New demo booking — ${booking.name}${booking.company !== "Not specified" ? ` (${booking.company})` : ""}`,
    text: [
      `New "Book Team Demo" submission:`,
      ``,
      `Name:    ${booking.name}`,
      `Email:   ${booking.email}`,
      `Company: ${booking.company}`,
      `Date:    ${booking.date}`,
      `Time:    ${booking.time}`,
      `Notes:   ${booking.notes || "(none)"}`,
    ].join("\n"),
  });
}

/** Notifies the team inbox when someone submits the contact/strategy-session form. */
export async function sendNewContactRequestNotification(
  data: ContactRequestData
): Promise<void> {
  await sendEmail({
    to: config.notifyEmailTo,
    subject: `New enquiry — ${data.name}${data.company ? ` (${data.company})` : ""}`,
    text: [
      `New contact form submission:`,
      ``,
      `Name:              ${data.name}`,
      `Email:             ${data.email}`,
      `Company:           ${data.company || "(not provided)"}`,
      `Phone:             ${data.phone || "(not provided)"}`,
      `Industry:          ${data.industry || "(not provided)"}`,
      `Project type:      ${data.projectType}`,
      `Budget:            ${data.budget || "(not provided)"}`,
      `Timeline:          ${data.timeline || "(not provided)"}`,
      `Preferred contact: ${data.preferredContact}`,
      `Wants LeadFlow demo: ${data.wantsLeadFlowDemo ? "Yes" : "No"}`,
      ``,
      `Message:`,
      data.message,
    ].join("\n"),
  });
}
