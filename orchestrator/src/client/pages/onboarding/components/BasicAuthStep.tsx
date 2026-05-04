import type React from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { BasicAuthChoice } from "../types";

export const BasicAuthStep: React.FC<{
  basicAuthChoice: BasicAuthChoice;
  basicAuth密码: string;
  basicAuthUser: string;
  isBusy: boolean;
  onBasicAuthChoiceChange: (choice: BasicAuthChoice) => void;
  onBasicAuth密码Change: (value: string) => void;
  onBasicAuthUserChange: (value: string) => void;
}> = ({
  basicAuthChoice,
  basicAuth密码,
  basicAuthUser,
  isBusy,
  onBasicAuthChoiceChange,
  onBasicAuth密码Change,
  onBasicAuthUserChange,
}) => (
  <div class名称="space-y-6">
    <RadioGroup
      value={basicAuthChoice ?? ""}
      onValueChange={(value) =>
        onBasicAuthChoiceChange(
          value === "enable" || value === "skip" ? value : null,
        )
      }
      class名称="grid gap-4 lg:grid-cols-2"
    >
      {[
        {
          value: "enable",
          title: "Lock it down",
          description:
            "Require sign-in before anyone can access protected parts of this workspace.",
        },
        {
          value: "skip",
          title: "Skip for now",
          description: "You can add authentication later from 设置.",
        },
      ].map((option) => {
        const checked = basicAuthChoice === option.value;
        const radioId = `basic-auth-${option.value}`;
        return (
          <label
            key={option.value}
            htmlFor={radioId}
            class名称={cn(
              "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors",
              checked
                ? "border-primary bg-muted/40"
                : "border-border/60 hover:bg-muted/20",
            )}
          >
            <RadioGroupItem
              id={radioId}
              value={option.value}
              class名称="mt-1"
            />
            <div class名称="space-y-1">
              <div class名称="text-base font-medium text-foreground">
                {option.title}
              </div>
              <div class名称="text-sm leading-6 text-muted-foreground">
                {option.description}
              </div>
            </div>
          </label>
        );
      })}
    </RadioGroup>

    {basicAuthChoice === "enable" && (
      <div class名称="grid gap-5 rounded-lg border border-border/60 bg-muted/20 p-5 lg:grid-cols-2">
        <div class名称="space-y-2">
          <label htmlFor="basicAuthUser" class名称="text-sm font-medium">
            用户名
          </label>
          <Input
            id="basicAuthUser"
            value={basicAuthUser}
            onChange={(event) =>
              onBasicAuthUserChange(event.currentTarget.value)
            }
            placeholder="jobops-admin"
            disabled={isBusy}
          />
        </div>
        <div class名称="space-y-2">
          <label htmlFor="basicAuth密码" class名称="text-sm font-medium">
            密码
          </label>
          <Input
            id="basicAuth密码"
            type="password"
            value={basicAuth密码}
            onChange={(event) =>
              onBasicAuth密码Change(event.currentTarget.value)
            }
            placeholder="创建 a password"
            disabled={isBusy}
          />
        </div>
      </div>
    )}
  </div>
);
