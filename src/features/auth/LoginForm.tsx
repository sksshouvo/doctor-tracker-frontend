"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/common/FormField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toApiError } from "@/lib/api-error";
import { safeNext } from "@/lib/format";
import { authApi } from "./api";
import { loginSchema, type LoginValues } from "./schemas";
import { useAuth } from "./store";

const DEMO = { email: "admin@doctortracker.dev", password: "Admin@12345" };
const showDemo =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_DEMO_CREDS === "true";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setSession = useAuth((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (params.get("expired")) toast.info("Your session expired. Please sign in again.");
  }, [params]);

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      const { accessToken, user } = await authApi.login(values);
      setSession(accessToken, user);
      router.replace(safeNext(params.get("next")));
    } catch (err) {
      const e = toApiError(err);
      if (e.status === 401) {
        setFormError("Invalid email or password");
        setValue("password", "");
        setFocus("password");
      } else if (e.status === 429) {
        setFormError(e.message);
      } else if (e.isNetwork) {
        setFormError("Can't reach the server. Check your connection.");
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle aria-hidden />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FormField label="Email" error={errors.email?.message} required>
        {(a) => (
          <Input
            {...a}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@hospital.com"
            autoFocus
            {...register("email")}
          />
        )}
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        {(a) => (
          <div className="relative">
            <Input
              {...a}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-10"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </Button>
          </div>
        )}
      </FormField>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      {showDemo && (
        <div className="bg-muted/60 text-muted-foreground flex gap-2 rounded-lg border border-dashed p-3 text-xs">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="space-y-1">
            <p className="text-foreground font-medium">Demo credentials</p>
            <p>
              {DEMO.email} / {DEMO.password}
            </p>
            <button
              type="button"
              className="text-primary font-medium underline-offset-2 hover:underline"
              onClick={() => {
                setValue("email", DEMO.email, { shouldValidate: true });
                setValue("password", DEMO.password, { shouldValidate: true });
              }}
            >
              Fill in
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
