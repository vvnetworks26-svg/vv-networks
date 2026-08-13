import { contactRequestRepository } from "../../database/repositories/ContactRequestRepository.js";
import type { IContactRequest } from "../../database/models/ContactRequest.js";
import { sendNewContactRequestNotification } from "./email.service.js";

export async function createContactRequest(businessId: string, data: Partial<IContactRequest>): Promise<IContactRequest> {
  const cr = await contactRequestRepository.create({ ...data, businessId } as unknown as Partial<IContactRequest>);
  sendNewContactRequestNotification(data as any).catch(() => {});
  return cr;
}
export async function updateContactRequest(id: string, data: Partial<IContactRequest>): Promise<IContactRequest | null> {
  return contactRequestRepository.update(id, data);
}
export async function softDeleteContactRequest(id: string): Promise<IContactRequest | null> {
  return contactRequestRepository.softDelete(id);
}
