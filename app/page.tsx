import { Bell, Car, Wrench } from "lucide-react";
import Link from "next/link";

const categories = [
  { icon: Car, label: "Parking", href: "/explore?category=parking" },
  { icon: Wrench, label: "Tools", href: "/explore?category=tools" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <header className="px-6 pt-12 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100/50 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Good morning, Samir</h1>
        </div>
        <div className="relative">
          <div className="p-2 bg-gray-100 rounded-full">
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-700 rounded-full border-2 border-white"></span>
        </div>
      </header>

      <section className="mt-4 px-6 pb-2">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="w-full h-24 rounded-3xl bg-white shadow-md border border-gray-200 flex items-center gap-4 px-5 mb-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-800/10 flex items-center justify-center">
              <cat.icon className="w-7 h-7 text-emerald-800" />
            </div>
            <span className="text-base font-semibold text-gray-900 tracking-tight">{cat.label}</span>
          </Link>
        ))}
      </section>

      <div className="px-6 mt-6 mb-2">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Near You</h2>
      </div>

      <div className="px-6 space-y-6 flex-1 pb-10">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex flex-col gap-3">
            <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gray-300" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                <span className="text-sm font-bold text-gray-900">$15/d</span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 leading-tight">Private Driveway</h3>
                <p className="text-sm text-gray-500 mt-0.5">0.2 mi away</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
