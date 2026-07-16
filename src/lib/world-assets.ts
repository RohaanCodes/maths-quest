const WORLD_IMAGES: Record<string, string> = {
  'world-5-oa-operations-and-algebraic-thinking':
    '/worlds/5-oa.webp',

  'world-5-nbt-number-and-operations-in-base-ten':
    '/worlds/5-nbt.webp',

  'world-5-nf-number-and-operations-fractions':
    '/worlds/5-nf.webp',

  'world-5-md-measurement-and-data':
    '/worlds/5-md.webp',

  'world-5-g-geometry':
    '/worlds/5-g.webp',

  'world-6-rp-ratios-and-proportional-relationships':
    '/worlds/6-rp.webp',

  'world-6-ns-the-number-system':
    '/worlds/6-ns.webp',

  'world-6-ee-expressions-and-equations':
    '/worlds/6-ee.webp',

  'world-6-g-geometry':
    '/worlds/6-g.webp',

  'world-6-sp-statistics-and-probability':
    '/worlds/6-sp.webp',
};

export function getWorldImage(
  worldId: string,
): string {
  return (
    WORLD_IMAGES[worldId] ||
    '/worlds/default.webp'
  );
}