import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark as BookmarkIcon,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  Grid2X2,
  LayoutList,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  hostname,
  isWebUrl,
  readLibrary,
  STORAGE_KEY,
  type Bookmark,
  type BookmarkLink,
  type Category,
  type Library,
} from "./data";

import Dialog from "./components/Dialog";
import CategoryCover, { categoryIcons } from "./components/CategoryCover";
import CategoryManager from "./components/CategoryManager";

type Editor = { kind: "new" } | { kind: "edit"; item: Bookmark };

function BookmarkForm({
  editor,
  onSave,
  onClose,
  categories,
}: {
  categories: Category[];
  editor: Editor;
  onSave: (item: Bookmark) => void;
  onClose: () => void;
}) {
  const item = editor.kind === "edit" ? editor.item : undefined;
  const [links, setLinks] = useState<BookmarkLink[]>(
    () => item?.links.map((link) => ({ ...link })) ?? [],
  );
  const [title, setTitle] = useState(item?.title ?? "");
  const [note, setNote] = useState(item?.note ?? "");
  const [tags, setTags] = useState(item?.tags.join(", ") ?? "");
  const [categoryId, setCategoryId] = useState(
    item?.categoryId ?? categories[0].id,
  );
  const [error, setError] = useState("");
  const addLinkRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<string | null>(null);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    if (target === "add-link") addLinkRef.current?.focus();
    else document.getElementById(target)?.focus();
    pendingFocus.current = null;
  }, [links]);
  function updateLink(id: string, field: "label" | "url", value: string) {
    setLinks((current) =>
      current.map((link) =>
        link.id === id ? { ...link, [field]: value } : link,
      ),
    );
    setError("");
  }
  function addLink() {
    const id = crypto.randomUUID();
    pendingFocus.current = `link-url-${id}`;
    setLinks((current) => [...current, { id, label: "", url: "" }]);
  }
  function removeLink(id: string) {
    const index = links.findIndex((link) => link.id === id);
    const remaining = links.filter((link) => link.id !== id);
    const next = remaining[Math.min(index, remaining.length - 1)];
    pendingFocus.current = next ? `link-url-${next.id}` : "add-link";
    setLinks(remaining);
    setError("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const enteredLinks = links.filter(
      (link) => link.label.trim() || link.url.trim(),
    );
    const invalidIndex = links.findIndex(
      (link) =>
        (link.label.trim() || link.url.trim()) && !isWebUrl(link.url.trim()),
    );
    if (invalidIndex !== -1) {
      setError(
        links[invalidIndex].url.trim()
          ? `링크 ${invalidIndex + 1}: http:// 또는 https://로 시작하는 올바른 링크를 입력해주세요.`
          : `링크 ${invalidIndex + 1}: 이름을 입력한 링크에는 URL도 입력해주세요. 필요하지 않은 행은 삭제할 수 있어요.`,
      );
      document.getElementById(`link-url-${links[invalidIndex].id}`)?.focus();
      return;
    }
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    onSave({
      id: item?.id ?? crypto.randomUUID(),
      title: title.trim(),
      links: enteredLinks.map((link) => {
        const url = new URL(link.url.trim()).href;
        return { id: link.id, label: link.label.trim() || hostname(url), url };
      }),
      note: note.trim(),
      tags: [
        ...new Set(
          tags
            .split(/[,#]/)
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ].slice(0, 8),
      categoryId,
      favorite: item?.favorite ?? false,
      createdAt: item?.createdAt ?? new Date().toISOString(),
    });
  }
  return (
    <Dialog
      title={item ? "저장한 정보 수정" : "새로운 발견 저장하기"}
      onClose={onClose}
    >
      <p className="dialog-description">
        나중의 나에게 제목과 메모를 남겨보세요. 관련 링크는 필요할 때 추가할 수
        있어요.
      </p>
      <form onSubmit={submit} className="bookmark-form">
        <label>
          제목 <span>*</span>
          <input
            data-autofocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="어떤 내용인가요?"
            required
            maxLength={120}
          />
        </label>
        <label>
          나의 메모
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="왜 저장했나요? 언제 다시 꺼내보면 좋을까요?"
            rows={3}
            maxLength={2000}
          />
        </label>
        <fieldset className="link-editor">
          <legend>
            관련 링크 <small>(선택)</small>
            <span className="link-editor-count">{links.length}개</span>
          </legend>
          <div className="link-editor-rows">
            {links.map((link, index) => (
              <div className="link-editor-row" key={link.id}>
                <div className="link-row-heading">
                  <span>
                    <Link2 size={14} />
                    링크 {index + 1}
                  </span>
                  <button
                    type="button"
                    className="icon-button remove-link"
                    aria-label={`링크 ${index + 1} 삭제`}
                    onClick={() => removeLink(link.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="link-row-fields">
                  <label htmlFor={`link-name-${link.id}`}>
                    이름 <small>(선택)</small>
                    <input
                      id={`link-name-${link.id}`}
                      aria-label={`링크 ${index + 1} 이름`}
                      value={link.label}
                      onChange={(e) =>
                        updateLink(link.id, "label", e.target.value)
                      }
                      placeholder="예: 설명 문서, 참고 사이트"
                      maxLength={120}
                    />
                  </label>
                  <label htmlFor={`link-url-${link.id}`}>
                    URL
                    <input
                      id={`link-url-${link.id}`}
                      aria-label={`링크 ${index + 1} URL`}
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        updateLink(link.id, "url", e.target.value)
                      }
                      placeholder="https://example.com"
                      maxLength={2048}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button
            ref={addLinkRef}
            type="button"
            className="add-link-button"
            onClick={addLink}
          >
            <Plus size={16} />
            링크 추가
          </button>
          <p className="field-hint">
            링크 없이도 저장할 수 있어요. 빈 행은 저장하지 않으며, 링크 이름을
            비우면 사이트 주소로 표시됩니다.
          </p>
        </fieldset>
        <div className="form-row">
          <label>
            분류
            <select
              aria-label="분류"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            태그
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="영감, 도구, 나중에 읽기"
              maxLength={200}
            />
          </label>
        </div>
        <p className="field-hint">
          태그는 쉼표로 구분해주세요. 최대 8개까지 저장할 수 있어요.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            취소
          </button>
          <button className="primary-button" type="submit">
            <BookmarkIcon size={17} />
            {item ? "변경 저장" : "내 보관함에 저장"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export default function App() {
  const [loaded] = useState(readLibrary);
  const [library, setLibrary] = useState<Library>(loaded.library);
  const { items, categories } = library;
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const getCategory = (id: string) => categoryById.get(id) ?? categories[0];
  function setItems(
    update: Bookmark[] | ((current: Bookmark[]) => Bookmark[]),
  ) {
    setLibrary((current) => ({
      ...current,
      items: typeof update === "function" ? update(current.items) : update,
    }));
  }
  const [managingCategories, setManagingCategories] = useState(false);
  const [storageIssue, setStorageIssue] = useState(loaded.failed);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [tab, setTab] = useState<"all" | "favorites">("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (loaded.failed) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
      setStorageIssue(false);
    } catch {
      setStorageIssue(true);
    }
  }, [library, loaded.failed]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !editor &&
        !selected &&
        !managingCategories
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor, selected, managingCategories]);

  const normalized = query.toLocaleLowerCase().trim();
  const filtered = items
    .filter(
      (item) =>
        (tab !== "favorites" || item.favorite) &&
        (category === "all" || item.categoryId === category) &&
        (!normalized ||
          `${item.title} ${item.note} ${item.tags.join(" ")} ${item.links.map((link) => `${link.label} ${link.url}`).join(" ")}`
            .toLocaleLowerCase()
            .includes(normalized)),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title, "ko")
        : sort === "oldest"
          ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
          : Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  const detail = items.find((item) => item.id === selected);
  const favoriteCount = items.filter((item) => item.favorite).length;
  const toggleFavorite = (id: string) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item,
      ),
    );
  const save = (item: Bookmark) => {
    setItems((current) =>
      current.some((b) => b.id === item.id)
        ? current.map((b) => (b.id === item.id ? item : b))
        : [item, ...current],
    );
    setToast(
      editor?.kind === "edit"
        ? "변경 내용을 저장했어요."
        : "새로운 발견을 보관함에 담았어요.",
    );
    if (editor?.kind === "new") {
      setQuery("");
      setCategory("all");
      setTab("all");
      setSort("newest");
    }
    setEditor(null);
  };

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a
            href="#"
            className="brand"
            onClick={() => {
              setTab("all");
              setCategory("all");
              setQuery("");
            }}
            aria-label="모아 홈"
          >
            <span className="brand-mark">
              <BookmarkIcon size={21} strokeWidth={2} />
            </span>
            <span>
              모아<span className="brand-dot">.</span>
            </span>
          </a>
          <nav className="header-nav" aria-label="보관함 메뉴">
            <button
              className={tab === "all" ? "active" : ""}
              onClick={() => setTab("all")}
            >
              <BookmarkIcon size={16} />내 보관함
            </button>
            <button
              className={tab === "favorites" ? "active" : ""}
              onClick={() => setTab("favorites")}
            >
              <Star size={16} />
              즐겨찾기<span className="nav-count">{favoriteCount}</span>
            </button>
          </nav>
          <button
            className="primary-button add-button"
            onClick={() => setEditor({ kind: "new" })}
          >
            <Plus size={18} />
            <span>정보 저장</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            YOUR PERSONAL LITTLE LIBRARY
          </div>
          <h1 id="hero-title">
            좋은 발견을,
            <br className="mobile-break" /> <span>다시 꺼내는 곳.</span>
          </h1>
          {/* <p>
            스쳐 지나가기 아쉬운 정보, 모아두세요.
            <br className="mobile-break" /> 필요할 때 바로 찾을 수 있도록.
          </p> */}
          <div className="search-box">
            <Search size={22} strokeWidth={1.8} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="저장한 정보 검색"
              placeholder="어떤 정보를 찾고 있나요?"
            />
            {query ? (
              <button
                className="icon-button clear-search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                aria-label="검색어 지우기"
              >
                <X size={18} />
              </button>
            ) : (
              <kbd>
                <span>⌘</span> K
              </kbd>
            )}
          </div>
          {/* <div className="search-hint">
            제목, 메모, 태그로 기억 속 정보를 찾아보세요.
          </div> */}
          <div className="hero-decoration decoration-left" aria-hidden="true">
            <BookmarkIcon size={27} strokeWidth={1.3} />
          </div>
          <div className="hero-decoration decoration-right" aria-hidden="true">
            <Sparkles size={24} strokeWidth={1.4} />
          </div>
        </section>

        <section className="library" aria-labelledby="library-title">
          <div className="library-heading">
            <div className="library-title">
              <h2 id="library-title">
                {tab === "favorites" ? "즐겨찾는 발견" : "나의 보관함"}
              </h2>
              <span className="total-count">{items.length}</span>
            </div>
            {/* <span className="library-description">
              오늘의 발견이 내일의 힌트가 되도록
            </span> */}
          </div>
          <div className="library-toolbar">
            <div className="category-filters" aria-label="분류 필터">
              <button
                className={`filter-chip ${category === "all" ? "selected" : ""}`}
                aria-pressed={category === "all"}
                onClick={() => setCategory("all")}
              >
                <Grid2X2 size={15} />
                전체
              </button>
              {categories.map((c) => {
                const Icon = categoryIcons[c.theme];
                return (
                  <button
                    key={c.id}
                    className={`filter-chip ${category === c.id ? "selected" : ""}`}
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    <Icon size={15} />
                    {c.name}
                  </button>
                );
              })}
            </div>
            <div className="view-controls">
              <button
                className="category-manage-button"
                onClick={() => setManagingCategories(true)}
              >
                <Settings2 size={15} />
                카테고리 관리
              </button>
              <div className="sort-control">
                <ArrowDown size={13} />
                <select
                  aria-label="정렬 방식"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">최근 저장순</option>
                  <option value="oldest">오래된 순</option>
                  <option value="title">제목순</option>
                </select>
                <ChevronDown size={12} />
              </div>
              <span className="control-divider" />
              <div className="view-toggle">
                <button
                  className={view === "grid" ? "selected" : ""}
                  aria-label="격자 보기"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  className={view === "list" ? "selected" : ""}
                  aria-label="목록 보기"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <LayoutList size={17} />
                </button>
              </div>
            </div>
          </div>
          {storageIssue && (
            <p className="storage-warning" role="status">
              브라우저 저장소를 사용할 수 없어 변경 내용은 새로고침 후 유지되지
              않을 수 있어요. 기존 저장 데이터는 덮어쓰지 않았습니다.
            </p>
          )}
          <div className="results-meta" aria-live="polite">
            <span>
              {query ? (
                <>
                  <b>“{query}”</b> 검색 결과
                </>
              ) : category !== "all" ? (
                `${getCategory(category).name}에 모아둔 정보`
              ) : tab === "favorites" ? (
                "다시 보고 싶은 정보"
              ) : (
                "차곡차곡 쌓인 좋은 발견"
              )}{" "}
              <b>{filtered.length}개</b>
            </span>
            <span>
              <span className="status-dot" />이 브라우저에 저장됩니다
            </span>
          </div>

          <div className={`card-grid ${view === "list" ? "list-view" : ""}`}>
            {filtered.map((item) => (
              <article className="bookmark-card" key={item.id}>
                <div className="card-cover-wrap">
                  <button
                    className="cover-open"
                    onClick={() => setSelected(item.id)}
                    aria-label={`${item.title} 상세 보기`}
                  >
                    <CategoryCover category={getCategory(item.categoryId)} />
                  </button>
                  <button
                    className={`favorite-button ${item.favorite ? "is-favorite" : ""}`}
                    aria-pressed={item.favorite}
                    aria-label={`${item.title} 즐겨찾기 ${item.favorite ? "해제" : "추가"}`}
                    onClick={() => toggleFavorite(item.id)}
                  >
                    <Star
                      size={17}
                      fill={item.favorite ? "currentColor" : "none"}
                      strokeWidth={1.8}
                    />
                  </button>
                  <span
                    className={`category-label theme-${getCategory(item.categoryId).theme}`}
                  >
                    {getCategory(item.categoryId).name}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-source">
                    <span className="source-icon">
                      {item.links.length ? (
                        <ExternalLink size={10} />
                      ) : (
                        <Pencil size={10} />
                      )}
                    </span>
                    <span className="source-hostname">
                      {item.links[0]
                        ? hostname(item.links[0].url)
                        : "나의 메모"}
                    </span>
                    {item.links.length > 0 && (
                      <button
                        className="card-link-count"
                        onClick={() => setSelected(item.id)}
                      >
                        <Link2 size={12} />
                        관련 링크 {item.links.length}개
                      </button>
                    )}
                  </div>
                  <button
                    className="card-title"
                    onClick={() => setSelected(item.id)}
                  >
                    {item.title}
                  </button>
                  <p className="card-note">
                    {item.note || "나중에 다시 꺼내볼 새로운 발견."}
                  </p>
                  <div className="card-tags">
                    {item.tags.map((tag) => (
                      <button key={tag} onClick={() => setQuery(tag)}>
                        #{tag}
                      </button>
                    ))}
                  </div>
                  <div className="card-footer">
                    <span>
                      <Clock3 size={12} />
                      {new Intl.DateTimeFormat("ko-KR", {
                        month: "long",
                        day: "numeric",
                      }).format(new Date(item.createdAt))}{" "}
                      저장
                    </span>
                    <button
                      aria-label={`${item.title} 관리`}
                      className="card-more"
                      onClick={() => setSelected(item.id)}
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <span>
                <Search size={28} strokeWidth={1.5} />
              </span>
              <h3>
                {items.length === 0
                  ? "첫 번째 발견을 모아볼까요?"
                  : "아직 찾는 정보가 없어요"}
              </h3>
              <p>
                {items.length === 0
                  ? "기억해두고 싶은 정보와 짧은 메모를 남겨보세요."
                  : "다른 검색어나 분류로 다시 찾아보세요."}
              </p>
              <button
                className="secondary-button"
                onClick={() => {
                  if (!items.length) setEditor({ kind: "new" });
                  else {
                    setQuery("");
                    setCategory("all");
                    setTab("all");
                  }
                }}
              >
                {items.length === 0 ? "정보 저장하기" : "전체 정보 보기"}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
          {filtered.length > 0 && (
            <p className="library-bottom">
              <BookmarkIcon size={14} />
              작은 발견도, 모이면 나만의 자산이 돼요.
            </p>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span className="footer-brand">
          모아<span>.</span>
        </span>
        <p>나중의 나를 위한 작은 보관함</p>
        <span className="footer-note">Made for your curious mind.</span>
      </footer>
      {managingCategories && (
        <CategoryManager
          library={library}
          onClose={() => setManagingCategories(false)}
          onSave={(next) => {
            setLibrary(next);
            if (!next.categories.some((c) => c.id === category))
              setCategory("all");
            setManagingCategories(false);
            setToast("카테고리 변경사항을 저장했어요.");
          }}
        />
      )}
      {editor && (
        <BookmarkForm
          editor={editor}
          categories={categories}
          onSave={save}
          onClose={() => setEditor(null)}
        />
      )}
      {detail && !editor && (
        <Dialog
          title="저장한 발견"
          onClose={() => setSelected(null)}
          className="detail-dialog"
        >
          <CategoryCover category={getCategory(detail.categoryId)} />
          <div className="detail-content">
            <span className="detail-category">
              {getCategory(detail.categoryId).name}
            </span>
            <h3>{detail.title}</h3>
            <p className="detail-note">
              {detail.note || "아직 남긴 메모가 없어요."}
            </p>
            <div className="detail-tags">
              {detail.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
            {detail.links.length > 0 && (
              <section className="detail-links" aria-label="관련 링크">
                <h4>
                  <Link2 size={16} />
                  관련 링크 <span>{detail.links.length}개</span>
                </h4>
                <div className="detail-link-list">
                  {detail.links.map((link, index) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-link"
                    >
                      <span className="detail-link-number">{index + 1}</span>
                      <span className="detail-link-text">
                        <strong>{link.label || hostname(link.url)}</strong>
                        <span>{link.url}</span>
                      </span>
                      <ArrowUpRight size={17} />
                    </a>
                  ))}
                </div>
              </section>
            )}
            <div className="dialog-actions detail-actions">
              <button
                className="danger-button"
                onClick={() => {
                  setItems((current) =>
                    current.filter((item) => item.id !== detail.id),
                  );
                  setSelected(null);
                  setToast("보관함에서 삭제했어요.");
                }}
              >
                <Trash2 size={16} />
                삭제
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  setEditor({ kind: "edit", item: detail });
                  setSelected(null);
                }}
              >
                <Pencil size={15} />
                수정
              </button>
            </div>
          </div>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={15} />
          </span>
          {toast}
        </div>
      )}
    </>
  );
}
