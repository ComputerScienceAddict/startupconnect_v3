"use client"

import React from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = React.useState(false);

  const nav = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Posts", href: "/posts" },
    { name: "Opportunities", href: "/opportunities" },
    { name: "Events", href: "/events" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-50 font-sans">
      <div className="bg-[#3b5998] text-white border-b border-black/10 shadow-md">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* 2006 Facebook-like Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 select-none">
              <span className="bg-white text-[#3b5998] px-2 py-1 font-bold text-lg leading-none tracking-tight shadow-sm">
                startupconnect
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {nav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium hover:underline"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile toggle */}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
              className="md:hidden inline-flex items-center justify-center rounded p-1 hover:bg-[#2d4373]"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          className="md:hidden overflow-hidden border-t border-white/10 bg-[#3b5998]"
        >
          <div className="px-4 py-3 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded px-3 py-2 text-base font-medium hover:bg-[#2d4373]"
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </header>
  );
} 