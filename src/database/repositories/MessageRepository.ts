import { Message, IMessage } from "../models/Message.js";
import { BaseRepository } from "./BaseRepository.js";

export class MessageRepository extends BaseRepository<IMessage> {
  constructor() { super(Message); }

  async findByConversation(conversationId: string): Promise<IMessage[]> {
    return this.model.find({ conversationId }).sort({ createdAt: 1 }).exec();
  }

  async countByConversation(conversationId: string): Promise<number> {
    return this.model.countDocuments({ conversationId }).exec();
  }
}

export const messageRepository = new MessageRepository();
