'use client';

import { useEffect, useState } from 'react';

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

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(tasksData);
  const [points, setPoints] = useState<number>(0);

  const handleStart = (taskId: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, started: true } : task
    );
    setTasks(updatedTasks);
  };

  const handleCheck = (taskId: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    const newPoints = points + 100;
    setTasks(updatedTasks);
    setPoints(newPoints);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-6">Your Tasks</h1>
      <h2 className="text-lg font-semibold mb-4">Points: {points}</h2>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
            <p>{task.name}</p>
            {!task.started ? (
              <button
                onClick={() => handleStart(task.id)}
                className="bg-blue-500 text-white py-1 px-3 rounded-lg"
              >
                Start Task
              </button>
            ) : (
              <button
                onClick={() => handleCheck(task.id)}
                className="bg-green-500 text-white py-1 px-3 rounded-lg"
              >
                Complete Task
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
