import { PasswordResetToken, IPasswordResetToken } from "../models/PasswordResetToken.js";
import { BaseRepository } from "./BaseRepository.js";

export class PasswordResetTokenRepository extends BaseRepository<IPasswordResetToken> {
  constructor() { super(PasswordResetToken); }

  async findValid(tokenHash: string): Promise<IPasswordResetToken | null> {
    return this.model.findOne({ tokenHash, isUsed: false, expiresAt: { $gt: new Date() } }).exec();
  }

  async markUsed(id: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { isUsed: true }).exec();
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.model.updateMany({ userId, isUsed: false }, { isUsed: true }).exec();
  }
}

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
