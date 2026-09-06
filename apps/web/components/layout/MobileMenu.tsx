"use client";

import React, { useState } from "react";
import { AlignLeft } from "lucide-react";
import SideMenu from "./SideMenu";

const MobileMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Open navigation menu"
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 flex items-center justify-center min-w-[40px] min-h-[40px] md:hidden cursor-pointer"
      >
        <AlignLeft className="w-6 h-6 hover:text-hoverColor hoverEffect" />
      </button>
      <div className="md:hidden">
        {/* SideMenu */}
        <SideMenu
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
    </>
  );
};

export default MobileMenu;
