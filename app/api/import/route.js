import { authenticate, apiError } from '../../../lib/server';
import { deckOutputSchema } from '../../../lib/validation';

export async function POST(request) {
  try {
    const {db}=await authenticate(request);
    const text=await request.text();
    if(text.length>150000)throw Object.assign(new Error('File impor terlalu besar.'),{status:413});
    const parsed=deckOutputSchema.safeParse(JSON.parse(text));
    if(!parsed.success)throw Object.assign(new Error('File flashcard tidak valid. Gunakan JSON hasil ekspor website ini.'),{status:400});
    const {data,error}=await db.rpc('import_deck',{p_title:parsed.data.title,p_cards:parsed.data.cards});
    if(error)throw error;
    return Response.json({id:data});
  }catch(error){return apiError(error instanceof SyntaxError ? Object.assign(new Error('File JSON tidak valid.'),{status:400}):error);}
}
