import type { ReactNode } from "react";
import styles from "./icons.module.css";

interface IconProps {
  className?: string;
  size?: number;
}

function Icon({
  children,
  className,
  size = 16,
  viewBox = "0 0 16 16",
}: Readonly<IconProps & { children: ReactNode; viewBox?: string }>) {
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      className={className ? `${styles.icon} ${className}` : styles.icon}
    >
      {children}
    </svg>
  );
}

export function AppIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props} viewBox="0 0 32 32">
      <g className={`${styles.app} ${styles.appInk}`}>
        <ellipse cx="16" cy="9" rx="12" ry="5" />
        <path d="M4 9v14a12 5 0 0 0 24 0V9" />
        <path d="M4 16a12 5 0 0 0 24 0" />
        <path d="M10.5 17.3h6M20.5 17.3h0M11.5 24.3h0M15.5 24.3h6" />
      </g>
      <path
        className={`${styles.app} ${styles.appCode}`}
        d="M12.5 6.8 10.3 9l2.2 2.2M19.5 6.8 21.7 9l-2.2 2.2M16.9 6.2l-1.8 5.6"
      />
    </Icon>
  );
}

export function ExpanderIcon({
  expanded,
  ...props
}: Readonly<IconProps & { expanded: boolean }>) {
  return (
    <Icon {...props}>
      <rect
        className={styles.expanderBox}
        x="3.5"
        y="3.5"
        width="10"
        height="10"
      />
      <path
        className={styles.expanderGlyph}
        d={expanded ? "M6 8.5h5" : "M6 8.5h5M8.5 6v5"}
      />
    </Icon>
  );
}

export function ServerIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <ellipse cx="7" cy="3.5" rx="5" ry="2" />
      <path d="M2 3.5v8.5c0 1.1 2.2 2 5 2s5-.9 5-2V3.5" />
      <circle className={styles.badge} cx="12" cy="12" r="3.5" />
      <path className={styles.badgeMark} d="M11 10.2v3.6l2.8-1.8z" />
    </Icon>
  );
}

export function FolderIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path className={styles.folder} d="M1 3h5l1.5 1.5H15V13H1z" />
    </Icon>
  );
}

export function DatabaseIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <ellipse cx="8" cy="3.5" rx="5.5" ry="2" />
      <path d="M2.5 3.5v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9" />
    </Icon>
  );
}

export function TableIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <rect x="1.5" y="2.5" width="13" height="11" />
      <rect className={styles.solid} x="2" y="3" width="12" height="2.5" />
      <path d="M1.5 9.5h13M5.5 5.5v8M10.5 5.5v8" />
    </Icon>
  );
}

export function ProcedureIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M3.5 1.5h6l3 3v10h-9z" />
      <path d="M9.5 1.5v3h3M5.5 7.5h5M5.5 9.5h5M5.5 11.5h3" />
    </Icon>
  );
}

export function KeywordIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1" />
      <path d="M4 6.5h8M4 9.5h5" />
    </Icon>
  );
}

export function NewQueryIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M2.5 1.5h6l3 3v10h-9z" />
      <path d="M8.5 1.5v3h3M4.5 8.5h5M4.5 10.5h5M4.5 12.5h3" />
      <path d="M13.5 1v4M11.5 3h4" />
    </Icon>
  );
}

export function ExecuteIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M4.5 2.5v11l9-5.5z" />
    </Icon>
  );
}

export function SimpleVersionIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M2.5 3.5h11M2.5 6.5h11M2.5 9.5h11M2.5 12.5h7" />
    </Icon>
  );
}

export function ExplorerIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <rect x="1.5" y="1.5" width="4" height="4" />
      <rect x="9.5" y="5.5" width="4" height="4" />
      <rect x="9.5" y="10.5" width="4" height="4" />
      <path d="M3.5 5.5v7h6M3.5 7.5h6" />
    </Icon>
  );
}

export function MenuIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M2 4.5h12M2 8.5h12M2 12.5h12" />
    </Icon>
  );
}

export function CaretDownIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path className={styles.solid} d="M4.5 6.5h7l-3.5 3.5z" />
    </Icon>
  );
}

export function CloseIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Icon>
  );
}

export function PinIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M1.5 8.5h4M5.5 5.5v6M5.5 6.5h7v4h-7M10.5 6.5v4" />
    </Icon>
  );
}

export function PlugIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M6.5 1.5v3M9.5 1.5v3M8 11.5v3" />
      <path className={styles.solid} d="M4.5 4.5h7v3a3.5 3.5 0 0 1-7 0z" />
    </Icon>
  );
}

export function DisconnectIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M9.5 1.5v3M12.5 1.5v3M11 11.5v3" />
      <path className={styles.solid} d="M7.5 4.5h7v3a3.5 3.5 0 0 1-7 0z" />
      <path className={styles.danger} d="M1.5 1.5l4 4M5.5 1.5l-4 4" />
    </Icon>
  );
}

export function StopIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <rect className={styles.solid} x="4" y="4" width="8" height="8" />
    </Icon>
  );
}

export function FilterIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path className={styles.solid} d="M2 2.5h12l-4.5 5.5v6l-3-2v-4z" />
    </Icon>
  );
}

export function RefreshIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M12.6 4.6A5.5 5.5 0 1 0 13.5 8" />
      <path className={styles.solid} d="M10.5 2.5h4v4z" />
    </Icon>
  );
}

export function ActivityIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M1 8.5h4l1.5-4 3 8 1.5-4h4" />
    </Icon>
  );
}

export function CheckCircleIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <circle className={styles.check} cx="8" cy="8" r="6.5" />
      <path className={styles.checkMark} d="M5 8.2l2 2 4-4.4" />
    </Icon>
  );
}

export function ConnectedIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path
        className={styles.statusInkLine}
        d="M4.5 0.5v3M8.5 0.5v3M6.5 10v4"
      />
      <path className={styles.statusInk} d="M2.5 3.5h8v2.5a4 4 0 0 1-8 0z" />
      <circle className={styles.statusBadge} cx="12" cy="12" r="3.5" />
      <path className={styles.statusBadgeMark} d="M10.3 12.1l1.2 1.2 2.2-2.4" />
    </Icon>
  );
}

export function ReadyIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M1.5 2.5h13v9h-5l-1.5 2-1.5-2h-5z" />
    </Icon>
  );
}

export function GridIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <rect x="1.5" y="1.5" width="13" height="13" />
      <path d="M1.5 5.5h13M1.5 10h13M5.5 1.5v13M10 1.5v13" />
    </Icon>
  );
}

export function MessagesIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M2.5 1.5h7l3 3v10h-10z" />
      <path d="M9.5 1.5v3h3M4.5 7.5h6M4.5 9.5h6M4.5 11.5h4" />
    </Icon>
  );
}

export function SuccessIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <circle className={styles.statusBadge} cx="8" cy="8" r="6.5" />
      <path className={styles.statusBadgeMark} d="M4.8 8.2l2.2 2.2 4.2-4.6" />
    </Icon>
  );
}

export function WarningIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path className={styles.warning} d="M8 1.5l6.8 12.5H1.2z" />
      <path className={styles.warningMark} d="M8 6v3.6M8 11v1.2" />
    </Icon>
  );
}

export function SpinnerIcon(props: Readonly<IconProps>) {
  const className = props.className
    ? `${styles.spinner} ${props.className}`
    : styles.spinner;
  return (
    <Icon {...props} className={className}>
      <circle className={styles.spinnerTrack} cx="8" cy="8" r="5.5" />
      <path d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5" strokeWidth="1.6" />
    </Icon>
  );
}

export function TardisIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path
        className={styles.solid}
        fillRule="evenodd"
        d="M7.25.5h1.5V2h-1.5zM5 2h6l1 1.5H4zM4 3.5h8V5H4zm.75.45v.6h6.5v-.6zM4 5h8v9.5H4zm1 1v2h2.5V6zm3.5 0v2H11V6zM7.85 8.75v4.75h.3V8.75zM3.5 14.5h9v1h-9z"
      />
    </Icon>
  );
}
