'use client';

import ReferralSystem from '@/components/ReferralSystem';
import { useState, useEffect } from 'react';

interface Task {
  id: number;
  name: string;
  url: string;
  completed: boolean;
}

const tasksData: Task[] = [
  { id: 1, name: 'Visit Example Site', url: 'https://example.com', completed: false },
  { id: 2, name: 'Check Another Site', url: 'https://example.org', completed: false },
];

export default function Home() {
  const [initData, setInitData] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [startParam, setStartParam] = useState('');
  const [tasks, setTasks] = useState<Task[]>(tasksData);
  const [points, setPoints] = useState<number>(0);

  // استرداد بيانات Telegram Web App
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

  // استرداد النقاط من قاعدة البيانات عند بدء التطبيق
  useEffect(() => {
    const fetchPoints = async () => {
      const db = await openDatabase();
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const request = store.get(username);

      request.onsuccess = () => {
        const user = request.result;
        if (user) {
          setPoints(user.points || 0);
        }
      };
    };

    if (username) fetchPoints();
  }, [username]);

  // تحديث النقاط في قاعدة البيانات
  const updatePointsInDB = async (newPoints: number) => {
    const db = await openDatabase();
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');

    const request = store.get(username);

    request.onsuccess = () => {
      const user = request.result;

      if (user) {
        user.points = newPoints;
        store.put(user);
      } else {
        store.add({ username, points: newPoints });
      }
    };
  };

  // التعامل مع الضغط على زر Start
  const handleStart = (taskId: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: false } : task
    );
    setTasks(updatedTasks);
  };

  // التعامل مع الضغط على زر Check
  const handleCheck = async (taskId: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);

    const newPoints = points + 100;
    setPoints(newPoints);
    await updatePointsInDB(newPoints);
  };

  return (
    <main className="flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6">Welcome to the App</h1>
      {username && <p className="text-lg mb-4">Hello, @{username}!</p>}

      {/* عرض نظام الإحالة */}
      <ReferralSystem initData={initData} userId={userId} startParam={startParam} />

      {/* عرض قائمة المهام */}
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
        <h3 className="text-lg mb-4">Your Points: {points}</h3>
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between p-4 bg-gray-100 rounded">
              <span>{task.name}</span>
              {!task.completed ? (
                <>
                  <button
                    onClick={() => window.open(task.url, '_blank')}
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleCheck(task.id)}
                    className="bg-green-500 text-white py-1 px-3 rounded"
                  >
                    Check
                  </button>
                </>
              ) : (
                <span className="text-gray-500">Completed</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

// دالة لفتح قاعدة البيانات
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
