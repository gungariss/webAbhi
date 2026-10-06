import { z } from 'zod';

export function youtubeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    let id;
    if (url.hostname === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      id = url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/)?.[1];
    }
    return /^[\w-]{11}$/.test(id || '') ? `https://www.youtube.com/watch?v=${id}` : null;
  } catch { return null; }
}

export const cardSchema = z.object({
  question: z.string().trim().min(3).max(1000),
  answer: z.string().trim().min(1).max(3000),
  reference: z.string().max(200).default(''),
});
export const deckOutputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  cards: z.array(cardSchema).min(1).max(30),
});
export const generationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  sourceType: z.enum(['pdf', 'images', 'youtube']),
  language: z.enum(['id', 'en']),
  cardCount: z.union([z.literal(10), z.literal(20), z.literal(30)]),
  youtube: z.string().max(500).optional(),
  files: z.array(z.object({path: z.string().max(300), name: z.string().max(200), mime: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])})).max(10).default([]),
});

export const responseJsonSchema = {
  type: 'object', properties: {
    title: {type:'string'},
    cards: {type:'array', items: {type:'object', properties: {
      question:{type:'string'}, answer:{type:'string'}, reference:{type:'string'},
    }, required:['question','answer','reference']}},
  }, required:['title','cards'],
};
