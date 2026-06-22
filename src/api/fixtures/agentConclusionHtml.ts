/** HTML-фикстура вывода агента для dev и Vitest. */
export const agentConclusionHtmlFixture = `
<article>
  <section>
    <h3>🚨 <strong>ALERT: Gate 1001 Test</strong></h3>
  </section>
  <section>
    <h3>📉 <strong>Детекция</strong></h3>
    <p><code>12:30–12:40 UTC</code> | Триггер: <code>tx_count</code> LOW</p>
    <ul>
      <li>tx_count: <strong>2</strong> (streak=3)</li>
      <li>success_rate: <strong>1.0</strong> (NORMAL)</li>
    </ul>
  </section>
  <section>
    <h3>⚠️ <strong>Ключевые отклонения</strong></h3>
    <ul>
      <li><code>3h/10m</code>: 40 tx → <strong>2 tx</strong> (−95% в 12:10–12:30)</li>
      <li><code>24h</code>: 240 tx/час → <strong>48 tx/час</strong> (−80% в 12:00)</li>
      <li><code>12:00</code>: 2 declined (DE, US), ошибки E001/E002 — единичные</li>
    </ul>
  </section>
  <section>
    <h3>✅ <strong>Стабильно</strong></h3>
    <ul>
      <li>SR по unknown-трафику: 100%</li>
      <li>Top-IP (198.51.100.31–.41): равномерно, без аномалий</li>
    </ul>
  </section>
  <section>
    <h3>🔧 <strong>Действия</strong></h3>
    <ol>
      <li>Выгрузить tx_count по минутам за 12:00–12:40</li>
      <li>Проверить логи конфигурации гейта (11:50–12:30)</li>
      <li>Детализировать 2 declined (BIN, эмитент, ответ провайдера)</li>
    </ol>
  </section>
  <section>
    <h3>📬 <strong>Провайдеру</strong></h3>
    <blockquote>
      «Подтвердите доступность приёма транзакций для гейта 1001 Test с 12:00 UTC.
      Зафиксировано падение объёма 40→2 tx/10мин без роста ошибок на нашей стороне».
    </blockquote>
  </section>
  <section>
    <h3>🎯 <strong>Итог</strong>: <strong>ЭСКАЛИРОВАТЬ</strong></h3>
    <p>Устойчивый LOW-стрик + обвал трафика &gt;95% = требуется срочная проверка upstream-интеграции.</p>
  </section>
  <p class="agent-conclusion-meta">
    <code>gate_id: 1001</code> |
    <code>decision: escalate</code> |
    <code>ts: 2026-06-10 12:40:39</code>
  </p>
</article>
`.trim()
