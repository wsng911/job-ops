import {
  getAuthBootstrap状态,
  hasAuthenticatedSession,
  restoreAuthSessionFromLegacyCredentials,
  setupFirstAdmin,
  signInWithCredentials,
} from "@client/api";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  Card描述,
  CardHeader,
  Card标题,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  loadRememberedAuthUsers,
  rememberAuthUser,
} from "../lib/remembered-auth-users";

function resolveNextPath(rawNext: string | null): string {
  if (!rawNext || !rawNext.startsWith("/")) return "/jobs/ready";
  if (rawNext === "/sign-in" || rawNext.startsWith("/sign-in?")) {
    return "/jobs/ready";
  }
  return rawNext;
}

export function SignInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, set用户名] = useState("");
  const [display名称, setDisplay名称] = useState("");
  const [password, set密码] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [isBusy, setIsBusy] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberedUsers, setRememberedUsers] = useState(() =>
    loadRememberedAuthUsers(),
  );

  const nextPath = useMemo(() => {
    const params = new URL搜索Params(location.search);
    return resolveNextPath(params.get("next"));
  }, [location.search]);

  useEffect(() => {
    const params = new URL搜索Params(location.search);
    const remembered用户名 = params.get("user")?.trim();
    if (remembered用户名) {
      set用户名(remembered用户名);
      set密码("");
    }
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const bootstrap = await getAuthBootstrap状态();
        if (cancelled) return;
        setSetupRequired(bootstrap.setupRequired);
        if (bootstrap.setupRequired) return;

        const restored = await restoreAuthSessionFromLegacyCredentials();
        if (cancelled) return;
        if (restored || hasAuthenticatedSession()) {
          navigate(nextPath, { replace: true });
          return;
        }
      } finally {
        if (!cancelled) {
          setIsBusy(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath]);

  const handle提交 = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized用户名 = username.trim();
    if (!normalized用户名 || !password) {
      setErrorMessage("Enter both username and password.");
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      if (setupRequired) {
        const user = await setupFirstAdmin({
          username: normalized用户名,
          password,
          display名称: display名称.trim() || normalized用户名,
        });
        setRememberedUsers(
          rememberAuthUser({
            username: user.username,
            display名称: user.display名称,
          }),
        );
      } else {
        await signInWithCredentials(normalized用户名, password);
        setRememberedUsers(
          rememberAuthUser({
            username: normalized用户名,
          }),
        );
      }
      navigate(nextPath, { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in",
      );
      setIsBusy(false);
    }
  };

  return (
    <main class名称="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.08),_transparent_45%),linear-gradient(180deg,_rgba(15,23,42,0.02),_transparent_30%)] px-4 py-16">
      <div class名称="mx-auto flex min-h-[70vh] max-w-md items-center">
        <Card class名称="w-full border-border/60 bg-background/95 shadow-xl">
          <CardHeader class名称="space-y-2">
            <Card标题 class名称="text-2xl tracking-tight">登录</Card标题>
            <Card描述>
              {setupRequired
                ? "创建 the first system admin for this JobOps instance."
                : "Enter your JobOps username and password."}
            </Card描述>
          </CardHeader>
          <CardContent>
            {!setupRequired && rememberedUsers.length > 0 ? (
              <div class名称="mb-5 space-y-2">
                <div class名称="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Remembered on this browser
                </div>
                <div class名称="flex flex-wrap gap-2">
                  {rememberedUsers.map((user) => (
                    <Button
                      key={user.username}
                      type="button"
                      variant={
                        username.trim() === user.username
                          ? "secondary"
                          : "outline"
                      }
                      size="sm"
                      class名称="h-8 max-w-full px-2.5"
                      disabled={isBusy}
                      onClick={() => {
                        set用户名(user.username);
                        set密码("");
                        setErrorMessage(null);
                      }}
                    >
                      <span class名称="truncate">
                        {user.display名称 ?? user.username}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
            <form class名称="space-y-4" on提交={handle提交}>
              {setupRequired ? (
                <div class名称="space-y-2">
                  <label
                    class名称="text-sm font-medium"
                    htmlFor="auth-display-name"
                  >
                    名称
                  </label>
                  <Input
                    id="auth-display-name"
                    autoComplete="name"
                    value={display名称}
                    onChange={(event) =>
                      setDisplay名称(event.currentTarget.value)
                    }
                    placeholder="Your name"
                    disabled={isBusy}
                  />
                </div>
              ) : null}
              <div class名称="space-y-2">
                <label class名称="text-sm font-medium" htmlFor="auth-username">
                  用户名
                </label>
                <Input
                  id="auth-username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => set用户名(event.currentTarget.value)}
                  placeholder="Enter username"
                  disabled={isBusy}
                />
              </div>
              <div class名称="space-y-2">
                <label class名称="text-sm font-medium" htmlFor="auth-password">
                  密码
                </label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => set密码(event.currentTarget.value)}
                  placeholder="Enter password"
                  disabled={isBusy}
                />
              </div>
              {errorMessage ? (
                <p class名称="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              ) : null}
              <Button class名称="w-full" type="submit" disabled={isBusy}>
                {isBusy
                  ? setupRequired
                    ? "Creating account..."
                    : "Signing in..."
                  : setupRequired
                    ? "创建 workspace"
                    : "登录"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
