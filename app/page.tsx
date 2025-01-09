'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-6">Welcome to NAIMO</h1>
      <p className="text-lg mb-4">Your one-stop platform for tasks and referrals!</p>

      {/* Navigation Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/tasks')}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Go to Tasks
        </button>
        <button
          onClick={() => router.push('/invite-friends')}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
        >
          Invite Friends
        </button>
      </div>
    </main>
  );
}
