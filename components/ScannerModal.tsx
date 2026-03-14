"use client";

import { useState } from "react";
import { processQRHandshake } from "@/app/actions/bookings";

interface ScannerModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScannerModal({ bookingId, isOpen, onClose, onSuccess }: ScannerModalProps) {
  const [scannedQrId, setScannedQrId] = useState("");
  const [evUsed, setEvUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleScan = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const result = await processQRHandshake(bookingId, scannedQrId, evUsed);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMsg(result.data?.message || "Success!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during scan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto overflow-x-hidden p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-800 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Scan QR Code
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Mock scanner: Enter the QR Code ID below to simulate scanning the real parking spot QR code.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 text-sm text-green-600 dark:text-green-400 bg-green-50 p-3 rounded-md">
            {successMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="qrId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              QR Code ID
            </label>
            <input
              type="text"
              id="qrId"
              value={scannedQrId}
              onChange={(e) => setScannedQrId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="e.g. 123e4567-e89b... (check listing details)"
              disabled={loading || !!successMsg}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="evUsed"
              checked={evUsed}
              onChange={(e) => setEvUsed(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading || !!successMsg}
            />
            <label htmlFor="evUsed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              EV Charging Used (for checkout)
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleScan}
              disabled={loading || !scannedQrId || !!successMsg}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Simulate Scan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
