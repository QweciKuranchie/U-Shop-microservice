import { GraduationCap, Grid3X3, Home, ShoppingBag, Store } from "lucide-react";

export const headerData = [
  { title: "Home", href: "/", icon: Home },
  { title: "Products", href: "/shop", icon: ShoppingBag },
  { title: "Categories", href: "/category", icon: Grid3X3 },
  { title: "Universities", href: "/universities", icon: GraduationCap },
  { title: "Stores", href: "/stores", icon: Store },
];

export const quickLinksData = {
  title: "Quick Links",
  links: [
    { title: "All Products", href: "/shop" },
    { title: "Stores", href: "/stores" },
    { title: "Universities", href: "/universities" },
    { title: "Flash Sales", href: "/deals/flash" },
  ],
};

export const categoriesData = {
  title: "Categories",
  links: [
    { title: "All Categories", href: "/category" },
    { title: "Phones", href: "/category/smartphones" },
    { title: "Laptops", href: "/category/laptops" },
    { title: "Accessories", href: "/category/accessories" },
    { title: "Appliances", href: "/category/appliances" },
    { title: "Gaming", href: "/category/gaming" },
  ],
};

export const customerCareData = {
  title: "Customer Care",
  links: [
    { title: "About Us", href: "/about" },
    { title: "Terms & Conditions", href: "/terms" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Cookie Policy", href: "/privacy#cookies" },
    { title: "Return and Refund Policy", href: "/help#returns" },
    { title: "Payments Info", href: "/payment-info" },
    { title: "Sell on UShop", href: "/user/business-apply" },
  ],
};

export const supportData = {
  title: "Need Help?",
  links: [
    { title: "Contact Us", href: "/contact" },
    { title: "Help Center", href: "/help" },
    { title: "FAQs", href: "/faqs" },
    { title: "Track Your Order", href: "/user/orders" },
    { title: "Sitemap", href: "/sitemap.xml" },
  ],
};

export const userAccountData = [
  { title: "My Profile", href: "/user/profile" },
  { title: "My Orders", href: "/user/orders" },
  { title: "My Wishlist", href: "/wishlist" },
  { title: "Shopping Cart", href: "/cart" },
  { title: "Dashboard", href: "/user/dashboard" },
  { title: "Settings", href: "/user/settings" },
];

export const productType = [
  { title: "All", value: "all" },
  { title: "Electronics", value: "electronics" },
  { title: "Computing", value: "computing" },
  { title: "Gaming", value: "gaming" },
  { title: "Others", value: "others" },
];

export const faqsData = [
  {
    question: "What services does U-Shop offer?",
    answer:
      "U-Shop offers a wide range of technology solutions including custom software development, cloud services, and digital transformation consulting.",
  },
  {
    question: "How can I get support for U-Shop products?",
    answer:
      "You can reach our support team through our contact page or by emailing support@ushopgh.com.",
  },
  {
    question: "Does U-Shop offer training for its products?",
    answer:
      "Yes, we offer comprehensive training programs for all our products and services. Please contact our sales team for more information.",
  },
  {
    question: "What industries does U-Shop serve?",
    answer:
      "U-Shop serves a wide range of industries including finance, healthcare, retail, and manufacturing.",
  },
  {
    question: "How does U-Shop ensure data security?",
    answer:
      "We employ industry-standard security measures and comply with all relevant data protection regulations to ensure the security of our clients' data.",
  },
];
