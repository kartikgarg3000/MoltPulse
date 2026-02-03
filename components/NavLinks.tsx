
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
    <div className="space-y-2 mb-8">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-white/10 text-white shadow-lg shadow-purple-500/10'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
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
