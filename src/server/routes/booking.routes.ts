import { Router, Request, Response } from "express";
import { createBooking, CreateBookingDto } from "../services/booking.service.js";
import { withBusiness, getBid } from "../api/middleware.js";

const router = Router();

router.post("/", withBusiness, async (req: Request, res: Response) => {
  const { name, email, company, date, time, notes } = req.body as CreateBookingDto;

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "name is required" });
    return;
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "a valid email is required" });
    return;
  }

  try {
    const booking = await createBooking(getBid(req), {
      name: name.trim(), email: email.trim(), company, date, time, notes,
    });
    res.status(201).json({ success: true, booking });
  } catch {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// NOTE: there is intentionally no public GET here. The previous version
// exposed every booker's name/email/company/notes to any unauthenticated
// caller — a real PII leak. The frontend now tracks the visitor's own
// booking locally instead of polling a global endpoint (see App.tsx).

export default router;
