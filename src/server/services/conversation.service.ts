import { conversationRepository } from "../../database/repositories/ConversationRepository.js";
import { messageRepository } from "../../database/repositories/MessageRepository.js";
import type { IConversation } from "../../database/models/Conversation.js";

export async function getConversationStats(businessId: string) {
  const [statusStats, totals] = await Promise.all([
    conversationRepository.getCompletionStats(businessId),
    conversationRepository.aggregate<{ total: number; avgMessages: number }>([
      { $match: { businessId, deletedAt: null } },
      { $group: { _id: null, total: { $sum: 1 }, avgMessages: { $avg: "$messageCount" } } },
    ]),
  ]);
  return {
    byStatus: statusStats,
    total: totals[0]?.total ?? 0,
    averageMessages: Math.round(totals[0]?.avgMessages ?? 0),
  };
}

export async function createConversation(businessId: string, data: Partial<IConversation>): Promise<IConversation> {
  return conversationRepository.create({ ...data, businessId } as unknown as Partial<IConversation>);
}

export async function updateConversation(id: string, data: Partial<IConversation>): Promise<IConversation | null> {
  return conversationRepository.update(id, data);
}

export async function softDeleteConversation(id: string): Promise<IConversation | null> {
  return conversationRepository.softDelete(id);
}

export async function addMessage(conversationId: string, businessId: string, data: { role: "user" | "assistant" | "system"; content: string; tokens?: number }) {
  const [message] = await Promise.all([
    messageRepository.create({ conversationId, businessId, ...data } as any),
    conversationRepository.update(conversationId, { $inc: { messageCount: 1 } } as any),
  ]);
  return message;
}
