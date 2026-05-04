import { createApp设置, createJob } from "@shared/testing/factories.js";
import { describe, expect, it } from "vitest";
import { getEnabledSources, getJobCounts } from "./utils";

describe("orchestrator utils", () => {
  it("enables adzuna only when both app id and key are configured", () => {
    const withCreds = createApp设置({
      adzunaAppId: "app-id",
      adzunaAppKeyHint: "key-",
    });
    const withoutKey = createApp设置({
      adzunaAppId: "app-id",
      adzunaAppKeyHint: null,
    });

    expect(getEnabledSources(withCreds)).toContain("adzuna");
    expect(getEnabledSources(withoutKey)).not.toContain("adzuna");
  });

  it("enables startupjobs without credentials", () => {
    expect(getEnabledSources(createApp设置())).toContain("startupjobs");
  });

  it("enables workingnomads without credentials", () => {
    expect(getEnabledSources(createApp设置())).toContain("workingnomads");
  });

  it("enables golangjobs without credentials", () => {
    expect(getEnabledSources(createApp设置())).toContain("golangjobs");
  });

  it("enables jobindex without credentials", () => {
    expect(getEnabledSources(createApp设置())).toContain("jobindex");
  });

  it("enables seek only when apify token is configured", () => {
    const withToken = createApp设置({ apifyTokenHint: "sk-" });
    const withoutToken = createApp设置({ apifyTokenHint: null });
    expect(getEnabledSources(withToken)).toContain("seek");
    expect(getEnabledSources(withoutToken)).not.toContain("seek");
  });

  it("enables naukri without credentials", () => {
    expect(getEnabledSources(createApp设置())).toContain("naukri");
  });

  it("counts processing jobs in ready and discovered tabs", () => {
    const jobs = [
      createJob({ id: "ready", status: "ready", closedAt: null }),
      createJob({ id: "processing", status: "processing", closedAt: null }),
      createJob({ id: "discovered", status: "discovered", closedAt: null }),
      createJob({ id: "applied", status: "applied", closedAt: null }),
    ];

    expect(getJobCounts(jobs)).toEqual({
      ready: 2,
      discovered: 2,
      applied: 1,
      all: 4,
    });
  });
});
