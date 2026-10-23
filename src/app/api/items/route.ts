import { cardsByIds, mcqsByIds, storiesByIds } from "@/lib/store";

// Lets client-side pages (revision, saved, past results) fetch the content behind ids kept in the browser.
const ids = (v: string | null) => (v ? v.split(",").filter(Boolean).slice(0, 200) : []);

export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  return Response.json({
    stories: storiesByIds(ids(q.get("stories"))),
    mcqs: mcqsByIds(ids(q.get("mcqs"))),
    cards: cardsByIds(ids(q.get("cards"))),
  });
}
