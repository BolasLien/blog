interface PostLike {
  id: string;
  data: { date: Date; tags: string[] };
}

export function getAllTags(posts: PostLike[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag));
}

export function getPostsByTag<T extends PostLike>(posts: T[], tag: string): T[] {
  return posts
    .filter((p) => p.data.tags.includes(tag))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
