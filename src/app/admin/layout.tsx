"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  CreditCard,
  Activity,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dasbor", href: "/admin", icon: LayoutDashboard },
  { name: "Tugas", href: "/admin/tasks", icon: ListTodo },
  { name: "Klien", href: "/admin/clients", icon: Users },
  { name: "Pembayaran", href: "/admin/payments", icon: CreditCard },
  { name: "Log Aktivitas", href: "/admin/activity", icon: Activity },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Image 
            src="/taskflow.png" 
            alt="TaskFlow Logo" 
            width={28} 
            height={28}
            priority
            className="object-contain rounded-full shadow-sm" 
          />
          <span className="bg-gradient-to-br from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">TaskFlow</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive && "text-primary")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        <form action={logout}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            type="submit"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-border bg-card">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 h-14 border-b border-border bg-background">
          <SheetTrigger
              render={<Button variant="ghost" size="icon" className="shrink-0" />}
            >
              <Menu className="w-5 h-5" />
          </SheetTrigger>
          <div className="w-14 items-center justify-center flex h-14 border-b lg:h-[60px]">
            <Image 
              src="/taskflow.png" 
              alt="TaskFlow Logo" 
              width={28} 
              height={28}
              priority
              className="object-contain rounded-full shadow-sm" 
            />
          </div>
          <span className="font-semibold text-sm">TaskFlow</span>
        </div>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigasi</SheetTitle>
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="hidden lg:flex h-14 items-center justify-between px-6 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <span>Cari tugas, klien...</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 lg:pt-6 mt-14 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
