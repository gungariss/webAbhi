import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesMime } from '../lib/mime.js';

test('does not trust MIME labels on uploaded material',()=>{
  assert.equal(matchesMime(Buffer.from('%PDF-1.7\n'),'application/pdf'),true);
  assert.equal(matchesMime(Buffer.from('<html>not a pdf</html>'),'application/pdf'),false);
  assert.equal(matchesMime(Buffer.from([255,216,255,224]),'image/jpeg'),true);
  assert.equal(matchesMime(Buffer.from([137,80,78,71,13,10,26,10]),'image/png'),true);
  assert.equal(matchesMime(Buffer.from('RIFF0000WEBP'),'image/webp'),true);
  assert.equal(matchesMime(Buffer.from('RIFF0000WAVE'),'image/webp'),false);
});
