import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import { appointmentRepository } from "../../../database/repositories/AppointmentRepository.js";
import { createAppointment, updateAppointment, softDeleteAppointment, getAppointmentStats } from "../../services/appointment.service.js";

export async function listAppointments(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await appointmentRepository.findByBusiness(getBid(req), { page: +page, limit: +limit, sort: { scheduledAt: 1 } });
    paginated(res, result.data, { page: result.page, limit: +limit, total: result.total, totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev });
  } catch { serverError(res); }
}

export async function getUpcoming(req: Request, res: Response): Promise<void> {
  try {
    const appointments = await appointmentRepository.findUpcoming(getBid(req));
    ok(res, appointments);
  } catch { serverError(res); }
}

export async function getAppointment(req: Request, res: Response): Promise<void> {
  try {
    const appt = await appointmentRepository.findById(req.params.id);
    if (!appt) { notFound(res, "Appointment"); return; }
    ok(res, appt);
  } catch { serverError(res); }
}

export async function createAppointmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const appt = await createAppointment(getBid(req), req.body);
    created(res, appt);
  } catch { serverError(res); }
}

export async function updateAppointmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const appt = await updateAppointment(req.params.id, req.body);
    if (!appt) { notFound(res, "Appointment"); return; }
    ok(res, appt);
  } catch { serverError(res); }
}

export async function deleteAppointmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const appt = await softDeleteAppointment(req.params.id);
    if (!appt) { notFound(res, "Appointment"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}

export async function getAppointmentStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getAppointmentStats(getBid(req));
    ok(res, stats);
  } catch { serverError(res); }
}
