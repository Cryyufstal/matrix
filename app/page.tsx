'use client';

import ReferralSystem from '@/components/ReferralSystem';
import { useState, useEffect } from 'react';
import Image from 'next/image';
interface Task {
  id: number;
  name: string;
  url: string;
  started: boolean;
  completed: boolean;
}

const tasksData: Task[] = [
  { id: 1, name: 'Visit Example Site', url: 'https://example.com', started: false, completed: false },
  { id: 2, name: 'Check Another Site', url: 'https://example.org', started: false, completed: false },
];

export default function Home() {
  const [initData, setInitData] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [startParam, setStartParam] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'tasks' | 'referral' | 'wallet'>('tasks'); // التحكم بالعرض

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        setInitData(WebApp.initData);
        setUserId(WebApp.initDataUnsafe.user?.id.toString() || '');
        setUsername(WebApp.initDataUnsafe.user?.username || 'Unknown');
        setStartParam(WebApp.initDataUnsafe.start_param || '');
      }
    };

    initWebApp();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const db = await openDatabase();
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const request = store.get(username);

      request.onsuccess = () => {
        const user = request.result;
        if (user) {
          setTasks(user.tasks || tasksData);
          setPoints(user.points || 0);
        } else {
          setTasks(tasksData);
        }
      };
    };

    if (username) fetchUserData();
  }, [username]);

  const updateUserDataInDB = async (newTasks: Task[], newPoints: number) => {
    const db = await openDatabase();
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');

    const request = store.get(username);

    request.onsuccess = () => {
      const user = request.result;

      if (user) {
        user.tasks = newTasks;
        user.points = newPoints;
        store.put(user);
      } else {
        store.add({ username, tasks: newTasks, points: newPoints });
      }
    };
  };

  const handleStart = (taskId: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, started: true } : task
    );
    setTasks(updatedTasks);
    updateUserDataInDB(updatedTasks, points);
  };

  const handleCheck = async (taskId: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    const newPoints = points + 100;

    setTasks(updatedTasks);
    setPoints(newPoints);
    await updateUserDataInDB(updatedTasks, newPoints);
  };

  return (
            <main className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-6">
  <h1 className="text-4xl font-extrabold text-blue-600 mb-6">NAIMO</h1>
  {username && <p className="text-lg text-gray-700 mb-4">Hello, @{username}!</p>}
      <Image
        src="/images/ninja.jpg" // المسار النسبي داخل مجلد public
        alt="Example Image"
        width={500} // تحديد العرض
        height={300} // تحديد الارتفاع
      />
  {/* Navigation Tabs */}
  <div className="flex justify-center space-x-4 mb-6">
    <button
      onClick={() => setActiveTab('tasks')}
      className={`py-2 px-4 rounded-lg font-medium ${
        activeTab === 'tasks'
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      Tasks
    </button>
    <button
      onClick={() => setActiveTab('referral')}
      className={`py-2 px-4 rounded-lg font-medium ${
        activeTab === 'referral'
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      Invite Friends
    </button>
    <button
      onClick={() => setActiveTab('wallet')}
      className={`py-2 px-4 rounded-lg font-medium ${
        activeTab === 'wallet'
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      Wallet
    </button>
  </div>

  {/* Conditional Rendering */}
  {activeTab === 'tasks' && (
    <div className="mt-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Tasks</h2>
      <h3 className="text-lg font-semibold text-blue-600 mb-4">
        Your Points: <span className="font-bold">{points}</span>
      </h3>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <span className="font-medium text-gray-800">{task.name}</span>
            {!task.started ? (
              <button
                onClick={() => {
                  window.open(task.url, '_blank');
                  handleStart(task.id);
                }}
                className="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={() => handleCheck(task.id)}
                className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Check
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )}

  {activeTab === 'referral' && (
    <div className="mt-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Invite Friends</h2>
      <ReferralSystem initData={initData} userId={userId} startParam={startParam} />
    </div>
  )}

  {activeTab === 'wallet' && (
    <div className="mt-8 w-full max-w-md text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet</h2>
      <p className="text-gray-500">Coming Soon</p>
    </div>
  )}
</main>
  );
}

async function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('AppDatabase', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
         }
