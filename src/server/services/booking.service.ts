import { leadRepository } from "../../database/repositories/LeadRepository.js";
import { appointmentRepository } from "../../database/repositories/AppointmentRepository.js";
import { sendNewBookingNotification } from "./email.service.js";

export interface Booking {
  id: string;
  name: string;
  email: string;
  company: string;
  date: string;
  time: string;
  notes: string;
  timestamp: string;
}

export interface CreateBookingDto {
  name: string;
  email: string;
  company?: string;
  date?: string;
  time?: string;
  notes?: string;
}

/**
 * Parses a "YYYY-MM-DD" date string + a "H:MM AM/PM" time string into a UTC Date.
 * Falls back to "now + 1 day" if either piece is missing/unparseable, so a
 * booking never fails to persist just because of a date-parsing edge case.
 */
function parseScheduledAt(date?: string, time?: string): Date {
  if (!date || !time) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1);
    return fallback;
  }
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) {
    const fallback = new Date(`${date}T09:00:00`);
    return isNaN(fallback.getTime()) ? new Date(Date.now() + 86_400_000) : fallback;
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const iso = `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  const parsed = new Date(iso);
  return isNaN(parsed.getTime()) ? new Date(Date.now() + 86_400_000) : parsed;
}

/**
 * Creates a real Lead + linked Appointment for a "Book a Demo" submission.
 * Persisted to MongoDB — replaces the old in-memory store, which lost every
 * booking on server restart and had no source of truth.
 */
export async function createBooking(businessId: string, dto: CreateBookingDto): Promise<Booking> {
  const lead = await leadRepository.create({
    businessId: businessId as any,
    name: dto.name,
    email: dto.email,
    company: dto.company || undefined,
    source: "manual",
    status: "booked",
    notes: dto.notes || undefined,
  } as any);

  const scheduledAt = parseScheduledAt(dto.date, dto.time);

  const appointment = await appointmentRepository.create({
    businessId: businessId as any,
    leadId: lead._id as any,
    status: "pending",
    scheduledAt,
    durationMinutes: 15,
    title: `Founding Team Demo — ${dto.name}`,
    notes: dto.notes || undefined,
  } as any);

  const booking: Booking = {
    id: String(appointment._id),
    name: dto.name,
    email: dto.email,
    company: dto.company ?? "Not specified",
    date: dto.date ?? "TBD",
    time: dto.time ?? "TBD",
    notes: dto.notes ?? "",
    timestamp: new Date().toISOString(),
  };

  // Fire-and-forget — a slow/failed notification must never block the booking response.
  sendNewBookingNotification(booking).catch(() => {});

  return booking;
}
