import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

export function converteParaHorarioBrasilia(dataUtc) {
  if (!dataUtc) return null; // defesa básica

  const data = dayjs.utc(dataUtc).tz('America/Sao_Paulo');
  return data.isValid() ? data : null;
}
export function converteParaHorarioUTC(dataISO) {
    if (!dataISO || typeof dataISO !== 'string') return null;

    // Verifica se a string contém alguma indicação explícita de fuso horário
    const contemFuso = /([+-]\d{2}:?\d{2})/.test(dataISO);

    let dt;
    if (contemFuso) {
        // Se já contém fuso, parse como UTC diretamente
        dt = dayjs.utc(dataISO);
    } else {
        // Se não contém fuso, assume que é horário de Brasília (GMT-3) e soma 3h para UTC
        dt = dayjs(dataISO).add(3, 'hour').utc();
    }

    return dt.isValid() ? dt.toDate() : null;
}



export function agoraBrasilia() {
    return dayjs().tz("America/Sao_Paulo").toDate();
}
