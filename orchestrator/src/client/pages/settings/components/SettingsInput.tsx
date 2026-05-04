import type React from "react";

import { Input } from "@/components/ui/input";

type 设置InputProps = {
  label: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  error?: string;
  helper?: React.React否de;
  current?: string;
};

export const 设置Input: React.FC<设置InputProps> = ({
  label,
  inputProps,
  placeholder,
  type = "text",
  disabled,
  error,
  helper,
  current,
}) => {
  const id = inputProps.id || inputProps.name;

  return (
    <div class名称="space-y-2">
      {label && (
        <label htmlFor={id} class名称="text-sm font-medium">
          {label}
        </label>
      )}
      <Input
        {...inputProps}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <p class名称="text-xs text-destructive">{error}</p>}
      {current && (
        <div class名称="text-xs text-muted-foreground">{current}</div>
      )}
      {helper && <div class名称="text-xs text-muted-foreground">{helper}</div>}
    </div>
  );
};
