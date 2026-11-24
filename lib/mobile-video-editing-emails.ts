import "server-only";

import { renderBrandedEmail } from "@/lib/branded-email";
import { sendTransactionalEmail } from "@/lib/email";
import {
  MOBILE_VIDEO_EDITING_ASSESSMENT_URL,
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
    "Welcome to the Cryptic Solutions Mobile Video Editing Programme. You are officially registered.",
    "Start with the tutorial playlist and complete the lessons at your own pace. Practise as you learn, then use the assessment brief when you are ready to create your final project.",
    "",
    `Tutorial playlist: ${MOBILE_VIDEO_EDITING_PLAYLIST_URL}`,
    `Assessment brief: ${MOBILE_VIDEO_EDITING_ASSESSMENT_URL}`,
    "",
    "The assessment brief contains the project requirements, submission process, and grading criteria.",
    "When your project meets the assessment standard, you will receive a certificate of completion.",
    "",
    "Cryptic Solutions",
  ].join("\n");

  return sendTransactionalEmail({
    to: email,
    subject: "Welcome to the Mobile Video Editing Programme",
    text,
    html: renderBrandedEmail({
      preview: "Your first lesson is ready. Save the assessment brief for later.",
      eyebrow: "Registration confirmed",
      heading: "You're in. Let's make your first edit.",
      greeting: fullName,
      paragraphs: [
        "Welcome to the Cryptic Solutions Mobile Video Editing Programme. We are glad to have you with us.",
        "You can learn at your own pace with the phone you already have. Here is the simplest way to begin:",
      ],
      steps: [
        {
          title: "Watch",
          description: "Open the tutorial playlist and begin with the first lesson.",
        },
        {
          title: "Practise",
          description: "Try each technique in CapCut as you move through the lessons.",
        },
        {
          title: "Create",
          description: "When you are ready, use the assessment brief to complete and submit your final project.",
        },
      ],
      callout:
        "Keep the assessment brief for later. It contains the full project requirements, submission instructions, and grading criteria.",
      action: {
        label: "Start your first lesson",
        href: MOBILE_VIDEO_EDITING_PLAYLIST_URL,
      },
      secondaryAction: {
        label: "View the assessment brief",
        href: MOBILE_VIDEO_EDITING_ASSESSMENT_URL,
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
