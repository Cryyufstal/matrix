'use client'

import ReferralSystem from '@/components/ReferralSystem';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [initData, setInitData] = useState('');
  const [userId, setUserId] = useState('');
  const [startParam, setStartParam] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null); // Add userData state

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        setInitData(WebApp.initData);
        setUserId(WebApp.initDataUnsafe.user?.id.toString() || '');
        setStartParam(WebApp.initDataUnsafe.start_param || '');

        // Set user data
        if (WebApp.initDataUnsafe?.user) {
          setUserData(WebApp.initDataUnsafe.user as UserData);
        }
      }
    };

    initWebApp();
  }, []);

  if (!userData) {
    // Show a loading state until userData is available
    return <div>Loading...</div>;
  }

  return (
      <p className="text-4xl font-bold mb-8">Telegram Referral Demo</p>
      <ReferralSystem initData={initData} userId={userId} startParam={startParam} />
    </main>
  );
}
