export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  phone?: string;
  email?: string;
  partnerName?: string;
  diagnoses: string[];
  allergies?: string;
  anamnesis?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CycleType = "natural" | "stimulated" | "ivf" | "icsi" | "cryo";
export type CycleStatus =
  | "planning"
  | "stimulation"
  | "trigger"
  | "retrieval"
  | "transfer"
  | "luteal"
  | "completed"
  | "cancelled";

export interface Medication {
  id: string;
  name: string;
  dose: string;
  unit?: string;
  days: string;
  time?: string;
  notes?: string;
}

export interface Protocol {
  id: string;
  name: string;
  type: CycleType;
  medications: Medication[];
  keyDates: {
    stimulationStart?: string;
    trigger?: string;
    retrieval?: string;
    transfer?: string;
    pregnancyTest?: string;
  };
  notes?: string;
}

export interface Cycle {
  id: string;
  patientId: string;
  startDate: string;
  type: CycleType;
  status: CycleStatus;
  protocol?: Protocol;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HormoneResult {
  id: string;
  cycleId: string;
  date: string;
  amh?: number;
  fsh?: number;
  lh?: number;
  estradiol?: number;
  progesterone?: number;
  notes?: string;
}

export const PROTOCOL_TEMPLATES: { name: string; type: CycleType; description: string }[] = [
  { name: "Длинный протокол", type: "ivf", description: "Агонисты ГнРГ + гонадотропины" },
  { name: "Короткий протокол", type: "ivf", description: "Короткая стимуляция" },
  { name: "Антагонисты", type: "ivf", description: "Протокол с антагонистами ГнРГ" },
  { name: "Минимальная стимуляция", type: "ivf", description: "Мягкая стимуляция" },
  { name: "Естественный цикл", type: "natural", description: "Без стимуляции" },
  { name: "Криоперенос", type: "cryo", description: "Перенос размороженных эмбрионов" },
  { name: "ИКСИ", type: "icsi", description: "Интрацитоплазматическая инъекция сперматозоида" },
];

export const STATUS_LABELS: Record<CycleStatus, string> = {
  planning: "Планирование",
  stimulation: "Стимуляция",
  trigger: "Триггер",
  retrieval: "Пункция",
  transfer: "Перенос",
  luteal: "Лютеиновая фаза",
  completed: "Завершён",
  cancelled: "Отменён",
};
