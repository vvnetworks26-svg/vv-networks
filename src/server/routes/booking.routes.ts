import { Router, Request, Response } from "express";
import { createBooking, getAllBookings, CreateBookingDto } from "../services/booking.service.js";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { name, email, company, date, time, notes } = req.body as CreateBookingDto;

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "name is required" });
    return;
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "a valid email is required" });
    return;
  }

  const booking = createBooking({ name: name.trim(), email: email.trim(), company, date, time, notes });
  res.status(201).json({ success: true, booking });
});

router.get("/", (_req: Request, res: Response) => {
  res.json(getAllBookings());
});

export default router;
