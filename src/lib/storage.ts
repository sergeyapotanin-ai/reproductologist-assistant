import { Patient, Cycle } from "@/types";

const PATIENTS_KEY = "repro_patients";
const CYCLES_KEY = "repro_cycles";

export function getPatients(): Patient[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(PATIENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePatients(patients: Patient[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

export function addPatient(
  patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
): Patient {
  const patients = getPatients();
  const newPatient: Patient = {
    ...patient,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  patients.unshift(newPatient);
  savePatients(patients);
  return newPatient;
}

export function updatePatient(
  id: string,
  updates: Partial<Patient>
): Patient | null {
  const patients = getPatients();
  const index = patients.findIndex((p) => p.id === id);
  if (index === -1) return null;
  patients[index] = {
    ...patients[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  savePatients(patients);
  return patients[index];
}

export function deletePatient(id: string): void {
  const patients = getPatients().filter((p) => p.id !== id);
  savePatients(patients);
  const cycles = getCycles().filter((c) => c.patientId !== id);
  saveCycles(cycles);
}

export function getCycles(): Cycle[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CYCLES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCycles(cycles: Cycle[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CYCLES_KEY, JSON.stringify(cycles));
}

export function getPatientCycles(patientId: string): Cycle[] {
  return getCycles()
    .filter((c) => c.patientId === patientId)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
}

export function addCycle(
  cycle: Omit<Cycle, "id" | "createdAt" | "updatedAt">
): Cycle {
  const cycles = getCycles();
  const newCycle: Cycle = {
    ...cycle,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  cycles.unshift(newCycle);
  saveCycles(cycles);
  return newCycle;
}

export function updateCycle(
  id: string,
  updates: Partial<Cycle>
): Cycle | null {
  const cycles = getCycles();
  const index = cycles.findIndex((c) => c.id === id);
  if (index === -1) return null;
  cycles[index] = {
    ...cycles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCycles(cycles);
  return cycles[index];
}

export function deleteCycle(id: string): void {
  const cycles = getCycles().filter((c) => c.id !== id);
  saveCycles(cycles);
}
