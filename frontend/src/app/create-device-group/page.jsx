"use client";
import React, {useState} from "react";
import {useRouter} from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateDeviceGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cityDisplay, setCityDisplay] = useState("");
  const [city, setCity] = useState("");
  const [weatherWidgetId, setWeatherWidgetId] = useState(null);

  const handleCityChange = (value) => {
    const fetchWeatherWidgetOptions = async () => {
      if (value && value.length > 3) {
        const response = await fetch(
          'https://app3.weatherwidget.org/data/',
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `list=1&str=${encodeURIComponent(value)}&lang=en`,
          }
        )
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // response shape: [{id: string, name: string},…]
        //   TODO: render a list of options to select from, set weatherWidgetId and city to the selected option
        console.log(data);
      }
    }
    fetchWeatherWidgetOptions();
    setCityDisplay(value);
    setCity(value);
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const doSubmit = async () => {
      const response = await fetch(`${API_URL}/device-groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          city,
          weatherWidgetId,
        }),
      });
      if (response.ok) {
        router.push("/device-groups");
      } else {
        throw new Error('Network response was not ok');
      }
    }
    doSubmit();
  }
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Create New Device
          Group</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name"
                   className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="city"
                   className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              name="city"
              type="text"
              id="city"
              value={cityDisplay}
              onChange={(e) => handleCityChange(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Item
          </button>
        </form>
      </div>
    </div>
  );
}