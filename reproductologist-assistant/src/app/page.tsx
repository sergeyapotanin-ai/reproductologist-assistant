"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  User,
  Calendar,
  Moon,
  Sun,
  Download,
  Upload,
  Bell,
} from "lucide-react";
import { getPatients, getCycles } from "@/lib/storage";
import { Patient } from "@/types";
import { formatDate, calculateAge } from "@/lib/utils";
import { exportAllData, importData } from "@/lib/export-import";
import {
  getUpcomingReminders,
  formatReminderDate,
  requestNotificationPermission,
} from "@/lib/reminders";

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);
  const [reminders, setReminders] = useState<
    { id: string; title: string; date: string; patientId: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    const pts = getPatients();
    setPatients(pts);
    const cycles = getCycles();
    const names: Record<string, string> = {};
    pts.forEach((p) => {
      names[p.id] = `${p.lastName} ${p.firstName[0]}.`;
    });
    setReminders(getUpcomingReminders(cycles, names).slice(0, 5));
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    const saved = localStorage.getItem("theme");
    if (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importData(file);
      loadData();
      alert(
        `Импортировано: ${result.patients} пациентов, ${result.cycles} протоколов`
      );
    } catch {
      alert("Ошибка импорта. Проверьте файл.");
    }
    e.target.value = "";
  };

  const enableNotifications = async () => {
    const ok = await requestNotificationPermission();
    alert(
      ok
        ? "Уведомления разрешены."
        : "Не удалось получить разрешение на уведомления."
    );
  };

  const filtered = patients.filter((p) => {
    const fullName = `${p.lastName} ${p.firstName} ${p.middleName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-teal-700 text-white shadow-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Ассистент репродуктолога</h1>
            <p className="text-teal-100 text-sm mt-0.5">Картотека пациентов</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={enableNotifications}
              className="p-2 rounded-lg hover:bg-teal-600"
              title="Уведомления"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={exportAllData}
              className="p-2 rounded-lg hover:bg-teal-600"
              title="Экспорт"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-teal-600"
              title="Импорт"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-teal-600"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {reminders.length > 0 && (
        <div className="max-w-lg mx-auto w-full px-4 pt-3">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" /> Ближайшие события
            </p>
            <ul className="space-y-1">
              {reminders.map((r) => (
                <li key={r.id} className="text-sm flex justify-between gap-2">
                  <Link
                    href={`/patient/${r.patientId}`}
                    className="text-amber-900 dark:text-amber-100 truncate hover:underline"
                  >
                    {r.title}
                  </Link>
                  <span className="text-amber-600 dark:text-amber-300 shrink-0 text-xs">
                    {formatReminderDate(r.date)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto w-full px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Поиск по ФИО..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>{search ? "Ничего не найдено" : "Пока нет пациентов"}</p>
            <p className="text-sm mt-1">Нажмите + чтобы добавить</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((patient) => (
              <li key={patient.id}>
                <Link
                  href={`/patient/${patient.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-medium text-lg truncate">
                        {patient.lastName} {patient.firstName}{" "}
                        {patient.middleName || ""}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {calculateAge(patient.birthDate)} лет ·{" "}
                        {formatDate(patient.birthDate)}
                      </p>
                      {patient.diagnoses.length > 0 && (
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 truncate">
                          {patient.diagnoses.join(", ")}
                        </p>
                      )}
                    </div>
                    <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-20">
        <Link
          href="/patient/new"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 active:scale-95 transition-all"
        >
          <Plus className="w-7 h-7" />
        </Link>
      </div>

      <footer className="max-w-lg mx-auto w-full px-4 py-3 text-center text-xs text-gray-400">
        Вспомогательный инструмент. Решения принимает только врач.
      </footer>
    </div>
  );
}
