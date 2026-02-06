---
description: Шаблон и правила оформления кейсов на сайте
---

# Структура кейса

Все кейсы должны следовать единому шаблону, основанному на формате Chery/ViaMed.

## 1. Hero Section (Dashboard Grid)

```html
<section class="section case-hero-section">
    <div class="container">
        <!-- Хлебные крошки -->
        <div class="breadcrumbs mb-40">
            <a href="/">Главная</a> > <a href="/cases/">Кейсы</a> > <span>Название</span>
        </div>

        <!-- Dashboard Grid: 2 колонки -->
        <div class="case-hero-grid">
            <!-- Левая: Главная карточка с фоном -->
            <div class="case-main-card">
                <img src="/images/[case]-card.png" class="case-hero-bg" alt="">
                <div style="...">КЕЙС: [КАТЕГОРИЯ]</div>
                <h1 class="case-hero-title">Название<br><span class="text-accent">Клиента</span></h1>
                <p class="case-hero-desc">Краткое описание результата (1-2 предложения)</p>
            </div>

            <!-- Правая: 2 карточки статов -->
            <div class="case-stat-stack">
                <div class="case-stat-card">
                    <div class="case-stat-big text-accent">[ЧИСЛО]</div>
                    <div class="case-stat-label">[Метрика 1]</div>
                </div>
                <div class="case-stat-card">
                    <div class="case-stat-big">[ЧИСЛО]</div>
                    <div class="case-stat-label">[Метрика 2]</div>
                </div>
            </div>
        </div>

        <!-- Meta Bar -->
        <div class="case-meta-bar">
            <div class="meta-group"><div class="meta-label">Клиент</div><div class="meta-value">[Имя]</div></div>
            <div class="meta-group"><div class="meta-label">Локация</div><div class="meta-value">[Город]</div></div>
            <div class="meta-group"><div class="meta-label">Инструменты</div><div class="meta-value">[FB/Insta + AI]</div></div>
            <div class="meta-group"><div class="meta-label">Задача</div><div class="meta-value">[Задача]</div></div>
            <img src="/images/[logo].jpg" class="case-meta-logo" alt="">
        </div>
    </div>
</section>
```

## 2. Body Layout (Контент + Sticky CTA)

```html
<section class="section">
    <div class="container">
        <div class="case-body-layout">
            <!-- Sticky виджет слева -->
            <div class="sticky-widget sticky-cta">
                <div>🚀</div>
                <h3>Хотите такой же результат?</h3>
                <p>Мы бесплатно разберем вашу ситуацию.</p>
                <a href="/#lead-form" class="btn btn-full">Оставить заявку</a>
            </div>

            <!-- Контент справа -->
            <div class="case-content-col">
                <article class="case-content">
                    <!-- Секции: Вызов, Решение, Результаты -->
                </article>
            </div>
        </div>
    </div>
</section>
```

## 3. Структура контента

### Обязательные секции:
1. **🎯 Вызов** — описание проблемы клиента до работы с нами
2. **⚡ Решение** — что мы сделали (архитектура системы)
3. **📊 Результаты** — конкретные цифры и метрики
4. **💰 Экономика** — ROI, окупаемость, сравнение

### Стиль текста:
- Короткие абзацы (2-3 предложения)
- Списки с буллетами для перечислений
- Акцент на цифрах и конкретных результатах
- Используй `<strong>` для ключевых фраз

## 4. Секция "Другие кейсы"

В конце каждого кейса добавляем секцию с 3 последними кейсами:

```html
<section class="section" style="border-top: 1px solid rgba(255,255,255,0.05);">
    <div class="container">
        <h2 class="mb-40">Другие кейсы</h2>
        <div class="cases-archive-grid" id="seeAlsoGrid"></div>
    </div>
</section>

<script src="/js/cases-data.js"></script>
<script>
    // Фильтруем текущий кейс и показываем 3 других
    const currentCaseId = '[case-id]';
    const others = window.casesData.filter(c => c.id !== currentCaseId).slice(0, 3);
    // ... рендер карточек
</script>
```

## 5. Регистрация в cases-data.js

Добавить новый кейс в начало массива `window.casesData`:

```javascript
{
    id: '[case-id]',
    category: 'services|b2b|auto',
    url: '/cases/case-[name]/',
    image: '/images/[case]-card.png',
    niche: '[Ниша]',
    title: '[Название]',
    desc: '[Продающее описание для карточки]',
    stats: [
        { val: '[число]', label: '[метрика]' },
        { val: '[число]', label: '[метрика]', isAccent: true }
    ]
}
```

## 6. Изображения

- **Карточка для архива**: `/images/[case]-card.png` — 600x400, тёмный фон с логотипом
- **Логотип**: `/images/[case]-logo.jpg` — для meta bar
- **Hero background**: То же что и карточка, отображается полупрозрачно

## Чеклист при создании нового кейса

- [ ] Создать папку `/cases/case-[name]/`
- [ ] Создать `index.html` по шаблону
- [ ] Подготовить изображения (card.png, logo.jpg)
- [ ] Добавить в `cases-data.js` (в начало массива!)
- [ ] Проверить хлебные крошки
- [ ] Проверить секцию "Другие кейсы"
- [ ] Проверить мобильную версию
