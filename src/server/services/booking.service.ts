export interface Booking {
  id: string;
  name: string;
  email: string;
  company: string;
  date: string;
  time: string;
  notes: string;
  timestamp: string;
}

export interface CreateBookingDto {
  name: string;
  email: string;
  company?: string;
  date?: string;
  time?: string;
  notes?: string;
}

// In-memory store — replace with MongoDB in production via environment variable
const store: Booking[] = [];

export function createBooking(dto: CreateBookingDto): Booking {
  const booking: Booking = {
    id: `bk-${Date.now()}`,
    name: dto.name,
    email: dto.email,
    company: dto.company ?? "Not specified",
    date: dto.date ?? "TBD",
    time: dto.time ?? "TBD",
    notes: dto.notes ?? "",
    timestamp: new Date().toISOString(),
  };
  store.push(booking);
  return booking;
}

export function getAllBookings(): Booking[] {
  return store;
}
