import React from 'react' 
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { contactConfig } from "@/config/contact";

interface ContactItemData {
  title: string;
  subtitle: string;
  href?: string;
  isExternal?: boolean;
  icon: React.ReactNode;
}

const data: ContactItemData[] = [
  {
    title: "Visit Us",
    subtitle: `${contactConfig.company.address}, ${contactConfig.company.city}`,
    icon: (
      <MapPin className="h-6 w-6 text-slate-400 group-hover:text-ushop-pink transition-colors" />
    ),
  },
  {
    title: "Call Us",
    subtitle: contactConfig.company.phone,
    href: `tel:${contactConfig.company.phoneClean}`,
    icon: (
      <Phone className="h-6 w-6 text-slate-400 group-hover:text-ushop-pink transition-colors" />
    )
  },
  {
    title: "Email Us",
    subtitle: contactConfig.emails.support,
    href: `mailto:${contactConfig.emails.support}`,
    icon: (
      <Mail className="h-6 w-6 text-slate-400 group-hover:text-ushop-pink transition-colors" />
    )
  },
  {
    title: "Working Hours",
    subtitle: contactConfig.businessHours.weekday,
    icon: (
      <Clock className="h-6 w-6 text-slate-400 group-hover:text-ushop-pink transition-colors" />
    )
  },
]

const ContactItem = ({ title, subtitle, href, icon }: ContactItemData) => {
  const content = (
    <div className="flex items-center gap-4 group p-4 rounded-lg bg-[#1e293b]/30 border border-slate-800/80 hover:border-slate-700 hover:bg-[#1e293b]/50 transition-all duration-300 h-full">
      <div className="p-3 bg-[#1e293b] rounded-full text-slate-400 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-sm font-semibold text-white mt-0.5">{subtitle}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
};

const FooterTop = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10 border-b border-slate-800">
      {data.map((item, index) => (
        <ContactItem key={index} {...item} />
      ))}
    </div>
  )
}

export default FooterTop