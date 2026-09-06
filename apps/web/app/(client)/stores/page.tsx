import Container from "@/components/Container";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import StoresClient, { ExtendedStore } from "@/components/stores/StoresClient";
import { getStores } from "@repo/sanity/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Stores & Verified Merchants | UShop",
  description: "Browse verified seller stores, merchant shops, and trusted vendors on UShop.",
};

const StoresPage = async () => {
  const storesList = (await getStores()) as ExtendedStore[];

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      <Container>
        {/* Breadcrumb Navigation */}
        <DynamicBreadcrumb
          customItems={[{ label: "Stores", href: "/stores" }]}
        />

        {/* Stores Hero Banner & Interactive Search Grid */}
        <StoresClient initialStores={storesList} />
      </Container>
    </div>
  );
};

export default StoresPage;
