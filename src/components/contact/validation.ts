import type { ContactFormData } from "./contactData";

export interface FieldError {
  message: string;
}

export type FormErrors = Partial<Record<keyof ContactFormData, FieldError>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-().]{7,20}$/;

export function validateField(
  field: keyof ContactFormData,
  value: ContactFormData[keyof ContactFormData]
): FieldError | null {
  const str = typeof value === "string" ? value.trim() : "";

  switch (field) {
    case "name":
      if (!str) return { message: "Your name is required." };
      if (str.length < 2) return { message: "Name must be at least 2 characters." };
      return null;

    case "email":
      if (!str) return { message: "A business email is required." };
      if (!EMAIL_RE.test(str)) return { message: "Enter a valid email address." };
      return null;

    case "phone":
      if (str && !PHONE_RE.test(str)) return { message: "Enter a valid phone number." };
      return null;

    case "projectType":
      if (!str) return { message: "Please select a project type." };
      return null;

    case "message":
      if (!str) return { message: "Tell us a little about your project." };
      if (str.length < 20) return { message: "Please add a bit more detail (20+ characters)." };
      return null;

    default:
      return null;
  }
}

export function validateForm(data: ContactFormData): FormErrors {
  const fields: Array<keyof ContactFormData> = ["name", "email", "phone", "projectType", "message"];
  const errors: FormErrors = {};
  for (const field of fields) {
    const err = validateField(field, data[field]);
    if (err) errors[field] = err;
  }
  return errors;
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}
