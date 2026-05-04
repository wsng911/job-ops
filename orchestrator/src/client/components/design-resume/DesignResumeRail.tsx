import type { DesignResumeDocument, DesignResumeJson } from "@shared/types";
import { Accordion } from "@/components/ui/accordion";
import {
  BasicsCustomFieldsSection,
  BasicsSection,
  PictureSection,
  SummarySection,
} from "./DesignResumeInlineSections";
import { DesignResumeListSection } from "./DesignResumeListSection";
import { DesignResumeSection } from "./DesignResumeSection";
import { ITEM_DEFINITIONS, type ItemDefinition } from "./definitions";
import { asArray, asRecord, setByPath } from "./utils";

type DesignResumeRailProps = {
  draft: DesignResumeDocument;
  on更新ResumeJson: (
    updater: (resumeJson: DesignResumeJson) => DesignResumeJson,
  ) => void;
  onOpenDialog: (definition: ItemDefinition, index: number | null) => void;
  onUploadPicture: () => void;
  on删除Picture: () => void;
  pictureUploading: boolean;
  pictureEnabled: boolean;
  pictureDisabledReason?: string | null;
};

export function DesignResumeRail({
  draft,
  on更新ResumeJson,
  onOpenDialog,
  onUploadPicture,
  on删除Picture,
  pictureUploading,
  pictureEnabled,
  pictureDisabledReason,
}: DesignResumeRailProps) {
  const resumeJson = draft.resumeJson as Record<string, unknown>;
  const basics = (asRecord(resumeJson.basics) ?? {}) as Record<string, unknown>;
  const picture = (asRecord(resumeJson.picture) ?? {}) as Record<
    string,
    unknown
  >;
  const summary = (asRecord(resumeJson.summary) ?? {}) as Record<
    string,
    unknown
  >;
  const sections = (asRecord(resumeJson.sections) ?? {}) as Record<
    string,
    unknown
  >;
  const customFields = asArray(basics.customFields) as Record<
    string,
    unknown
  >[];

  const updateBasics = (path: string, value: unknown) => {
    on更新ResumeJson((current) => {
      const next = structuredClone(current);
      const currentBasics = (asRecord(next.basics) ?? {}) as Record<
        string,
        unknown
      >;
      next.basics = setByPath(
        currentBasics,
        path,
        value,
      ) as DesignResumeJson["basics"];
      return next;
    });
  };

  const updatePicture = (key: string, value: unknown) => {
    on更新ResumeJson((current) => {
      const next = structuredClone(current);
      const currentPicture = (asRecord(next.picture) ?? {}) as Record<
        string,
        unknown
      >;
      next.picture = {
        ...currentPicture,
        [key]: value,
      } as DesignResumeJson["picture"];
      return next;
    });
  };

  const updateSummary = (key: string, value: unknown) => {
    on更新ResumeJson((current) => {
      const next = structuredClone(current);
      const currentSummary = (asRecord(next.summary) ?? {}) as Record<
        string,
        unknown
      >;
      next.summary = {
        ...currentSummary,
        [key]: value,
      } as DesignResumeJson["summary"];
      return next;
    });
  };

  const updateCustomFields = (nextFields: Record<string, unknown>[]) => {
    on更新ResumeJson((current) => {
      const next = structuredClone(current);
      const currentBasics = (asRecord(next.basics) ?? {}) as Record<
        string,
        unknown
      >;
      next.basics = {
        ...currentBasics,
        customFields: nextFields,
      } as DesignResumeJson["basics"];
      return next;
    });
  };

  const updateSectionItems = (
    sectionKey: string,
    nextItems: Record<string, unknown>[],
  ) => {
    on更新ResumeJson((current) => {
      const next = structuredClone(current);
      const currentSections = (asRecord(next.sections) ?? {}) as Record<
        string,
        unknown
      >;
      next.sections = {
        ...currentSections,
        [sectionKey]: {
          ...(asRecord(currentSections[sectionKey]) ?? {}),
          // Keep edited sections visible in preview/PDF when items are managed here.
          hidden: false,
          items: nextItems,
        },
      } as DesignResumeJson["sections"];
      return next;
    });
  };

  return (
    <Accordion type="multiple" defaultValue={[]} class名称="space-y-3">
      <DesignResumeSection
        value="picture"
        title="Picture"
        subtitle="Manage your resume photo and how it appears."
      >
        <PictureSection
          picture={picture}
          pictureUploading={pictureUploading}
          pictureEnabled={pictureEnabled}
          pictureDisabledReason={pictureDisabledReason}
          onUploadPicture={onUploadPicture}
          on删除Picture={on删除Picture}
          on更新Picture={updatePicture}
        />
      </DesignResumeSection>

      <DesignResumeSection
        value="basics"
        title="Basics"
        subtitle="编辑 your name, headline, and contact details."
      >
        <BasicsSection basics={basics} on更新Basics={updateBasics} />
      </DesignResumeSection>

      <DesignResumeSection
        value="basics-custom-fields"
        title="Basics Custom Fields"
        subtitle="添加 extra links or short details near your contact info."
        badge={customFields.length === 0 ? "Empty" : `${customFields.length}`}
      >
        <BasicsCustomFieldsSection
          customFields={customFields}
          onChange={updateCustomFields}
        />
      </DesignResumeSection>

      <DesignResumeSection
        value="summary"
        title="Summary"
        subtitle="Write the short intro that appears near the top of your resume."
      >
        <SummarySection summary={summary} on更新Summary={updateSummary} />
      </DesignResumeSection>

      {ITEM_DEFINITIONS.map((definition) => {
        const section = (asRecord(sections[definition.key]) ?? {}) as Record<
          string,
          unknown
        >;
        const items = asArray(section.items).map(
          (item) => asRecord(item) ?? {},
        ) as Record<string, unknown>[];

        return (
          <DesignResumeListSection
            key={definition.key}
            definition={definition}
            items={items}
            on添加={() => onOpenDialog(definition, null)}
            on编辑={(index) => onOpenDialog(definition, index)}
            on更新Items={(nextItems) =>
              updateSectionItems(definition.key, nextItems)
            }
          />
        );
      })}
    </Accordion>
  );
}
