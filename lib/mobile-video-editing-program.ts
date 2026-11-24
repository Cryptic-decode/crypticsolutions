export const MOBILE_VIDEO_EDITING_PLAYLIST_URL =
  "https://youtube.com/playlist?list=PLn5zXzLdT3OJY7-eAlMgr-eEaXTHGqemV";

export const MOBILE_VIDEO_EXPERIENCE_LEVELS = [
  "new",
  "beginner",
  "intermediate",
] as const;

export const mobileVideoExperienceLabels: Record<
  (typeof MOBILE_VIDEO_EXPERIENCE_LEVELS)[number],
  string
> = {
  new: "I am completely new",
  beginner: "I have tried basic edits",
  intermediate: "I edit and want to improve",
};
