"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  User,
  FileText,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import {
  getPatient,
  updatePatient,
  deletePatient,
  getPatientCycles,
  deleteCycle,
} from "@/lib/storage";
import { Patient, Cycle } from "@/types";
import { formatDate, calculateAge } from "@/lib/utils";
import VoiceDictation from "@/components/VoiceDictation";
import CycleCard from "@/components/CycleCard";
import NewCycleForm from "@/components/NewCycleForm";
import MonthCalendar from "@/components/MonthCalendar";
import { generatePatientExtract } from "@/lib/pdf";

export default function PatientPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Patient>>({});
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  const loadData = () => {
    const p = getPatient(id);
    if (p) {
      setPatient(p);
      setForm(p);
      setCycles(getPatientCycles(id));
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    const saved = localStorage.getItem("theme");
    if (
      saved === "dark" ||
      (!saved &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, [id]);

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

  const handleSave = () => {
    if (!patient) return;
    const updated = updatePatient(patient.id, {
      ...form,
      diagnoses: Array.isArray(form.diagnoses)
        ? form.diagnoses
        : String(form.diagnoses || "")
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
    });
    if (updated) {
      setPatient(updated);
      setEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Удалить пациента? Это действие нельзя отменить.")) {
      deletePatient(id);
      router.push("/");
    }
  };

  const handleDeleteCycle = (cycleId: string) => {
    if (confirm("Удалить этот протокол?")) {
      deleteCycle(cycleId);
      setCycles(getPatientCycles(id));
    }
  };

  const handlePdf = () => {
    if (patient) generatePatientExtract(patient, cycles);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Загрузка...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>Пациент не найден</p>
        <Link href="/" className="text-teal-600">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-teal-700 text-white shadow-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1 -ml-1">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                {patient.lastName} {patient.firstName}
              </h1>
              <p className="text-teal-100 text-xs">
                {calculateAge(patient.birthDate)} лет
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-teal-600"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handlePdf}
              className="p-2 rounded-lg hover:bg-teal-600"
              title="Скачать PDF"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() => setEditing(!editing)}
              className="p-2 rounded-lg hover:bg-teal-600"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4 pb-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-medium text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> Основные данные
          </h2>
          {editing ? (
            <div className="space-y-3">
              <input
                value={form.lastName || ""}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Фамилия"
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600"
              />
              <input
                value={form.firstName || ""}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Имя"
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600"
              />
              <input
                type="date"
                value={form.birthDate || ""}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600"
              />
              <input
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Телефон"
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600"
              />
              <input
                value={form.partnerName || ""}
                onChange={(e) =>
                  setForm({ ...form, partnerName: e.target.value })
                }
                placeholder="Партнёр"
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600"
              />
              <input
                value={
                  Array.isArray(form.diagnoses)
                    ? form.diagnoses.join(", ")
                    : (form.diagnoses as any) || ""
                }
                onChange={(e) =>
                  setForm({ ...form, diagnoses: e.target.value as any })
                }
                placeholder="Диагнозы (через запятую)"
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-600"
              />
            </div>
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Дата рождения</dt>
                <dd>{formatDate(patient.birthDate)}</dd>
              </div>
              {patient.phone && (
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Телефон</dt>
                  <dd className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${patient.phone}`} className="text-teal-600">
                      {patient.phone}
                    </a>
                  </dd>
                </div>
              )}
              {patient.partnerName && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Партнёр</dt>
                  <dd>{patient.partnerName}</dd>
                </div>
              )}
              {patient.diagnoses.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Диагнозы</dt>
                  <dd className="text-right">{patient.diagnoses.join(", ")}</dd>
                </div>
              )}
              {patient.allergies && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Аллергии</dt>
                  <dd className="text-right text-red-600">{patient.allergies}</dd>
                </div>
              )}
            </dl>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-medium text-teal-700 dark:text-teal-400 mb-3">
            Анамнез
          </h2>
          {editing ? (
            <VoiceDictation
              value={form.anamnesis || ""}
              onChange={(val) => setForm({ ...form, anamnesis: val })}
              placeholder="Надиктуйте анамнез..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {patient.anamnesis || (
                <span className="text-gray-400">Не заполнен</span>
              )}
            </p>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-medium text-teal-700 dark:text-teal-400 mb-3">
            Заметки
          </h2>
          {editing ? (
            <VoiceDictation
              value={form.notes || ""}
              onChange={(val) => setForm({ ...form, notes: val })}
              placeholder="Заметки..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {patient.notes || (
                <span className="text-gray-400">Нет заметок</span>
              )}
            </p>
          )}
        </section>

        {editing && (
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-medium"
          >
            Сохранить изменения
          </button>
        )}

        {/* Calendar */}
        {cycles.length > 0 && (
          <section>
            <h2 className="font-medium text-teal-700 dark:text-teal-400 mb-3">
              Календарь стимуляции
            </h2>
            <MonthCalendar cycles={cycles} />
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-teal-700 dark:text-teal-400">
              Протоколы ЭКО
            </h2>
            <button
              onClick={() => setShowNewCycle(true)}
              className="flex items-center gap-1 text-sm text-teal-600 font-medium"
            >
              <Plus className="w-4 h-4" /> Добавить
            </button>
          </div>

          {cycles.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              Пока нет протоколов
            </div>
          ) : (
            <div className="space-y-3">
              {cycles.map((cycle) => (
                <CycleCard
                  key={cycle.id}
                  cycle={cycle}
                  onDelete={handleDeleteCycle}
                />
              ))}
            </div>
          )}
        </section>

        <p className="text-xs text-center text-gray-400 pt-4">
          Данные хранятся только на этом устройстве · Вспомогательный инструмент
        </p>
      </main>

      {showNewCycle && (
        <NewCycleForm
          patientId={id}
          onClose={() => setShowNewCycle(false)}
          onCreated={loadData}
        />
      )}
    </div>
  );
}
