import { GroodHeader } from "@/components/layout/grood-header";
import { GroodFooter } from "@/components/layout/grood-footer";

export default function GroodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GroodHeader />
      {children}
      <GroodFooter />
    </>
  );
}
