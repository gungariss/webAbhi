import test from 'node:test';
import assert from 'node:assert/strict';
import { apiError } from '../lib/server.js';

test('application generation limit returns HTTP 429 with the six-hour explanation',async()=>{
  const message='Batas generate tercapai: maksimal 10 permintaan dalam 6 jam terakhir. Coba lagi setelah permintaan terlama melewati 6 jam.';
  const response=apiError(new Error(message));
  assert.equal(response.status,429);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.deepEqual(await response.json(),{error:message});
});

test('provider quota errors retain the provider quota response',async()=>{
  const response=apiError(new Error('RESOURCE_EXHAUSTED'));
  assert.equal(response.status,429);
  assert.match((await response.json()).error,/Kuota generate sementara habis/);
});
