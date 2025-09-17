import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: res.status });
    }
    const data = await res.json();

    const comments =
      data.items?.map(
        (item: any) => item.snippet.topLevelComment.snippet.textDisplay
      ) || [];

    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}