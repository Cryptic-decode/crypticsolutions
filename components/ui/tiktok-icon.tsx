interface TikTokIconProps {
  className?: string;
}

export function TikTokIcon({ className }: TikTokIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 7.34a5.1 5.1 0 0 1-3.09-1.02 5.1 5.1 0 0 1-1.63-2.36H12.2v11.2a2.44 2.44 0 1 1-2.44-2.44c.24 0 .48.04.7.1v-2.7a5.17 5.17 0 0 0-.7-.05 5.14 5.14 0 1 0 5.14 5.14V10.1a7.7 7.7 0 0 0 4.66 1.53V8.98a4.97 4.97 0 0 1-1-.14z" />
    </svg>
  );
}
