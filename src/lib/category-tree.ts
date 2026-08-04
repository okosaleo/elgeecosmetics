type CategoryNode = { id: string; name: string; parentId: string | null };

export function flattenCategoryTree(
  categories: CategoryNode[],
  excludeId?: string
): { id: string; name: string; depth: number }[] {
  // Figure out which ids to exclude: the node itself + all descendants,
  // so a category can never become its own ancestor.
  const excluded = new Set<string>();
  if (excludeId) {
    excluded.add(excludeId);
    let added = true;
    while (added) {
      added = false;
      for (const c of categories) {
        if (c.parentId && excluded.has(c.parentId) && !excluded.has(c.id)) {
          excluded.add(c.id);
          added = true;
        }
      }
    }
  }

  const byParent = new Map<string | null, CategoryNode[]>();
  for (const c of categories) {
    if (excluded.has(c.id)) continue;
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }

  const result: { id: string; name: string; depth: number }[] = [];
  function walk(parentId: string | null, depth: number) {
    const children = (byParent.get(parentId) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const child of children) {
      result.push({ id: child.id, name: child.name, depth });
      walk(child.id, depth + 1);
    }
  }
  walk(null, 0);
  return result;
}