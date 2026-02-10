'use client';

import React from 'react';
import Link from 'next/link';
import NavLinks from './NavLinks';
import UserNav from './UserNav';

const navItems = [
  { name: 'Pulse', href: '/', icon: '⚡' },
  { name: 'Directory', href: '/agents', icon: '🤖' },
  { name: 'Rankings', href: '/rankings', icon: '🏆' },
  { name: 'Playbooks', href: '/playbooks', icon: '📚' },
  { name: 'Submit', href: '/submit', icon: '📤' },
];

export default function Navigation() {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-black/50 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col hidden md:flex">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">M</span>
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          MoltPulse
        </h1>
      </div>

      <NavLinks items={navItems} />

      <div className="mt-4 pt-8 border-t border-white/5">
         {/* @ts-ignore */}
         <UserNav />
      </div>
    </nav>
  );
}
