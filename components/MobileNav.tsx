
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutGrid, BarChart2, Book, PlusSquare, Github, User } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const navItems = [
  { name: 'Pulse', href: '/', icon: <Activity size={20} /> },
  { name: 'Agents', href: '/agents', icon: <LayoutGrid size={20} /> },
  { name: 'Submit', href: '/submit', icon: <PlusSquare size={20} /> },
  { name: 'Account', href: '/login', icon: <User size={20} /> },
  { name: 'GitHub', href: 'https://github.com/kartikgarg3000/MoltPulse', icon: <Github size={20} /> },
];

export default function MobileNav() {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();
  
  // Hide the nav when scrolling down (unless at the very top)
  const isHidden = scrollDirection === 'down';

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-white/10 px-2 pb-safe transition-transform duration-300 ease-in-out ${
      isHidden ? 'translate-y-full' : 'translate-y-0'
    }`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isExternal = item.href.startsWith('http');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              target={isExternal ? "_blank" : "_self"}
              rel={isExternal ? "noopener noreferrer" : ""}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-gray-100' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`p-1.5 rounded-md ${isActive ? 'bg-[#1a1a1a] border border-white/10' : 'border border-transparent'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
