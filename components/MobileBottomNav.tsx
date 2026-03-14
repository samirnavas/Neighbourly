"use client";

import { Home, Compass, PlusCircle, Calendar, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: "Home", icon: Home, href: "/" },
        { label: "Explore", icon: Compass, href: "/explore" },
        { label: "Add", icon: PlusCircle, href: "/listings/new", isFab: true },
        { label: "Bookings", icon: Calendar, href: "/bookings" },
        { label: "Profile", icon: User, href: "/profile" },
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center w-full">
                                <div className="bg-emerald-800 text-white p-3 rounded-full -mt-6 shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] mt-1 font-medium text-gray-500">{item.label}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full space-y-1 active:scale-95 transition-transform ${isActive ? "text-emerald-800" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] tracking-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
