import { Shell } from "@/components/shell/shell";

export default function ShellLayout({ children }: LayoutProps<"/">) {
  return <Shell>{children}</Shell>;
}
