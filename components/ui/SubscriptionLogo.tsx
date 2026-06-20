"use client";

import { useEffect, useState } from "react";
import type { IconType } from "@icons-pack/react-simple-icons";
import { Dumbbell, Home, Repeat, Wifi } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { loadSubscriptionIcon } from "@/lib/brands/subscription-icons";
import {
  resolveSubscriptionBrand,
  type SubscriptionBrand,
} from "@/lib/brands/subscriptions";

type SubscriptionLogoProps = {
  description: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  brand?: SubscriptionBrand | null;
  className?: string;
};

const containerSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

const lucideMap = {
  dumbbell: Dumbbell,
  wifi: Wifi,
  home: Home,
  repeat: Repeat,
};

function getInitials(description: string): string {
  return description
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function BrandIcon({
  iconId,
  color,
  size,
  label,
}: {
  iconId: string;
  color: string;
  size: number;
  label: string;
}) {
  const [Icon, setIcon] = useState<IconType | null>(null);

  useEffect(() => {
    let active = true;
    loadSubscriptionIcon(iconId).then((loaded) => {
      if (active) setIcon(() => loaded);
    });
    return () => {
      active = false;
    };
  }, [iconId]);

  if (!Icon) {
    return (
      <div
        className="animate-pulse rounded-md bg-muted/30"
        style={{ width: size, height: size }}
      />
    );
  }

  return <Icon size={size} color={color} aria-label={label} />;
}

export function SubscriptionLogo({
  description,
  size = "md",
  showName = false,
  brand: brandOverride,
  className,
}: SubscriptionLogoProps) {
  const brand = brandOverride ?? resolveSubscriptionBrand(description);
  const px = iconSizes[size];

  const bgColor = brand?.bgColor ?? brand?.color ?? "#6366F1";
  const LucideFallback = brand?.lucideIcon
    ? lucideMap[brand.lucideIcon]
    : Repeat;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
          containerSizes[size]
        )}
        style={{
          backgroundColor: brand ? `${bgColor}22` : "#6366F122",
          border: brand ? `1px solid ${bgColor}44` : "1px solid #6366F144",
        }}
        title={brand?.label ?? description}
      >
        {brand?.iconId ? (
          <BrandIcon
            iconId={brand.iconId}
            color={brand.color}
            size={px}
            label={brand.label}
          />
        ) : brand?.lucideIcon ? (
          <LucideFallback size={px} style={{ color: brand.color }} aria-hidden />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: "#6366F1" }}
          >
            {getInitials(description)}
          </div>
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium text-foreground">
          {brand?.label ?? description}
        </span>
      )}
    </div>
  );
}

export function PopularSubscriptionBrands({
  onSelect,
}: {
  onSelect: (name: string) => void;
}) {
  const popular = [
    "Netflix",
    "Spotify",
    "iCloud+",
    "Smart Fit",
    "Internet Vivo",
    "YouTube Premium",
    "HBO Max",
    "Notion",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {popular.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs transition-colors hover:border-accent/40 hover:bg-card-hover"
        >
          <SubscriptionLogo description={name} size="sm" />
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
}
