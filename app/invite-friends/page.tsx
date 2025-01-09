'use client';

import ReferralSystem from '@/app/components/ReferralSystem';
import { useSearchParams } from 'next/navigation';

export default function InviteFriends() {
  const searchParams = useSearchParams();

  const initData = searchParams.get('initData') || '';
  const userId = searchParams.get('userId') || '';
  const startParam = searchParams.get('startParam') || '';

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <h1 className="text-4xl font-extrabold text-green-500 mb-6">Invite Your Friends</h1>
      <p className="text-lg mb-4">Share your referral link and earn rewards!</p>
      <ReferralSystem />
    </main>
  );
}
