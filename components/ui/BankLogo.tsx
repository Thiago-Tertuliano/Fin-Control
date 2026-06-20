"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BANK_ICON_SIZES, resolveBankBrand } from "@/lib/brands/banks";

type SvgBancoFn = (options: {
  nome: string;
  tamanho: number;
  formato: string;
  fundo?: string;
}) => string | null;

type BankLogoProps = {
  slug: string;
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
};

const containerSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function BankLogo({
  slug,
  name,
  color,
  size = "md",
  showName = false,
  className,
}: BankLogoProps) {
  const px = BANK_ICON_SIZES[size];
  const brandName = resolveBankBrand(slug);
  const isCash = slug === "dinheiro";
  const [svgHtml, setSvgHtml] = useState<string | null>(null);

  useEffect(() => {
    if (isCash || !brandName) {
      setSvgHtml(null);
      return;
    }

    let active = true;

    import("@/lib/brands/svg-banco").then(({ svgBanco }) => {
      if (!active) return;
      const html = (svgBanco as SvgBancoFn)({
        nome: brandName,
        tamanho: px,
        formato: "quadrado",
        ...(color ? { fundo: color } : {}),
      });
      setSvgHtml(html);
    });

    return () => {
      active = false;
    };
  }, [brandName, color, isCash, px]);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
          containerSizes[size],
          !svgHtml && !isCash && "text-xs font-semibold"
        )}
        style={
          !svgHtml && !isCash
            ? {
                backgroundColor: color ?? "#64748B",
                color: slug === "bb" || slug === "xp" ? "#1e293b" : "#ffffff",
              }
            : undefined
        }
        title={name}
      >
        {isCash ? (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: color ?? "#10B981" }}
          >
            <Wallet className="h-[55%] w-[55%] text-white" />
          </div>
        ) : svgHtml ? (
          <div
            className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : !brandName ? (
          initials
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-muted/30" />
        )}
      </div>
      {showName && (
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {name}
        </span>
      )}
    </div>
  );
}
