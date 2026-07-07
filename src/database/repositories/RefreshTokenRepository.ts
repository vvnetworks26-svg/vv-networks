import { RefreshToken, IRefreshToken } from "../models/RefreshToken.js";
import { BaseRepository } from "./BaseRepository.js";

export class RefreshTokenRepository extends BaseRepository<IRefreshToken> {
  constructor() { super(RefreshToken); }

  async findValidByHash(tokenHash: string): Promise<IRefreshToken | null> {
    return this.model.findOne({ tokenHash, isRevoked: false, expiresAt: { $gt: new Date() } }).exec();
  }

  async revokeFamily(family: string): Promise<void> {
    await this.model.updateMany({ family }, { isRevoked: true }).exec();
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.model.updateMany({ userId, isRevoked: false }, { isRevoked: true }).exec();
  }

  async revokeByHash(tokenHash: string): Promise<void> {
    await this.model.updateOne({ tokenHash }, { isRevoked: true }).exec();
  }

  async existsByFamily(family: string): Promise<boolean> {
    return this.exists({ family });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
