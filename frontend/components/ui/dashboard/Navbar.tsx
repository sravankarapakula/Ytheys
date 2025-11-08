'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  // Don't show navbar on auth page
  if (pathname === '/auth') return null;

  return (
    <nav className="w-full fixed h-16 sm:px-10 px-5 bg-black/40 backdrop-blur-sm border-b border-neutral-800/50 flex justify-between items-center z-50">
      {/* Logo */}
      <Link href="/" className="inline-flex font-instrument items-center font-mono text-white text-[1.9rem] sm:text-[2.5rem] font-medium leading-none tracking-tight">
              <span className="text-white">Yth</span>
              <span className="text-neutral-500">eys</span>
       </Link>
      
      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        
        {/* <Link 
          href="/home/trending" 
          className={`text-sm font-medium transition ${
            pathname === '/home/trending' 
              ? 'text-yellow-400' 
              : 'text-neutral-300 hover:text-white'
          }`}
        >
          Trending
        </Link> */}
        
        <Link 
          href="/profile" 
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-lg"
        >
          Profile
        </Link>
      </div>
    </nav>
  );
}
