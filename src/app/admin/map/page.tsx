"use client";

import React from "react";
import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('@/components/admin/AdminMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />
});

export default function MapPage() {
  return (
    <div className="flex-1 relative">
      <AdminMap selectedRide={null} />
    </div>
  );
}
