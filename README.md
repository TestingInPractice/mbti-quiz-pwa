<<<<<<< HEAD
# MBTI Quiz PWA — Определи свою IT-роль

> Progressive Web Application для определения типа личности MBTI и рекомендации IT-роли. Работает полностью офлайн после установки.

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-181717.svg)](https://TestingInPractice.github.io/mbti-quiz-pwa/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 Открыть приложение

👉 **[https://TestingInPractice.github.io/mbti-quiz-pwa/](https://TestingInPractice.github.io/mbti-quiz-pwa/)**

## 📱 Установка на телефон

### iPhone / iPad
1. Открой **Safari** → [ссылку](https://TestingInPractice.github.io/mbti-quiz-pwa/)
2. Нажми **Поделиться** (⎋) → **На экран «Домой»**
3. Иконка появится на рабочем столе

### Android
1. Открой **Chrome** → [ссылку](https://TestingInPractice.github.io/mbti-quiz-pwa/)
2. Нажми **⋮** → **Установить приложение**

## ✨ Фичи

- 🧠 **60 вопросов** по 4 категориям MBTI
- 🎯 **16 типов личности** + рекомендация IT-роли
- 📊 **История прохождений** (хранится локально)
- 📱 **PWA** — установка как нативное приложение
- 🔄 **Офлайн-режим** — работает без интернета
- 🖼 **Адаптивный дизайн** — mobile-first

## 🛠 Технологии

| Компонент | Технология |
|-----------|------------|
| **Frontend** | Чистый HTML5 + CSS3 + JavaScript |
| **PWA** | Service Worker + Web Manifest |
| **Хранение** | localStorage |
| **Деплой** | GitHub Pages |
| **Данные** | questions.json (экспорт из Django) |

## 📂 Структура проекта

```
mbti-quiz-pwa/
├── index.html              ← Главная страница (SPA)
├── manifest.json           ← PWA конфигурация
├── service-worker.js       ← Кэширование + офлайн
├── css/
│   └── style.css           ← Адаптивные стили
├── js/
│   ├── app.js              ← Основная логика
│   ├── scoring.js          ← MBTI расчёт
│   └── storage.js          ← localStorage
├── data/
│   └── questions.json      ← 60 вопросов
└── icons/
    ├── icon-192x192.png    ← Иконка для PWA
    └── icon-512x512.png    ← Иконка для splash screen
```

## 🧪 Алгоритм расчёта MBTI

Каждый вопрос имеет:
- **Категорию**: EI, SN, TF, JP
- **Вес**: 1-3 (важность вопроса)
- **Инверсия**: для вопросов с отрицательной формулировкой

Формула: `weight = (answer - 3) * question_weight`

Результат: 4 буквы MBTI типа (напр. INTJ, ENFP)

## 🤝 Разработка

### Локальный запуск

```bash
# Клонируем репозиторий
git clone https://github.com/TestingInPractice/mbti-quiz-pwa.git
cd mbti-quiz-pwa

# Открываем в браузере (нужен сервер для SW)
python3 -m http.server 8080

# Или через npx
npx serve
```

### Обновление вопросов

```bash
# Экспорт из Django
docker compose run --rm web python manage.py shell -c "..."

# Копируем в PWA проект
cp data_export.json data/questions.json
```

## 📈 Roadmap

- [ ] Экспорт результата в PNG
- [ ] Темная тема
- [ ] Мультиязычность (i18n)
- [ ] Делиться результатом через Web Share API
- [ ] Детальный разбор типа MBTI

## 📄 Лицензия

[MIT](LICENSE)

---

<p align="center">
  Сделано с ❤️ для определения IT-роли
</p>
=======
# mbti-quiz-pwa
>>>>>>> origin/main
