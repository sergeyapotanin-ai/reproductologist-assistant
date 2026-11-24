import { Cycle } from "@/types";
import { parseISO, isToday, isTomorrow, format } from "date-fns";
import { ru } from "date-fns/locale";

export interface Reminder {
  id: string;
  title: string;
  date: string;
  patientId: string;
  type: "keyDate" | "medication";
}

export function getUpcomingReminders(
  cycles: Cycle[],
  patientNames: Record<string, string>
): Reminder[] {
  const reminders: Reminder[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  cycles.forEach((cycle) => {
    const kd = cycle.protocol?.keyDates;
    if (!kd) return;

    const labels: Record<string, string> = {
      stimulationStart: "Старт стимуляции",
      trigger: "Триггер",
      retrieval: "Пункция",
      transfer: "Перенос эмбриона",
      pregnancyTest: "Тест на беременность",
    };

    Object.entries(kd).forEach(([key, dateStr]) => {
      if (!dateStr) return;
      const date = parseISO(dateStr);
      if (date >= today) {
        const name = patientNames[cycle.patientId] || "Пациент";
        reminders.push({
          id: `${cycle.id}-${key}`,
          title: `${labels[key] || key} — ${name}`,
          date: dateStr,
          patientId: cycle.patientId,
          type: "keyDate",
        });
      }
    });
  });

  return reminders.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function formatReminderDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Сегодня";
  if (isTomorrow(date)) return "Завтра";
  return format(date, "d MMMM", { locale: ru });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  }
}
