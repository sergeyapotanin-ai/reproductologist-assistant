"use client";

import { Cycle, STATUS_LABELS } from "@/types";
import { formatDate } from "@/lib/utils";
import { Calendar, Syringe, Trash2 } from "lucide-react";

interface CycleCardProps {
  cycle: Cycle;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export default function CycleCard({ cycle, onDelete, onClick }: CycleCardProps) {
  const statusColor: Record<string, string> = {
    planning: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    stimulation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    trigger: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    retrieval: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    transfer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    luteal: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.99] transition cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium truncate">
              {cycle.protocol?.name || "Протокол"}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                statusColor[cycle.status] || statusColor.planning
              }`}
            >
              {STATUS_LABELS[cycle.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Старт: {formatDate(cycle.startDate)}
          </p>

          {cycle.protocol?.keyDates && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
              {cycle.protocol.keyDates.trigger && (
                <span>Триггер: {formatDate(cycle.protocol.keyDates.trigger)}</span>
              )}
              {cycle.protocol.keyDates.retrieval && (
                <span>Пункция: {formatDate(cycle.protocol.keyDates.retrieval)}</span>
              )}
              {cycle.protocol.keyDates.transfer && (
                <span>Перенос: {formatDate(cycle.protocol.keyDates.transfer)}</span>
              )}
            </div>
          )}

          {cycle.protocol?.medications && cycle.protocol.medications.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
              <Syringe className="w-3.5 h-3.5" />
              {cycle.protocol.medications.length} препарат(ов)
            </div>
          )}
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cycle.id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
