
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export default function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const isExternal = item.href.startsWith('http');
        
        return (
          <Link
            key={item.href}
            href={item.href}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : ""}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
              isActive 
                ? 'bg-white/10 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
