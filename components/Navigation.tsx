
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Pulse', href: '/', icon: '⚡' },
  { name: 'Directory', href: '/agents', icon: '🤖' },
  { name: 'Rankings', href: '/rankings', icon: '🏆' },
  { name: 'Playbooks', href: '/playbooks', icon: '📚' },
  { name: 'Submit', href: '/submit', icon: '📤' },
];

export default function Navigation() {
  const pathname = usePathname();

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

      <div className="space-y-2">
        {navItems.map((item) => {
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

      <div className="mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-white/5">
           {/* <p className="text-xs text-gray-400 mb-2">Phase 1 MVP</p> */}
           <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 w-1/4"></div>
           </div>
        </div>
      </div>
    </nav>
  );
}
