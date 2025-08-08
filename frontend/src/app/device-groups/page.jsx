"use client";
import React, {useState, useEffect} from 'react';
import {useRouter} from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DeviceGroups() {
  const router = useRouter();
  const [deviceGroups, setDeviceGroups] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceGroups = async () => {
      try {
        const response = await fetch(`${API_URL}/device-groups`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDeviceGroups(data.deviceGroups);
        setCount(data.totalCount);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceGroups();
  }, [setDeviceGroups, setLoading, setCount]);

  if (loading) {
    return <LoadingSpinner />;
  } else {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Device Groups (Count: {count})</h1>
        <button
          onClick={() => router.push('/create-device-group')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer mb-6"
        >
          + Create New Device Group
        </button>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {deviceGroups.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/devices?groupId=${item.id}`)}
            >
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-500 mb-4">{item.city}</p>
              {item.weatherWidgetId && <div className="h-36 overflow-hidden">
                <p className="text-gray-500 mb-4">Weather: {item.weatherWidgetId}</p>
              </div>}
            </div>
          ))}
        </div>
      </div>
    );
  }
};