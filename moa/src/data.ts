export const coverThemes = [
  "design",
  "development",
  "tips",
  "video",
  "other",
] as const;
export type CoverTheme = (typeof coverThemes)[number];
export type Category = { id: string; name: string; theme: CoverTheme };
export const defaultCategories: Category[] = [
  { id: "design", name: "디자인", theme: "design" },
  { id: "development", name: "개발", theme: "development" },
  { id: "tips", name: "꿀팁", theme: "tips" },
  { id: "video", name: "영상", theme: "video" },
  { id: "other", name: "기타", theme: "other" },
];
export type BookmarkLink = { id: string; label: string; url: string };
export type Bookmark = {
  id: string;
  title: string;
  links: BookmarkLink[];
  note: string;
  tags: string[];
  categoryId: string;
  favorite: boolean;
  createdAt: string;
};
export type Library = { version: 3; categories: Category[]; items: Bookmark[] };
export const STORAGE_KEY = "moa-library-v3";

export const initialBookmarks: Bookmark[] = [
  {
    id: "sample-1",
    title: "좋은 디자인은 덜어내는 것에서 시작된다",
    links: [
      {
        id: "sample-link-1",
        label: "좋은 디자인의 10가지 원칙",
        url: "https://www.vitsoe.com/us/about/good-design",
      },
    ],
    note: "디터 람스의 좋은 디자인 10가지 원칙. 다음 프로젝트 시작 전에 다시 읽어보기.",
    tags: ["디자인 원칙", "영감"],
    categoryId: "design",
    favorite: true,
    createdAt: "2026-10-06T08:00:00.000Z",
  },
  {
    id: "sample-2",
    title: "CSS Grid, 이 가이드 하나로 정리하기",
    links: [
      {
        id: "sample-link-2",
        label: "CSS Grid 가이드",
        url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
      },
      {
        id: "sample-link-2-mdn",
        label: "MDN 그리드 레이아웃 문서",
        url: "https://developer.mozilla.org/ko/docs/Web/CSS/CSS_grid_layout",
      },
      {
        id: "sample-link-2-webdev",
        label: "그리드 실습과 예제",
        url: "https://web.dev/learn/css/grid",
      },
    ],
    note: "반응형 카드 레이아웃 만들 때 참고할 자료. 그림으로 설명되어 있어서 이해하기 좋다.",
    tags: ["CSS", "프론트엔드"],
    categoryId: "development",
    favorite: false,
    createdAt: "2026-10-05T08:00:00.000Z",
  },
  {
    id: "sample-3",
    title: "복잡한 하루를 정리하는 나만의 시스템",
    links: [
      {
        id: "sample-link-3",
        label: "노션 템플릿 모음",
        url: "https://www.notion.com/templates",
      },
    ],
    note: "일정과 할 일을 한곳에 모으는 템플릿 모음. 주간 계획을 세울 때 활용해보기.",
    tags: ["노션", "루틴"],
    categoryId: "tips",
    favorite: true,
    createdAt: "2026-10-04T08:00:00.000Z",
  },
  {
    id: "sample-4",
    title: "색 조합이 고민될 때 꺼내보는 팔레트",
    links: [
      {
        id: "sample-link-4",
        label: "추천 컬러 팔레트",
        url: "https://coolors.co/palettes/trending",
      },
    ],
    note: "웹사이트 색상을 정할 때 참고하기. 따뜻한 중립색과 포인트 컬러 조합이 좋다.",
    tags: ["컬러", "웹디자인"],
    categoryId: "design",
    favorite: false,
    createdAt: "2026-10-03T08:00:00.000Z",
  },
  {
    id: "sample-5",
    title: "잠깐의 산책이 만드는 작은 변화",
    links: [
      {
        id: "sample-link-5",
        label: "걷기의 장점",
        url: "https://www.health.harvard.edu/staying-healthy/5-surprising-benefits-of-walking",
      },
    ],
    note: "집중이 안 될 때 20분만 걸어보기. 일상에서 바로 실천할 수 있는 걷기의 장점.",
    tags: ["건강", "일상"],
    categoryId: "other",
    favorite: false,
    createdAt: "2026-10-02T08:00:00.000Z",
  },
  {
    id: "sample-6",
    title: "웹 개발하면서 자주 찾게 되는 문서",
    links: [
      {
        id: "sample-link-6",
        label: "MDN 웹 개발 문서",
        url: "https://developer.mozilla.org/ko/docs/Web",
      },
    ],
    note: "HTML, CSS, JavaScript 기본 개념부터 찾아볼 수 있는 공식 문서. 막힐 때 가장 먼저 확인.",
    tags: ["JavaScript", "레퍼런스"],
    categoryId: "development",
    favorite: false,
    createdAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "sample-7",
    title: "짧은 강연에서 발견하는 새로운 아이디어",
    links: [
      {
        id: "sample-link-7",
        label: "TED 영상 모음",
        url: "https://www.youtube.com/@TED",
      },
    ],
    note: "시간이 날 때 보고 싶은 강연들. 새로운 관점이 필요할 때 다시 찾아보기.",
    tags: ["영상", "강연"],
    categoryId: "video",
    favorite: false,
    createdAt: "2026-09-30T08:00:00.000Z",
  },
];

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function isWebUrl(url: string) {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export function normalizeCategoryName(name: string) {
  return name.trim().normalize("NFKC").toLocaleLowerCase();
}

export function validateCategories(categories: Category[]): string {
  if (!categories.length) return "최소 1개의 카테고리를 남겨주세요.";
  const names = new Set<string>();
  for (const category of categories) {
    const name = normalizeCategoryName(category.name);
    if (!name) return "카테고리 이름을 입력해주세요.";
    if (category.name.trim().length > 30)
      return "카테고리 이름은 30자 이내로 입력해주세요.";
    if (name === "전체")
      return "‘전체’는 모든 정보를 보여주는 필터라 이름으로 사용할 수 없어요.";
    if (names.has(name))
      return "같은 이름의 카테고리가 있어요. 다른 이름을 입력해주세요.";
    names.add(name);
  }
  return "";
}

function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== "object") return false;
  const c = value as Category;
  return (
    typeof c.id === "string" &&
    Boolean(c.id) &&
    typeof c.name === "string" &&
    c.name.trim().length > 0 &&
    c.name.length <= 30 &&
    coverThemes.includes(c.theme)
  );
}

function hasBookmarkFields(
  value: unknown,
): value is Omit<Bookmark, "categoryId" | "links"> & Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const b = value as Bookmark;
  return (
    typeof b.id === "string" &&
    typeof b.title === "string" &&
    typeof b.note === "string" &&
    typeof b.favorite === "boolean" &&
    Array.isArray(b.tags) &&
    b.tags.every((t) => typeof t === "string") &&
    typeof b.createdAt === "string" &&
    Number.isFinite(Date.parse(b.createdAt))
  );
}

function isLinks(value: unknown): value is BookmarkLink[] {
  return (
    Array.isArray(value) &&
    value.every((link: unknown) => {
      if (!link || typeof link !== "object") return false;
      const l = link as BookmarkLink;
      return (
        typeof l.id === "string" &&
        typeof l.label === "string" &&
        typeof l.url === "string" &&
        isWebUrl(l.url)
      );
    }) &&
    new Set(value.map((l) => l.id)).size === value.length
  );
}

function isLibrary(value: unknown): value is Library {
  if (!value || typeof value !== "object") return false;
  const library = value as Library;
  if (
    library.version !== 3 ||
    !Array.isArray(library.categories) ||
    !library.categories.every(isCategory) ||
    validateCategories(library.categories) ||
    new Set(library.categories.map((c) => c.id)).size !==
      library.categories.length ||
    !Array.isArray(library.items)
  )
    return false;
  const ids = new Set(library.categories.map((c) => c.id));
  return (
    library.items.every(
      (item) =>
        hasBookmarkFields(item) &&
        isLinks(item.links) &&
        typeof item.categoryId === "string" &&
        ids.has(item.categoryId),
    ) &&
    new Set(library.items.map((item) => item.id)).size === library.items.length
  );
}

function migrateLegacy(value: unknown): Library {
  if (!Array.isArray(value)) throw new Error("Invalid legacy library");
  const categories = defaultCategories.map((c) => ({ ...c }));
  const aliases: Record<string, string> = {
    디자인: "design",
    개발: "development",
    꿀팁: "tips",
    영상: "video",
    기타: "other",
    생산성: "tips",
    라이프: "other",
  };
  const items = value.map((item: unknown): Bookmark => {
    if (
      !hasBookmarkFields(item) ||
      typeof item.category !== "string" ||
      !item.category.trim()
    )
      throw new Error("Invalid bookmark");
    let links: BookmarkLink[];
    if ("links" in item) {
      if (!isLinks(item.links)) throw new Error("Invalid links");
      links = item.links;
    } else if (typeof item.url === "string" && isWebUrl(item.url)) {
      links = [
        { id: `legacy-${item.id}`, label: hostname(item.url), url: item.url },
      ];
    } else throw new Error("Invalid URL");
    const name = item.category.trim();
    let categoryId = Object.hasOwn(aliases, name) ? aliases[name] : undefined;
    if (!categoryId) {
      const existing = categories.find(
        (c) => normalizeCategoryName(c.name) === normalizeCategoryName(name),
      );
      categoryId = existing?.id ?? `legacy-category-${categories.length}`;
      if (!existing) categories.push({ id: categoryId, name, theme: "other" });
    }
    return {
      id: item.id,
      title: item.title,
      note: item.note,
      links,
      tags: item.tags,
      categoryId,
      favorite: item.favorite,
      createdAt: item.createdAt,
    };
  });
  const library: Library = { version: 3, categories, items };
  if (!isLibrary(library)) throw new Error("Invalid migrated library");
  return library;
}

export function readLibrary(): { library: Library; failed: boolean } {
  const initial: Library = {
    version: 3,
    categories: defaultCategories.map((c) => ({ ...c })),
    items: initialBookmarks,
  };
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) {
      const parsed: unknown = JSON.parse(current);
      if (!isLibrary(parsed)) throw new Error("Invalid saved library");
      return { library: parsed, failed: false };
    }
    const legacy =
      localStorage.getItem("moa-bookmarks-v2") ??
      localStorage.getItem("moa-bookmarks-v1");
    return {
      library: legacy === null ? initial : migrateLegacy(JSON.parse(legacy)),
      failed: false,
    };
  } catch {
    return { library: initial, failed: true };
  }
}
