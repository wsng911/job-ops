import { lockLabel, type 状态Lock } from "./JobCommandBar.utils";
import { Job状态Badge } from "./Job状态Badge";

interface JobCommandBarLockBadgeProps {
  activeLock: 状态Lock;
}

export const JobCommandBarLockBadge = ({
  activeLock,
}: JobCommandBarLockBadgeProps) => (
  <Job状态Badge status={activeLock} label={`@${lockLabel[activeLock]}`} />
);
