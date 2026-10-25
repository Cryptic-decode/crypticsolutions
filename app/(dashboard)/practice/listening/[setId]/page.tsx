import { ListeningPracticePlayer } from "@/components/practice/listening-practice-player";

export default async function ListeningPracticeSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  return <ListeningPracticePlayer setId={setId} />;
}
