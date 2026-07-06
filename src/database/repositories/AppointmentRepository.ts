import { Appointment, IAppointment, AppointmentStatus } from "../models/Appointment.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class AppointmentRepository extends BaseRepository<IAppointment> {
  constructor() { super(Appointment); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<IAppointment>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findUpcoming(businessId: string): Promise<IAppointment[]> {
    return this.model
      .find({ businessId, scheduledAt: { $gte: new Date() }, status: { $in: ["pending","confirmed"] }, deletedAt: null })
      .sort({ scheduledAt: 1 })
      .populate("leadId", "name email company")
      .exec();
  }

  async findByStatus(businessId: string, status: AppointmentStatus): Promise<IAppointment[]> {
    return this.model.find({ businessId, status, deletedAt: null }).sort({ scheduledAt: 1 }).exec();
  }

  async findByLead(leadId: string): Promise<IAppointment[]> {
    return this.model.find({ leadId, deletedAt: null }).sort({ scheduledAt: -1 }).exec();
  }
}

export const appointmentRepository = new AppointmentRepository();
