import type { Request, Response } from "express";
import { ok, created, notFound, serverError } from "../response.js";
import { getBid } from "../middleware.js";
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
