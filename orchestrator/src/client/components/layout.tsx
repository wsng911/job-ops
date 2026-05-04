/**
 * Shared layout components for consistent page structure.
 */

import { logout } from "@client/api";
import {
  ExternalLink,
  LogOut,
  type LucideIcon,
  Menu,
  UserRound,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  Sheet标题,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useVersionCheck } from "../hooks/useVersionCheck";
import {
  loadRememberedAuthUsers,
  type RememberedAuthUser,
} from "../lib/remembered-auth-users";
import { isNavActive, NAV_LINKS } from "./navigation";
import { 状态BadgeIndicator } from "./状态Indicator";

const buildSignInPath = (username: string, nextPath: string): string => {
  const params = new URL搜索Params();
  params.set("user", username);
  if (
    nextPath &&
    nextPath !== "/sign-in" &&
    !nextPath.startsWith("/sign-in?")
  ) {
    params.set("next", nextPath);
  }
  return `/sign-in?${params.toString()}`;
};

// ============================================================================
// Page Header
// ============================================================================

interface PageHeaderProps {
  icon: LucideIcon | React.FC<{ class名称?: string }>;
  title: string;
  subtitle: string;
  badge?: string;
  statusIndicator?: React.React否de;
  actions?: React.React否de;
  showVersionFooter?: boolean;
  navOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  statusIndicator,
  actions,
  showVersionFooter = true,
  navOpen: controlledNavOpen,
  onNavOpenChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [internalNavOpen, setInternalNavOpen] = useState(false);
  const [rememberedUsers, setRememberedUsers] = useState<RememberedAuthUser[]>(
    () => loadRememberedAuthUsers(),
  );
  const navOpen = controlledNavOpen ?? internalNavOpen;
  const setNavOpen = onNavOpenChange ?? setInternalNavOpen;
  const { version, updateAvailable } = useVersionCheck();

  useEffect(() => {
    if (navOpen) {
      setRememberedUsers(loadRememberedAuthUsers());
    }
  }, [navOpen]);

  const handleNavClick = (to: string, activePaths?: string[]) => {
    if (isNavActive(location.pathname, to, activePaths)) {
      setNavOpen(false);
      return;
    }
    setNavOpen(false);
    setTimeout(() => navigate(to), 150);
  };

  const handleRememberedUserClick = async (username: string) => {
    setNavOpen(false);
    await logout({ redirect: false });
    navigate(buildSignInPath(username, location.pathname), { replace: true });
  };

  const handleSignOut = async () => {
    setNavOpen(false);
    await logout();
  };

  return (
    <header class名称="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class名称="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div class名称="flex min-w-0 items-center gap-3">
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu class名称="h-5 w-5" />
                <span class名称="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class名称="w-64 flex flex-col">
              <SheetHeader>
                <Sheet标题>JobOps</Sheet标题>
              </SheetHeader>
              <nav class名称="mt-6 flex flex-col gap-2">
                {NAV_LINKS.map(({ to, label, icon: NavIcon, activePaths }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => handleNavClick(to, activePaths)}
                    class名称={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-left",
                      isNavActive(location.pathname, to, activePaths)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <NavIcon class名称="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
              <div class名称="mt-auto space-y-4 pt-6 pb-2">
                <div class名称="space-y-2 border-t border-border/60 pt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        class名称="h-8 w-full justify-start gap-2 px-2 text-xs"
                      >
                        <UserRound class名称="h-3.5 w-3.5" />
                        <span>Account</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" class名称="w-56">
                      <DropdownMenuLabel>Remembered</DropdownMenuLabel>
                      {rememberedUsers.length > 0 ? (
                        rememberedUsers.map((user) => (
                          <DropdownMenuItem
                            key={user.username}
                            onSelect={() =>
                              void handleRememberedUserClick(user.username)
                            }
                            class名称="flex min-w-0 items-start gap-2"
                          >
                            <UserRound class名称="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span class名称="min-w-0">
                              <span class名称="block truncate font-medium">
                                {user.display名称 ?? user.username}
                              </span>
                              {user.display名称 ? (
                                <span class名称="block truncate text-xs text-muted-foreground">
                                  {user.username}
                                </span>
                              ) : null}
                            </span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>
                          登录 once to remember a username here.
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => void handleSignOut()}
                        class名称="gap-2"
                      >
                        <LogOut class名称="h-3.5 w-3.5" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {showVersionFooter && (
                  <TooltipProvider>
                    <div class名称="flex flex-col items-start gap-2">
                      <a
                        href="https://github.com/DaKheera47/job-ops/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        class名称="flex min-w-0 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span class名称="truncate">Version {version}</span>
                        {updateAvailable && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span class名称="h-2 w-2 shrink-0 cursor-pointer rounded-full bg-emerald-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>更新 available</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNavOpen(false);
                          window.open("/docs", "_blank", "noopener,noreferrer");
                        }}
                        class名称="h-7 gap-1.5 px-2 text-xs"
                      >
                        <span>Documentation</span>
                        <ExternalLink class名称="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TooltipProvider>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div class名称="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30">
            <Icon class名称="h-4 w-4 text-muted-foreground" />
          </div>
          <div class名称="min-w-0 leading-tight">
            <div class名称="text-sm font-semibold tracking-tight">{title}</div>
            <div class名称="text-xs text-muted-foreground">{subtitle}</div>
          </div>
          {badge && (
            <Badge variant="outline" class名称="uppercase tracking-wide">
              {badge}
            </Badge>
          )}
          {statusIndicator}
        </div>

        <div class名称="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
          {actions}
        </div>
      </div>
    </header>
  );
};

export const 状态Indicator = 状态BadgeIndicator;

// ============================================================================
// Split Layout (List + Detail panels)
// ============================================================================

interface SplitLayoutProps {
  children: React.React否de;
  class名称?: string;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  children,
  class名称,
}) => (
  <section
    class名称={cn(
      "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]",
      class名称,
    )}
  >
    {children}
  </section>
);

// ============================================================================
// List Panel (left side of split)
// ============================================================================

interface ListPanelProps {
  children: React.React否de;
  header?: React.React否de;
  footer?: React.React否de;
  class名称?: string;
}

export const ListPanel: React.FC<ListPanelProps> = ({
  children,
  header,
  footer,
  class名称,
}) => (
  <div
    class名称={cn(
      "min-w-0 rounded-xl border border-border/60 bg-card/40 flex flex-col",
      class名称,
    )}
  >
    {header && (
      <div class名称="border-b border-border/60 px-4 py-3">{header}</div>
    )}
    <div class名称="flex-1 divide-y divide-border/60 overflow-y-auto">
      {children}
    </div>
    {footer && (
      <div class名称="border-t border-border/60 px-4 py-2">{footer}</div>
    )}
  </div>
);

// ============================================================================
// List Item (clickable row in list)
// ============================================================================

interface ListItemProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.React否de;
  class名称?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  selected,
  onClick,
  children,
  class名称,
}) => (
  <button
    type="button"
    onClick={onClick}
    class名称={cn(
      "flex w-full items-start gap-4 px-4 py-3 text-left transition-colors",
      selected ? "bg-muted/40" : "hover:bg-muted/30",
      class名称,
    )}
    aria-pressed={selected}
  >
    {children}
  </button>
);

// ============================================================================
// Detail Panel (right side of split)
// ============================================================================

interface DetailPanelProps {
  children: React.React否de;
  class名称?: string;
  sticky?: boolean;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  children,
  class名称,
  sticky = true,
}) => (
  <div
    class名称={cn(
      "min-w-0 rounded-xl border border-border/60 bg-card/40 p-4",
      sticky && "lg:sticky lg:top-24 lg:self-start",
      class名称,
    )}
  >
    {children}
  </div>
);

// ============================================================================
// Empty State
// ============================================================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.React否de;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div class名称="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
    {Icon && <Icon class名称="h-10 w-10 text-muted-foreground/50 mb-2" />}
    <div class名称="text-base font-semibold">{title}</div>
    {description && (
      <p class名称="max-w-md text-sm text-muted-foreground">{description}</p>
    )}
    {action && <div class名称="mt-2">{action}</div>}
  </div>
);

// ============================================================================
// Score Meter
// ============================================================================

interface ScoreMeterProps {
  score: number | null;
  showLabel?: boolean;
}

const getScoreTokens = (score: number) => {
  if (score >= 90) return { bar: "bg-emerald-500/80" };
  if (score >= 70) return { bar: "bg-amber-500/80" };
  if (score >= 50) return { bar: "bg-orange-500/80" };
  return { bar: "bg-rose-500/80" };
};

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  showLabel = true,
}) => {
  if (score == null) {
    return <span class名称="text-xs text-muted-foreground">否t scored</span>;
  }

  const tokens = getScoreTokens(score);
  return (
    <div class名称="flex items-center gap-2 text-xs text-muted-foreground">
      <div class名称="h-1.5 w-12 rounded-full bg-muted/40">
        <div
          class名称={cn("h-1.5 rounded-full", tokens.bar)}
          style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
        />
      </div>
      {showLabel && (
        <span class名称="tabular-nums text-foreground">{score}%</span>
      )}
    </div>
  );
};

// ============================================================================
// Full Height Split Layout (for pages like VisaSponsors that use full viewport)
// ============================================================================

interface FullHeightSplitProps {
  sidebar: React.React否de;
  sidebarWidth?: string;
  children: React.React否de;
}

export const FullHeightSplit: React.FC<FullHeightSplitProps> = ({
  sidebar,
  sidebarWidth = "lg:w-[420px]",
  children,
}) => (
  <div class名称="flex flex-1 flex-col overflow-hidden lg:flex-row">
    <div
      class名称={cn(
        "flex w-full flex-col border-b lg:border-b-0 lg:border-r",
        sidebarWidth,
      )}
    >
      {sidebar}
    </div>
    <div class名称="flex-1 overflow-y-auto">{children}</div>
  </div>
);

// ============================================================================
// Section Card (for forms, stats, etc.)
// ============================================================================

interface SectionCardProps {
  children: React.React否de;
  class名称?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  class名称,
}) => (
  <section
    class名称={cn(
      "rounded-xl border border-border/60 bg-card/40 p-4",
      class名称,
    )}
  >
    {children}
  </section>
);

// ============================================================================
// Page Main Content Wrapper
// ============================================================================

interface PageMainProps {
  children: React.React否de;
  class名称?: string;
}

export const PageMain: React.FC<PageMainProps> = ({ children, class名称 }) => (
  <main
    class名称={cn("container mx-auto space-y-6 px-4 py-6 pb-12", class名称)}
  >
    {children}
  </main>
);
