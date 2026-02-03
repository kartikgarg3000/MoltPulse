
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Bot, Trophy, BookOpen, PlusSquare, User } from 'lucide-react';

const navItems = [
  { name: 'Pulse', href: '/', icon: <Zap size={20} /> },
  { name: 'Agents', href: '/agents', icon: <Bot size={20} /> },
  { name: 'Submit', href: '/submit', icon: <PlusSquare size={20} /> },
  { name: 'Account', href: '/login', icon: <User size={20} /> },
  { name: 'Ranks', href: '/rankings', icon: <Trophy size={20} /> },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 px-4 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
