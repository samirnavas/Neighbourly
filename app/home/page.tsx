import Link from "next/link";
import { Car, Wrench } from "lucide-react";

export default function UserHomePage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
            {/* Background decoration for Liquid glass effect */}
            <div className="absolute top-[-10%] left-[10%] w-[30%] h-[30%] bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
            <div className="absolute top-[30%] right-[10%] w-[25%] h-[25%] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-[-10%] left-[30%] w-[35%] h-[35%] bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>

            {/* Main Container */}
            <div className="relative w-full max-w-4xl p-8 md:p-12 mb-10 z-10 flex flex-col items-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-blue-200 to-indigo-300 mb-4 text-center tracking-tight">
                    Welcome to Neighbourly
                </h1>
                <p className="text-xl text-slate-300 mb-16 text-center max-w-2xl font-light">
                    What are you looking for today? Choose a category to explore available listings near you.
                </p>

                <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
                    {/* Parking Space Option */}
                    <Link href="/explore?category=space" className="group block h-full">
                        {/* Liquid Glass Card */}
                        <div className="h-full flex flex-col items-center justify-center p-10 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all duration-500 transform group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_-5px_rgba(16,185,129,0.3)]">
                            <div className="w-24 h-24 mb-8 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                                <Car className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">Parking Space</h2>
                            <p className="text-slate-400 text-center leading-relaxed group-hover:text-slate-300 transition-colors">
                                Find empty driveways, garages and safe spots available for rent in your locality.
                            </p>
                        </div>
                    </Link>

                    {/* Tools Option */}
                    <Link href="/explore?category=tool" className="group block h-full">
                        {/* Liquid Glass Card */}
                        <div className="h-full flex flex-col items-center justify-center p-10 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/[0.08] hover:border-blue-400/30 transition-all duration-500 transform group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_-5px_rgba(59,130,246,0.3)]">
                            <div className="w-24 h-24 mb-8 rounded-2xl bg-gradient-to-br from-blue-400/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner">
                                <Wrench className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">Tools</h2>
                            <p className="text-slate-400 text-center leading-relaxed group-hover:text-slate-300 transition-colors">
                                Borrow power tools, gardening equipment and more from your neighbours.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
