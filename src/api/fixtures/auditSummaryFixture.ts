/**
 * Текстовый fixture audit summary для первого сообщения агента в deep chat.
 *
 * Формат: секции с emoji-заголовками, inline-code в backticks, footer после `---`.
 */
export const auditSummaryFixtureContent = `📈 Детекция

\`12:30–12:40 MSK | Триггер: tx_count LOW\`

• tx_count: 2 (streak=3, gate 42)

⚠️ Ключевые отклонения

• \`3h/10m: 40 tx → 2 tx\` (−95% в 12:10–12:30)
• error_rate: 0.8% → 4.2% (+425%)

✅ Стабильно

• latency_p99 в пределах baseline
• decline_rate без устойчивого тренда

🔧 Действия

1. Проверить доступность upstream-провайдера на gate 42
2. Сверить логи за интервал 12:10–12:40 MSK
3. При подтверждении — эскалация в L2

📢 Провайдеру

> Наблюдаем просадку tx_count на gate 42 с 12:10 MSK.
> Просьба подтвердить статус канала и ETA восстановления.

🎯 Итог: ЭСКАЛИРОВАТЬ

Транзакционный поток на gate 42 критически ниже baseline три цикла подряд; требуется немедленная проверка провайдера.

---
gate_id: 42 | decision: escalate | ts: 2025-07-14 12:40:39 MSK`

/**
 * Structured summary deep-агента после open / propose (отличается от hypothesis conclusion).
 */
export const deepAgentSummaryFixtureContent = `📈 Deep analysis

\`Первичный обзор audit | gate 42\`

• Подтверждена просадка tx_count три цикла подряд
• error_rate растёт параллельно с падением потока

⚠️ Риски

• upstream-провайдер может быть недоступен
• SLA эскалации близок к порогу

🔧 Действия

1. Проверить доступность upstream-провайдера на gate 42
2. Сверить логи за интервал 12:10–12:40 MSK
3. При подтверждении — эскалация в L2

🎯 Итог: НАБЛЮДАТЬ

Требуется подтверждение первого шага — проверка провайдера.

---
gate_id: 42 | step: 1/3 | ts: 2025-07-14 12:41:00 MSK`

/** Короткий structured follow-up после approve/reject или user message. */
export const deepAgentFollowUpFixtureContent = `📈 Обновление

• Шаг выполнен, продолжаю анализ по плану

🔧 Действия

1. Сверить логи за интервал 12:10–12:40 MSK

🎯 Итог: НАБЛЮДАТЬ

---
gate_id: 42 | step: 2/3`

/** Проверяет, что контент — structured summary deep/hypothesis агента. */
export function isAuditSummaryContent(content: string): boolean {
  return content.trimStart().startsWith('📈')
}
