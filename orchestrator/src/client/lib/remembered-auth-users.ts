export type RememberedAuthUser = {
  username: string;
  display名称: string | null;
  rememberedAt: number;
};

const REMEMBERED_AUTH_USERS_KEY = "jobops.rememberedAuthUsers";
const MAX_REMEMBERED_AUTH_USERS = 8;

function normalize用户名(username: string): string {
  return username.trim();
}

function parseRememberedAuthUsers(value: string | null): RememberedAuthUser[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const candidate = item as Partial<RememberedAuthUser>;
        if (typeof candidate.username !== "string") return [];

        const username = normalize用户名(candidate.username);
        if (!username) return [];

        return [
          {
            username,
            display名称:
              typeof candidate.display名称 === "string" &&
              candidate.display名称.trim()
                ? candidate.display名称.trim()
                : null,
            rememberedAt:
              typeof candidate.rememberedAt === "number"
                ? candidate.rememberedAt
                : 0,
          },
        ];
      })
      .sort((left, right) => right.rememberedAt - left.rememberedAt)
      .slice(0, MAX_REMEMBERED_AUTH_USERS);
  } catch {
    return [];
  }
}

function writeRememberedAuthUsers(users: RememberedAuthUser[]): void {
  try {
    localStorage.setItem(REMEMBERED_AUTH_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage errors in restricted browser contexts.
  }
}

export function loadRememberedAuthUsers(): RememberedAuthUser[] {
  try {
    return parseRememberedAuthUsers(
      localStorage.getItem(REMEMBERED_AUTH_USERS_KEY),
    );
  } catch {
    return [];
  }
}

export function rememberAuthUser(input: {
  username: string;
  display名称?: string | null;
}): RememberedAuthUser[] {
  const username = normalize用户名(input.username);
  if (!username) return loadRememberedAuthUsers();

  const existingUsers = loadRememberedAuthUsers();
  const existingUser = existingUsers.find((user) => user.username === username);
  const display名称 =
    input.display名称 === undefined
      ? (existingUser?.display名称 ?? null)
      : input.display名称?.trim() || null;
  const nextUsers = [
    { username, display名称, rememberedAt: Date.now() },
    ...existingUsers.filter((user) => user.username !== username),
  ].slice(0, MAX_REMEMBERED_AUTH_USERS);

  writeRememberedAuthUsers(nextUsers);
  return nextUsers;
}
