import Container from "@/components/Container";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import UniversitiesClient, { UniversityCardItem } from "@/components/universities/UniversitiesClient";
import { getUniversities } from "@repo/sanity/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Hubs & Student Sellers | UShop",
  description: "Explore student seller hubs and campus storefronts across Ghana universities.",
};

const UniversitiesPage = async () => {
  // Fetch real university campus data directly from Sanity
  const fetchedUniversities = await getUniversities();
  const universitiesList = (fetchedUniversities || []) as UniversityCardItem[];

  return (
    <div className="min-h-screen bg-gray-50/50 py-6">
      <Container>
        {/* Breadcrumb Navigation */}
        <DynamicBreadcrumb
          customItems={[
            { label: "Universities", href: "/universities" }
          ]}
        />

        {/* Universities Hero Banner & Interactive Search Grid */}
        <UniversitiesClient universitiesList={universitiesList} />
      </Container>
    </div>
  );
};

export default UniversitiesPage;
