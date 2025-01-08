'use client';

import ReferralSystem from '@/components/ReferralSystem';
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import Image from 'next/image';
import paws from '../images/paws.webp';

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [initData, setInitData] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [startParam, setStartParam] = useState<string>('');
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        try {
          const WebApp = (await import('@twa-dev/sdk')).default;
          console.log('Initializing WebApp...');
          WebApp.ready(); // تأكد من أن WebApp جاهز

          if (WebApp.initDataUnsafe?.user) {
            const user = WebApp.initDataUnsafe.user;
            console.log('User data:', user); // تحقق من بيانات المستخدم
            setInitData(WebApp.initData);
            setUserId(user.id.toString() || '');
            setStartParam(WebApp.initDataUnsafe.start_param || '');
            setUsername(user.username);
          } else {
            console.error('User data is not available in initDataUnsafe');
          }
        } catch (error) {
          console.error('Error initializing WebApp:', error);
        }
      }
    };

    initWebApp();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>
        Welcome, {username || 'Guest'}
      </h1>
      <div style={{ padding: '20px', backgroundColor: '#333', borderRadius: '8px' }}>
        <Image src={paws} alt="Paws" width={171} height={132} />
      </div>
      <p className="text-4xl font-bold mb-8">Telegram Referral Demo</p>
      <ReferralSystem initData={initData} userId={userId} startParam={startParam} username={username} />
    </main>
  );
}
