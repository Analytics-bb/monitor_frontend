---
id: m7-composer-attachments
parent_module: .cursor/plans/FE/module-7-support.plan.md
depends_on:
  - m7-page-shell
  - m7-use-support-chat
  - m0-toast-provider
план читать: "да, §Ключевые гарантии п.4–6"
status: completed
---

# Задача: SupportComposer — text + file upload

## Что сделать
`SupportComposer` + `AttachmentChips`: pill composer как deep `ChatComposer`; кнопка attach; upload → pending chips; send text и/или `attachment_ids`; disabled при `processing`.

## Файлы
**Создать:**
- `src/components/support/SupportComposer.tsx`
- `src/components/support/AttachmentChips.tsx`

**Изменить:**
- `src/pages/SupportPage.tsx`
- `src/components/support/index.ts`

## Контракт (если задача создаёт/меняет сущность)
Send guard: непустой `content` или непустой `attachment_ids`.

`409 chat_processing` → toast + refetch, draft сохранён. `422 attachment_rejected` → toast.

Upload при `processing` — UI disabled.

## Решения / якоря реализации
- Повторить паттерн: `src/components/deep/ChatComposer.tsx` — pill layout, Enter send.
- Обязательно: pending attachment metadata cache (filename из upload response) для chips.
- Не делать: optimistic append messages.

## Зависимости
- `m7-use-support-chat` — send/upload, `snapshot.state`.
- `m0-toast-provider` — `error_code` toasts.

## Тесты
| Сценарий | Путь теста | Критерий |
|----------|-----------|----------|
| processing blocks input | `tests/unit/support/SupportComposer.test.tsx` | disabled при processing |
| send with attachment | `tests/unit/support/SupportComposer.test.tsx` | upload then send with ids |

## DoD
- [ ] Composer + attach wired
- [ ] 409/422 обработаны
- [ ] Тесты из раздела «Тесты» зелёные
- [ ] Нет нарушений инвариантов проекта (актуальный список — `memory.md`, раздел «Инварианты»)
