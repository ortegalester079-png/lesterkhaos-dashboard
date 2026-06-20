"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups, navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-card/40 backdrop-blur-xl lg:flex">
      {/* Marca */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <span className="brand-mark text-xl text-primary">LK</span>
        </div>
        <div className="leading-tight">
          <p className="brand-mark text-lg text-foreground">@lesterkhaos</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Content OS
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="scroll-thin flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {navGroups.map((grupo) => (
          <div key={grupo} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              {grupo}
            </p>
            {navItems
              .filter((item) => item.group === grupo)
              .map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-foreground ring-1 ring-inset ring-primary/30"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 h-[18px] w-[18px] shrink-0",
                        active
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="flex flex-col">
                      <span className="font-medium leading-tight">{item.label}</span>
                      <span className="text-[11px] leading-tight text-muted-foreground/70">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Pie / usuario */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary/40 p-3">
          <Avatar>
            <AvatarFallback>LK</AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-foreground">
              Lester Khaos
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @lesterkhaos
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
