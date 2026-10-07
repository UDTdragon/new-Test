import { useState } from "react";
import { Code2, FolderOpen, Lightbulb, Sparkles, Video } from "lucide-react";
import { defaultCategories, type Category, type CoverTheme } from "../data";
import design from "../assets/categories/design.png";
import development from "../assets/categories/development.png";
import tips from "../assets/categories/tips.png";
import video from "../assets/categories/video.png";
import other from "../assets/categories/other.png";

export const coverImages: Record<CoverTheme, string> = {
  design,
  development,
  tips,
  video,
  other,
};
export const categoryIcons = {
  design: Sparkles,
  development: Code2,
  tips: Lightbulb,
  video: Video,
  other: FolderOpen,
};
export const coverChoices = defaultCategories.map((c) => ({
  theme: c.theme,
  label: c.name,
}));

export default function CategoryCover({ category }: { category: Category }) {
  const source = coverImages[category.theme];
  const [failedSource, setFailedSource] = useState("");
  const Icon = categoryIcons[category.theme];
  return (
    <div
      className={`cover category-cover theme-${category.theme}`}
      aria-hidden="true"
    >
      {failedSource === source ? (
        <div className="cover-fallback">
          <Icon size={44} strokeWidth={1.2} />
          <span>{category.name}</span>
        </div>
      ) : (
        <img
          className="category-cover-image"
          src={source}
          alt=""
          decoding="async"
          onError={() => setFailedSource(source)}
        />
      )}
    </div>
  );
}
