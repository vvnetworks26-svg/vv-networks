import type { Response } from "express";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  fields?: Record<string, string[]>;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function ok<T>(res: Response, data: T, meta?: Record<string, unknown>): Response {
  return res.json({ success: true, data, ...(meta ? { meta } : {}) } satisfies ApiSuccess<T>);
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json({ success: true, data } satisfies ApiSuccess<T>);
}

export function paginated<T>(
  res: Response,
  data: T[],
  pagination: ApiPaginated<T>["pagination"]
): Response {
  return res.json({ success: true, data, pagination } satisfies ApiPaginated<T>);
}

export function notFound(res: Response, resource = "Resource"): Response {
  return res.status(404).json({ success: false, error: `${resource} not found` } satisfies ApiError);
}

export function badRequest(res: Response, error: string, fields?: Record<string, string[]>): Response {
  return res.status(400).json({ success: false, error, ...(fields ? { fields } : {}) } satisfies ApiError);
}

export function serverError(res: Response, message = "Internal server error"): Response {
  return res.status(500).json({ success: false, error: message } satisfies ApiError);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}
