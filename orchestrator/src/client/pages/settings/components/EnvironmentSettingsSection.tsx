import * as api from "@client/api";
import { 设置Input } from "@client/pages/settings/components/设置Input";
import { 设置SectionFrame } from "@client/pages/settings/components/设置SectionFrame";
import type { Env设置Values } from "@client/pages/settings/types";
import { formatSecretHint } from "@client/pages/settings/utils";
import type { 更新设置Input } from "@shared/settings-schema.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { showErrorToast } from "@/client/lib/error-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Environment设置SectionProps = {
  values: Env设置Values;
  isLoading: boolean;
  isSaving: boolean;
  layoutMode?: "accordion" | "panel";
};

const workspaceUsersQueryKey = ["workspaces", "users"] as const;
const currentAuthUserQueryKey = ["auth", "me"] as const;

function AccountManagementSection() {
  const queryClient = useQueryClient();
  const [username, set用户名] = useState("");
  const [display名称, setDisplay名称] = useState("");
  const [password, set密码] = useState("");
  const [reset密码ByUserId, setReset密码ByUserId] = useState<
    Record<string, string>
  >({});

  const meQuery = useQuery({
    queryKey: currentAuthUserQueryKey,
    queryFn: api.getCurrentAuthUser,
    retry: false,
  });
  const usersQuery = useQuery({
    queryKey: workspaceUsersQueryKey,
    queryFn: api.listWorkspaceUsers,
    enabled: meQuery.data?.isSystemAdmin === true,
  });

  const createUserMutation = useMutation({
    mutationFn: api.createWorkspaceUser,
    onSuccess: async () => {
      set用户名("");
      setDisplay名称("");
      set密码("");
      await queryClient.invalidateQueries({ queryKey: workspaceUsersQueryKey });
      toast.success("User created");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create user");
    },
  });

  const disableUserMutation = useMutation({
    mutationFn: (input: { userId: string; isDisabled: boolean }) =>
      api.setWorkspaceUserDisabled(input.userId, input.isDisabled),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workspaceUsersQueryKey });
      toast.success("User updated");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update user");
    },
  });

  const reset密码Mutation = useMutation({
    mutationFn: (input: { userId: string; password: string }) =>
      api.resetWorkspaceUser密码(input.userId, input.password),
    onSuccess: async (_data, variables) => {
      setReset密码ByUserId((current) => ({
        ...current,
        [variables.userId]: "",
      }));
      toast.success("密码 reset");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to reset password");
    },
  });

  if (!meQuery.data?.isSystemAdmin) {
    return (
      <div class名称="space-y-2">
        <div class名称="text-sm font-semibold">Workspace</div>
        <p class名称="text-sm text-muted-foreground">
          Signed in as {meQuery.data?.username ?? "a workspace user"}.
        </p>
      </div>
    );
  }

  const users = usersQuery.data ?? [];

  return (
    <div class名称="space-y-5">
      <div class名称="space-y-1">
        <div class名称="text-sm font-semibold">Workspace Users</div>
        <p class名称="text-sm text-muted-foreground">
          Each user gets a private workspace with isolated jobs and settings.
        </p>
      </div>

      <div class名称="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <Input
          value={display名称}
          onChange={(event) => setDisplay名称(event.currentTarget.value)}
          placeholder="名称"
        />
        <Input
          value={username}
          onChange={(event) => set用户名(event.currentTarget.value)}
          placeholder="用户名"
          autoComplete="off"
        />
        <Input
          value={password}
          onChange={(event) => set密码(event.currentTarget.value)}
          placeholder="Temporary password"
          type="password"
          autoComplete="new-password"
        />
        <Button
          type="button"
          onClick={() =>
            createUserMutation.mutate({
              username,
              display名称: display名称 || username,
              password,
            })
          }
          disabled={
            createUserMutation.isPending ||
            username.trim().length === 0 ||
            password.length < 8
          }
        >
          创建
        </Button>
      </div>

      <div class名称="divide-y divide-border rounded-md border border-border">
        {users.map((user) => {
          const reset密码 = reset密码ByUserId[user.id] ?? "";
          return (
            <div
              class名称="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
              key={user.id}
            >
              <div class名称="min-w-0">
                <div class名称="flex flex-wrap items-center gap-2">
                  <span class名称="truncate text-sm font-medium">
                    {user.display名称 || user.username}
                  </span>
                  <Badge variant="outline">{user.username}</Badge>
                  {user.isSystemAdmin ? (
                    <Badge variant="secondary">System admin</Badge>
                  ) : null}
                  {user.isDisabled ? (
                    <Badge variant="destructive">Disabled</Badge>
                  ) : null}
                </div>
                <div class名称="mt-1 text-xs text-muted-foreground">
                  {user.workspace名称}
                </div>
              </div>
              <div class名称="flex gap-2">
                <Input
                  value={reset密码}
                  onChange={(event) =>
                    setReset密码ByUserId((current) => ({
                      ...current,
                      [user.id]: event.currentTarget.value,
                    }))
                  }
                  placeholder="新建 password"
                  type="password"
                  autoComplete="new-password"
                  class名称="h-8 w-40"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={
                    reset密码Mutation.isPending || reset密码.length < 8
                  }
                  onClick={() =>
                    reset密码Mutation.mutate({
                      userId: user.id,
                      password: reset密码,
                    })
                  }
                >
                  Reset
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  disableUserMutation.isPending || user.id === meQuery.data?.id
                }
                onClick={() =>
                  disableUserMutation.mutate({
                    userId: user.id,
                    isDisabled: !user.isDisabled,
                  })
                }
              >
                {user.isDisabled ? "Enable" : "Disable"}
              </Button>
            </div>
          );
        })}
        {users.length === 0 ? (
          <div class名称="p-3 text-sm text-muted-foreground">
            否 users found.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const Environment设置Section: React.FC<
  Environment设置SectionProps
> = ({ values, isLoading, isSaving, layoutMode }) => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<更新设置Input>();
  const { private: privateValues } = values;

  const isBasicAuthEnabled = watch("enableBasicAuth");

  return (
    <设置SectionFrame
      mode={layoutMode}
      title="Environment & Workspaces"
      value="environment"
    >
      <div class名称="space-y-8">
        <div class名称="space-y-6">
          <div class名称="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Service Accounts
          </div>

          <div class名称="space-y-4">
            <div class名称="text-sm font-semibold">UKVisaJobs</div>
            <div class名称="grid gap-4 md:grid-cols-2">
              <设置Input
                label="邮箱"
                inputProps={register("ukvisajobs邮箱")}
                placeholder="you@example.com"
                disabled={isLoading || isSaving}
                error={errors.ukvisajobs邮箱?.message as string | undefined}
              />
              <设置Input
                label="密码"
                inputProps={register("ukvisajobs密码")}
                type="password"
                placeholder="Enter new password"
                disabled={isLoading || isSaving}
                error={errors.ukvisajobs密码?.message as string | undefined}
                current={formatSecretHint(privateValues.ukvisajobs密码Hint)}
              />
            </div>
          </div>

          <div class名称="space-y-4">
            <div class名称="text-sm font-semibold">Adzuna</div>
            <div class名称="grid gap-4 md:grid-cols-2">
              <设置Input
                label="App ID"
                inputProps={register("adzunaAppId")}
                placeholder="your-app-id"
                disabled={isLoading || isSaving}
                error={errors.adzunaAppId?.message as string | undefined}
              />
              <设置Input
                label="App Key"
                inputProps={register("adzunaAppKey")}
                type="password"
                placeholder="Enter new app key"
                disabled={isLoading || isSaving}
                error={errors.adzunaAppKey?.message as string | undefined}
                current={formatSecretHint(privateValues.adzunaAppKeyHint)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div class名称="space-y-4">
          <div class名称="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Security
          </div>
          <AccountManagementSection />
          <Separator />
          <div class名称="flex items-start space-x-3">
            <Controller
              name="enableBasicAuth"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="enableBasicAuth"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading || isSaving}
                />
              )}
            />
            <div class名称="flex flex-col gap-1.5">
              <label
                htmlFor="enableBasicAuth"
                class名称="cursor-pointer text-sm font-medium leading-none"
              >
                Enable authentication
              </label>
              <p class名称="text-xs text-muted-foreground">
                Require a username and password to sign in and access protected
                routes.
              </p>
            </div>
          </div>

          {isBasicAuthEnabled && (
            <div class名称="grid gap-4 pt-2 md:grid-cols-2">
              <设置Input
                label="用户名"
                inputProps={register("basicAuthUser")}
                placeholder="username"
                disabled={isLoading || isSaving}
                error={errors.basicAuthUser?.message as string | undefined}
              />

              <设置Input
                label="密码"
                inputProps={register("basicAuth密码")}
                type="password"
                placeholder="Enter new password"
                disabled={isLoading || isSaving}
                error={errors.basicAuth密码?.message as string | undefined}
              />
            </div>
          )}
        </div>
      </div>
    </设置SectionFrame>
  );
};
