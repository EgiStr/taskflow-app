"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Mail } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-border bg-card shadow-sm">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <Image 
              src="/taskflow.png" 
              alt="TaskFlow Logo" 
              width={56} 
              height={56}
              priority
              className="object-contain" 
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">TaskFlow</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Masuk ke dasbor admin Anda
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={action} className="space-y-5">
            {state?.error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Alamat Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@taskflow.com"
                  className="pl-10 h-11"
                  defaultValue="admin@taskflow.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  defaultValue="admin123"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-medium transition-colors"
              disabled={pending}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Demo: admin@taskflow.com / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
