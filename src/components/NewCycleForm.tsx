"use client";

import { useState } from "react";
import { PROTOCOL_TEMPLATES, CycleType, CycleStatus, Medication } from "@/types";
import { addCycle } from "@/lib/storage";
import { X, Plus, Trash2 } from "lucide-react";

interface NewCycleFormProps {
  patientId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewCycleForm({
  patientId,
  onClose,
  onCreated,
}: NewCycleFormProps) {
  const [templateIdx, setTemplateIdx] = useState(0);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<CycleStatus>("planning");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [keyDates, setKeyDates] = useState({
    stimulationStart: "",
    trigger: "",
    retrieval: "",
    transfer: "",
    pregnancyTest: "",
  });
  const [notes, setNotes] = useState("");

  const template = PROTOCOL_TEMPLATES[templateIdx];

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: crypto.randomUUID(),
        name: "",
        dose: "",
        days: "",
      },
    ]);
  };

  const updateMed = (id: string, field: keyof Medication, value: string) => {
    setMedications(
      medications.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const removeMed = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleSubmit = () => {
    addCycle({
      patientId,
      startDate,
      type: template.type,
      status,
      protocol: {
        id: crypto.randomUUID(),
        name: template.name,
        type: template.type,
        medications: medications.filter((m) => m.name.trim()),
        keyDates: {
          stimulationStart: keyDates.stimulationStart || undefined,
          trigger: keyDates.trigger || undefined,
          retrieval: keyDates.retrieval || undefined,
          transfer: keyDates.transfer || undefined,
          pregnancyTest: keyDates.pregnancyTest || undefined,
        },
        notes: notes || undefined,
      },
      notes: notes || undefined,
    });
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Новый протокол</h2>
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Template */}
          <div>
            <label className="block text-sm font-medium mb-1">Тип протокола</label>
            <select
              value={templateIdx}
              onChange={(e) => setTemplateIdx(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              {PROTOCOL_TEMPLATES.map((t, i) => (
                <option key={t.name} value={i}>
                  {t.name} — {t.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Дата старта</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CycleStatus)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="planning">Планирование</option>
              <option value="stimulation">Стимуляция</option>
              <option value="trigger">Триггер</option>
              <option value="retrieval">Пункция</option>
              <option value="transfer">Перенос</option>
              <option value="luteal">Лютеиновая фаза</option>
              <option value="completed">Завершён</option>
              <option value="cancelled">Отменён</option>
            </select>
          </div>

          {/* Key dates */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Ключевые даты</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["stimulationStart", "Старт стимуляции"],
                ["trigger", "Триггер"],
                ["retrieval", "Пункция"],
                ["transfer", "Перенос"],
                ["pregnancyTest", "Тест на беременность"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-0.5">
                    {label}
                  </label>
                  <input
                    type="date"
                    value={(keyDates as any)[key]}
                    onChange={(e) =>
                      setKeyDates({ ...keyDates, [key]: e.target.value })
                    }
                    className="w-full px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Препараты</p>
              <button
                type="button"
                onClick={addMedication}
                className="text-sm text-teal-600 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Добавить
              </button>
            </div>
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="flex gap-2 items-start bg-gray-50 dark:bg-gray-800 p-2 rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <input
                      placeholder="Название"
                      value={med.name}
                      onChange={(e) => updateMed(med.id, "name", e.target.value)}
                      className="w-full px-2 py-1.5 rounded border text-sm dark:bg-gray-900"
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="Доза"
                        value={med.dose}
                        onChange={(e) =>
                          updateMed(med.id, "dose", e.target.value)
                        }
                        className="w-1/2 px-2 py-1.5 rounded border text-sm dark:bg-gray-900"
                      />
                      <input
                        placeholder="Дни (1-5)"
                        value={med.days}
                        onChange={(e) =>
                          updateMed(med.id, "days", e.target.value)
                        }
                        className="w-1/2 px-2 py-1.5 rounded border text-sm dark:bg-gray-900"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeMed(med.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Заметки</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-medium"
          >
            Создать протокол
          </button>
        </div>
      </div>
    </div>
  );
}
