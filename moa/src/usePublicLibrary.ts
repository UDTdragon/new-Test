import { useEffect, useRef, useState, type SetStateAction } from 'react';
import { readLibrary, STORAGE_KEY, type Library } from './data';
import { createPublicLibrary, emptyLibrary, importBrowserLibrary } from './publicLibrary';

const DRAFT_KEY = 'moa-public-library-draft-v1';
export function usePublicLibrary() {
  const [library, update] = useState<Library>(emptyLibrary);
  const [status, setStatus] = useState('공용 보관함 불러오는 중…');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const base = useRef<Library | null>(null);
  const current = useRef(library);
  const locked = useRef(true);
  const client = useRef<ReturnType<typeof createPublicLibrary> | null>(null);
  const [local] = useState(readLibrary);
  const [hasLocal] = useState(() => {
    try { return [STORAGE_KEY, 'moa-bookmarks-v2', 'moa-bookmarks-v1'].some(key => localStorage.getItem(key) !== null); }
    catch { return false; }
  });
  const [draft, setDraft] = useState(() => {
    try { return localStorage.getItem(DRAFT_KEY); } catch { return null; }
  });
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        client.current = createPublicLibrary(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
        const value = await client.current.read();
        if (!active) return;
        base.current = value;
        current.current = value ?? emptyLibrary();
        update(current.current);
        locked.current = false;
        setReady(true);
        setStatus('로그인 없이 함께 사용하는 공용 보관함');
      } catch (error) {
        if (active) {
          setLoadFailed(true);
          setStatus(error instanceof Error ? error.message : '불러오지 못했습니다. 새로고침해주세요.');
        }
      }
    }
    void load();
    return () => { active = false; };
  }, []);
  async function persist(next: Library) {
    locked.current = true;
    setBusy(true);
    setFailed(false);
    const raw = JSON.stringify(next);
    setDraft(raw);
    try { localStorage.setItem(DRAFT_KEY, raw); } catch { /* In-memory draft remains downloadable. */ }
    setStatus('공용 보관함에 저장 중…');
    try {
      await client.current!.save(next, base.current);
      base.current = next;
      locked.current = false;
      setStatus('공용 보관함에 저장되었습니다');
      // Keep the recovery copy, including drafts from an earlier visit.
    } catch (error) {
      setFailed(true);
      setStatus(error instanceof Error ? error.message : '저장 실패. 임시본을 보관하고 있습니다.');
    } finally { setBusy(false); }
  }
  function setLibrary(action: SetStateAction<Library>) {
    if (locked.current) return;
    const next = typeof action === 'function' ? action(current.current) : action;
    current.current = next;
    update(next);
    void persist(next);
  }
  function downloadDraft() {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([draft], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'moa-library-backup.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const imported = ready && hasLocal && !local.failed
    ? importBrowserLibrary(library, local.library) : null;
  const needsImport = Boolean(imported && (
    imported.categories.length > library.categories.length || imported.items.length > library.items.length
  ));
  return { library, setLibrary, status, loadFailed, canEdit: ready && !busy && !failed, failed, busy,
    localFailed: hasLocal && local.failed, hasLocal: needsImport,
    importLocal: () => setLibrary(importBrowserLibrary(current.current, local.library)),
    retry: () => void persist(current.current), downloadDraft, hasDraft: Boolean(draft) };
}
