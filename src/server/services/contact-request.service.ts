import { contactRequestRepository } from "../../database/repositories/ContactRequestRepository.js";
import type { IContactRequest } from "../../database/models/ContactRequest.js";

export async function createContactRequest(businessId: string, data: Partial<IContactRequest>): Promise<IContactRequest> {
  return contactRequestRepository.create({ ...data, businessId } as unknown as Partial<IContactRequest>);
}
export async function updateContactRequest(id: string, data: Partial<IContactRequest>): Promise<IContactRequest | null> {
  return contactRequestRepository.update(id, data);
}
export async function softDeleteContactRequest(id: string): Promise<IContactRequest | null> {
  return contactRequestRepository.softDelete(id);
}
