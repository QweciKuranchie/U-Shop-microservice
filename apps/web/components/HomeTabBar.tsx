import Link from "next/link";
import React from "react";
import { productType } from "@/Constants/data";

interface Props {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

const HomeTabBar = ({ selectedTab, onTabSelect }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin scrollbar-thumb-ushop-pink/40 scrollbar-track-transparent -mx-6 px-6 sm:mx-0 sm:px-0 text-sm font-semibold w-full sm:w-auto">
        {productType?.map((item) => (
          <button
            onClick={() => onTabSelect(item?.title)}
            key={item?.title}
            className={`flex-shrink-0 border border-ushop-pink/20 px-4 py-1.5 md:px-6 md:py-2 rounded-full hover:bg-ushop-pink hover:border-ushop-pink hover:text-white hoverEffect ${
              selectedTab === item?.title
                ? "bg-ushop-pink text-white border-ushop-pink"
                : "bg-ushop-pink/20"
            }`}
          >
            {item?.title}
          </button>
        ))}
      </div>
      <Link
        href={"/category"}
        className="self-end sm:self-auto border border-ushop-pink/20 px-4 py-1.5 md:px-6 md:py-2 rounded-full hover:bg-ushop-pink hover:border-ushop-pink hover:text-white hoverEffect text-sm font-semibold flex-shrink-0"
      >
        see all
      </Link>
    </div>
  );
};

export default HomeTabBar;
