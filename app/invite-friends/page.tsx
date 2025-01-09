'use client';

import ReferralSystem from '@/components/ReferralSystem';

export default function InviteFriends() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-green-500 mb-6">Invite Your Friends</h1>
      <p className="text-lg mb-4">Share your referral link and earn rewards!</p>
      <ReferralSystem />
    </main>
  );
}
