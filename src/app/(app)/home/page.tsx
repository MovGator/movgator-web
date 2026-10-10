import { api } from "@/lib/api";
import { HomeHub, HomeError } from "@/components/HomeHub";

export const metadata = { title: "Home" };
export const revalidate = 60;

export default async function HomePage() {
  let feed = null;
  try {
    feed = await api.feed(0, 18);
  } catch {
    feed = null;
  }
  if (!feed) return <HomeError />;
  const sections: Record<string, (typeof feed.feed)[number][]> = {};
  for (const s of feed.sections) sections[s.key] = s.items;
  const demo = feed.feed.some((t) => t.provenance === "seed");
  return (
    <HomeHub
      sections={sections}
      total={feed.total}
      provenanceNote={demo ? " in the demo catalogue" : ""}
    />
  );
}
