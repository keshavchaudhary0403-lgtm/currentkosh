import {
  Atom,
  Award,
  BarChart3,
  CalendarHeart,
  Globe2,
  HeartPulse,
  IndianRupee,
  Landmark,
  Leaf,
  Mountain,
  Palette,
  ScrollText,
  Shield,
  Trophy,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES, categoryById } from "@/lib/taxonomy";

const ICONS: Record<string, LucideIcon> = {
  polity: Landmark,
  schemes: ScrollText,
  economy: IndianRupee,
  international: Globe2,
  environment: Leaf,
  science_tech: Atom,
  defence: Shield,
  reports_indices: BarChart3,
  appointments: UserCheck,
  awards: Award,
  sports: Trophy,
  culture: Palette,
  social: HeartPulse,
  geography: Mountain,
  days: CalendarHeart,
};

export const categoryHue = (id: string) => (categoryById(id) ?? CATEGORIES[0]).hue;

/** Style object that sets the category hue for `.cat` colour variables. */
export const catStyle = (id: string) => ({ "--h": categoryHue(id) }) as React.CSSProperties;

export function CategoryIcon({ id, size = "md" }: { id: string; size?: "sm" | "md" | "lg" }) {
  const Icon = ICONS[id] ?? ScrollText;
  const box = size === "lg" ? "size-12 rounded-2xl" : size === "sm" ? "size-8 rounded-lg" : "size-10 rounded-xl";
  const icon = size === "lg" ? "size-6" : size === "sm" ? "size-4" : "size-5";
  return (
    <span className={`cat grid shrink-0 place-items-center bg-(--cat-tint) text-(--cat-ink) ${box}`} style={catStyle(id)}>
      <Icon className={icon} strokeWidth={2} />
    </span>
  );
}
