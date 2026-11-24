import { getPatients, getCycles, savePatients, saveCycles } from "./storage";
import { Patient, Cycle } from "@/types";

export interface ExportData {
  version: number;
  exportedAt: string;
  patients: Patient[];
  cycles: Cycle[];
}

export function exportAllData(): void {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    patients: getPatients(),
    cycles: getCycles(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `repro-backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<{ patients: number; cycles: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as ExportData;

        if (!data.patients || !Array.isArray(data.patients)) {
          throw new Error("Неверный формат файла");
        }

        // Merge strategy: keep existing, add new by id
        const existingPatients = getPatients();
        const existingIds = new Set(existingPatients.map((p) => p.id));
        const newPatients = data.patients.filter((p) => !existingIds.has(p.id));
        savePatients([...newPatients, ...existingPatients]);

        const existingCycles = getCycles();
        const existingCycleIds = new Set(existingCycles.map((c) => c.id));
        const newCycles = (data.cycles || []).filter(
          (c) => !existingCycleIds.has(c.id)
        );
        saveCycles([...newCycles, ...existingCycles]);

        resolve({
          patients: newPatients.length,
          cycles: newCycles.length,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Ошибка чтения файла"));
    reader.readAsText(file);
  });
}
