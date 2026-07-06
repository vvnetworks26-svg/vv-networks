import { Conversation, IConversation } from "../models/Conversation.js";
import { BaseRepository } from "./BaseRepository.js";

export class ConversationRepository extends BaseRepository<IConversation> {
  constructor() { super(Conversation); }

  async findByLead(leadId: string): Promise<IConversation[]> {
    return this.model.find({ leadId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findActiveByBusiness(businessId: string): Promise<IConversation[]> {
    return this.model.find({ businessId, status: "active", deletedAt: null }).exec();
  }

  async getCompletionStats(businessId: string): Promise<{ status: string; count: number }[]> {
    return this.aggregate([
      { $match: { businessId, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);
  }
}

export const conversationRepository = new ConversationRepository();
