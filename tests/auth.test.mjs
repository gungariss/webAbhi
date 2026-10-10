import test from 'node:test';
import assert from 'node:assert/strict';
import { friendlyError } from '../lib/supabase.js';

test('email delivery quota is distinguished from auth request throttling', () => {
  const emailQuota = friendlyError({code:'over_email_send_rate_limit',status:429,message:'Email rate limit exceeded'});
  assert.match(emailQuota,/email konfirmasi/);
  assert.match(emailQuota,/pengelola/);
  const requestLimit = friendlyError({code:'over_request_rate_limit',status:429,message:'Request rate limit reached'});
  assert.match(requestLimit,/percobaan masuk atau daftar/);
  assert.doesNotMatch(requestLimit,/pengelola/);
});

test('legacy email quota errors and unknown HTTP 429 responses are recognized', () => {
  assert.match(friendlyError({message:'email rate limit exceeded'}),/email konfirmasi/);
  assert.match(friendlyError({status:429,message:'Unexpected response'}),/Terlalu banyak percobaan/);
});

test('login failures keep actionable messages', () => {
  assert.match(friendlyError({message:'Invalid login credentials'}),/Email atau kata sandi/);
  assert.match(friendlyError({message:'Email not confirmed'}),/Konfirmasi email/);
  assert.match(friendlyError({message:'Failed to fetch'}),/Koneksi gagal/);
});
