export async function paginateAll<T>(
  fetcher: (page: number, size: number) => Promise<T[]>,
  size: number = 1000,
): Promise<T[]> {
  const results: T[] = [];
  let page = 0;
  while (true) {
    const batch = await fetcher(page, size);
    if (batch.length === 0) break;
    results.push(...batch);
    page++;
  }
  return results;
}
