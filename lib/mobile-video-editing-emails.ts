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
    "Welcome to the Cryptic Solutions Mobile Video Editing Programme. Your registration is confirmed.",
    "Start with the free tutorial playlist and complete the lessons at your own pace.",
    "",
    `Tutorial playlist: ${MOBILE_VIDEO_EDITING_PLAYLIST_URL}`,
    `Assessment brief: ${MOBILE_VIDEO_EDITING_ASSESSMENT_URL}`,
    "",
    "After the tutorials, create a 45 to 90-second movie trailer or music-video-style edit on your phone.",
    "Upload your finished video to Google Drive, change General access to Anyone with the link, then reply to this email with the public link for grading.",
    "We will review your work and issue a certificate of completion when it meets the assessment standard.",
    "",
    "Cryptic Solutions",
  ].join("\n");

  return sendTransactionalEmail({
    to: email,
    subject: "Welcome to the Mobile Video Editing Programme",
    text,
    html: renderBrandedEmail({
      preview: "Your tutorials and practical assessment brief are ready.",
      eyebrow: "Welcome to the programme",
      heading: "Your first lesson is ready",
      greeting: fullName,
      paragraphs: [
        "You are officially registered for the Cryptic Solutions Mobile Video Editing Programme.",
        "Start with the free tutorial playlist and complete the lessons at your own pace. When you finish, use the assessment brief to create your final project.",
      ],
      details: [
        {
          label: "Start here",
          value: "Watch the free tutorial playlist",
          href: MOBILE_VIDEO_EDITING_PLAYLIST_URL,
        },
        {
          label: "Your final project",
          value: "Create a 45 to 90-second movie trailer or music video",
        },
        {
          label: "Assessment brief",
          value: "View the full task and grading criteria",
          href: MOBILE_VIDEO_EDITING_ASSESSMENT_URL,
        },
        {
          label: "Submit for grading",
          value: "Upload to Google Drive and reply with the public link",
        },
      ],
      callout:
        "When your video is ready, upload it to Google Drive. Under General access, select Anyone with the link, then reply to this email with the link. We will review your work and email your result.",
      action: {
        label: "Start the tutorial playlist",
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
