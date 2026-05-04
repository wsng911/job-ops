import { FileImage, ImagePlus, Plus, Trash2 } from "lucide-react";
import { Alert, Alert描述 } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RichText编辑or } from "./RichText编辑or";
import { fieldId, getByPath, toBoolean, toNumber, toText } from "./utils";

const labelClass名称 =
  "text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground";
const fieldClass名称 = "bg-background/60";
const insetPanelClass名称 =
  "rounded-lg border border-border/60 bg-background/60";
const subtlePanelClass名称 =
  "rounded-lg border border-border/60 bg-muted/20 px-4 py-3";

function normalizeColorValue(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return "#000000";
}

type ColorFieldProps = {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function ColorField({
  id,
  label,
  value,
  disabled = false,
  onChange,
}: ColorFieldProps) {
  const pickerValue = normalizeColorValue(value);

  return (
    <div class名称="grid gap-2">
      <label class名称={labelClass名称} htmlFor={id}>
        {label}
      </label>
      <div class名称="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.currentTarget.value)}
          class名称="h-10 w-12 cursor-pointer rounded-md border border-border/60 bg-background/60 p-1"
          aria-label={label}
          disabled={disabled}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          class名称={fieldClass名称}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

type PictureSectionProps = {
  picture: Record<string, unknown>;
  pictureUploading: boolean;
  pictureEnabled: boolean;
  pictureDisabledReason?: string | null;
  onUploadPicture: () => void;
  on删除Picture: () => void;
  on更新Picture: (key: string, value: unknown) => void;
};

export function PictureSection({
  picture,
  pictureUploading,
  pictureEnabled,
  pictureDisabledReason,
  onUploadPicture,
  on删除Picture,
  on更新Picture,
}: PictureSectionProps) {
  const editDisabled = !pictureEnabled;

  return (
    <div class名称="grid gap-3">
      {!pictureEnabled ? (
        <Alert>
          <Alert描述>
            {pictureDisabledReason ??
              "Pictures require JobOps to be reachable at a public URL."}
          </Alert描述>
        </Alert>
      ) : null}

      {picture.url ? (
        <div
          class名称={`${insetPanelClass名称} flex items-center gap-3 border-dashed p-3`}
        >
          <img
            src={toText(picture.url)}
            alt="Design Resume profile"
            class名称="h-16 w-16 rounded-lg border border-border/60 object-cover"
          />
          <div class名称="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onUploadPicture}
              disabled={pictureUploading || editDisabled}
            >
              <ImagePlus class名称="mr-2 h-4 w-4" />
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              class名称="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              onClick={on删除Picture}
              disabled={pictureUploading}
            >
              <Trash2 class名称="mr-2 h-4 w-4" />
              删除
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          class名称="justify-start border-dashed"
          onClick={onUploadPicture}
          disabled={pictureUploading || editDisabled}
        >
          <FileImage class名称="mr-2 h-4 w-4" />
          {pictureUploading ? "Uploading..." : "Upload image"}
        </Button>
      )}

      <div class名称="grid gap-2">
        <label class名称={labelClass名称} htmlFor={fieldId("picture", "url")}>
          Image URL
        </label>
        <Input
          id={fieldId("picture", "url")}
          value={toText(picture.url)}
          onChange={(event) =>
            on更新Picture("url", event.currentTarget.value)
          }
          class名称={fieldClass名称}
          disabled={editDisabled}
        />
      </div>

      <div
        class名称={`${subtlePanelClass名称} flex items-center justify-between`}
      >
        <div>
          <div class名称="text-sm font-medium text-foreground">
            Show picture
          </div>
          <div class名称="text-xs text-muted-foreground">
            Turn your photo on or off.
          </div>
        </div>
        <Switch
          checked={!toBoolean(picture.hidden, false)}
          onCheckedChange={(checked) => on更新Picture("hidden", !checked)}
          disabled={editDisabled}
        />
      </div>

      <div class名称="grid grid-cols-2 gap-3">
        {[
          ["size", "Size"],
          ["rotation", "Rotation"],
          ["aspectRatio", "Aspect ratio"],
          ["borderRadius", "Border radius"],
          ["borderWidth", "Border width"],
          ["shadowWidth", "Shadow width"],
        ].map(([key, label]) => (
          <div key={key} class名称="grid gap-2">
            <label class名称={labelClass名称} htmlFor={fieldId("picture", key)}>
              {label}
            </label>
            <Input
              id={fieldId("picture", key)}
              type="number"
              value={String(toNumber(picture[key], 0))}
              onChange={(event) =>
                on更新Picture(key, Number(event.currentTarget.value || 0))
              }
              class名称={fieldClass名称}
              disabled={editDisabled}
            />
          </div>
        ))}
        {[
          ["borderColor", "Border color"],
          ["shadowColor", "Shadow color"],
        ].map(([key, label]) => (
          <ColorField
            key={key}
            id={fieldId("picture", key)}
            label={label}
            value={toText(picture[key])}
            disabled={editDisabled}
            onChange={(nextValue) => on更新Picture(key, nextValue)}
          />
        ))}
      </div>
    </div>
  );
}

type BasicsSectionProps = {
  basics: Record<string, unknown>;
  on更新Basics: (path: string, value: unknown) => void;
};

export function BasicsSection({ basics, on更新Basics }: BasicsSectionProps) {
  return (
    <div class名称="grid gap-3">
      {[
        ["name", "名称"],
        ["headline", "Headline"],
        ["email", "邮箱"],
        ["phone", "Phone"],
        ["location", "Location"],
        ["website.url", "Website"],
      ].map(([path, label]) => (
        <div key={path} class名称="grid gap-2">
          <label class名称={labelClass名称} htmlFor={fieldId("basics", path)}>
            {label}
          </label>
          <Input
            id={fieldId("basics", path)}
            value={toText(getByPath(basics, path))}
            onChange={(event) =>
              on更新Basics(path, event.currentTarget.value)
            }
            class名称={fieldClass名称}
          />
        </div>
      ))}
    </div>
  );
}

type BasicsCustomFieldsSectionProps = {
  customFields: Record<string, unknown>[];
  onChange: (nextFields: Record<string, unknown>[]) => void;
};

export function BasicsCustomFieldsSection({
  customFields,
  onChange,
}: BasicsCustomFieldsSectionProps) {
  const moveField = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= customFields.length) return;
    const nextFields = [...customFields];
    const [item] = nextFields.splice(index, 1);
    nextFields.splice(target, 0, item);
    onChange(nextFields);
  };

  return (
    <div class名称="space-y-3">
      {customFields.map((field, index) => (
        <div
          key={toText(field.id, `field-${index}`)}
          class名称={`${insetPanelClass名称} p-3`}
        >
          <div class名称="grid gap-3">
            {[
              ["icon", "Icon"],
              ["text", "Text"],
              ["link", "Link"],
            ].map(([key, label]) => (
              <div key={key} class名称="grid gap-2">
                <label
                  class名称={labelClass名称}
                  htmlFor={fieldId("custom-field", String(index), key)}
                >
                  {label}
                </label>
                <Input
                  id={fieldId("custom-field", String(index), key)}
                  value={toText(field[key])}
                  onChange={(event) => {
                    const nextFields = [...customFields];
                    nextFields[index] = {
                      ...nextFields[index],
                      [key]: event.currentTarget.value,
                    };
                    onChange(nextFields);
                  }}
                  class名称={fieldClass名称}
                />
              </div>
            ))}
          </div>
          <div class名称="mt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => moveField(index, -1)}
            >
              Up
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => moveField(index, 1)}
            >
              Down
            </Button>
            <Button
              type="button"
              variant="ghost"
              class名称="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              onClick={() =>
                onChange(
                  customFields.filter(
                    (_, currentIndex) => currentIndex !== index,
                  ),
                )
              }
            >
              移除
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        class名称="w-full border-dashed"
        onClick={() =>
          onChange([
            ...customFields,
            {
              id: crypto.randomUUID(),
              icon: "",
              text: "",
              link: "",
            },
          ])
        }
      >
        <Plus class名称="mr-2 h-4 w-4" />
        添加 custom field
      </Button>
    </div>
  );
}

type SummarySectionProps = {
  summary: Record<string, unknown>;
  on更新Summary: (key: string, value: unknown) => void;
};

export function SummarySection({
  summary,
  on更新Summary,
}: SummarySectionProps) {
  return (
    <div class名称="space-y-3">
      <div
        class名称={`${subtlePanelClass名称} flex items-center justify-between`}
      >
        <div>
          <div class名称="text-sm font-medium text-foreground">
            Show summary
          </div>
          <div class名称="text-xs text-muted-foreground">
            Show or hide this section on your resume.
          </div>
        </div>
        <Switch
          checked={!toBoolean(summary.hidden, false)}
          onCheckedChange={(checked) => on更新Summary("hidden", !checked)}
        />
      </div>
      <RichText编辑or
        value={toText(summary.content)}
        onChange={(next) => on更新Summary("content", next)}
        placeholder="Summarize the story your resume should tell."
      />
    </div>
  );
}
