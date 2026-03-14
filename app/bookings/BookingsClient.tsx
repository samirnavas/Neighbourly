"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, QrCode, CreditCard, Clock, Star, MapPin } from "lucide-react";
import ScannerModal from "@/components/ScannerModal";
import PaymentSheet from "@/components/PaymentSheet";
import BookingChatModal from "@/components/BookingChatModal";

type Profile = {
    full_name: string | null;
    avatar_url: string | null;
    phone_number: string | null;
    trust_score: number | null;
};

type Listing = {
    id: string;
    title: string;
    category: string;
    price_per_hour: number | null;
    ev_charging_available: boolean;
    ev_price_per_hour: number | null;
    image_url: string | null;
    address_text: string | null;
    owner: Profile;
};

type Booking = {
    id: string;
    status: string;
    actual_start_time: string | null;
    actual_end_time: string | null;
    total_price: number;
    listings: Listing;
};

export default function BookingsClient({
    activeBookings,
    pendingBookings,
    pastBookings
}: {
    activeBookings: Booking[];
    pendingBookings: Booking[];
    pastBookings: Booking[];
}) {
    const [activeTab, setActiveTab] = useState<"active" | "pending" | "past">("active");

    // Modals
    const [scannerBookingId, setScannerBookingId] = useState<string | null>(null);
    const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
    const [chatBookingId, setChatBookingId] = useState<string | null>(null);

    // Hard refresh for now to pull new DB values after scan
    const handleSuccess = () => {
        window.location.reload();
    };

    // Helper timer just visual for active rents
    const renderTimer = (startTime: string | null) => {
        if (!startTime) return "00h 00m";
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        const diffMs = now - start;
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
    };

    return (
        <div className="relative min-h-[100dvh] bg-gray-50 pb-24">
            <div className="pt-6 pb-2 px-4 bg-white shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Your Bookings</h1>
                
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`flex-1 flex justify-center py-2 text-sm font-bold tracking-tight rounded-md transition-all ${
                            activeTab === "active"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 font-medium"
                        }`}
                    >
                        Active
                        {activeBookings.length > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center">
                                {activeBookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`flex-1 flex justify-center py-2 text-sm font-bold tracking-tight rounded-md transition-all ${
                            activeTab === "pending"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 font-medium"
                        }`}
                    >
                        Pending
                        {pendingBookings.length > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center">
                                {pendingBookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("past")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === "past"
                                ? "bg-white text-gray-900 shadow-sm font-bold"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Past
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Active Tab */}
                {activeTab === "active" && (
                    activeBookings.length === 0 ? (
                        <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                            No active sessions right now.
                        </div>
                    ) : (
                        activeBookings.map((b) => (
                            <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 border-l-4 border-l-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />
                                        In Progress
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-500">Rate</div>
                                        <div className="font-bold text-gray-900">${b.listings.price_per_hour}/hr</div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{b.listings.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 shrink-0" /> {b.listings.address_text || "Address unavailable"}
                                </p>
                                
                                <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-center justify-between border border-blue-100/50">
                                    <div className="flex items-center text-blue-900 font-bold">
                                        <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                        Time Elapsed
                                    </div>
                                    <div className="font-mono text-xl font-bold tracking-tighter text-blue-700">
                                        {renderTimer(b.actual_start_time)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <button 
                                        onClick={() => setChatBookingId(b.id)}
                                        className="flex items-center justify-center p-3 rounded-xl border border-gray-200 bg-white shadow-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-sm"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
                                        Chat
                                    </button>
                                    {b.status === "awaiting_payment" ? (
                                        <button 
                                            onClick={() => setPaymentBooking(b)}
                                            className="flex items-center justify-center p-3 rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold active:scale-95 transition-all text-sm"
                                        >
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Pay Now
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setScannerBookingId(b.id)}
                                            className="flex items-center justify-center p-3 rounded-xl bg-gray-900 text-white shadow-md font-bold active:scale-95 transition-all text-sm"
                                        >
                                            <QrCode className="w-4 h-4 mr-2" />
                                            Check-Out
                                        </button>
                                    )}
                                </div>
                                
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                                            {b.listings.owner.avatar_url ? (
                                                <Image src={b.listings.owner.avatar_url} alt="pic" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600 font-bold text-xs">
                                                    {b.listings.owner.full_name?.charAt(0) || "U"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 font-medium">Host</span>
                                            <span className="text-sm font-bold text-gray-900 leading-none mt-0.5">{b.listings.owner.full_name || "Unknown"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                        {b.listings.owner.trust_score || "5.0"}
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                )}

                {/* Pending Tab */}
                {activeTab === "pending" && (
                    pendingBookings.length === 0 ? (
                        <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                            No upcoming or pending items.
                        </div>
                    ) : (
                        pendingBookings.map((b) => (
                            <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {b.listings.image_url && (
                                    <div className="relative h-24 w-full bg-gray-200 shrink-0">
                                        <Image src={b.listings.image_url} alt={b.listings.title} fill className="object-cover" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-sm">
                                            Pre-Booked
                                        </div>
                                        <div className="font-bold text-gray-900">${b.listings.price_per_hour}/hr</div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mt-2">{b.listings.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 shrink-0" /> {b.listings.address_text || "Address pending"}
                                    </p>

                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <button 
                                            onClick={() => setScannerBookingId(b.id)}
                                            className="w-full bg-indigo-600 text-white rounded-xl font-bold py-3.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-transform flex items-center justify-center"
                                        >
                                            <QrCode className="w-5 h-5 mr-2" />
                                            Scan to Unlock/Check-in
                                        </button>
                                        <p className="text-xs text-center text-gray-500 font-medium mt-3">
                                            Arrive at the location and scan the host&apos;s QR code to begin.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                )}

                {/* Past Tab */}
                {activeTab === "past" && (
                    pastBookings.length === 0 ? (
                        <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                            No past rental history.
                        </div>
                    ) : (
                        pastBookings.map((b) => (
                            <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 opacity-70 filter grayscale-[0.2]">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Past Session
                                    </div>
                                    <div className="font-bold text-gray-900">Total: ${b.total_price}</div>
                                </div>
                                <h3 className="font-bold text-gray-600">{b.listings.title}</h3>
                                <div className="text-sm text-gray-400 mt-1 capitalize font-medium">{b.status}</div>
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Support Modals */}
            <ScannerModal
                bookingId={scannerBookingId!}
                isOpen={!!scannerBookingId}
                onClose={() => setScannerBookingId(null)}
                onSuccess={handleSuccess}
            />

            <BookingChatModal 
                bookingId={chatBookingId!}
                currentUserId="prototype-user-id" // or pass from auth context / server component
                status="active" // pass actual status mapped from booking
                isOpen={!!chatBookingId}
                onClose={() => setChatBookingId(null)}
            />

            <PaymentSheet
                booking={paymentBooking}
                isOpen={!!paymentBooking}
                onClose={() => setPaymentBooking(null)}
            />
        </div>
    );
}
