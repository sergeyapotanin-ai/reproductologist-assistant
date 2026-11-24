import { jsPDF } from "jspdf";
import { Patient, Cycle, STATUS_LABELS } from "@/types";
import { formatDate, calculateAge } from "./utils";

export function generatePatientExtract(patient: Patient, cycles: Cycle[] = []) {
  const doc = new jsPDF();
  const margin = 15;
  let y = 20;

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Выписка из медицинской карты", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Дата формирования: ${formatDate(new Date().toISOString())}`, margin, y);
  y += 12;

  // Patient info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Пациент", margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const fullName = `${patient.lastName} ${patient.firstName} ${patient.middleName || ""}`.trim();
  doc.text(`ФИО: ${fullName}`, margin, y);
  y += 6;
  doc.text(`Дата рождения: ${formatDate(patient.birthDate)} (${calculateAge(patient.birthDate)} лет)`, margin, y);
  y += 6;

  if (patient.phone) {
    doc.text(`Телефон: ${patient.phone}`, margin, y);
    y += 6;
  }
  if (patient.partnerName) {
    doc.text(`Партнёр: ${patient.partnerName}`, margin, y);
    y += 6;
  }
  if (patient.diagnoses.length > 0) {
    doc.text(`Диагнозы: ${patient.diagnoses.join(", ")}`, margin, y);
    y += 6;
  }
  if (patient.allergies) {
    doc.text(`Аллергии: ${patient.allergies}`, margin, y);
    y += 6;
  }

  y += 6;

  // Anamnesis
  if (patient.anamnesis) {
    doc.setFont("helvetica", "bold");
    doc.text("Анамнез", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(patient.anamnesis, 180);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 8;
  }

  // Cycles
  if (cycles.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Протоколы / Циклы", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");

    cycles.forEach((cycle, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const status = STATUS_LABELS[cycle.status] || cycle.status;
      const protocolName = cycle.protocol?.name || "—";
      doc.text(
        `${idx + 1}. ${formatDate(cycle.startDate)} — ${protocolName} (${status})`,
        margin,
        y
      );
      y += 6;

      if (cycle.protocol?.keyDates) {
        const kd = cycle.protocol.keyDates;
        const dates = [
          kd.stimulationStart && `Старт: ${formatDate(kd.stimulationStart)}`,
          kd.trigger && `Триггер: ${formatDate(kd.trigger)}`,
          kd.retrieval && `Пункция: ${formatDate(kd.retrieval)}`,
          kd.transfer && `Перенос: ${formatDate(kd.transfer)}`,
        ].filter(Boolean);
        if (dates.length) {
          doc.setFontSize(9);
          doc.text(dates.join("  |  "), margin + 5, y);
          doc.setFontSize(10);
          y += 5;
        }
      }
      y += 3;
    });
  }

  // Notes
  if (patient.notes) {
    y += 4;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Заметки", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(patient.notes, 180);
    doc.text(noteLines, margin, y);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "Документ сформирован ассистентом репродуктолога. Не является официальной медицинской выпиской.",
      margin,
      290
    );
  }

  doc.save(
    `Выписка_${patient.lastName}_${patient.firstName}_${formatDate(new Date().toISOString()).replace(/\./g, "-")}.pdf`
  );
}
