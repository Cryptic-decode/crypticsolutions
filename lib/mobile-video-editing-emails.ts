import "server-only";

import { renderBrandedEmail } from "@/lib/branded-email";
import { sendTransactionalEmail } from "@/lib/email";
import {
  MOBILE_VIDEO_EDITING_PLAYLIST_URL,
  mobileVideoExperienceLabels,
} from "@/lib/mobile-video-editing-program";

interface StudentRegistrationEmail {
  fullName: string;
  email: string;
}

interface AdminRegistrationEmail extends StudentRegistrationEmail {
  phone?: string;
  experienceLevel: keyof typeof mobileVideoExperienceLabels;
  learningGoal?: string;
}

export function sendMobileVideoRegistrationWelcome({
  fullName,
  email,
}: StudentRegistrationEmail) {
  const text = [
    `Hello ${fullName},`,
    "",
    "Your registration for the Cryptic Solutions Mobile Video Editing Programme is confirmed.",
    "Start with our free tutorial playlist and complete the lessons at your own pace. You only need your smartphone, CapCut, and a willingness to practise.",
    "",
    `Start the free tutorial: ${MOBILE_VIDEO_EDITING_PLAYLIST_URL}`,
    "",
    "After the lessons, you will complete a practical 45 to 90-second editing assessment. Students whose work meets the assessment standard receive a certificate of completion.",
    "",
    "Cryptic Solutions",
  ].join("\n");

  return sendTransactionalEmail({
    to: email,
    subject: "Your Mobile Video Editing learning journey starts here",
    text,
    html: renderBrandedEmail({
      preview: "Your free Mobile Video Editing tutorial is ready.",
      eyebrow: "Registration confirmed",
      heading: "Start learning with the phone you already have",
      greeting: fullName,
      paragraphs: [
        "Your registration for the Cryptic Solutions Mobile Video Editing Programme is confirmed.",
        "Start with our free tutorial playlist and complete the lessons at your own pace. You only need your smartphone, CapCut, and a willingness to practise.",
      ],
      details: [
        { label: "Learning format", value: "Free self-paced video tutorials" },
        { label: "What you need", value: "A smartphone and CapCut" },
        { label: "Practical assessment", value: "A 45 to 90-second mobile edit" },
      ],
      callout:
        "After the lessons, complete the practical assessment. Students whose work meets the assessment standard receive a certificate of completion.",
      action: {
        label: "Start the free tutorial",
        href: MOBILE_VIDEO_EDITING_PLAYLIST_URL,
      },
      disclaimer:
        "You received this email because you registered for the Cryptic Solutions Mobile Video Editing Programme.",
    }),
  });
}

export function sendMobileVideoRegistrationAdminNotification({
  to,
  fullName,
  email,
  phone,
  experienceLevel,
  learningGoal,
}: AdminRegistrationEmail & { to: string }) {
  const text = [
    "A new student registered for the Mobile Video Editing Programme.",
    "",
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Experience: ${mobileVideoExperienceLabels[experienceLevel]}`,
    `Learning goal: ${learningGoal || "Not provided"}`,
  ].join("\n");

  return sendTransactionalEmail({
    to,
    subject: `New Mobile Video Editing registration from ${fullName}`,
    text,
    html: renderBrandedEmail({
      preview: `${fullName} registered for the Mobile Video Editing Programme.`,
      eyebrow: "New programme registration",
      heading: "A new learner is ready to begin",
      greeting: "Cryptic team",
      paragraphs: [
        `${fullName} has registered for the Mobile Video Editing Programme.`,
      ],
      details: [
        { label: "Student", value: fullName },
        { label: "Email", value: email, href: `mailto:${email}` },
        { label: "Phone or WhatsApp", value: phone || "Not provided" },
        {
          label: "Current experience",
          value: mobileVideoExperienceLabels[experienceLevel],
        },
        { label: "Learning goal", value: learningGoal || "Not provided" },
      ],
      disclaimer: "This is an internal Cryptic Solutions programme notification.",
    }),
  });
}
