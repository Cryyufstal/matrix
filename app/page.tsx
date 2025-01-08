'use client';

import ReferralSystem from '@/components/ReferralSystem';
import { useEffect, useState } from 'react';

export default function Home() {
  const [initData, setInitData] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [startParam, setStartParam] = useState('');
  const [points, setPoints] = useState<number>(0);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Visit Google", link: "https://google.com", status: "pending" },
    { id: 2, title: "Visit YouTube", link: "https://youtube.com", status: "pending" },
  ]);

  useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        setInitData(WebApp.initData);
        setUserId(WebApp.initDataUnsafe.user?.id.toString() || '');
        setUsername(WebApp.initDataUnsafe.user?.username || 'Unknown');
        setStartParam(WebApp.initDataUnsafe.start_param || '');

        // إذا كان المستخدم مدعوًا، أضف 300 نقطة
        if (WebApp.initDataUnsafe.start_param) {
          setPoints((prev) => prev + 300);
          await updatePointsInDB(WebApp.initDataUnsafe.user?.username || '', points + 300);
        }
      }
    };

    initWebApp();
  }, []);

  const handleCheckTask = async (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    );
    setPoints((prev) => prev + 100);
    await updatePointsInDB(username, points + 100);
  };

  const updatePointsInDB = async (username: string, newPoints: number) => {
  const db = await openDatabase();
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");

  // الحصول على المستخدم
  const request = store.get(username);
  request.onsuccess = () => {
    const user = request.result;

    if (user) {
      // تحديث النقاط للمستخدم الحالي
      user.points = newPoints;
      store.put(user);
    } else {
      // إضافة مستخدم جديد إذا لم يكن موجودًا
      store.add({ username, points: newPoints });
    }
  };

  request.onerror = () => {
    console.error("Error accessing user data in IndexedDB");
  };

  await tx.done;
  db.close();
};

  const openDatabase = async () => {
    if (!("indexedDB" in window)) {
      throw new Error("This browser doesn't support IndexedDB");
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("TaskAppDB", 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("users")) {
          db.createObjectStore("users", { keyPath: "username" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Telegram Referral Demo</h1>
      {username && <p className="text-lg mb-4">Welcome, @{username}!</p>}
      <p className="text-lg mb-4">Your Points: {points}</p>

      {/* عرض قائمة المهام */}
      <div className="task-container w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="mb-4">
              <div className="flex items-center justify-between">
                <span>{task.title}</span>
                {task.status === "pending" ? (
                  <>
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Start
                    </a>
                    <button
                      onClick={() => handleCheckTask(task.id)}
                      className="btn btn-secondary"
                    >
                      Check
                    </button>
                  </>
                ) : (
                  <span className="text-green-500">Completed</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* نظام الإحالة */}
      <ReferralSystem initData={initData} userId={userId} startParam={startParam} />
    </main>
  );
            }
