"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { navGroups, navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function Topbar() {
  const pathname = usePathname();
  const current =
    navItems.find((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)
    ) ?? navItems[0];

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-6 py-5">
            <SheetTitle className="brand-mark text-lg">@lesterkhaos</SheetTitle>
          </SheetHeader>
          <nav className="space-y-4 px-3 pb-6">
            {navGroups.map((grupo) => (
              <div key={grupo} className="space-y-1">
                <p className="px-3 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
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
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                            active
                              ? "bg-primary/10 text-foreground ring-1 ring-inset ring-primary/30"
                              : "text-muted-foreground hover:bg-secondary/60"
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <current.icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{current.label}</span>
      </div>
    </header>
  );
}
