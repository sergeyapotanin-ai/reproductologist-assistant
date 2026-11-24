"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { addPatient } from "@/lib/storage";
import VoiceDictation from "@/components/VoiceDictation";

export default function NewPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    birthDate: "",
    phone: "",
    email: "",
    partnerName: "",
    diagnoses: "",
    allergies: "",
    anamnesis: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lastName || !form.firstName || !form.birthDate) {
      alert("Заполните фамилию, имя и дату рождения");
      return;
    }

    const patient = addPatient({
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || undefined,
      birthDate: form.birthDate,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      partnerName: form.partnerName.trim() || undefined,
      diagnoses: form.diagnoses
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      allergies: form.allergies.trim() || undefined,
      anamnesis: form.anamnesis.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });

    router.push(`/patient/${patient.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-teal-700 text-white shadow-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold">Новый пациент</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4 pb-28">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Фамилия *</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Имя *</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Отчество</label>
            <input
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Дата рождения *</label>
            <input
              type="date"
              required
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Партнёр</label>
            <input
              value={form.partnerName}
              onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Диагнозы (МКБ-10, через запятую)</label>
            <input
              value={form.diagnoses}
              onChange={(e) => setForm({ ...form, diagnoses: e.target.value })}
              placeholder="N97.1, E28.2"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Аллергии</label>
            <input
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Анамнез</label>
            <VoiceDictation
              value={form.anamnesis}
              onChange={(val) => setForm({ ...form, anamnesis: val })}
              placeholder="Надиктуйте или введите анамнез..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Заметки</label>
            <VoiceDictation
              value={form.notes}
              onChange={(val) => setForm({ ...form, notes: val })}
              placeholder="Дополнительные заметки..."
            />
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-lg mx-auto">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 active:scale-[0.98] transition"
          >
            <Save className="w-5 h-5" />
            Сохранить пациента
          </button>
        </div>
      </div>
    </div>
  );
}
