"use client";
import React, {useState, useEffect} from 'react';
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DeviceGroups() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const [devices, setDevices] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(`${API_URL}/device-groups/${groupId}/devices`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDevices(data.devices);
        setCount(data.devices.length);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [setDevices, setLoading, setCount]);

  if (loading) {
    return <LoadingSpinner />;
  } else {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Devices (Count: {count})</h1> {/* TODO: why does this not show the total number of devices? */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* TODO: why is this not showing all devices? */}
          {devices.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{item.serialNumber}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  }
};