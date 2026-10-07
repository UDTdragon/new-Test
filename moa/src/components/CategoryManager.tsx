import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash2, X } from "lucide-react";
import {
  validateCategories,
  type Category,
  type CoverTheme,
  type Library,
} from "../data";
import Dialog from "./Dialog";
import { coverChoices, coverImages } from "./CategoryCover";

export default function CategoryManager({
  library,
  onSave,
  onClose,
}: {
  library: Library;
  onSave: (library: Library) => void;
  onClose: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>(() =>
    library.categories.map((c) => ({ ...c })),
  );
  const [items, setItems] = useState(library.items);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<{
    id: string;
    target: string;
  } | null>(null);
  const pendingFocus = useRef("");
  useLayoutEffect(() => {
    if (pendingFocus.current)
      document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = "";
  }, [categories]);
  function change(id: string, field: "name" | "theme", value: string) {
    setCategories((current) =>
      current.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
    setError("");
  }
  function add() {
    const id = `cat-${crypto.randomUUID()}`;
    pendingFocus.current = `category-name-${id}`;
    setCategories((current) => [...current, { id, name: "", theme: "other" }]);
    setError("");
  }
  function reorder(index: number, direction: number) {
    const next = [...categories];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    setCategories(next);
  }
  function requestDelete(category: Category) {
    if (categories.length === 1) return;
    if (!items.some((item) => item.categoryId === category.id)) {
      setCategories((current) => current.filter((c) => c.id !== category.id));
      setError("");
      return;
    }
    const target =
      categories.find((c) => c.id === "other" && c.id !== category.id) ??
      categories.find((c) => c.id !== category.id)!;
    setDeleting({ id: category.id, target: target.id });
    setError("");
  }
  function deleteAndMove() {
    if (
      !deleting ||
      !categories.some((c) => c.id === deleting.target && c.id !== deleting.id)
    )
      return;
    setItems((current) =>
      current.map((item) =>
        item.categoryId === deleting.id
          ? { ...item, categoryId: deleting.target }
          : item,
      ),
    );
    setCategories((current) => current.filter((c) => c.id !== deleting.id));
    setDeleting(null);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (deleting) {
      setError(
        "정보를 옮길 카테고리를 선택한 뒤 삭제를 완료하거나 취소해주세요.",
      );
      return;
    }
    const message = validateCategories(categories);
    if (message) {
      setError(message);
      return;
    }
    onSave({
      version: 3,
      categories: categories.map((c) => ({ ...c, name: c.name.trim() })),
      items,
    });
  }
  const pendingCategory = categories.find((c) => c.id === deleting?.id);
  return (
    <Dialog
      title="카테고리 관리"
      className="category-manager"
      onClose={onClose}
    >
      <p className="dialog-description">
        나에게 맞는 이름과 순서로 정리하세요. 카테고리를 바꾸면 카드의 썸네일도
        함께 바뀝니다.
      </p>
      <form onSubmit={submit}>
        <div className="category-management-list">
          {categories.map((category, index) => {
            const count = items.filter(
              (item) => item.categoryId === category.id,
            ).length;
            return (
              <div
                className="category-management-row"
                key={category.id}
                data-category-id={category.id}
              >
                <img
                  className="category-preview"
                  src={coverImages[category.theme]}
                  alt=""
                />
                <div className="category-fields">
                  <label htmlFor={`category-name-${category.id}`}>
                    카테고리 이름 <span>{count}개 정보</span>
                  </label>
                  <input
                    id={`category-name-${category.id}`}
                    data-autofocus={index === 0 ? true : undefined}
                    aria-label={`${index + 1}번째 카테고리 이름`}
                    value={category.name}
                    onChange={(e) =>
                      change(category.id, "name", e.target.value)
                    }
                    placeholder="카테고리 이름"
                    maxLength={30}
                  />
                  <label
                    className="cover-select-label"
                    htmlFor={`category-theme-${category.id}`}
                  >
                    기본 썸네일
                  </label>
                  <select
                    id={`category-theme-${category.id}`}
                    aria-label={`${index + 1}번째 카테고리 썸네일`}
                    value={category.theme}
                    onChange={(e) =>
                      change(category.id, "theme", e.target.value as CoverTheme)
                    }
                  >
                    {coverChoices.map((choice) => (
                      <option value={choice.theme} key={choice.theme}>
                        {choice.label} 이미지
                      </option>
                    ))}
                  </select>
                </div>
                <div className="category-row-controls">
                  <button
                    type="button"
                    className="icon-button"
                    disabled={index === 0 || Boolean(deleting)}
                    onClick={() => reorder(index, -1)}
                    aria-label={`${category.name || "새 카테고리"} 위로 이동`}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    disabled={
                      index === categories.length - 1 || Boolean(deleting)
                    }
                    onClick={() => reorder(index, 1)}
                    aria-label={`${category.name || "새 카테고리"} 아래로 이동`}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-button category-delete"
                    disabled={categories.length === 1 || Boolean(deleting)}
                    onClick={() => requestDelete(category)}
                    aria-label={`${category.name || "새 카테고리"} 삭제`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {deleting && pendingCategory && (
          <section className="category-move-panel" aria-label="카테고리 삭제">
            <div className="move-panel-heading">
              <strong>
                ‘{pendingCategory.name}’의 정보를 어디로 옮길까요?
              </strong>
              <button
                type="button"
                className="icon-button"
                aria-label="카테고리 삭제 취소"
                onClick={() => setDeleting(null)}
              >
                <X size={17} />
              </button>
            </div>
            <p>
              저장된 정보{" "}
              {items.filter((item) => item.categoryId === deleting.id).length}
              개는 유지되며, 선택한 카테고리로 이동합니다.
            </p>
            <div className="move-panel-actions">
              <select
                aria-label="정보를 옮길 카테고리"
                value={deleting.target}
                onChange={(e) =>
                  setDeleting({ ...deleting, target: e.target.value })
                }
              >
                {categories
                  .filter((c) => c.id !== deleting.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || "이름 없는 카테고리"}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="secondary-button"
                onClick={deleteAndMove}
              >
                옮기고 삭제
              </button>
            </div>
          </section>
        )}
        <button
          type="button"
          className="add-category-button"
          onClick={add}
          disabled={Boolean(deleting)}
        >
          <Plus size={16} />
          카테고리 추가
        </button>
        <p className="field-hint">
          ‘전체’는 공통 필터로 유지됩니다. 최소 1개의 카테고리가 필요하며, 변경
          사항은 저장 버튼을 눌러야 적용됩니다.
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
          <button type="submit" className="primary-button">
            <Check size={16} />
            변경사항 저장
          </button>
        </div>
      </form>
    </Dialog>
  );
}
