"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { LanguageProvider } from "@/lib/language-context";
import { BookingProvider } from "@/hooks/use-booking";
import BookingDialog from "@/components/sections/booking-dialog";

export default function Providers({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  return (
    <APIProvider 
      apiKey={apiKey} 
      version="beta"
      libraries={['places', 'marker', 'routes']}
    >
      <LanguageProvider>
        <BookingProvider>
          {children}
          <BookingDialog />
        </BookingProvider>
      </LanguageProvider>
    </APIProvider>
  );
}
