import { appointmentRepository } from "../../database/repositories/AppointmentRepository.js";
import type { IAppointment } from "../../database/models/Appointment.js";
import type { FilterQuery } from "mongoose";

export async function getAppointmentStats(businessId: string) {
  const stats = await appointmentRepository.aggregate<{ status: string; count: number }>([
    { $match: { businessId, deletedAt: null } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
  ]);
  const upcoming = await appointmentRepository.count({
    businessId,
    scheduledAt: { $gte: new Date() },
    status: { $in: ["pending", "confirmed"] },
    deletedAt: null,
  } as FilterQuery<IAppointment>);
  return { byStatus: stats, upcoming };
}

export async function createAppointment(businessId: string, data: Partial<IAppointment>): Promise<IAppointment> {
  return appointmentRepository.create({ ...data, businessId } as unknown as Partial<IAppointment>);
}

export async function updateAppointment(id: string, data: Partial<IAppointment>): Promise<IAppointment | null> {
  const update: Partial<IAppointment> & { cancelledAt?: Date } = { ...data };
  if ((data as any).status === "cancelled" && !update.cancelledAt) {
    update.cancelledAt = new Date();
  }
  return appointmentRepository.update(id, update);
}

export async function softDeleteAppointment(id: string): Promise<IAppointment | null> {
  return appointmentRepository.softDelete(id);
}
