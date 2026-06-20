import {
  Car,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  Repeat,
  ShoppingBag,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  "heart-pulse": HeartPulse,
  "gamepad-2": Gamepad2,
  "graduation-cap": GraduationCap,
  "shopping-bag": ShoppingBag,
  repeat: Repeat,
  wrench: Wrench,
  "more-horizontal": MoreHorizontal,
};

export function CategoryIcon({
  icon,
  color,
  size = "md",
}: {
  icon: string;
  color: string;
  size?: "sm" | "md";
}) {
  const Icon = ICON_MAP[icon] ?? MoreHorizontal;
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconDim = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div
      className={cn("flex items-center justify-center rounded-xl", dim)}
      style={{ backgroundColor: `${color}22`, color }}
    >
      <Icon className={iconDim} />
    </div>
  );
}
