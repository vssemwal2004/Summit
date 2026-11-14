export type Interest = "residential" | "commercial" | "general";

export type Enquiry = {
  name: string;
  phone: string;
  email: string;
  interest: Interest;
  message: string;
  consent: boolean;
};

export type SubmitResult = { ok: true; demo: boolean } | { ok: false; error: string };

/**
 * NOT CONNECTED TO A BACKEND.
 * No data leaves the browser. Replace the body with a call to an API route,
 * CRM or email service (keep any API keys server-side, never in client code).
 */
export async function submitEnquiry(_data: Enquiry): Promise<SubmitResult> {
  await new Promise((r) => setTimeout(r, 700));
  return { ok: true, demo: true };
}
