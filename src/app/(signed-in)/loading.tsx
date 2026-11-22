import { PageContainer } from "@/lib/components/page-container/page-container";
import { DestinationLoading } from "./_components/destination-loading";

export default function Loading() {
  return (
    <PageContainer as="main" className="flex-1">
      <DestinationLoading />
    </PageContainer>
  );
}
