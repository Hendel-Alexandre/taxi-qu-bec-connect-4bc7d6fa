"use client";

import { LanguageProvider } from "@/lib/language-context";
import { BookingProvider } from "@/hooks/use-booking";
import BookingDialog from "@/components/sections/booking-dialog";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <BookingProvider>
        {children}
        <BookingDialog />
      </BookingProvider>
    </LanguageProvider>
  );
}
