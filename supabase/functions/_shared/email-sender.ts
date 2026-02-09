/**
 * Shared email sender using Resend.
 * Import from "_shared/email-sender.ts" in any edge function.
 */
import { Resend } from "npm:resend@2.0.0";
import { BRAND, getEmailTemplate, type EmailType, type EmailData } from "./email-templates.ts";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[EMAIL-SENDER] ${step}${detailsStr}`);
};

export interface SendEmailParams {
  to: string;
  type: EmailType;
  data: EmailData;
}

export async function sendEmail({ to, type, data }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    logStep("ERROR", { message: "RESEND_API_KEY is not configured" });
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { subject, html } = getEmailTemplate(type, data);

    logStep("Sending email", { to, type, subject });

    const response = await resend.emails.send({
      from: BRAND.from,
      to: [to],
      subject,
      html,
    });

    logStep("Email sent successfully", { to, type, id: response?.data?.id });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR sending email", { to, type, message });
    return { success: false, error: message };
  }
}

export { type EmailType, type EmailData };
