import { defaultCategories, isLibrary, type Library } from './data.ts';

export const TABLE = 'moa_public_test_library';
export const emptyLibrary = (): Library => ({ version: 3, categories: defaultCategories.map(category => ({ ...category })), items: [] });

export function createPublicLibrary(url: string, key: string, request: typeof fetch = fetch) {
  if (!url || !key) throw new Error('공용 보관함 연결 설정이 없습니다. 배포 환경 변수를 확인해주세요.');
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${TABLE}`;
  const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  async function call(query: string, init: RequestInit = {}) {
    const response = await request(`${endpoint}?${query}`, { ...init, headers, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`공용 보관함 요청 실패 (${response.status}). 연결 및 테이블 접근 권한을 확인해주세요.`);
    return response.json();
  }
  return {
    async read(): Promise<Library | null> {
      const rows = await call('id=eq.shared&select=data');
      if (!Array.isArray(rows)) throw new Error('잘못된 공용 보관함 응답입니다.');
      if (!rows.length) return null;
      if (!isLibrary(rows[0].data)) throw new Error('공용 보관함 데이터 형식을 확인해주세요. 기존 데이터는 변경하지 않았습니다.');
      return rows[0].data;
    },
    async save(next: Library, previous: Library | null): Promise<void> {
      if (!isLibrary(next)) throw new Error('저장할 데이터 형식이 올바르지 않습니다.');
      // Compare the complete jsonb value so concurrent edits cannot silently overwrite each other.
      const query = previous === null ? '' : `id=eq.shared&data=eq.${encodeURIComponent(JSON.stringify(previous))}`;
      const rows = await call(query, {
        method: previous === null ? 'POST' : 'PATCH',
        body: JSON.stringify(previous === null ? { id: 'shared', data: next } : { data: next }),
      });
      if (!Array.isArray(rows) || rows.length !== 1 || !isLibrary(rows[0].data))
        throw new Error('다른 사용자의 변경 또는 저장 권한 문제로 저장하지 못했습니다. 임시본을 내려받은 뒤 새로고침해주세요.');
    },
  };
}

// Import with fresh IDs; preserve both versions when local and public cards differ.
export function importBrowserLibrary(remote: Library, local: Library): Library {
  const categories = remote.categories.map(c => ({ ...c }));
  const mapping = new Map<string, string>();
  for (const c of local.categories) {
    let match = categories.find(r => r.name.trim().normalize('NFKC').toLocaleLowerCase() === c.name.trim().normalize('NFKC').toLocaleLowerCase());
    if (!match) { match = { ...c, id: crypto.randomUUID() }; categories.push(match); }
    mapping.set(c.id, match.id);
  }
  const items = [...remote.items];
  for (const item of local.items) {
    const candidate = { ...item, categoryId: mapping.get(item.categoryId)! };
    const content = ({ id: _id, ...rest }: typeof candidate) => JSON.stringify(rest);
    if (!items.some(existing => content(existing) === content(candidate)))
      items.push({ ...candidate, id: crypto.randomUUID() });
  }
  return { version: 3, categories, items };
}
