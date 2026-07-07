import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import { conversationRepository } from "../../../database/repositories/ConversationRepository.js";
import { messageRepository } from "../../../database/repositories/MessageRepository.js";
import {
  createConversation, updateConversation,
  softDeleteConversation, addMessage, getConversationStats,
} from "../../services/conversation.service.js";
import { paginationSchema, buildSortObj } from "../pagination.js";

export async function listConversations(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20, sort = "createdAt", order = "desc" } = req.query as any;
    const result = await conversationRepository.paginate(
      { businessId: getBid(req), deletedAt: null },
      { page: +page, limit: +limit, sort: buildSortObj(sort, order) }
    );
    paginated(res, result.data, { page: result.page, limit: +limit, total: result.total, totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev });
  } catch { serverError(res); }
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  try {
    const conv = await conversationRepository.findById(req.params.id);
    if (!conv) { notFound(res, "Conversation"); return; }
    ok(res, conv);
  } catch { serverError(res); }
}

export async function createConversationHandler(req: Request, res: Response): Promise<void> {
  try {
    const conv = await createConversation(getBid(req), req.body);
    created(res, conv);
  } catch { serverError(res); }
}

export async function updateConversationHandler(req: Request, res: Response): Promise<void> {
  try {
    const conv = await updateConversation(req.params.id, req.body);
    if (!conv) { notFound(res, "Conversation"); return; }
    ok(res, conv);
  } catch { serverError(res); }
}

export async function deleteConversationHandler(req: Request, res: Response): Promise<void> {
  try {
    const conv = await softDeleteConversation(req.params.id);
    if (!conv) { notFound(res, "Conversation"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}

export async function listMessages(req: Request, res: Response): Promise<void> {
  try {
    const msgs = await messageRepository.findByConversation(req.params.id);
    ok(res, msgs);
  } catch { serverError(res); }
}

export async function createMessageHandler(req: Request, res: Response): Promise<void> {
  try {
    const msg = await addMessage(req.params.id, getBid(req), req.body);
    created(res, msg);
  } catch { serverError(res); }
}

export async function getConversationStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getConversationStats(getBid(req));
    ok(res, stats);
  } catch { serverError(res); }
}
