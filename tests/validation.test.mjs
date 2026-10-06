import test from 'node:test';
import assert from 'node:assert/strict';
import { youtubeUrl, deckOutputSchema, generationSchema } from '../lib/validation.js';

test('accepts and canonicalizes supported YouTube URLs',()=>{
  for(const url of ['https://youtu.be/abcdefghijk?t=2','https://www.youtube.com/watch?v=abcdefghijk','https://youtube.com/shorts/abcdefghijk'])assert.equal(youtubeUrl(url),'https://www.youtube.com/watch?v=abcdefghijk');
});
test('rejects unsupported hosts, protocols, playlists and malformed video IDs',()=>{
  for(const url of ['https://youtube.com.evil.com/watch?v=abcdefghijk','http://youtube.com/watch?v=abcdefghijk','javascript:alert(1)','https://youtube.com/playlist?list=abc','https://youtu.be/nope','not a url'])assert.equal(youtubeUrl(url),null);
});
test('rejects empty/oversized AI output and preserves valid content',()=>{
  assert.equal(deckOutputSchema.safeParse({title:'Test',cards:[]}).success,false);
  assert.equal(deckOutputSchema.safeParse({title:'Test',cards:Array(31).fill({question:'Question?',answer:'Answer'})}).success,false);
  assert.equal(deckOutputSchema.safeParse({title:'Test',cards:[{question:'Q',answer:''}]}).success,false);
  const parsed=deckOutputSchema.parse({title:' Test ',cards:[{question:' Question? ',answer:' Answer '}],extra:'discard'});
  assert.deepEqual(parsed,{title:'Test',cards:[{question:'Question?',answer:'Answer',reference:''}]});
});
test('enforces image count, supported settings and valid IDs on backend inputs',()=>{
  const valid={id:'8b6c69f7-bc1f-4cf6-8f69-e5bc3e98b3db',title:'Topic',sourceType:'images',language:'id',cardCount:20,files:[{path:'owner/deck/file.jpg',name:'a.jpg',mime:'image/jpeg'}]};
  assert.equal(generationSchema.safeParse(valid).success,true);
  assert.equal(generationSchema.safeParse({...valid,files:Array(11).fill(valid.files[0])}).success,false);
  assert.equal(generationSchema.safeParse({...valid,cardCount:100}).success,false);
  assert.equal(generationSchema.safeParse({...valid,id:'not-id'}).success,false);
});
