import "server-only";

import { Resend } from "resend";

const DEVELOPMENT_FROM_EMAIL = "Cryptic Solutions <onboarding@resend.dev>";
const DEFAULT_REPLY_TO_EMAIL = "info@crypticsolutionsltd.com";

export interface EmailDeliveryResult {
  sent: boolean;
  id?: string;
  error?: string;
}

interface TransactionalEmail {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export async function sendTransactionalEmail({
  to,
  subject,
  text,
  html,
}: TransactionalEmail): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey) {
    return { sent: false, error: "The email service is not configured." };
  }

  if (!configuredFrom && process.env.NODE_ENV === "production") {
    return { sent: false, error: "The production sender address is not configured." };
  }

  try {
    const resend = new Resend(apiKey);
    const content = html ? { html, text } : { text: text || "" };
    const { data, error } = await resend.emails.send({
      from: configuredFrom || DEVELOPMENT_FROM_EMAIL,
      to,
      subject,
      replyTo: process.env.RESEND_REPLY_TO_EMAIL?.trim() || DEFAULT_REPLY_TO_EMAIL,
      ...content,
    });

    if (error) {
      console.error("Transactional email error:", error);
      return { sent: false, error: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (error) {
    console.error("Transactional email error:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "The email could not be sent.",
    };
  }
}
