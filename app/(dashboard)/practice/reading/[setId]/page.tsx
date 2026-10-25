import { ReadingPracticePlayer } from "@/components/practice/reading-practice-player";

export default async function ReadingPracticeSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  return <ReadingPracticePlayer setId={setId} />;
}
