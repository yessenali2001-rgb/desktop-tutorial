// =====================================================================
//  ДЕМО-ДАННЫЕ (выдуманные). Используются, только если в config.js не указан API_URL.
//  Настоящие данные хранятся в Google Таблице (см. apps-script/).
// =====================================================================
const DEMO_DATA = {
  // Название класса / группы
  className: "8 «А» класс (демо)",

  // Логин и PIN учителя и воспитателя (видят сводку по всем ученикам)
  teacher: { login: "teacher", pin: "0000" },
  tutor: { login: "vospitatel", pin: "1111" },

  // РАСПИСАНИЕ (общее для класса)
  schedule: [
  {
    "day": "Понедельник",
    "lessons": [
      {
        "num": 1,
        "time": "08:30–09:15",
        "subject": "Математика",
        "room": "204",
        "teacher": "Иванова А.С."
      },
      {
        "num": 2,
        "time": "09:25–10:10",
        "subject": "Русский язык",
        "room": "112",
        "teacher": "Петрова Е.В."
      },
      {
        "num": 3,
        "time": "10:25–11:10",
        "subject": "Английский язык",
        "room": "гр.1: 301 · гр.2: 302",
        "teacher": "гр.1: Смит Дж. · гр.2: Ли К.Н."
      },
      {
        "num": 4,
        "time": "11:20–12:05",
        "subject": "Физика",
        "room": "215",
        "teacher": "Сергеев П.Р."
      }
    ]
  },
  {
    "day": "Вторник",
    "lessons": [
      {
        "num": 1,
        "time": "08:30–09:15",
        "subject": "Информатика",
        "room": "118",
        "teacher": "Ахметов Б.К."
      },
      {
        "num": 2,
        "time": "09:25–10:10",
        "subject": "Математика",
        "room": "204",
        "teacher": "Иванова А.С."
      },
      {
        "num": 3,
        "time": "10:25–11:10",
        "subject": "История",
        "room": "107",
        "teacher": "Омарова Д.Т."
      },
      {
        "num": 4,
        "time": "11:20–12:05",
        "subject": "Физкультура",
        "room": "Спортзал",
        "teacher": "Абенов С.М."
      }
    ]
  },
  {
    "day": "Среда",
    "lessons": [
      {
        "num": 1,
        "time": "08:30–09:15",
        "subject": "Физика",
        "room": "215",
        "teacher": "Сергеев П.Р."
      },
      {
        "num": 2,
        "time": "09:25–10:10",
        "subject": "Английский язык",
        "room": "гр.1: 301 · гр.2: 302",
        "teacher": "гр.1: Смит Дж. · гр.2: Ли К.Н."
      },
      {
        "num": 3,
        "time": "10:25–11:10",
        "subject": "Литература",
        "room": "112",
        "teacher": "Петрова Е.В."
      },
      {
        "num": 4,
        "time": "11:20–12:05",
        "subject": "Биология",
        "room": "220",
        "teacher": "Жанова Г.А."
      }
    ]
  },
  {
    "day": "Четверг",
    "lessons": [
      {
        "num": 1,
        "time": "08:30–09:15",
        "subject": "Математика",
        "room": "204",
        "teacher": "Иванова А.С."
      },
      {
        "num": 2,
        "time": "09:25–10:10",
        "subject": "Химия",
        "room": "222",
        "teacher": "Каримов Н.Н."
      },
      {
        "num": 3,
        "time": "10:25–11:10",
        "subject": "Казахский язык",
        "room": "109",
        "teacher": "Серикова А.Б."
      },
      {
        "num": 4,
        "time": "11:20–12:05",
        "subject": "География",
        "room": "105",
        "teacher": "Нурланова М.Е."
      }
    ]
  },
  {
    "day": "Пятница",
    "lessons": [
      {
        "num": 1,
        "time": "08:30–09:15",
        "subject": "Английский язык",
        "room": "гр.1: 301 · гр.2: 302",
        "teacher": "гр.1: Смит Дж. · гр.2: Ли К.Н."
      },
      {
        "num": 2,
        "time": "09:25–10:10",
        "subject": "Информатика",
        "room": "118",
        "teacher": "Ахметов Б.К."
      },
      {
        "num": 3,
        "time": "10:25–11:10",
        "subject": "Математика",
        "room": "204",
        "teacher": "Иванова А.С."
      },
      {
        "num": 4,
        "time": "11:20–12:05",
        "subject": "Классный час",
        "room": "204",
        "teacher": "Классный руководитель"
      }
    ]
  }
],

  // КАЛЕНДАРЬ СОБЫТИЙ («Алдағы күнтізбе»): start/end — "yyyy-mm-dd"
  calendar: [
  {
    "start": "2026-09-21",
    "end": "2026-09-26",
    "title": "Мектепішілік футбол жарысы. Сыныптар арасы"
  },
  {
    "start": "2026-10-10",
    "end": "2026-10-10",
    "title": "Ата-ана мұғалім кездесуі"
  },
  {
    "start": "2026-10-13",
    "end": "2026-10-13",
    "title": "Brain Rain мектепішілік"
  },
  {
    "start": "2026-10-14",
    "end": "2026-10-14",
    "title": "Мектепшілік Көңілді тапқырлар лигасы"
  },
  {
    "start": "2026-10-15",
    "end": "2026-10-16",
    "title": "БТС-1"
  },
  {
    "start": "2026-10-24",
    "end": "2026-11-01",
    "title": "Күзгі демалыс"
  }
],

  // РЕСУРСЫ: where = "Ресурсы" (вкладка «Ресурсы») или "Тесты" (пояснения во вкладке «Тесты»)
  resources: [
  {
    "section": "English — Vocabulary",
    "text": "Words A1, A2, B1, B2",
    "where": "Ресурсы"
  },
  {
    "section": "English — Speaking",
    "text": "ChatGPT; YouTube: Speak English with Mr. Duncan",
    "where": "Ресурсы"
  },
  {
    "section": "English — Listening",
    "text": "ejoy-english.com; BBC English; Dailydictation",
    "where": "Ресурсы"
  },
  {
    "section": "English — Reading",
    "text": "Library",
    "where": "Ресурсы"
  },
  {
    "section": "English — Writing",
    "text": "ChatGPT everyday; Duolingo; writeandimprove.com",
    "where": "Ресурсы"
  },
  {
    "section": "English — Grammar",
    "text": "Lingust; Murphy books",
    "where": "Ресурсы"
  },
  {
    "section": "English — Tests",
    "text": "Ieltsonlinetests",
    "where": "Ресурсы"
  },
  {
    "section": "ИСН",
    "text": "Инерттілігі жоғары оқушыларға бейімделуге көмектесу қажет.",
    "where": "Тесты"
  },
  {
    "section": "ИСН",
    "text": "Сенситивтілігі жоғары оқушыларды өз-өзіне сенімді болуға үйрету маңызды.",
    "where": "Тесты"
  },
  {
    "section": "ИСН",
    "text": "Нервоздығы жоғары оқушыларға стрессті басқару әдістерін дамыту керек.",
    "where": "Тесты"
  },
  {
    "section": "Темперамент — Холерик",
    "text": "Очень энергичный, активный. Быстро реагирует на события, но часто вспыльчивый. Настойчивый, решительный, иногда нетерпеливый. Эмоции проявляет ярко и бурно. Легко загорается новой идеей, но может быстро охладеть.",
    "where": "Тесты"
  },
  {
    "section": "Темперамент — Меланхолик",
    "text": "Чувствительный, склонный глубоко переживать. Может быть застенчивым, осторожным, нерешительным. Долго и сильно реагирует на неприятности. Склонен к самокопанию, но при этом способен на глубокие мысли. Предпочитает спокойную, стабильную обстановку.",
    "where": "Тесты"
  },
  {
    "section": "Темперамент — Сангвиник",
    "text": "Общительный, легко находит контакт с людьми. Быстро приспосабливается к новым условиям. Жизнерадостный, оптимистичный. Эмоции проявляет открыто, но не так бурно, как холерик. Быстро загорается новым делом, но может терять интерес.",
    "where": "Тесты"
  },
  {
    "section": "Темперамент — Флегматик",
    "text": "Спокойный, уравновешенный, медлительный. Редко поддаётся сильным эмоциям. Настойчивый, трудолюбивый, любит порядок. Медленно включается в работу, но делает её основательно. Предпочитает стабильность, не любит резких перемен.",
    "where": "Тесты"
  },
  {
    "section": "Гарднер — көптік зият теориясы",
    "text": "Визуалды-кеңістіктік; Музыкалық; Тәндік-кинестетикалық; Тұлғааралық; Вербалды-тілтанымдық; Логика-математикалық; Ішкі тұлғалық",
    "where": "Тесты"
  }
],

  // УЧЕНИКИ: логин = id, пароль = pin.
  // Родитель входит, выбрав ребёнка и введя телефон мамы (momPhone) или папы (dadPhone).
  students: [
  {
    "id": "S01",
    "name": "Алиев Арман",
    "pin": "8564",
    "momPhone": "8 775 691 97 67",
    "dadPhone": "8 707 784 54 12",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": true
            },
            {
              "text": "Решить сборник задач",
              "done": true
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": true
            }
          ]
        },
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выучить 300 новых слов",
              "done": false
            },
            {
              "text": "Читать 1 книгу в месяц",
              "done": false
            },
            {
              "text": "Сдать пробный тест B2",
              "done": false
            }
          ]
        },
        {
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": false
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "17.09.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "программирование",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "IT",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Городской турнир по шахматам",
        "details": "1 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "плавание",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Алматы, Медеу",
        "details": "",
        "date": "март 2025"
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "GOLD"
      },
      {
        "name": "KBO final",
        "value": "Bronze"
      },
      {
        "name": "Olympiad",
        "value": "Биология"
      },
      {
        "name": "KBO final 2",
        "value": "17"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "70"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "65"
      },
      {
        "name": "BTS-1",
        "value": "98"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 18 · Орыс 13 · Геогр 17 · Тарих 16 · Мат 14 · Түрік 20"
      },
      {
        "name": "BTS-2",
        "value": "84"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 16 · Орыс 13 · Геогр 18 · Тарих 10 · Мат 10 · Түрік 17"
      },
      {
        "name": "BTS-3",
        "value": "82"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 15 · Орыс 11 · Геогр 14 · Тарих 11 · Мат 16 · Түрік 15"
      },
      {
        "name": "BTS-4",
        "value": "87"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 9 · Орыс 19 · Геогр 10 · Тарих 17 · Мат 18 · Түрік 14"
      },
      {
        "name": "Kitap exam",
        "value": "13"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "2"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "4"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "9"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Кинестетический (3), Лингвистический (4), Межличностный (3), Внутриличностный (2)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S02",
    "name": "Ахметов Айбек",
    "pin": "2491",
    "momPhone": "8 701 876 77 48",
    "dadPhone": "",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Хорошая память, ответственность",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": true
            },
            {
              "text": "Собрать данные",
              "done": false
            },
            {
              "text": "Написать отчёт",
              "done": false
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "Повысить оценку по математике до 5",
          "area": "Математика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Решать 10 задач в неделю",
              "done": true
            },
            {
              "text": "Разобрать ошибки контрольной",
              "done": false
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": false
            }
          ]
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "11.02.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "программирование",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Архитектор",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Областная олимпиада",
        "details": "2 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "плавание",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "футбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "волейбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Бурабай",
        "details": "",
        "date": "июнь 2024"
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "GOLD"
      },
      {
        "name": "KBO final",
        "value": "Silver"
      },
      {
        "name": "Olympiad",
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "27"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "91"
      },
      {
        "name": "KET-2",
        "value": "Pass with Distinction (B1)"
      },
      {
        "name": "KET-2 балл",
        "value": "69"
      },
      {
        "name": "BTS-1",
        "value": "78"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 17 · Орыс 10 · Геогр 14 · Тарих 18 · Мат 9 · Түрік 10"
      },
      {
        "name": "BTS-2",
        "value": "88"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 12 · Орыс 18 · Геогр 15 · Тарих 11 · Мат 19 · Түрік 13"
      },
      {
        "name": "BTS-3",
        "value": "82"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 14 · Орыс 18 · Геогр 14 · Тарих 16 · Мат 10 · Түрік 10"
      },
      {
        "name": "BTS-4",
        "value": "87"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 16 · Орыс 16 · Геогр 16 · Тарих 16 · Мат 13 · Түрік 10"
      },
      {
        "name": "Kitap exam",
        "value": "10"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "9"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "7"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "2"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Визуально-пространственный (1), Логико-математический (0), Музыкальный (2), Межличностный (4)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S03",
    "name": "Беков Данияр",
    "pin": "9219",
    "momPhone": "8 775 697 76 63",
    "dadPhone": "",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Выучить 300 новых слов",
              "done": true
            },
            {
              "text": "Читать 1 книгу в месяц",
              "done": false
            },
            {
              "text": "Сдать пробный тест B2",
              "done": false
            }
          ]
        },
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": true
            },
            {
              "text": "Решить сборник задач",
              "done": true
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "14.01.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "программирование",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Врач",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "гитара",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Поездки",
        "title": "Астана",
        "details": "",
        "date": "январь 2025"
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Bronze"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Физика"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "63"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "61"
      },
      {
        "name": "BTS-1",
        "value": "93"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 11 · Орыс 18 · Геогр 16 · Тарих 19 · Мат 11 · Түрік 18"
      },
      {
        "name": "BTS-2",
        "value": "95"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 18 · Орыс 16 · Геогр 19 · Тарих 14 · Мат 11 · Түрік 17"
      },
      {
        "name": "BTS-3",
        "value": "85"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 17 · Орыс 11 · Геогр 9 · Тарих 9 · Мат 20 · Түрік 19"
      },
      {
        "name": "BTS-4",
        "value": "85"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 10 · Орыс 17 · Геогр 20 · Тарих 11 · Мат 15 · Түрік 12"
      },
      {
        "name": "Kitap exam",
        "value": "11"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "3"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "7"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "5"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Межличностный (0), Визуально-пространственный (3), Музыкальный (3), Внутриличностный (3)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S04",
    "name": "Габдуллин Ерлан",
    "pin": "5237",
    "momPhone": "8 705 873 26 64",
    "dadPhone": "",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": true
            },
            {
              "text": "Собрать данные",
              "done": true
            },
            {
              "text": "Написать отчёт",
              "done": true
            },
            {
              "text": "Защитить проект",
              "done": true
            }
          ]
        },
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выучить 300 новых слов",
              "done": true
            },
            {
              "text": "Читать 1 книгу в месяц",
              "done": false
            },
            {
              "text": "Сдать пробный тест B2",
              "done": false
            }
          ]
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Обрати внимание на сроки по целям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "01.02.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "музыка",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Пилот",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Конкурс проектов",
        "details": "2 место",
        "date": "2025"
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "плавание",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Silver"
      },
      {
        "name": "KBO final",
        "value": "Silver"
      },
      {
        "name": "Olympiad",
        "value": "Физика"
      },
      {
        "name": "KBO final 2",
        "value": "110"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "86"
      },
      {
        "name": "KET-2",
        "value": "Pass with Distinction (B1)"
      },
      {
        "name": "KET-2 балл",
        "value": "70"
      },
      {
        "name": "BTS-1",
        "value": "94"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 19 · Орыс 12 · Геогр 11 · Тарих 20 · Мат 15 · Түрік 17"
      },
      {
        "name": "BTS-2",
        "value": "84"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 15 · Орыс 14 · Геогр 15 · Тарих 12 · Мат 14 · Түрік 14"
      },
      {
        "name": "BTS-3",
        "value": "84"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 10 · Орыс 20 · Геогр 14 · Тарих 9 · Мат 14 · Түрік 17"
      },
      {
        "name": "BTS-4",
        "value": "90"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 16 · Орыс 16 · Геогр 20 · Тарих 9 · Мат 15 · Түрік 14"
      },
      {
        "name": "Kitap exam",
        "value": "16"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "3"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "4"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "6"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Музыкальный (1), Логико-математический (2), Визуально-пространственный (1), Внутриличностный (3)"
      },
      {
        "name": "Темперамент",
        "value": "Сангвиник"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S05",
    "name": "Жумабаев Нурлан",
    "pin": "9237",
    "momPhone": "8 705 323 55 33",
    "dadPhone": "8 707 185 70 45",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": true
            },
            {
              "text": "Решить сборник задач",
              "done": true
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "Повысить оценку по математике до 5",
          "area": "Математика",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Решать 10 задач в неделю",
              "done": true
            },
            {
              "text": "Разобрать ошибки контрольной",
              "done": false
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": false
            }
          ]
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Нужно больше внимания домашним заданиям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "15.02.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "музыка",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "IT",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Областная олимпиада",
        "details": "1 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "плавание",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Алматы, Медеу",
        "details": "",
        "date": "март 2025"
      },
      {
        "section": "Поездки",
        "title": "Египет, Шарм-эль-Шейх",
        "details": "",
        "date": "ноябрь 2023"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Информатика"
      },
      {
        "name": "KBO final 2",
        "value": "5"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "76"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "72"
      },
      {
        "name": "BTS-1",
        "value": "99"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 20 · Орыс 20 · Геогр 19 · Тарих 11 · Мат 15 · Түрік 14"
      },
      {
        "name": "BTS-2",
        "value": "78"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 9 · Орыс 11 · Геогр 9 · Тарих 10 · Мат 19 · Түрік 20"
      },
      {
        "name": "BTS-3",
        "value": "77"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 13 · Орыс 15 · Геогр 11 · Тарих 9 · Мат 10 · Түрік 19"
      },
      {
        "name": "BTS-4",
        "value": "94"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 15 · Орыс 17 · Геогр 19 · Тарих 13 · Мат 18 · Түрік 12"
      },
      {
        "name": "Kitap exam",
        "value": "19"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "5"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "9"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "9"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Визуально-пространственный (3), Межличностный (4), Логико-математический (3), Кинестетический (4)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S06",
    "name": "Иванов Максим",
    "pin": "1286",
    "momPhone": "8 747 304 49 20",
    "dadPhone": "",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Лидерские качества, инициативность",
      "goals": [
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": false
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": false
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "Повысить оценку по математике до 5",
          "area": "Математика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Решать 10 задач в неделю",
              "done": false
            },
            {
              "text": "Разобрать ошибки контрольной",
              "done": false
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": false
            }
          ]
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": false
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "19.11.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "программирование",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "IT",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "GOLD"
      },
      {
        "name": "KBO final",
        "value": "Bronze"
      },
      {
        "name": "Olympiad",
        "value": "Биология"
      },
      {
        "name": "KBO final 2",
        "value": "1"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Level A1"
      },
      {
        "name": "KET-1 балл",
        "value": "84"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "91"
      },
      {
        "name": "BTS-1",
        "value": "82"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 15 · Орыс 10 · Геогр 16 · Тарих 19 · Мат 13 · Түрік 9"
      },
      {
        "name": "BTS-2",
        "value": "96"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 18 · Орыс 19 · Геогр 19 · Тарих 12 · Мат 10 · Түрік 18"
      },
      {
        "name": "BTS-3",
        "value": "97"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 11 · Орыс 14 · Геогр 13 · Тарих 19 · Мат 20 · Түрік 20"
      },
      {
        "name": "BTS-4",
        "value": "85"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 13 · Орыс 18 · Геогр 18 · Тарих 11 · Мат 9 · Түрік 16"
      },
      {
        "name": "Kitap exam",
        "value": "8"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "9"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "2"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "3"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Кинестетический (2), Лингвистический (0), Логико-математический (2), Межличностный (1)"
      },
      {
        "name": "Темперамент",
        "value": "Сангвиник"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S07",
    "name": "Исаев Тимур",
    "pin": "4405",
    "momPhone": "8 705 594 81 95",
    "dadPhone": "8 702 758 30 19",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Лидерские качества, инициативность",
      "goals": [
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": true
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": true
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": true
            },
            {
              "text": "Собрать данные",
              "done": false
            },
            {
              "text": "Написать отчёт",
              "done": false
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": true
        },
        {
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Нужно больше внимания домашним заданиям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "02.05.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "музыка",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Врач",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "A2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Египет, Шарм-эль-Шейх",
        "details": "",
        "date": "ноябрь 2023"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Биология"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "73"
      },
      {
        "name": "KET-2",
        "value": "Pass with Distinction (B1)"
      },
      {
        "name": "KET-2 балл",
        "value": "69"
      },
      {
        "name": "BTS-1",
        "value": "83"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 12 · Орыс 13 · Геогр 15 · Тарих 17 · Мат 14 · Түрік 12"
      },
      {
        "name": "BTS-2",
        "value": "89"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 14 · Орыс 15 · Геогр 9 · Тарих 19 · Мат 15 · Түрік 17"
      },
      {
        "name": "BTS-3",
        "value": "88"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 17 · Орыс 12 · Геогр 20 · Тарих 10 · Мат 9 · Түрік 20"
      },
      {
        "name": "BTS-4",
        "value": "92"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 15 · Орыс 16 · Геогр 18 · Тарих 11 · Мат 19 · Түрік 13"
      },
      {
        "name": "Kitap exam",
        "value": "15"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "6"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "5"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "7"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Логико-математический (2), Межличностный (3), Кинестетический (2), Музыкальный (0)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S08",
    "name": "Касымов Алихан",
    "pin": "6036",
    "momPhone": "8 702 660 41 13",
    "dadPhone": "",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Логическое мышление, усидчивость",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": true
            },
            {
              "text": "Собрать данные",
              "done": true
            },
            {
              "text": "Написать отчёт",
              "done": true
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": true
            },
            {
              "text": "Решить сборник задач",
              "done": false
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": true
        },
        {
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Нужно больше внимания домашним заданиям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "16.02.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "музыка",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Врач",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "футбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в НИШ/BIL лицей старших классов",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Level A1"
      },
      {
        "name": "KET-1 балл",
        "value": "61"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "89"
      },
      {
        "name": "BTS-1",
        "value": "68"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 10 · Орыс 17 · Геогр 9 · Тарих 9 · Мат 11 · Түрік 12"
      },
      {
        "name": "BTS-2",
        "value": "90"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 18 · Орыс 9 · Геогр 19 · Тарих 20 · Мат 13 · Түрік 11"
      },
      {
        "name": "BTS-3",
        "value": "103"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 19 · Орыс 13 · Геогр 17 · Тарих 19 · Мат 15 · Түрік 20"
      },
      {
        "name": "BTS-4",
        "value": "78"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 10 · Орыс 10 · Геогр 10 · Тарих 13 · Мат 17 · Түрік 18"
      },
      {
        "name": "Kitap exam",
        "value": "11"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "9"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "8"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "2"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Логико-математический (3), Межличностный (1), Лингвистический (0), Кинестетический (1)"
      },
      {
        "name": "Темперамент",
        "value": "Сангвиник"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S09",
    "name": "Ким Виктор",
    "pin": "6185",
    "momPhone": "8 747 447 56 44",
    "dadPhone": "8 747 144 43 98",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Хорошая память, ответственность",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": false
            },
            {
              "text": "Собрать данные",
              "done": false
            },
            {
              "text": "Написать отчёт",
              "done": false
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": true
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": false
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": true
        },
        {
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "23.06.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "чтение",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Инженер",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Городской турнир по шахматам",
        "details": "3 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "футбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "A2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Алматы, Медеу",
        "details": "",
        "date": "март 2025"
      },
      {
        "section": "Поездки",
        "title": "Астана",
        "details": "",
        "date": "январь 2025"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в НИШ/BIL лицей старших классов",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Химия"
      },
      {
        "name": "KBO final 2",
        "value": "81"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "61"
      },
      {
        "name": "KET-2",
        "value": "Level A1"
      },
      {
        "name": "KET-2 балл",
        "value": "60"
      },
      {
        "name": "BTS-1",
        "value": "72"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 10 · Орыс 13 · Геогр 10 · Тарих 14 · Мат 15 · Түрік 10"
      },
      {
        "name": "BTS-2",
        "value": "86"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 17 · Орыс 12 · Геогр 15 · Тарих 14 · Мат 13 · Түрік 15"
      },
      {
        "name": "BTS-3",
        "value": "81"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 10 · Орыс 9 · Геогр 20 · Тарих 16 · Мат 12 · Түрік 14"
      },
      {
        "name": "BTS-4",
        "value": "93"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 17 · Орыс 16 · Геогр 12 · Тарих 14 · Мат 14 · Түрік 20"
      },
      {
        "name": "Kitap exam",
        "value": "15"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "3"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "2"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "4"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Внутриличностный (0), Визуально-пространственный (2), Кинестетический (3), Межличностный (2)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S10",
    "name": "Кузнецов Артём",
    "pin": "2733",
    "momPhone": "8 701 481 75 32",
    "dadPhone": "8 705 893 95 10",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Хорошая память, ответственность",
      "goals": [
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": false
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": false
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "Повысить оценку по математике до 5",
          "area": "Математика",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Решать 10 задач в неделю",
              "done": false
            },
            {
              "text": "Разобрать ошибки контрольной",
              "done": false
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": false
            }
          ]
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": false
        },
        {
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Нужно больше внимания домашним заданиям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "22.02.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "чтение",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Врач",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Городской турнир по шахматам",
        "details": "2 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "волейбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в НИШ/BIL лицей старших классов",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "115"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "71"
      },
      {
        "name": "KET-2",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "76"
      },
      {
        "name": "BTS-1",
        "value": "75"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 12 · Орыс 16 · Геогр 12 · Тарих 11 · Мат 12 · Түрік 12"
      },
      {
        "name": "BTS-2",
        "value": "78"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 11 · Орыс 13 · Геогр 18 · Тарих 12 · Мат 14 · Түрік 10"
      },
      {
        "name": "BTS-3",
        "value": "86"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 15 · Орыс 13 · Геогр 12 · Тарих 17 · Мат 17 · Түрік 12"
      },
      {
        "name": "BTS-4",
        "value": "83"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 19 · Орыс 10 · Геогр 19 · Тарих 16 · Мат 9 · Түрік 10"
      },
      {
        "name": "Kitap exam",
        "value": "8"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "4"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "4"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "4"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Межличностный (4), Музыкальный (0), Лингвистический (2), Визуально-пространственный (2)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S11",
    "name": "Муратов Данияр",
    "pin": "3563",
    "momPhone": "8 747 966 35 70",
    "dadPhone": "8 702 142 61 76",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Хорошая память, ответственность",
      "goals": [
        {
          "title": "Повысить оценку по математике до 5",
          "area": "Математика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Решать 10 задач в неделю",
              "done": true
            },
            {
              "text": "Разобрать ошибки контрольной",
              "done": true
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": false
            }
          ]
        },
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": false
            },
            {
              "text": "Решить сборник задач",
              "done": false
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
          "steps": [],
          "done": false
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "15.04.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "спорт",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Инженер",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Городской турнир по шахматам",
        "details": "2 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "58"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "95"
      },
      {
        "name": "BTS-1",
        "value": "91"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 11 · Орыс 19 · Геогр 15 · Тарих 10 · Мат 18 · Түрік 18"
      },
      {
        "name": "BTS-2",
        "value": "87"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 14 · Орыс 20 · Геогр 17 · Тарих 11 · Мат 11 · Түрік 14"
      },
      {
        "name": "BTS-3",
        "value": "72"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 13 · Орыс 11 · Геогр 17 · Тарих 11 · Мат 10 · Түрік 10"
      },
      {
        "name": "BTS-4",
        "value": "76"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 15 · Орыс 16 · Геогр 12 · Тарих 13 · Мат 11 · Түрік 9"
      },
      {
        "name": "Kitap exam",
        "value": "15"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "5"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "1"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "8"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Визуально-пространственный (3), Межличностный (4), Логико-математический (2), Лингвистический (3)"
      },
      {
        "name": "Темперамент",
        "value": "Сангвиник"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S12",
    "name": "Нурланов Жанибек",
    "pin": "7459",
    "momPhone": "8 777 468 67 81",
    "dadPhone": "8 775 207 42 78",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Хорошая память, ответственность",
      "goals": [
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выучить 300 новых слов",
              "done": true
            },
            {
              "text": "Читать 1 книгу в месяц",
              "done": false
            },
            {
              "text": "Сдать пробный тест B2",
              "done": false
            }
          ]
        },
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": false
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": false
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
          "steps": [],
          "done": false
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "10.03.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "музыка",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Пилот",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "гитара",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "волейбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "GOLD"
      },
      {
        "name": "KBO final",
        "value": "Bronze"
      },
      {
        "name": "Olympiad",
        "value": "Математика"
      },
      {
        "name": "KBO final 2",
        "value": "34"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "73"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "70"
      },
      {
        "name": "BTS-1",
        "value": "93"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 19 · Орыс 20 · Геогр 12 · Тарих 10 · Мат 14 · Түрік 18"
      },
      {
        "name": "BTS-2",
        "value": "85"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 13 · Орыс 11 · Геогр 14 · Тарих 18 · Мат 13 · Түрік 16"
      },
      {
        "name": "BTS-3",
        "value": "87"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 11 · Орыс 13 · Геогр 17 · Тарих 16 · Мат 12 · Түрік 18"
      },
      {
        "name": "BTS-4",
        "value": "88"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 13 · Орыс 18 · Геогр 17 · Тарих 12 · Мат 14 · Түрік 14"
      },
      {
        "name": "Kitap exam",
        "value": "8"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "3"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "6"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "3"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Логико-математический (0), Лингвистический (0), Межличностный (4), Визуально-пространственный (0)"
      },
      {
        "name": "Темперамент",
        "value": "Сангвиник"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S13",
    "name": "Омаров Алихан",
    "pin": "8830",
    "momPhone": "8 707 932 88 32",
    "dadPhone": "8 701 407 90 16",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Логическое мышление, усидчивость",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": true
            },
            {
              "text": "Собрать данные",
              "done": true
            },
            {
              "text": "Написать отчёт",
              "done": true
            },
            {
              "text": "Защитить проект",
              "done": true
            }
          ]
        },
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": true
            },
            {
              "text": "Решить сборник задач",
              "done": true
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": true
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Обрати внимание на сроки по целям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "05.05.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "спорт",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Инженер",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "футбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "гитара",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Bronze"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Биология"
      },
      {
        "name": "KBO final 2",
        "value": "78"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Level A1"
      },
      {
        "name": "KET-1 балл",
        "value": "64"
      },
      {
        "name": "KET-2",
        "value": "Pass with Distinction (B1)"
      },
      {
        "name": "KET-2 балл",
        "value": "77"
      },
      {
        "name": "BTS-1",
        "value": "82"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 15 · Орыс 13 · Геогр 9 · Тарих 9 · Мат 19 · Түрік 17"
      },
      {
        "name": "BTS-2",
        "value": "103"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 14 · Орыс 18 · Геогр 19 · Тарих 18 · Мат 16 · Түрік 18"
      },
      {
        "name": "BTS-3",
        "value": "85"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 17 · Орыс 20 · Геогр 16 · Тарих 12 · Мат 11 · Түрік 9"
      },
      {
        "name": "BTS-4",
        "value": "70"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 9 · Орыс 9 · Геогр 17 · Тарих 9 · Мат 15 · Түрік 11"
      },
      {
        "name": "Kitap exam",
        "value": "11"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "4"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "4"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "7"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Лингвистический (0), Межличностный (1), Визуально-пространственный (1), Музыкальный (3)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S14",
    "name": "Петров Илья",
    "pin": "5630",
    "momPhone": "8 775 309 47 50",
    "dadPhone": "8 705 121 54 42",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Хорошая память, ответственность",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": false
            },
            {
              "text": "Собрать данные",
              "done": false
            },
            {
              "text": "Написать отчёт",
              "done": false
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": true
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": true
            },
            {
              "text": "Создать свой проект",
              "done": true
            }
          ]
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": true
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "05.03.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "музыка",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Пилот",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "гитара",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Бурабай",
        "details": "",
        "date": "июнь 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Математика"
      },
      {
        "name": "KBO final 2",
        "value": "60"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "64"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "61"
      },
      {
        "name": "BTS-1",
        "value": "87"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 9 · Орыс 9 · Геогр 11 · Тарих 20 · Мат 19 · Түрік 19"
      },
      {
        "name": "BTS-2",
        "value": "78"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 9 · Орыс 20 · Геогр 10 · Тарих 20 · Мат 9 · Түрік 10"
      },
      {
        "name": "BTS-3",
        "value": "90"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 18 · Орыс 14 · Геогр 12 · Тарих 17 · Мат 19 · Түрік 10"
      },
      {
        "name": "BTS-4",
        "value": "81"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 20 · Орыс 15 · Геогр 10 · Тарих 12 · Мат 12 · Түрік 12"
      },
      {
        "name": "Kitap exam",
        "value": "9"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "6"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "4"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "8"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Лингвистический (1), Музыкальный (0), Логико-математический (0), Визуально-пространственный (0)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S15",
    "name": "Рахимов Асет",
    "pin": "4870",
    "momPhone": "8 747 258 29 41",
    "dadPhone": "8 747 634 54 30",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": true
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": true
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": false
            },
            {
              "text": "Собрать данные",
              "done": false
            },
            {
              "text": "Написать отчёт",
              "done": false
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "29.08.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "спорт",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Предприниматель",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Городской турнир по шахматам",
        "details": "2 место",
        "date": "2025"
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "плавание",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "A2",
        "date": ""
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Тарих"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "89"
      },
      {
        "name": "KET-2",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "92"
      },
      {
        "name": "BTS-1",
        "value": "84"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 11 · Орыс 15 · Геогр 19 · Тарих 12 · Мат 16 · Түрік 11"
      },
      {
        "name": "BTS-2",
        "value": "101"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 17 · Орыс 18 · Геогр 20 · Тарих 18 · Мат 19 · Түрік 9"
      },
      {
        "name": "BTS-3",
        "value": "90"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 14 · Орыс 18 · Геогр 14 · Тарих 17 · Мат 11 · Түрік 16"
      },
      {
        "name": "BTS-4",
        "value": "97"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 19 · Орыс 17 · Геогр 20 · Тарих 14 · Мат 11 · Түрік 16"
      },
      {
        "name": "Kitap exam",
        "value": "15"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "3"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "6"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "7"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Логико-математический (3), Межличностный (0), Кинестетический (2), Музыкальный (1)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S16",
    "name": "Сабитов Руслан",
    "pin": "7561",
    "momPhone": "8 707 743 99 96",
    "dadPhone": "8 705 211 38 48",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Повысить оценку по математике до 5",
          "area": "Математика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Решать 10 задач в неделю",
              "done": false
            },
            {
              "text": "Разобрать ошибки контрольной",
              "done": false
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": false
            }
          ]
        },
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выучить 300 новых слов",
              "done": true
            },
            {
              "text": "Читать 1 книгу в месяц",
              "done": true
            },
            {
              "text": "Сдать пробный тест B2",
              "done": true
            }
          ]
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Обрати внимание на сроки по целям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "11.04.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "спорт",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Пилот",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Областная олимпиада",
        "details": "3 место",
        "date": "2025"
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "гитара",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "волейбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Египет, Шарм-эль-Шейх",
        "details": "",
        "date": "ноябрь 2023"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "103"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "57"
      },
      {
        "name": "KET-2",
        "value": "Level A1"
      },
      {
        "name": "KET-2 балл",
        "value": "76"
      },
      {
        "name": "BTS-1",
        "value": "89"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 17 · Орыс 12 · Геогр 11 · Тарих 20 · Мат 12 · Түрік 17"
      },
      {
        "name": "BTS-2",
        "value": "87"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 14 · Орыс 10 · Геогр 18 · Тарих 16 · Мат 17 · Түрік 12"
      },
      {
        "name": "BTS-3",
        "value": "95"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 20 · Орыс 16 · Геогр 17 · Тарих 9 · Мат 19 · Түрік 14"
      },
      {
        "name": "BTS-4",
        "value": "94"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 17 · Орыс 14 · Геогр 15 · Тарих 20 · Мат 16 · Түрік 12"
      },
      {
        "name": "Kitap exam",
        "value": "18"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "4"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "5"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "8"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Межличностный (4), Музыкальный (1), Логико-математический (2), Кинестетический (0)"
      },
      {
        "name": "Темперамент",
        "value": "Меланхолик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S17",
    "name": "Сейткали Амир",
    "pin": "8667",
    "momPhone": "8 747 983 10 30",
    "dadPhone": "",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Лидерские качества, инициативность",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": true
            },
            {
              "text": "Собрать данные",
              "done": false
            },
            {
              "text": "Написать отчёт",
              "done": false
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Выучить 300 новых слов",
              "done": false
            },
            {
              "text": "Читать 1 книгу в месяц",
              "done": false
            },
            {
              "text": "Сдать пробный тест B2",
              "done": false
            }
          ]
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "22.02.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "программирование",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Инженер",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Алматы, Медеу",
        "details": "",
        "date": "март 2025"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Silver"
      },
      {
        "name": "KBO final",
        "value": "GOLD"
      },
      {
        "name": "Olympiad",
        "value": "Физика"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "66"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "88"
      },
      {
        "name": "BTS-1",
        "value": "80"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 14 · Орыс 11 · Геогр 12 · Тарих 15 · Мат 17 · Түрік 11"
      },
      {
        "name": "BTS-2",
        "value": "102"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 18 · Орыс 20 · Геогр 18 · Тарих 10 · Мат 19 · Түрік 17"
      },
      {
        "name": "BTS-3",
        "value": "92"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 19 · Орыс 13 · Геогр 12 · Тарих 16 · Мат 20 · Түрік 12"
      },
      {
        "name": "BTS-4",
        "value": "92"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 17 · Орыс 10 · Геогр 20 · Тарих 16 · Мат 19 · Түрік 10"
      },
      {
        "name": "Kitap exam",
        "value": "16"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "7"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "3"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "7"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Кинестетический (1), Лингвистический (0), Логико-математический (2), Музыкальный (2)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S18",
    "name": "Смирнов Андрей",
    "pin": "1894",
    "momPhone": "8 747 827 43 48",
    "dadPhone": "8 701 426 12 65",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Логическое мышление, усидчивость",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": true
            },
            {
              "text": "Собрать данные",
              "done": true
            },
            {
              "text": "Написать отчёт",
              "done": true
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": false
            },
            {
              "text": "Решить сборник задач",
              "done": false
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
          "steps": [],
          "done": true
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "13.01.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "музыка",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "IT",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Конкурс проектов",
        "details": "2 место",
        "date": "2025"
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "футбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Бурабай",
        "details": "",
        "date": "июнь 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Тарих"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "61"
      },
      {
        "name": "KET-2",
        "value": "Level A1"
      },
      {
        "name": "KET-2 балл",
        "value": "60"
      },
      {
        "name": "BTS-1",
        "value": "83"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 9 · Орыс 12 · Геогр 16 · Тарих 18 · Мат 19 · Түрік 9"
      },
      {
        "name": "BTS-2",
        "value": "96"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 17 · Орыс 17 · Геогр 18 · Тарих 15 · Мат 18 · Түрік 11"
      },
      {
        "name": "BTS-3",
        "value": "115"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 19 · Орыс 19 · Геогр 20 · Тарих 20 · Мат 18 · Түрік 19"
      },
      {
        "name": "BTS-4",
        "value": "85"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 10 · Орыс 12 · Геогр 9 · Тарих 19 · Мат 19 · Түрік 16"
      },
      {
        "name": "Kitap exam",
        "value": "18"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "7"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "4"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "7"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Кинестетический (0), Внутриличностный (3), Визуально-пространственный (4), Логико-математический (3)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S19",
    "name": "Султанов Мирас",
    "pin": "3304",
    "momPhone": "8 705 369 44 64",
    "dadPhone": "8 777 881 15 46",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": true
            },
            {
              "text": "Собрать данные",
              "done": true
            },
            {
              "text": "Написать отчёт",
              "done": true
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": false
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": false
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": false
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "22.02.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "спорт",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Пилот",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Областная олимпиада",
        "details": "3 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "футбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Математика"
      },
      {
        "name": "KBO final 2",
        "value": "21"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Level A1"
      },
      {
        "name": "KET-1 балл",
        "value": "65"
      },
      {
        "name": "KET-2",
        "value": "Level A1"
      },
      {
        "name": "KET-2 балл",
        "value": "69"
      },
      {
        "name": "BTS-1",
        "value": "88"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 10 · Орыс 14 · Геогр 19 · Тарих 11 · Мат 19 · Түрік 15"
      },
      {
        "name": "BTS-2",
        "value": "92"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 16 · Орыс 15 · Геогр 16 · Тарих 13 · Мат 18 · Түрік 14"
      },
      {
        "name": "BTS-3",
        "value": "92"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 13 · Орыс 13 · Геогр 9 · Тарих 18 · Мат 19 · Түрік 20"
      },
      {
        "name": "BTS-4",
        "value": "90"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 18 · Орыс 14 · Геогр 18 · Тарих 20 · Мат 9 · Түрік 11"
      },
      {
        "name": "Kitap exam",
        "value": "17"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "8"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "5"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "6"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Кинестетический (4), Лингвистический (0), Визуально-пространственный (2), Межличностный (2)"
      },
      {
        "name": "Темперамент",
        "value": "Меланхолик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S20",
    "name": "Тлеубаев Камиль",
    "pin": "3992",
    "momPhone": "8 701 363 50 82",
    "dadPhone": "8 701 785 74 60",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": true
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": true
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": false
            },
            {
              "text": "Собрать данные",
              "done": false
            },
            {
              "text": "Написать отчёт",
              "done": false
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": false
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "20.01.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "программирование",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Инженер",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Конкурс проектов",
        "details": "3 место",
        "date": "2025"
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "волейбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Бурабай",
        "details": "",
        "date": "июнь 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Bronze"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "88"
      },
      {
        "name": "KET-2",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "61"
      },
      {
        "name": "BTS-1",
        "value": "83"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 10 · Орыс 9 · Геогр 12 · Тарих 18 · Мат 16 · Түрік 18"
      },
      {
        "name": "BTS-2",
        "value": "81"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 18 · Орыс 12 · Геогр 13 · Тарих 13 · Мат 15 · Түрік 10"
      },
      {
        "name": "BTS-3",
        "value": "85"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 16 · Орыс 18 · Геогр 18 · Тарих 11 · Мат 13 · Түрік 9"
      },
      {
        "name": "BTS-4",
        "value": "71"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 14 · Орыс 12 · Геогр 11 · Тарих 15 · Мат 10 · Түрік 9"
      },
      {
        "name": "Kitap exam",
        "value": "8"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "4"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "4"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "2"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Межличностный (3), Внутриличностный (0), Логико-математический (1), Кинестетический (2)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S21",
    "name": "Усенов Бауыржан",
    "pin": "4901",
    "momPhone": "8 702 473 65 43",
    "dadPhone": "",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Лидерские качества, инициативность",
      "goals": [
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выучить 300 новых слов",
              "done": true
            },
            {
              "text": "Читать 1 книгу в месяц",
              "done": false
            },
            {
              "text": "Сдать пробный тест B2",
              "done": false
            }
          ]
        },
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": true
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": true
            },
            {
              "text": "Создать свой проект",
              "done": false
            }
          ]
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "07.02.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "наука",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Пилот",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Городской турнир по шахматам",
        "details": "Грамота",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "гитара",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "волейбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в НИШ/BIL лицей старших классов",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Биология"
      },
      {
        "name": "KBO final 2",
        "value": "96"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "76"
      },
      {
        "name": "KET-2",
        "value": "Pass (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "74"
      },
      {
        "name": "BTS-1",
        "value": "93"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 20 · Орыс 9 · Геогр 11 · Тарих 20 · Мат 16 · Түрік 17"
      },
      {
        "name": "BTS-2",
        "value": "81"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 11 · Орыс 16 · Геогр 11 · Тарих 13 · Мат 15 · Түрік 15"
      },
      {
        "name": "BTS-3",
        "value": "76"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 12 · Орыс 11 · Геогр 9 · Тарих 13 · Мат 18 · Түрік 13"
      },
      {
        "name": "BTS-4",
        "value": "78"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 14 · Орыс 11 · Геогр 13 · Тарих 16 · Мат 10 · Түрік 14"
      },
      {
        "name": "Kitap exam",
        "value": "15"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "4"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "8"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "3"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Межличностный (2), Логико-математический (2), Кинестетический (1), Музыкальный (3)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S22",
    "name": "Федоров Сергей",
    "pin": "8601",
    "momPhone": "8 701 119 22 99",
    "dadPhone": "8 705 118 86 91",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Выбрать тему",
              "done": false
            },
            {
              "text": "Собрать данные",
              "done": false
            },
            {
              "text": "Написать отчёт",
              "done": false
            },
            {
              "text": "Защитить проект",
              "done": false
            }
          ]
        },
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Выучить 300 новых слов",
              "done": true
            },
            {
              "text": "Читать 1 книгу в месяц",
              "done": true
            },
            {
              "text": "Сдать пробный тест B2",
              "done": false
            }
          ]
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": true
        }
      ],
      "comment": "Обрати внимание на сроки по целям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "13.03.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "чтение",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "IT",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Областная олимпиада",
        "details": "2 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "гитара",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "волейбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Алматы, Медеу",
        "details": "",
        "date": "март 2025"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в НИШ/BIL лицей старших классов",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "91"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "83"
      },
      {
        "name": "BTS-1",
        "value": "90"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 9 · Орыс 11 · Геогр 20 · Тарих 14 · Мат 18 · Түрік 18"
      },
      {
        "name": "BTS-2",
        "value": "83"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 9 · Орыс 14 · Геогр 17 · Тарих 16 · Мат 17 · Түрік 10"
      },
      {
        "name": "BTS-3",
        "value": "90"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 10 · Орыс 14 · Геогр 20 · Тарих 12 · Мат 14 · Түрік 20"
      },
      {
        "name": "BTS-4",
        "value": "85"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 15 · Орыс 18 · Геогр 9 · Тарих 13 · Мат 10 · Түрік 20"
      },
      {
        "name": "Kitap exam",
        "value": "15"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "2"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "9"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "7"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Внутриличностный (0), Музыкальный (3), Межличностный (3), Логико-математический (1)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": false
      },
      {
        "name": "Педконсилиум- 2",
        "value": true
      },
      {
        "name": "Педконсилиум- 3",
        "value": true
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S23",
    "name": "Хасенов Адиль",
    "pin": "5723",
    "momPhone": "8 701 623 26 47",
    "dadPhone": "",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Повысить оценку по математике до 5",
          "area": "Математика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Решать 10 задач в неделю",
              "done": false
            },
            {
              "text": "Разобрать ошибки контрольной",
              "done": false
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": false
            }
          ]
        },
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2026-12-20",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": true
            },
            {
              "text": "Решить сборник задач",
              "done": false
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
          "steps": [],
          "done": false
        },
        {
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "25.01.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "музыка",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "IT",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "футбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Шерлок Холмс",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Астана",
        "details": "",
        "date": "январь 2025"
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Ағылшын тілі"
      },
      {
        "name": "KBO final 2",
        "value": "91"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-1 балл",
        "value": "81"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "85"
      },
      {
        "name": "BTS-1",
        "value": "81"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 16 · Орыс 19 · Геогр 9 · Тарих 9 · Мат 9 · Түрік 19"
      },
      {
        "name": "BTS-2",
        "value": "100"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 18 · Орыс 13 · Геогр 19 · Тарих 18 · Мат 13 · Түрік 19"
      },
      {
        "name": "BTS-3",
        "value": "77"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 17 · Орыс 9 · Геогр 18 · Тарих 10 · Мат 13 · Түрік 10"
      },
      {
        "name": "BTS-4",
        "value": "75"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 17 · Орыс 9 · Геогр 15 · Тарих 12 · Мат 9 · Түрік 13"
      },
      {
        "name": "Kitap exam",
        "value": "9"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "5"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "7"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "2"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Внутриличностный (0), Логико-математический (2), Лингвистический (3), Визуально-пространственный (1)"
      },
      {
        "name": "Темперамент",
        "value": "Холерик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": false
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": true
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": true
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S24",
    "name": "Шарипов Дамир",
    "pin": "8137",
    "momPhone": "8 705 288 78 48",
    "dadPhone": "",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Лидерские качества, инициативность",
      "goals": [
        {
          "title": "Освоить основы программирования",
          "area": "Информатика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти курс Python",
              "done": true
            },
            {
              "text": "Сделать 3 мини-программы",
              "done": true
            },
            {
              "text": "Создать свой проект",
              "done": true
            }
          ]
        },
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": true
            },
            {
              "text": "Решить сборник задач",
              "done": false
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": false
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Нужно больше внимания домашним заданиям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "01.04.2012",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "наука",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Инженер",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "4",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "баскетбол",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Тимур и его команда",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Маленький принц",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Остров сокровищ",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "A2",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Поездки",
        "title": "Египет, Шарм-эль-Шейх",
        "details": "",
        "date": "ноябрь 2023"
      },
      {
        "section": "Цели на будущее",
        "title": "Поступить в Назарбаев Университет",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Жазбады"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Level A1"
      },
      {
        "name": "KET-1 балл",
        "value": "85"
      },
      {
        "name": "KET-2",
        "value": "Pass with Distinction (B1)"
      },
      {
        "name": "KET-2 балл",
        "value": "77"
      },
      {
        "name": "BTS-1",
        "value": "104"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 19 · Орыс 20 · Геогр 19 · Тарих 20 · Мат 11 · Түрік 15"
      },
      {
        "name": "BTS-2",
        "value": "79"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 10 · Орыс 9 · Геогр 15 · Тарих 17 · Мат 18 · Түрік 10"
      },
      {
        "name": "BTS-3",
        "value": "88"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 16 · Орыс 15 · Геогр 18 · Тарих 11 · Мат 15 · Түрік 13"
      },
      {
        "name": "BTS-4",
        "value": "97"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 18 · Орыс 18 · Геогр 10 · Тарих 15 · Мат 16 · Түрік 20"
      },
      {
        "name": "Kitap exam",
        "value": "15"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "7"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "2"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "5"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Кинестетический (2), Музыкальный (2), Визуально-пространственный (1), Межличностный (1)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": true
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": false
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S25",
    "name": "Юсупов Эльдар",
    "pin": "2247",
    "momPhone": "8 747 224 28 30",
    "dadPhone": "8 747 209 13 22",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Лидерские качества, инициативность",
      "goals": [
        {
          "title": "Повысить оценку по математике до 5",
          "area": "Математика",
          "deadline": "2027-05-25",
          "steps": [
            {
              "text": "Решать 10 задач в неделю",
              "done": true
            },
            {
              "text": "Разобрать ошибки контрольной",
              "done": true
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": false
            }
          ]
        },
        {
          "title": "Подготовиться к олимпиаде по физике",
          "area": "Физика",
          "deadline": "2027-03-15",
          "steps": [
            {
              "text": "Пройти школьный этап",
              "done": true
            },
            {
              "text": "Решить сборник задач",
              "done": false
            },
            {
              "text": "Занятия с наставником 2 раза в неделю",
              "done": false
            }
          ]
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
          "steps": [],
          "done": false
        },
        {
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
          "steps": [],
          "done": false
        }
      ],
      "comment": "Обрати внимание на сроки по целям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "14.01.2011",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Интересы",
        "details": "спорт",
        "date": ""
      },
      {
        "section": "Личное",
        "title": "Будущая профессия",
        "details": "Инженер",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақ тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Орыс тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Алгебра",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Геометрия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Ағылшын тілі",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Физика",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Химия",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Биология",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Информатика",
        "details": "4",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "География",
        "details": "5",
        "date": ""
      },
      {
        "section": "Оценки",
        "title": "Қазақстан тарихы",
        "details": "5",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
        "details": "",
        "date": ""
      },
      {
        "section": "Сертификаты",
        "title": "Робототехника",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "теннис",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "плавание",
        "details": "",
        "date": ""
      },
      {
        "section": "Хобби",
        "title": "шахматы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Три мушкетёра",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Абай жолы",
        "details": "",
        "date": ""
      },
      {
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
        "details": "",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Қазақ тілі",
        "details": "C1",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Орыс тілі",
        "details": "B2",
        "date": ""
      },
      {
        "section": "Языки",
        "title": "Ағылшын тілі",
        "details": "B1",
        "date": ""
      },
      {
        "section": "Поездки",
        "title": "Бурабай",
        "details": "",
        "date": "июнь 2024"
      },
      {
        "section": "Цели на будущее",
        "title": "Стать программистом",
        "details": "",
        "date": ""
      }
    ],
    "olympiads": [
      {
        "name": "Областной",
        "value": "Bronze"
      },
      {
        "name": "KBO final",
        "value": ""
      },
      {
        "name": "Olympiad",
        "value": "Физика"
      },
      {
        "name": "KBO final 2",
        "value": "82"
      }
    ],
    "exams": [
      {
        "name": "KET-1",
        "value": "Level A1"
      },
      {
        "name": "KET-1 балл",
        "value": "67"
      },
      {
        "name": "KET-2",
        "value": "Pass with Merit (A2)"
      },
      {
        "name": "KET-2 балл",
        "value": "86"
      },
      {
        "name": "BTS-1",
        "value": "85"
      },
      {
        "name": "BTS-1 по предметам",
        "value": "Қаз 11 · Орыс 9 · Геогр 19 · Тарих 18 · Мат 18 · Түрік 10"
      },
      {
        "name": "BTS-2",
        "value": "99"
      },
      {
        "name": "BTS-2 по предметам",
        "value": "Қаз 14 · Орыс 18 · Геогр 19 · Тарих 19 · Мат 20 · Түрік 9"
      },
      {
        "name": "BTS-3",
        "value": "86"
      },
      {
        "name": "BTS-3 по предметам",
        "value": "Қаз 20 · Орыс 15 · Геогр 9 · Тарих 9 · Мат 13 · Түрік 20"
      },
      {
        "name": "BTS-4",
        "value": "84"
      },
      {
        "name": "BTS-4 по предметам",
        "value": "Қаз 20 · Орыс 17 · Геогр 9 · Тарих 13 · Мат 15 · Түрік 10"
      },
      {
        "name": "Kitap exam",
        "value": "17"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "7"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "2"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "6"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Лингвистический (2), Визуально-пространственный (4), Логико-математический (3), Внутриличностный (1)"
      },
      {
        "name": "Темперамент",
        "value": "Флегматик"
      }
    ],
    "parentEvents": [
      {
        "name": "Жиналыс",
        "value": true
      },
      {
        "name": "Педконсилиум- 1",
        "value": true
      },
      {
        "name": "Педконсилиум- 2",
        "value": false
      },
      {
        "name": "Педконсилиум- 3",
        "value": false
      },
      {
        "name": "Педконсилиум- 4",
        "value": false
      },
      {
        "name": "Жиналыс - 2",
        "value": false
      },
      {
        "name": "Наурыз",
        "value": false
      },
      {
        "name": "Пикник көктем",
        "value": true
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  }
],

  // ЖУРНАЛ ПОСЕЩАЕМОСТИ: одна запись = один урок; перечислены только отсутствовавшие
  attendance: [
    {"date": "2026-09-01", "subject": "Информатика", "absent": [], "late": ["S25"], "excused": []},
    {"date": "2026-09-01", "subject": "Математика", "absent": ["S12"], "late": ["S20"], "excused": []},
    {"date": "2026-09-01", "subject": "История", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-01", "subject": "Физкультура", "absent": [], "late": [], "excused": ["S25"]},
    {"date": "2026-09-02", "subject": "Физика", "absent": ["S02", "S18"], "late": ["S19"], "excused": ["S24"]},
    {"date": "2026-09-02", "subject": "Английский язык", "absent": ["S10"], "late": [], "excused": ["S14"]},
    {"date": "2026-09-02", "subject": "Литература", "absent": [], "late": [], "excused": ["S05", "S21"]},
    {"date": "2026-09-02", "subject": "Биология", "absent": ["S05"], "late": [], "excused": []},
    {"date": "2026-09-03", "subject": "Математика", "absent": ["S12", "S23"], "late": [], "excused": []},
    {"date": "2026-09-03", "subject": "Химия", "absent": ["S10", "S19"], "late": [], "excused": []},
    {"date": "2026-09-03", "subject": "Казахский язык", "absent": [], "late": [], "excused": ["S15"]},
    {"date": "2026-09-03", "subject": "География", "absent": ["S12"], "late": ["S02"], "excused": ["S08"]},
    {"date": "2026-09-04", "subject": "Английский язык", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-04", "subject": "Информатика", "absent": [], "late": ["S03"], "excused": []},
    {"date": "2026-09-04", "subject": "Математика", "absent": [], "late": ["S18"], "excused": ["S07"]},
    {"date": "2026-09-04", "subject": "Классный час", "absent": ["S02", "S05"], "late": [], "excused": []},
    {"date": "2026-09-07", "subject": "Математика", "absent": [], "late": ["S17", "S18"], "excused": []},
    {"date": "2026-09-07", "subject": "Русский язык", "absent": ["S06", "S12"], "late": [], "excused": []},
    {"date": "2026-09-07", "subject": "Английский язык", "absent": ["S10", "S13"], "late": [], "excused": ["S16"]},
    {"date": "2026-09-07", "subject": "Физика", "absent": ["S02"], "late": [], "excused": []},
    {"date": "2026-09-08", "subject": "Информатика", "absent": ["S08"], "late": [], "excused": []},
    {"date": "2026-09-08", "subject": "Математика", "absent": ["S12"], "late": ["S07"], "excused": []},
    {"date": "2026-09-08", "subject": "История", "absent": ["S18", "S20"], "late": [], "excused": []},
    {"date": "2026-09-08", "subject": "Физкультура", "absent": ["S02"], "late": [], "excused": []},
    {"date": "2026-09-09", "subject": "Физика", "absent": ["S11", "S20"], "late": [], "excused": ["S22"]},
    {"date": "2026-09-09", "subject": "Английский язык", "absent": ["S25"], "late": ["S08"], "excused": []},
    {"date": "2026-09-09", "subject": "Литература", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-09", "subject": "Биология", "absent": ["S18", "S21", "S25"], "late": [], "excused": []},
    {"date": "2026-09-10", "subject": "Математика", "absent": ["S18"], "late": ["S13"], "excused": ["S09"]},
    {"date": "2026-09-10", "subject": "Химия", "absent": ["S18"], "late": ["S19", "S24"], "excused": []},
    {"date": "2026-09-10", "subject": "Казахский язык", "absent": ["S17"], "late": ["S25"], "excused": []},
    {"date": "2026-09-10", "subject": "География", "absent": ["S11"], "late": [], "excused": []},
    {"date": "2026-09-11", "subject": "Английский язык", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-11", "subject": "Информатика", "absent": ["S02"], "late": [], "excused": []},
    {"date": "2026-09-11", "subject": "Математика", "absent": ["S05"], "late": [], "excused": []},
    {"date": "2026-09-11", "subject": "Классный час", "absent": [], "late": ["S23"], "excused": []},
    {"date": "2026-09-14", "subject": "Математика", "absent": ["S20"], "late": ["S13"], "excused": ["S18"]},
    {"date": "2026-09-14", "subject": "Русский язык", "absent": ["S05", "S15", "S25"], "late": ["S01"], "excused": []},
    {"date": "2026-09-14", "subject": "Английский язык", "absent": ["S07", "S18"], "late": [], "excused": []},
    {"date": "2026-09-14", "subject": "Физика", "absent": ["S12"], "late": [], "excused": []},
    {"date": "2026-09-15", "subject": "Информатика", "absent": [], "late": [], "excused": ["S16"]},
    {"date": "2026-09-15", "subject": "Математика", "absent": [], "late": ["S06"], "excused": ["S18"]},
    {"date": "2026-09-15", "subject": "История", "absent": [], "late": ["S15"], "excused": ["S21"]},
    {"date": "2026-09-15", "subject": "Физкультура", "absent": [], "late": [], "excused": ["S11"]},
    {"date": "2026-09-16", "subject": "Физика", "absent": ["S22"], "late": [], "excused": []},
    {"date": "2026-09-16", "subject": "Английский язык", "absent": ["S07", "S12", "S18"], "late": ["S22"], "excused": []},
    {"date": "2026-09-16", "subject": "Литература", "absent": ["S05"], "late": [], "excused": []},
    {"date": "2026-09-16", "subject": "Биология", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-17", "subject": "Математика", "absent": ["S25"], "late": [], "excused": []},
    {"date": "2026-09-17", "subject": "Химия", "absent": ["S07"], "late": ["S09"], "excused": []},
    {"date": "2026-09-17", "subject": "Казахский язык", "absent": ["S23"], "late": [], "excused": []},
    {"date": "2026-09-17", "subject": "География", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-18", "subject": "Английский язык", "absent": ["S02"], "late": ["S19"], "excused": ["S11"]},
    {"date": "2026-09-18", "subject": "Информатика", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-18", "subject": "Математика", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-18", "subject": "Классный час", "absent": ["S12"], "late": ["S25"], "excused": []},
    {"date": "2026-09-21", "subject": "Математика", "absent": [], "late": ["S20"], "excused": ["S22"]},
    {"date": "2026-09-21", "subject": "Русский язык", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-21", "subject": "Английский язык", "absent": ["S14", "S18"], "late": ["S22"], "excused": ["S05"]},
    {"date": "2026-09-21", "subject": "Физика", "absent": ["S13"], "late": [], "excused": ["S11"]},
    {"date": "2026-09-22", "subject": "Информатика", "absent": [], "late": ["S05"], "excused": []},
    {"date": "2026-09-22", "subject": "Математика", "absent": ["S25"], "late": ["S07", "S09", "S19"], "excused": []},
    {"date": "2026-09-22", "subject": "История", "absent": [], "late": ["S16"], "excused": []},
    {"date": "2026-09-22", "subject": "Физкультура", "absent": ["S02", "S06"], "late": ["S25"], "excused": []}
  ]
};
