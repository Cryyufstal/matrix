'use client';

import ReferralSystem from '@/components/ReferralSystem';
import { useState, useEffect } from 'react';

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
    <main className="flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6">Welcome to the App</h1>
      {username && <p className="text-lg mb-4">Hello, @{username}!</p>}

      {/* شريط التنقل */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2 px-4 rounded ${activeTab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('referral')}
          className={`py-2 px-4 rounded ${activeTab === 'referral' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Invite Friends
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`py-2 px-4 rounded ${activeTab === 'wallet' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Wallet
        </button>
      </div>

      {/* عرض المحتوى بناءً على التبويب النشط */}
      {activeTab === 'tasks' && (
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
          <h3 className="text-lg mb-4">Your Points: {points}</h3>
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between p-4 bg-gray-100 rounded">
                <span>{task.name}</span>
                {!task.started ? (
                  <button
                    onClick={() => {
                      window.open(task.url, '_blank');
                      handleStart(task.id);
                    }}
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheck(task.id)}
                    className="bg-green-500 text-white py-1 px-3 rounded"
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
          <h2 className="text-2xl font-bold mb-4">Invite Friends</h2>
          <ReferralSystem initData={initData} userId={userId} startParam={startParam} />
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Wallet</h2>
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
