"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, LogIn, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@pizzapos.com",
      password: "admin123",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Login failed. Check your credentials.");
        return;
      }

      toast.success(`Welcome back, ${result.data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login Submission Error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: "ADMIN" | "CASHIER") => {
    if (role === "ADMIN") {
      setValue("email", "admin@pizzapos.com");
      setValue("password", "admin123");
      toast.info("Filled Admin demo credentials");
    } else {
      setValue("email", "cashier@pizzapos.com");
      setValue("password", "cashier123");
      toast.info("Filled Cashier demo credentials");
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="admin@pizzapos.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
          leftIcon={<LogIn className="h-5 w-5" />}
        >
          Sign In to Terminal
        </Button>
      </form>

      {/* Quick Demo Login Credentials */}
      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider">
          <KeyRound className="h-3.5 w-3.5 text-pizza-500" />
          <span>Quick Demo Access Accounts</span>
        </div>
        <p className="text-slate-500 text-[11px]">Click below to auto-fill credentials for testing:</p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => fillDemoCredentials("ADMIN")}
            className="rounded-xl border border-pizza-200 bg-pizza-50 px-3 py-2 text-left font-bold text-pizza-700 hover:bg-pizza-100 transition-colors"
          >
            🔑 Admin Account
            <span className="block text-[10px] text-pizza-600 font-normal">Full Access</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemoCredentials("CASHIER")}
            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-left font-bold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            🍕 Cashier Account
            <span className="block text-[10px] text-blue-600 font-normal">Terminal POS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
