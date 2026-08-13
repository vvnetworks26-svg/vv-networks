import type { Request, Response } from "express";
import { ok, created, notFound, forbidden, serverError } from "../response.js";
import { getBid } from "../middleware.js";
import type { AuthRequest } from "../auth.middleware.js";
import { userRepository } from "../../../database/repositories/UserRepository.js";

export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await userRepository.findByBusiness(getBid(req));
    ok(res, users);
  } catch { serverError(res); }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user) { notFound(res, "User"); return; }
    ok(res, user);
  } catch { serverError(res); }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await userRepository.create({ ...req.body, businessId: getBid(req) });
    created(res, user);
  } catch { serverError(res); }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    // SECURITY: `role` is a privilege field, not a self-service profile field.
    // - Only owner/admin may change someone ELSE's role (authenticate() +
    //   authorize() on the route already guarantee the caller is one of those).
    // - Nobody may change their OWN role here, including owner/admin — that
    //   would let a compromised or careless admin session silently reassign
    //   its own privileges. A deliberate, separate action is required for that.
    // Non-role fields remain self-editable via PATCH /api/v1/profile.
    if (Object.prototype.hasOwnProperty.call(req.body, "role")) {
      const caller = (req as AuthRequest).user;
      if (caller.sub === req.params.id) {
        forbidden(res, "Cannot change your own role");
        return;
      }
      if (caller.role !== "owner" && caller.role !== "admin") {
        forbidden(res, "Only owner/admin may change another user's role");
        return;
      }
    }

    const user = await userRepository.update(req.params.id, req.body);
    if (!user) { notFound(res, "User"); return; }
    ok(res, user);
  } catch { serverError(res); }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await userRepository.softDelete(req.params.id);
    if (!user) { notFound(res, "User"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}
