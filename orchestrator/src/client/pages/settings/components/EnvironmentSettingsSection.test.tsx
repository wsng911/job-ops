import type { 更新设置Input } from "@shared/settings-schema.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { Accordion } from "@/components/ui/accordion";
import { Environment设置Section } from "./Environment设置Section";

const Environment设置Harness = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const methods = useForm<更新设置Input>({
    defaultValues: {
      ukvisajobs邮箱: "visa@example.com",
      basicAuthUser: "admin",
      ukvisajobs密码: "",
      adzunaAppId: "adzuna-id",
      adzunaAppKey: "",
      basicAuth密码: "super-secret",
      webhookSecret: "",
      enableBasicAuth: true,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>
        <Accordion type="multiple" defaultValue={["environment"]}>
          <Environment设置Section
            values={{
              readable: {
                ukvisajobs邮箱: "visa@example.com",
                adzunaAppId: "adzuna-id",
                basicAuthUser: "admin",
                basicAuth密码: "super-secret",
              },
              private: {
                ukvisajobs密码Hint: "pass",
                adzunaAppKeyHint: "adzu",
                basicAuth密码Hint: "abcd",
                webhookSecretHint: "sec-",
              },
              basicAuthActive: true,
            }}
            isLoading={false}
            isSaving={false}
          />
        </Accordion>
      </FormProvider>
    </QueryClientProvider>
  );
};

describe("Environment设置Section", () => {
  it("renders values grouped logically and masks private secrets with hints", () => {
    render(<Environment设置Harness />);

    expect(screen.getByDisplayValue("visa@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("adzuna-id")).toBeInTheDocument();

    expect(screen.getByText(/pass\*{8}/)).toBeInTheDocument();
    expect(screen.getByText(/adzu\*{8}/)).toBeInTheDocument();
    // Authentication
    expect(screen.getByLabelText("Enable authentication")).toBeChecked();
    expect(screen.getByDisplayValue("admin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("super-secret")).toBeInTheDocument();

    // Sections
    expect(screen.getByText("Service Accounts")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.queryByText("RxResume")).not.toBeInTheDocument();
  });
});
