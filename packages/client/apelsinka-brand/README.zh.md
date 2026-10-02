---
description: "Слой бренда «Апельсинки»: долька и вордмарк в сайдбаре, оранжевый акцент поверх токенов дизайн-платформы и вкладка «Оформление» с переключением палитр."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-apelsinka-brand

[English](README.md) | 中文

Владельцу этот лист удобнее читать в [README.ru.md](README.ru.md).

## Summary

Слой бренда «Апельсинки» даёт изданию своё лицо: долька и вордмарк «Апельсинка / Harness» в сайдбаре, оранжевый акцент поверх штатных токенов дизайн-платформы, контурная долька во время работы агента и вкладка «Оформление» рядом с «Чат», переключающая четыре палитры.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Вкладка «Оформление» открывает выбор палитры. «Стандартная» не трогает токены дизайн-платформы, «Долька» меняет и акцент, и нейтральную лестницу, «Цедра» делает то же самое, но со золотом как вторым цветом бренда, а «Цитрус» — вариант по умолчанию — меняет только акцент. Выбор хранится в браузере под ключом `apelsinka.brand.variant`, применяется сразу, переживает перезагрузку и никогда не попадает в журнал сессии.

Долька и вордмарк рисуются в слотах `sidebar.brand.mark` и `sidebar.brand.name`, поэтому оболочка сохраняет свои отступы и поведение кнопки «Новая сессия».

## Understand the implementation

Палитра подменяет лестницы токенов дизайн-платформы, а не добавляет свои, поэтому любая штатная поверхность, читающая псевдоним, следует за выбором. Один и тот же блок токенов уходит в два селектора: штатная тёмная тема объявляет эти токены на `body[data-ds-dark-theme]`, а селектор по атрибуту считается на уровне класса, поэтому блок на `html body` (0,0,2) проигрывает (0,1,1), и палитра не применилась бы нигде. Выигрывает `html body[data-ds-dark-theme]` (0,1,2).

Токены живут в одном элементе `<style>` в `document.head`, а не в собранной таблице стилей: палитра меняется во время работы, а статический бандл не может нести четыре варианта. Долька и вордмарк регистрируются с приоритетом -1: штатный пакет `ui-brand-official` занимает оба слота с приоритетом по умолчанию, вторая регистрация одиночного слота на занятом приоритете бросает ошибку в браузере, а записи слота сортируются по приоритету по возрастанию, и ячейка рисует первую живую запись.

Пакет не предоставляет сервис и не объявляет слияние Context.

## Further Exploration

- [ui-sidebar](../ui-sidebar/README.zh.md) — сайдбар, который рисует слоты бренда и кнопку сворачивания.
- [ui-conversation](../ui-conversation/README.zh.md) — поверхность разговора, в чьём кольце вкладок живёт «Оформление».
- [ui-theme](../ui-theme/README.zh.md) — токены дизайн-платформы, которые перекрывает этот пакет.

## Model Experience

None, as the package is a browser-side UI plugin layer that registers nothing model-facing.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- **Силуэт рабочего состояния** — индикатор работы нарисован контурной маской из пяти секторов в 14 px, где секторы сливаются в обычный круг. Читаемый силуэт требует заменить штатного кита, а не подменять его маской; эта работа отложена.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

Текст интерфейса живёт в пространстве имён `apelsinka-brand`. Встроенные словари `en` и `zh` регистрируются через типизированную перегрузку, а `ru` — через перегрузку пространства имён, потому что язык издания не входит во встроенные идентификаторы локалей.

</details>

**Runtime invariant:** No companion is published. It is a pure-consumer plugin: it emits no Cordis events and owns no mutable cross-plugin state; its slot registrations are plain effects whose disposal the slot ledger's own specs observe directly.