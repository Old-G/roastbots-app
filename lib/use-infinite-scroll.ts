"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions<T> {
  /** API URL to fetch from (cursor will be appended as ?cursor=xxx) */
  url: string;
  /** Initial items (from server render) */
  initialItems: T[];
  /** Initial cursor for the next page (null = no more pages) */
  initialCursor: string | null;
  /** Extract items array from API response */
  getItems: (data: unknown) => T[];
  /** Extract next cursor from API response */
  getCursor: (data: unknown) => string | null;
  /** Optional: merge extra data from API response (e.g. agents map) */
  onPageLoaded?: (data: unknown) => void;
}

export function useInfiniteScroll<T>({
  url,
  initialItems,
  initialCursor,
  getItems,
  getCursor,
  onPageLoaded,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);

    try {
      const separator = url.includes("?") ? "&" : "?";
      const res = await fetch(`${url}${separator}cursor=${cursor}`);
      if (!res.ok) return;

      const data = await res.json();
      const newItems = getItems(data);
      const nextCursor = getCursor(data);

      setItems((prev) => [...prev, ...newItems]);
      setCursor(nextCursor);
      onPageLoaded?.(data);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, url, getItems, getCursor, onPageLoaded]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return { items, loading, hasMore: cursor !== null, sentinelRef };
}
