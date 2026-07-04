'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, LayoutGrid, BarChart2, Book, PlusSquare, Github } from 'lucide-react';
import NavLinks from './NavLinks';
import UserNav from './UserNav';

const navItems = [
  { name: 'Pulse', href: '/', icon: Activity },
  { name: 'Directory', href: '/agents', icon: LayoutGrid },
  { name: 'Rankings', href: '/rankings', icon: BarChart2 },
  { name: 'Playbooks', href: '/playbooks', icon: Book },
  { name: 'Submit', href: '/submit', icon: PlusSquare },
  { name: 'GitHub', href: 'https://github.com/kartikgarg3000/MoltPulse', icon: Github },
];

export default function Navigation() {
  return (
    <nav className="group fixed left-0 top-0 h-full w-16 hover:w-64 bg-[#0a0a0a] border-r border-white/10 flex-col hidden md:flex z-50 transition-[width] duration-300 ease-in-out overflow-hidden">
      
      <Link href="/" className="h-16 flex items-center px-4 gap-4 flex-shrink-0">
        <div className="w-8 h-8 flex-shrink-0 rounded bg-white flex items-center justify-center transition-transform hover:scale-105">
            <span className="text-black font-bold text-lg">M</span>
        </div>
        <h1 className="text-xl font-bold text-gray-100 tracking-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          MoltPulse
        </h1>
      </Link>

      <div className="flex-1 py-4 px-2 overflow-hidden">
        <NavLinks items={navItems} />
      </div>

      <div className="mt-auto border-t border-white/10 p-2 overflow-hidden">
         {/* @ts-ignore */}
         <UserNav />
      </div>
    </nav>
  );
}
