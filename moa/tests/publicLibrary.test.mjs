import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPublicLibrary, emptyLibrary, importBrowserLibrary } from '../src/publicLibrary.ts';
import { readLibrary, STORAGE_KEY } from '../src/data.ts';
const url = 'https://example.supabase.co';
const library = () => ({ ...emptyLibrary(), items: [{ id: 'one', title: '메모', note: '', tags: [], links: [], categoryId: 'other', favorite: false, createdAt: '2026-10-13T00:00:00Z' }] });
test('public read uses shared row and publishable API key without login', async () => {
  const client = createPublicLibrary(url, 'sb_publishable_test', async (input, init) => {
    assert.match(input, /moa_public_test_library\?id=eq.shared&select=data/);
    assert.equal(init.headers.apikey, 'sb_publishable_test');
    assert.equal(init.headers.Authorization, undefined);
    return Response.json([{ data: library() }]);
  });
  assert.deepEqual(await client.read(), library());
});
test('missing row is distinct from invalid data and request failures', async () => {
  assert.equal(await createPublicLibrary(url, 'key', async () => Response.json([])).read(), null);
  await assert.rejects(createPublicLibrary(url, 'key', async () => Response.json([{ data: {} }])).read());
  await assert.rejects(createPublicLibrary(url, 'key', async () => new Response('', { status: 403 })).read(), /403/);
});
test('save inserts only shared row, then compares prior data before updating', async () => {
  for (const previous of [null, emptyLibrary()]) {
    await createPublicLibrary(url, 'key', async (input, init) => {
      assert.equal(init.method, previous ? 'PATCH' : 'POST');
      assert.deepEqual(JSON.parse(init.body), previous ? { data: library() } : { id: 'shared', data: library() });
      if (previous) assert.equal(new URL(input).searchParams.get('data'), `eq.${JSON.stringify(previous)}`);
      return Response.json([{ data: library() }]);
    }).save(library(), previous);
  }
});
test('concurrent update or RLS no-op is reported as unsaved', async () => {
  await assert.rejects(createPublicLibrary(url, 'key', async () => Response.json([])).save(library(), emptyLibrary()), /다른 사용자/);
});
test('browser import retains conflicting cards and is idempotent', () => {
  const remote = library();
  const local = library(); local.items[0].note = '기존 브라우저 메모';
  const merged = importBrowserLibrary(remote, local);
  assert.equal(merged.items.length, 2);
  assert.equal(new Set(merged.items.map(i => i.id)).size, 2);
  assert.deepEqual(importBrowserLibrary(merged, local), merged);
  assert.equal(remote.items.length, 1);
});
test('legacy browser data is read without altering original storage', () => {
  const values = new Map([['moa-bookmarks-v1', JSON.stringify([{ ...library().items[0], category: '기타', url: 'https://example.com', links: undefined }])]]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null };
  const before = [...values];
  assert.equal(readLibrary().library.items[0].links.length, 1);
  assert.deepEqual([...values], before);
  values.set(STORAGE_KEY, '{broken');
  assert.equal(readLibrary().failed, true);
  assert.equal(values.get(STORAGE_KEY), '{broken');
});
test('already imported cards are recognized after JSONB reorders object keys', () => {
  const local = library();
  const remote = library();
  remote.items[0] = Object.fromEntries(Object.entries(remote.items[0]).reverse());
  remote.items[0].id = 'imported';
  const merged = importBrowserLibrary(remote, local);
  assert.equal(merged.items.length, remote.items.length);
  assert.equal(merged.categories.length, remote.categories.length);
});
