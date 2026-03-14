"use client";

import { Car, Wrench, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ExploreSelection() {
  return (
    <div className="h-[100dvh] w-full bg-white flex flex-col px-6 pt-20 pb-24 overflow-hidden">
      {/* Header section */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
          What are you<br />
          <span className="text-emerald-600">looking for</span> today?
        </h1>
        <p className="text-gray-500 mt-3 font-medium text-lg">
          Select a category to explore nearby listings in your community.
        </p>
      </div>

      {/* Selection Cards */}
      <div className="flex-1 flex flex-col gap-6 justify-center">
        {/* Parking Card */}
        <Link 
          href="/explore/spaces"
          className="group relative flex-1 max-h-[220px] bg-emerald-50 rounded-[2.5rem] p-8 overflow-hidden border border-emerald-100/50 shadow-sm active:scale-[0.98] transition-all"
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-200/50 group-hover:scale-110 transition-transform">
              <Car className="w-8 h-8 text-emerald-700" />
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-emerald-900">Parking<br />Spaces</h2>
                <p className="text-emerald-700/70 font-bold text-sm mt-1 uppercase tracking-widest">Find a spot</p>
              </div>
              <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-700/30">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          {/* Background Decorative Element */}
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl group-hover:bg-emerald-200/40 transition-colors" />
        </Link>

        {/* Tools Card */}
        <Link 
          href="/explore/tools"
          className="group relative flex-1 max-h-[220px] bg-amber-50 rounded-[2.5rem] p-8 overflow-hidden border border-amber-100/50 shadow-sm active:scale-[0.98] transition-all"
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-amber-200/50 group-hover:scale-110 transition-transform">
              <Wrench className="w-8 h-8 text-amber-700" />
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-amber-900">Tools &<br />Equipment</h2>
                <p className="text-amber-700/70 font-bold text-sm mt-1 uppercase tracking-widest">Borrow items</p>
              </div>
              <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-700/30">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          {/* Background Decorative Element */}
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl group-hover:bg-amber-200/40 transition-colors" />
        </Link>
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Neighbourly • Safe Sharing</p>
      </div>
    </div>
  );
}
