"use client";

import { useState } from "react";

export default function YouTubeCommentsFetcher() {
  const [videoId, setVideoId] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  const fetchComments = async () => {
    const res = await fetch(`/api/youtube-comments?videoId=${videoId}`);
    const data = await res.json();
    setComments(data.comments || []);
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        placeholder="Enter YouTube Video ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        onClick={fetchComments}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Fetch Comments
      </button>

      <ul className="list-disc pl-5">
        {comments.map((c, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: c }} />
        ))}
      </ul>
    </div>
  );
}
