"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completePayment } from "@/app/actions/bookings";

interface PaymentSheetProps {
  booking: any; // We use 'any' for prototype to easily accept joined listing data
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentSheet({ booking, isOpen, onClose }: PaymentSheetProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen || !booking) return null;

  // Derive duration manually for the breakdown
  const start = new Date(booking.actual_start_time);
  const end = new Date(booking.actual_end_time);
  const diffMs = end.getTime() - start.getTime();
  const rawHours = diffMs / (1000 * 60 * 60);
  const durationHours = Math.max(1, Math.ceil(rawHours));

  // Destructure joined listing safely
  const listing = booking.listings || {};
  const hourlyRate = parseFloat(listing.price_per_hour || 0);
  const evRate = parseFloat(listing.ev_price_per_hour || 0);
  const totalPrice = parseFloat(booking.total_price || 0);

  // If EV charging was used, we assume total = duration * (hourlyRate + evRate).
  // Thus we can infer if EV was used by seeing if duration * hourlyRate < total
  const estimatedEvUsed = durationHours * hourlyRate < totalPrice - 0.01; // epsilon for float

  const handlePayment = async () => {
    setLoading(true);
    try {
      const result = await completePayment(booking.id);
      if (result.error) {
        alert("Payment failed: " + result.error);
        setLoading(false);
      } else {
        // Redirect to a placeholder review route 
        // e.g. /bookings/[id]/review
        // Or simple mock URL for the prototype
        router.push(`/dashboard/reviews/new?bookingId=${booking.id}`);
        onClose();
      }
    } catch (error) {
      alert("Error processing payment.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className="fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out bg-white dark:bg-gray-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] slide-up-sheet"
      >
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-3" />
        
        <div className="px-6 pb-8 pt-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Complete Payment
          </h2>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-6 space-y-4 border border-gray-100 dark:border-gray-700">
            {/* Breakdown */}
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
              <span>Time parked ({durationHours} hr{durationHours > 1 && 's'})</span>
              <span>₹{(durationHours * hourlyRate).toFixed(2)}</span>
            </div>

            {estimatedEvUsed && evRate > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span>EV Charging ({durationHours} hr{durationHours > 1 && 's'})</span>
                <span>₹{(durationHours * evRate).toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
              <div className="flex justify-between items-center font-bold text-xl text-gray-900 dark:text-white">
                <span>Total Due</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/30 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Pay via UPI / Card"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .slide-up-sheet {
          animation: slideUpSheet 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUpSheet {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}} />
    </>
  );
}
