"use client";

import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Cycle } from "@/types";

interface CalendarEvent {
  date: string;
  label: string;
  color: string;
  cycleId: string;
}

interface MonthCalendarProps {
  cycles: Cycle[];
}

const EVENT_COLORS: Record<string, string> = {
  stimulationStart: "bg-blue-500",
  trigger: "bg-purple-500",
  retrieval: "bg-orange-500",
  transfer: "bg-green-500",
  pregnancyTest: "bg-pink-500",
};

const EVENT_LABELS: Record<string, string> = {
  stimulationStart: "Старт",
  trigger: "Триггер",
  retrieval: "Пункция",
  transfer: "Перенос",
  pregnancyTest: "Тест",
};

export default function MonthCalendar({ cycles }: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const events = useMemo(() => {
    const list: CalendarEvent[] = [];
    cycles.forEach((cycle) => {
      const kd = cycle.protocol?.keyDates;
      if (!kd) return;
      Object.entries(kd).forEach(([key, date]) => {
        if (date) {
          list.push({
            date,
            label: EVENT_LABELS[key] || key,
            color: EVENT_COLORS[key] || "bg-gray-500",
            cycleId: cycle.id,
          });
        }
      });
      // Also mark start date
      if (cycle.startDate) {
        list.push({
          date: cycle.startDate,
          label: "Старт цикла",
          color: "bg-teal-500",
          cycleId: cycle.id,
        });
      }
    });
    return list;
  }, [cycles]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(parseISO(e.date), day));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: ru })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-500 py-1 font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[44px] p-0.5 rounded-lg text-center relative ${
                isCurrentMonth
                  ? "bg-gray-50 dark:bg-gray-900/50"
                  : "opacity-30"
              } ${isToday ? "ring-2 ring-teal-500" : ""}`}
            >
              <span
                className={`text-xs ${
                  isToday ? "font-bold text-teal-600" : ""
                }`}
              >
                {format(day, "d")}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${ev.color}`}
                      title={ev.label}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {events.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
          {Object.entries(EVENT_LABELS).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${EVENT_COLORS[key]}`} />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
