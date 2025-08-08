"use client";
import {useRouter} from "next/navigation";
import React, { useEffect } from "react";


export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // TODO: check if user is logged in, if not redirect to login page
    router.push("/device-groups");
  }, [router]);
}
