import { GroodHeader } from "@/components/layout/grood-header";
import { GroodFooter } from "@/components/layout/grood-footer";
import { AdminToolbarWrapper } from "@/components/admin";

export default function GroodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminToolbarWrapper>
      <GroodHeader />
      {children}
      <GroodFooter />
    </AdminToolbarWrapper>
  );
}
