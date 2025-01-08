'use client'

import ReferralSystem from '@/components/ReferralSystem'
import { useEffect, useState } from 'react'
import WebApp from "@twa-dev/sdk";
import Image from "next/image";
import paws from "..//images/paws.webp";


interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [initData, setInitData] = useState('')
  const [userId, setUserId] = useState('')
  const [startParam, setStartParam] = useState('')

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        setInitData(WebApp.initData);
        setUserId(WebApp.initDataUnsafe.user?.id.toString() || '');
        setStartParam(WebApp.initDataUnsafe.start_param || '');
      }
    };

    initWebApp();
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>Welcome, {userData.username}</h1>
      <div style={{ padding: "20px", backgroundColor: "#333", borderRadius: "8px" }}>
      <Image src={paws} alt="Paws" width={171} height={132} />
      </div>
      <p className="text-4xl font-bold mb-8">Telegram Referral Demo</p>
      <ReferralSystem initData={initData} userId={userId} startParam={startParam} />
    </main>
  )
}