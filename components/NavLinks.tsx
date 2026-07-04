
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export default function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const isExternal = item.href.startsWith('http');
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : ""}
            className={`flex items-center gap-4 px-3 py-3 rounded-md transition-all duration-300 text-sm font-medium whitespace-nowrap overflow-hidden ${
              isActive 
                ? 'bg-[#1a1a1a] text-white border border-white/10' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#111] border border-transparent'
            }`}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-5">
              <Icon size={20} className={isActive ? 'text-gray-100' : 'text-gray-500'} />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
