export interface LeafCategory {
  name: string;
  slug: string;
  keyAttributes?: string[];
}

export interface SubCategory {
  name: string;
  slug: string;
  leaves: LeafCategory[];
}

export interface CategoryTreeItem {
  name: string;
  slug: string;
  productType: "electronics" | "computing" | "others";
  keyAttributes?: string[];
  subcategories: SubCategory[];
}

export const CATEGORY_TREE: CategoryTreeItem[] = [
  // ──────────────────────────────────────────────────────────
  // PRODUCT TYPE: ELECTRONICS
  // ──────────────────────────────────────────────────────────
  {
    name: "Appliances",
    slug: "appliances",
    productType: "electronics",
    keyAttributes: ["Brand", "Power (W)", "Capacity (L, kg)", "Energy rating", "Color", "Warranty type & duration"],
    subcategories: [
      {
        name: "Small Kitchen Appliances",
        slug: "small-kitchen-appliances",
        leaves: [
          { name: "Blenders", slug: "blenders", keyAttributes: ["Brand", "Power (W)", "Capacity (L)", "Speed Settings", "Color"] },
          { name: "Toasters", slug: "toasters", keyAttributes: ["Brand", "Power (W)", "Color"] },
          { name: "Rice Cookers", slug: "rice-cookers", keyAttributes: ["Brand", "Capacity (L)", "Power (W)"] },
          { name: "Fryers", slug: "fryers", keyAttributes: ["Brand", "Capacity (L)", "Power (W)"] },
          { name: "Microwave Ovens", slug: "microwave-ovens", keyAttributes: ["Brand", "Capacity (L)", "Power (W)"] },
          { name: "Food Processors", slug: "food-processors", keyAttributes: ["Brand", "Power (W)", "Capacity (L)"] },
          { name: "Juicers", slug: "juicers", keyAttributes: ["Brand", "Power (W)", "Capacity (L)"] },
          { name: "Coffee Makers", slug: "coffee-makers", keyAttributes: ["Brand", "Capacity (L)", "Power (W)"] },
          { name: "Mixers", slug: "mixers", keyAttributes: ["Brand", "Power (W)", "Speed Settings"] },
          { name: "Air Fryers", slug: "air-fryers", keyAttributes: ["Brand", "Capacity (L)", "Power (W)"] },
          { name: "Fufu Machines", slug: "fufu-machines", keyAttributes: ["Brand", "Power (W)", "Capacity (kg)"] },
        ],
      },
      {
        name: "Home Comfort & Care",
        slug: "home-comfort-care",
        leaves: [
          { name: "Irons", slug: "irons", keyAttributes: ["Brand", "Power (W)", "Type"] },
          { name: "Vacuum Cleaners", slug: "vacuum-cleaners", keyAttributes: ["Brand", "Power (W)", "Capacity"] },
          { name: "Fans", slug: "fans", keyAttributes: ["Brand", "Type", "Speed Settings"] },
          { name: "Air Conditioners", slug: "air-conditioners", keyAttributes: ["Brand", "Capacity (BTU/HP)", "Inverter"] },
          { name: "Water Dispensers", slug: "water-dispensers", keyAttributes: ["Brand", "Hot/Cold", "Capacity"] },
        ],
      },
      {
        name: "Large Appliances",
        slug: "large-appliances",
        leaves: [
          { name: "Refrigerators", slug: "refrigerators", keyAttributes: ["Brand", "Capacity (L)", "Door Style", "Energy Rating"] },
          { name: "Freezers", slug: "freezers", keyAttributes: ["Brand", "Capacity (L)", "Type"] },
          { name: "Chest Freezers", slug: "chest-freezers", keyAttributes: ["Brand", "Capacity (L)"] },
          { name: "Washing Machines", slug: "washing-machines", keyAttributes: ["Brand", "Capacity (kg)", "Load Type"] },
          { name: "Gas Cookers", slug: "gas-cookers", keyAttributes: ["Brand", "Burners", "Oven Type"] },
        ],
      },
    ],
  },
  {
    name: "TVs & Video",
    slug: "tvs-video",
    productType: "electronics",
    keyAttributes: ["Screen size (inches)", "Resolution", "Smart TV", "HDR support", "Refresh rate (Hz)", "Brand", "Model"],
    subcategories: [
      {
        name: "Televisions",
        slug: "televisions",
        leaves: [
          { name: "LED & LCD TVs", slug: "led-lcd-tvs", keyAttributes: ["Screen size", "Resolution", "Smart TV", "HDR Support", "Brand", "Model"] },
        ],
      },
      {
        name: "Video Players & Recorders",
        slug: "video-players-recorders",
        leaves: [
          { name: "DVD Players", slug: "dvd-players", keyAttributes: ["Brand", "Supported Formats"] },
          { name: "Blu‑Ray Players", slug: "blu-ray-players", keyAttributes: ["Brand", "4K Support"] },
        ],
      },
      {
        name: "Projectors",
        slug: "projectors",
        leaves: [
          { name: "Projectors", slug: "projectors-leaf", keyAttributes: ["Brightness (Lumens)", "Resolution", "Smart OS", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "Audio",
    slug: "audio",
    productType: "electronics",
    keyAttributes: ["Speaker type", "Power output (W)", "Connectivity", "Brand"],
    subcategories: [
      {
        name: "Speakers",
        slug: "speakers",
        leaves: [
          { name: "Bluetooth Speakers", slug: "bluetooth-speakers", keyAttributes: ["Power (W)", "Battery Life", "Water Resistance", "Brand"] },
          { name: "Outdoor Speakers", slug: "outdoor-speakers", keyAttributes: ["Power (W)", "Waterproofing", "Brand"] },
          { name: "Home Theatre Systems", slug: "home-theatre-systems", keyAttributes: ["Channels", "Power (W)", "Dolby Atmos", "Brand"] },
          { name: "Compact Radios & Stereos", slug: "compact-radios-stereos", keyAttributes: ["Connectivity", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "Cameras & Photography",
    slug: "cameras-photography",
    productType: "electronics",
    keyAttributes: ["Camera type", "Sensor resolution (MP)", "Video resolution", "Lens mount", "Brand", "Model"],
    subcategories: [
      {
        name: "Cameras & Imaging",
        slug: "cameras-imaging",
        leaves: [
          { name: "Digital Cameras", slug: "digital-cameras", keyAttributes: ["Sensor (MP)", "Camera Type", "Brand", "Model"] },
          { name: "Video Cameras / Camcorders", slug: "video-cameras-camcorders", keyAttributes: ["Video Resolution", "Optical Zoom", "Brand"] },
          { name: "Binoculars & Scopes", slug: "binoculars-scopes", keyAttributes: ["Magnification", "Lens Diameter"] },
          { name: "Camera Accessories", slug: "camera-accessories", keyAttributes: ["Type", "Compatibility", "Brand"] },
          { name: "Lenses", slug: "lenses", keyAttributes: ["Mount", "Focal Length", "Aperture", "Brand"] },
          { name: "VR Gear", slug: "vr-gear", keyAttributes: ["Compatibility", "Resolution", "Brand"] },
        ],
      },
      {
        name: "Surveillance",
        slug: "surveillance",
        leaves: [
          { name: "Video Surveillance", slug: "video-surveillance", keyAttributes: ["Resolution", "Night Vision", "Connectivity", "Brand"] },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // PRODUCT TYPE: COMPUTING
  // ──────────────────────────────────────────────────────────
  {
    name: "Phones",
    slug: "phones",
    productType: "computing",
    keyAttributes: ["OS", "Network", "Screen size", "RAM", "Storage", "Battery capacity", "Brand", "Model"],
    subcategories: [
      {
        name: "Mobile Phones",
        slug: "mobile-phones",
        leaves: [
          { name: "Smartphones", slug: "smartphones", keyAttributes: ["OS", "Network", "Screen size", "RAM", "Storage", "Battery", "Brand", "Model"] },
          { name: "Basic Phones", slug: "basic-phones", keyAttributes: ["Network", "Battery", "Dual SIM", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "Tablets",
    slug: "tablets",
    productType: "computing",
    keyAttributes: ["OS", "Screen size", "RAM", "Storage", "Brand", "Model"],
    subcategories: [
      {
        name: "Tablets",
        slug: "tablets-sub",
        leaves: [
          { name: "Tablets", slug: "tablets-leaf", keyAttributes: ["OS", "Screen size", "RAM", "Storage", "Cellular", "Brand", "Model"] },
          { name: "Educational & Kids Tablets", slug: "educational-kids-tablets", keyAttributes: ["OS", "Screen size", "Parental Control", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "Computers",
    slug: "computers",
    productType: "computing",
    keyAttributes: ["CPU family & generation", "RAM", "Storage type & capacity", "GPU", "Screen size & resolution", "OS", "Brand", "Model"],
    subcategories: [
      {
        name: "Laptops",
        slug: "laptops",
        leaves: [
          { name: "HP Laptops", slug: "hp-laptops", keyAttributes: ["Model Series", "CPU Brand/Model", "RAM", "Storage Type/Capacity", "Screen Size", "OS"] },
          { name: "Dell Laptops", slug: "dell-laptops", keyAttributes: ["Model Series", "CPU Brand/Model", "RAM", "Storage Type/Capacity", "Screen Size", "OS"] },
          { name: "MacBooks", slug: "macbooks", keyAttributes: ["Chip (M1/M2/M3)", "RAM", "Storage Capacity", "Screen Size"] },
          { name: "Lenovo Laptops", slug: "lenovo-laptops", keyAttributes: ["Model Series", "CPU Brand/Model", "RAM", "Storage Type/Capacity", "Screen Size", "OS"] },
          { name: "Asus Laptops", slug: "asus-laptops", keyAttributes: ["Model Series", "CPU Brand/Model", "RAM", "Storage Type/Capacity", "Screen Size", "OS"] },
          { name: "Acer Laptops", slug: "acer-laptops", keyAttributes: ["Model Series", "CPU Brand/Model", "RAM", "Storage Type/Capacity", "Screen Size", "OS"] },
          { name: "Other Laptops", slug: "other-laptops", keyAttributes: ["Brand", "CPU", "RAM", "Storage", "Screen Size", "OS"] },
        ],
      },
      {
        name: "Desktops & All‑in‑Ones",
        slug: "desktops-all-in-ones",
        leaves: [
          { name: "Desktops", slug: "desktops", keyAttributes: ["CPU", "RAM", "Storage", "GPU", "OS", "Brand"] },
          { name: "All‑in‑One PCs", slug: "all-in-one-pcs", keyAttributes: ["Screen Size", "CPU", "RAM", "Storage", "OS", "Brand"] },
        ],
      },
      {
        name: "Monitors",
        slug: "monitors",
        leaves: [
          { name: "Monitors", slug: "monitors-leaf", keyAttributes: ["Screen Size", "Resolution", "Refresh Rate", "Panel Type", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "Printers & Scanners",
    slug: "printers-scanners",
    productType: "computing",
    keyAttributes: ["Print technology", "Functions", "Print speed", "Connectivity", "Brand", "Model"],
    subcategories: [
      {
        name: "Printers",
        slug: "printers",
        leaves: [
          { name: "Dot Matrix Printers", slug: "dot-matrix-printers", keyAttributes: ["Print technology", "Functions", "Connectivity", "Brand"] },
          { name: "Inkjet Printers", slug: "inkjet-printers", keyAttributes: ["Functions", "Print speed", "Wi-Fi", "Brand"] },
          { name: "Label Printers", slug: "label-printers", keyAttributes: ["Technology", "Label size", "Brand"] },
          { name: "Laser Printers", slug: "laser-printers", keyAttributes: ["Functions", "Print speed", "Color/Mono", "Brand"] },
          { name: "Multi‑Function Printers", slug: "multi-function-printers", keyAttributes: ["Functions (Print/Scan/Copy/Fax)", "Print speed", "Brand"] },
        ],
      },
      {
        name: "Scanners",
        slug: "scanners",
        leaves: [
          { name: "Document Scanners", slug: "document-scanners", keyAttributes: ["Resolution", "Scan speed", "Duplex", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "Networking",
    slug: "networking",
    productType: "computing",
    keyAttributes: ["Device type", "Speed", "Wi-Fi standard", "Number of ports", "Brand", "Model"],
    subcategories: [
      {
        name: "Networking",
        slug: "networking-sub",
        leaves: [
          { name: "Hubs", slug: "hubs", keyAttributes: ["Ports", "Speed", "Brand"] },
          { name: "Modems", slug: "modems", keyAttributes: ["Type", "Speed", "Brand"] },
          { name: "Network Adapters", slug: "network-adapters", keyAttributes: ["Interface", "Speed", "Brand"] },
          { name: "Network Antennas", slug: "network-antennas", keyAttributes: ["Gain (dBi)", "Frequency", "Brand"] },
          { name: "Repeaters", slug: "repeaters", keyAttributes: ["Speed", "Wi-Fi Standard", "Brand"] },
          { name: "Routers", slug: "routers", keyAttributes: ["Speed", "Wi-Fi Standard (Wi-Fi 5/6/6E/7)", "Ports", "Brand"] },
          { name: "Streaming Media Players", slug: "streaming-media-players", keyAttributes: ["Resolution (4K/HD)", "OS", "Brand"] },
          { name: "Switches", slug: "switches", keyAttributes: ["Number of ports", "Speed (Gbps)", "Managed/Unmanaged", "Brand"] },
          { name: "Wireless Access Points", slug: "wireless-access-points", keyAttributes: ["Speed", "PoE Support", "Brand"] },
          { name: "Network Cables", slug: "network-cables", keyAttributes: ["Category (Cat6/Cat7)", "Length", "Shielding"] },
        ],
      },
    ],
  },
  {
    name: "Software",
    slug: "software",
    productType: "computing",
    keyAttributes: ["Software type", "Platform", "License type", "Brand", "Product name"],
    subcategories: [
      {
        name: "Software",
        slug: "software-sub",
        leaves: [
          { name: "Software", slug: "software-leaf", keyAttributes: ["Software type", "Platform", "License type", "Brand", "Product name"] },
        ],
      },
    ],
  },
  {
    name: "Data Storage",
    slug: "data-storage",
    productType: "computing",
    keyAttributes: ["Capacity", "Interface", "Form factor", "Read/Write speeds", "Brand", "Model"],
    subcategories: [
      {
        name: "Data Storage",
        slug: "data-storage-sub",
        leaves: [
          { name: "Hard Drives (HDD)", slug: "hard-drives-hdd", keyAttributes: ["Capacity", "Form factor (2.5\"/3.5\")", "RPM", "Brand"] },
          { name: "Solid State Drives (SSD)", slug: "solid-state-drives-ssd", keyAttributes: ["Capacity", "Interface (NVMe/SATA)", "Form factor (M.2/2.5\")", "Read/Write Speed", "Brand"] },
          { name: "External Hard Drives", slug: "external-hard-drives", keyAttributes: ["Capacity", "Interface (USB 3.x)", "Brand"] },
          { name: "External Solid State Drives", slug: "external-solid-state-drives", keyAttributes: ["Capacity", "Interface", "Read Speed", "Brand"] },
          { name: "Network Attached Storage (NAS)", slug: "network-attached-storage-nas", keyAttributes: ["Bays", "CPU/RAM", "Brand"] },
          { name: "USB Flash Drives", slug: "usb-flash-drives", keyAttributes: ["Capacity", "Interface (USB 3.0/C)", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "PC Components",
    slug: "pc-components",
    productType: "computing",
    keyAttributes: ["Component type", "Specs vary by component", "Brand", "Model"],
    subcategories: [
      {
        name: "PC Components",
        slug: "pc-components-sub",
        leaves: [
          { name: "Computer Cases", slug: "computer-cases", keyAttributes: ["Form factor", "Side Panel", "Fan support", "Brand"] },
          { name: "External Optical Drives", slug: "external-optical-drives", keyAttributes: ["Type (DVD/Blu-Ray)", "Interface", "Brand"] },
          { name: "External Sound Cards", slug: "external-sound-cards", keyAttributes: ["Channels", "Interface", "Brand"] },
          { name: "Fans & Cooling", slug: "fans-cooling", keyAttributes: ["Fan size", "Radiator size", "TDP support", "Brand"] },
          { name: "Graphics Cards", slug: "graphics-cards", keyAttributes: ["VRAM", "Chipset", "Interface", "Brand", "Model"] },
          { name: "I/O Port Cards", slug: "io-port-cards", keyAttributes: ["Interface", "Ports"] },
          { name: "Internal Hard Drives", slug: "internal-hard-drives", keyAttributes: ["Capacity", "RPM", "Interface", "Brand"] },
          { name: "Internal Memory Card Readers", slug: "internal-memory-card-readers", keyAttributes: ["Form factor", "Supported Cards"] },
          { name: "Internal Solid State Drives", slug: "internal-solid-state-drives", keyAttributes: ["Capacity", "Interface (NVMe/SATA)", "Form factor", "Speed", "Brand"] },
          { name: "Internal Sound Cards", slug: "internal-sound-cards", keyAttributes: ["Channels", "Interface", "Brand"] },
          { name: "Internal TV Tuner & Capture Cards", slug: "internal-tv-tuner-capture-cards", keyAttributes: ["Resolution", "Interface", "Brand"] },
          { name: "Laptop Replacement Parts", slug: "laptop-replacement-parts", keyAttributes: ["Part type", "Model compatibility"] },
          { name: "Memory (RAM)", slug: "memory-ram", keyAttributes: ["Type (DDR4/DDR5)", "Capacity", "Speed (MHz)", "Brand"] },
          { name: "Network Cards", slug: "network-cards", keyAttributes: ["Speed", "Wi-Fi standard", "Interface", "Brand"] },
          { name: "Power Supplies", slug: "power-supplies", keyAttributes: ["Wattage", "Efficiency rating (80+)", "Form factor", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "Gaming",
    slug: "gaming",
    productType: "computing",
    keyAttributes: ["Platform", "Generation", "Genre/Rating", "Brand", "Model"],
    subcategories: [
      {
        name: "Gaming Consoles",
        slug: "gaming-consoles",
        leaves: [
          { name: "Nintendo Consoles", slug: "nintendo-consoles", keyAttributes: ["Model (Switch/OLED)", "Storage", "Edition"] },
          { name: "PlayStation Consoles", slug: "playstation-consoles", keyAttributes: ["Generation (PS4/PS5)", "Edition (Disc/Digital)", "Storage"] },
          { name: "Xbox Consoles", slug: "xbox-consoles", keyAttributes: ["Generation (Series X/S/One)", "Storage"] },
          { name: "Other Gaming Systems", slug: "other-gaming-systems", keyAttributes: ["Platform", "Brand"] },
          { name: "Retro Gaming & Microconsoles", slug: "retro-gaming-microconsoles", keyAttributes: ["Built-in games", "Display output"] },
        ],
      },
      {
        name: "Gaming Controllers",
        slug: "gaming-controllers",
        leaves: [
          { name: "Nintendo Controllers", slug: "nintendo-controllers", keyAttributes: ["Compatibility", "Connectivity", "Brand"] },
          { name: "PlayStation Controllers", slug: "playstation-controllers", keyAttributes: ["Compatibility (PS4/PS5)", "Connectivity", "Brand"] },
          { name: "Xbox Controllers", slug: "xbox-controllers", keyAttributes: ["Compatibility", "Connectivity", "Brand"] },
          { name: "Other Gaming Controllers", slug: "other-gaming-controllers", keyAttributes: ["Platform", "Connectivity", "Brand"] },
        ],
      },
      {
        name: "Gaming Games",
        slug: "gaming-games",
        leaves: [
          { name: "Nintendo Games", slug: "nintendo-games", keyAttributes: ["Game Title", "Genre", "PEGI/ESRB Rating"] },
          { name: "PlayStation Games", slug: "playstation-games", keyAttributes: ["Platform (PS4/PS5)", "Genre", "PEGI/ESRB Rating"] },
          { name: "Xbox Games", slug: "xbox-games", keyAttributes: ["Platform (Xbox Series/One)", "Genre", "PEGI/ESRB Rating"] },
          { name: "PC Games", slug: "pc-games", keyAttributes: ["Platform", "Genre", "Delivery Method"] },
          { name: "Other Games", slug: "other-games", keyAttributes: ["Platform", "Genre"] },
        ],
      },
      {
        name: "PC Gaming Hardware",
        slug: "pc-gaming-hardware",
        leaves: [
          { name: "Gaming Laptops", slug: "gaming-laptops", keyAttributes: ["GPU", "CPU", "RAM", "Screen Refresh Rate", "Brand"] },
          { name: "VR Headsets for Gaming", slug: "vr-headsets-gaming", keyAttributes: ["Resolution", "Platform compatibility", "Brand"] },
        ],
      },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    productType: "computing",
    keyAttributes: ["Compatible device type", "Brand/Model compatibility", "Connection type", "Material/Color"],
    subcategories: [
      {
        name: "Mobile Accessories",
        slug: "mobile-accessories",
        leaves: [
          { name: "Cases & Covers", slug: "cases-covers", keyAttributes: ["Device compatibility", "Material", "Brand"] },
          { name: "Chargers & Power Adapters", slug: "chargers-power-adapters", keyAttributes: ["Wattage", "Port type (USB-C/Lightning)", "Brand"] },
          { name: "Cables", slug: "cables", keyAttributes: ["Length", "Connector type", "Brand"] },
          { name: "Power Banks", slug: "power-banks", keyAttributes: ["Capacity (mAh)", "Output Watts", "Brand"] },
          { name: "Screen Protectors", slug: "screen-protectors", keyAttributes: ["Device compatibility", "Material (Tempered Glass)"] },
          { name: "Headsets & Earphones", slug: "headsets-earphones", keyAttributes: ["Connectivity (Bluetooth/3.5mm)", "Mic", "Brand"] },
          { name: "Mounts & Stands", slug: "mounts-stands", keyAttributes: ["Type (Car/Desk)", "Compatibility"] },
          { name: "Memory Cards", slug: "memory-cards", keyAttributes: ["Capacity", "Class/Speed", "Brand"] },
          { name: "Smart Watches & Bands", slug: "smart-watches-bands", keyAttributes: ["OS compatibility", "Display", "Brand"] },
          { name: "Repair Kits & Tools", slug: "repair-kits-tools", keyAttributes: ["Tool count", "Application"] },
          { name: "Other Mobile Accessories", slug: "other-mobile-accessories", keyAttributes: ["Description"] },
        ],
      },
      {
        name: "Tablet Accessories",
        slug: "tablet-accessories",
        leaves: [
          { name: "Tablet Cases, Bags & Sleeves", slug: "tablet-cases-bags-sleeves", keyAttributes: ["Screen size compatibility", "Brand"] },
          { name: "Tablet Chargers & Adapters", slug: "tablet-chargers-adapters", keyAttributes: ["Wattage", "Port type", "Brand"] },
          { name: "Keyboard Cases & Keyboards", slug: "keyboard-cases-keyboards", keyAttributes: ["Layout", "Bluetooth", "Brand"] },
          { name: "Tablet Mounts & Stands", slug: "tablet-mounts-stands", keyAttributes: ["Size compatibility"] },
          { name: "Tablet Screen Protectors", slug: "tablet-screen-protectors", keyAttributes: ["Device compatibility"] },
          { name: "Styluses", slug: "styluses", keyAttributes: ["Pressure sensitivity", "Compatibility", "Brand"] },
          { name: "Tablet Repair Kits", slug: "tablet-repair-kits", keyAttributes: ["Tools included"] },
          { name: "Other Tablet Accessories", slug: "other-tablet-accessories", keyAttributes: ["Description"] },
        ],
      },
      {
        name: "Laptop Accessories",
        slug: "laptop-accessories",
        leaves: [
          { name: "Laptop Bags, Cases & Sleeves", slug: "laptop-bags-cases-sleeves", keyAttributes: ["Laptop size (inches)", "Material", "Brand"] },
          { name: "Laptop Batteries", slug: "laptop-batteries", keyAttributes: ["Laptop model compatibility", "Cells/Capacity"] },
          { name: "Laptop Chargers & Adapters", slug: "laptop-chargers-adapters", keyAttributes: ["Wattage", "Tip type/USB-C", "Brand"] },
          { name: "Cooling Pads & External Fans", slug: "cooling-pads-external-fans", keyAttributes: ["Fan count", "USB powered", "Brand"] },
          { name: "Docking Stations", slug: "docking-stations", keyAttributes: ["Ports", "Display output", "Brand"] },
          { name: "Lapdesks", slug: "lapdesks", keyAttributes: ["Size compatibility", "Material"] },
          { name: "Laptop Mounts & Stands", slug: "laptop-mounts-stands", keyAttributes: ["Adjustability", "Material"] },
          { name: "Laptop Screen Protectors", slug: "laptop-screen-protectors", keyAttributes: ["Screen size"] },
          { name: "Security Locks", slug: "security-locks", keyAttributes: ["Lock type (Kensington/Key)"] },
          { name: "Skins & Decals", slug: "skins-decals", keyAttributes: ["Model compatibility"] },
          { name: "Other Laptop Accessories", slug: "other-laptop-accessories", keyAttributes: ["Description"] },
        ],
      },
      {
        name: "Gaming Accessories",
        slug: "gaming-accessories",
        leaves: [
          { name: "Gaming Controllers", slug: "gaming-controllers-acc", keyAttributes: ["Platform compatibility", "Wireless/Wired", "Brand"] },
          { name: "Gaming Keyboards", slug: "gaming-keyboards", keyAttributes: ["Switch type (Mechanical)", "RGB", "Brand"] },
          { name: "Gaming Mice", slug: "gaming-mice", keyAttributes: ["DPI", "Sensor", "Programmable buttons", "Brand"] },
          { name: "Gaming Headsets", slug: "gaming-headsets", keyAttributes: ["7.1 Surround", "Mic", "Platform compatibility", "Brand"] },
          { name: "Other Gaming Accessories", slug: "other-gaming-accessories", keyAttributes: ["Description"] },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // PRODUCT TYPE: OTHERS
  // ──────────────────────────────────────────────────────────
  {
    name: "Digital Services",
    slug: "digital-services",
    productType: "others",
    keyAttributes: ["Network/provider", "Denomination / value", "Delivery method"],
    subcategories: [
      {
        name: "Digital Services",
        slug: "digital-services-sub",
        leaves: [
          { name: "Airtime", slug: "airtime", keyAttributes: ["Network (MTN/Telecel/AirtelTigo)", "Value (GHS)", "Delivery"] },
          { name: "Data Bundles", slug: "data-bundles", keyAttributes: ["Network", "Data Volume (GB/MB)", "Validity"] },
          { name: "Vouchers", slug: "vouchers", keyAttributes: ["Service/Store", "Value", "Delivery method"] },
          { name: "International Top‑up", slug: "international-top-up", keyAttributes: ["Country", "Provider", "Amount"] },
          { name: "Exam Checkers (BECE & WASSCE)", slug: "exam-checkers", keyAttributes: ["Exam type (BECE/WASSCE)", "Year", "Delivery method"] },
        ],
      },
    ],
  },
];
