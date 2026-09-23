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
        "time": "08:30–09:15",
        "subject": "Математика",
        "room": "204"
      },
      {
        "time": "09:25–10:10",
        "subject": "Русский язык",
        "room": "112"
      },
      {
        "time": "10:25–11:10",
        "subject": "Английский язык",
        "room": "301"
      },
      {
        "time": "11:20–12:05",
        "subject": "Физика",
        "room": "215"
      }
    ]
  },
  {
    "day": "Вторник",
    "lessons": [
      {
        "time": "08:30–09:15",
        "subject": "Информатика",
        "room": "118"
      },
      {
        "time": "09:25–10:10",
        "subject": "Математика",
        "room": "204"
      },
      {
        "time": "10:25–11:10",
        "subject": "История",
        "room": "107"
      },
      {
        "time": "11:20–12:05",
        "subject": "Физкультура",
        "room": "Спортзал"
      }
    ]
  },
  {
    "day": "Среда",
    "lessons": [
      {
        "time": "08:30–09:15",
        "subject": "Физика",
        "room": "215"
      },
      {
        "time": "09:25–10:10",
        "subject": "Английский язык",
        "room": "301"
      },
      {
        "time": "10:25–11:10",
        "subject": "Литература",
        "room": "112"
      },
      {
        "time": "11:20–12:05",
        "subject": "Биология",
        "room": "220"
      }
    ]
  },
  {
    "day": "Четверг",
    "lessons": [
      {
        "time": "08:30–09:15",
        "subject": "Математика",
        "room": "204"
      },
      {
        "time": "09:25–10:10",
        "subject": "Химия",
        "room": "222"
      },
      {
        "time": "10:25–11:10",
        "subject": "Казахский язык",
        "room": "109"
      },
      {
        "time": "11:20–12:05",
        "subject": "География",
        "room": "105"
      }
    ]
  },
  {
    "day": "Пятница",
    "lessons": [
      {
        "time": "08:30–09:15",
        "subject": "Английский язык",
        "room": "301"
      },
      {
        "time": "09:25–10:10",
        "subject": "Информатика",
        "room": "118"
      },
      {
        "time": "10:25–11:10",
        "subject": "Математика",
        "room": "204"
      },
      {
        "time": "11:20–12:05",
        "subject": "Классный час",
        "room": "204"
      }
    ]
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
    "pin": "2271",
    "momPhone": "+7 747 528 31 53",
    "dadPhone": "+7 707 531 15 95",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Хорошая память, ответственность",
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
      "comment": "Отличная работа на уроках."
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
        "value": false
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
    "pin": "7560",
    "momPhone": "+7 775 917 81 60",
    "dadPhone": "+7 707 206 71 91",
    "idp": {
      "mentor": "Сарсенова А.Б.",
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
              "done": true
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
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
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
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "28.11.2011",
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
        "details": "2 место",
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
        "title": "баскетбол",
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
        "title": "Астана",
        "details": "",
        "date": "январь 2025"
      },
      {
        "section": "Поездки",
        "title": "Египет, Шарм-эль-Шейх",
        "details": "",
        "date": "ноябрь 2023"
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
        "value": "Silver"
      },
      {
        "name": "KBO final",
        "value": "GOLD"
      },
      {
        "name": "Olympiad",
        "value": "Химия"
      },
      {
        "name": "KBO final 2",
        "value": "39"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "5"
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
        "value": "Межличностный (2), Лингвистический (0), Визуально-пространственный (1), Внутриличностный (3)"
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
        "value": false
      }
    ]
  },
  {
    "id": "S03",
    "name": "Беков Данияр",
    "pin": "8327",
    "momPhone": "+7 775 129 13 45",
    "dadPhone": "+7 702 809 87 54",
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
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-05-25",
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
          "done": true
        }
      ],
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "21.02.2011",
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
        "details": "Предприниматель",
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
        "title": "Робототехника",
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
        "title": "гитара",
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
        "value": "GOLD"
      },
      {
        "name": "KBO final",
        "value": "Silver"
      },
      {
        "name": "Olympiad",
        "value": "Химия"
      },
      {
        "name": "KBO final 2",
        "value": "7"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "6"
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
        "value": "Лингвистический (1), Внутриличностный (4), Визуально-пространственный (4), Кинестетический (4)"
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
        "value": true
      }
    ]
  },
  {
    "id": "S04",
    "name": "Габдуллин Ерлан",
    "pin": "1064",
    "momPhone": "+7 747 233 78 29",
    "dadPhone": "+7 701 993 66 33",
    "idp": {
      "mentor": "Сарсенова А.Б.",
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
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
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
        "details": "09.11.2011",
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
        "title": "Конкурс проектов",
        "details": "1 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Английский язык",
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
        "title": "плавание",
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
        "details": "B1",
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
        "value": "GOLD"
      },
      {
        "name": "Olympiad",
        "value": "Математика"
      },
      {
        "name": "KBO final 2",
        "value": "27"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "4"
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
        "value": "Музыкальный (1), Визуально-пространственный (2), Логико-математический (4), Внутриличностный (1)"
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
    "id": "S05",
    "name": "Жумабаев Нурлан",
    "pin": "2716",
    "momPhone": "+7 701 493 52 76",
    "dadPhone": "+7 747 165 24 39",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Хорошая память, ответственность",
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
        "details": "14.10.2011",
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
        "title": "Конкурс проектов",
        "details": "Грамота",
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
        "value": "32"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "4"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "6"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "4"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Внутриличностный (0), Визуально-пространственный (3), Межличностный (3), Кинестетический (1)"
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
    "id": "S06",
    "name": "Иванов Максим",
    "pin": "3289",
    "momPhone": "+7 777 502 74 49",
    "dadPhone": "+7 702 450 35 91",
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
              "done": true
            },
            {
              "text": "Сдать пробный тест B2",
              "done": true
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
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
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
        "details": "20.10.2011",
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
        "title": "Областная олимпиада",
        "details": "1 место",
        "date": "2025"
      },
      {
        "section": "Сертификаты",
        "title": "Python для начинающих",
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
        "value": "Информатика"
      },
      {
        "name": "KBO final 2",
        "value": "52"
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
        "value": "5"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Внутриличностный (2), Межличностный (2), Лингвистический (0), Визуально-пространственный (2)"
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
    "id": "S07",
    "name": "Исаев Тимур",
    "pin": "8032",
    "momPhone": "+7 705 841 89 92",
    "dadPhone": "+7 777 955 75 90",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
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
              "done": true
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
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "21.03.2012",
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
        "details": "3 место",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
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
        "value": "Биология"
      },
      {
        "name": "KBO final 2",
        "value": "2"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "3"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "5"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "3"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Визуально-пространственный (3), Межличностный (0), Лингвистический (2), Логико-математический (2)"
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
    "id": "S08",
    "name": "Касымов Алихан",
    "pin": "4452",
    "momPhone": "+7 707 375 59 36",
    "dadPhone": "",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Логическое мышление, усидчивость",
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
      "comment": "Нужно больше внимания домашним заданиям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "26.01.2011",
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
        "title": "гитара",
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
        "title": "Абай жолы",
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
        "value": "Ағылшын тілі"
      },
      {
        "name": "KBO final 2",
        "value": "78"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "4"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "1"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "9"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Логико-математический (1), Межличностный (3), Внутриличностный (2), Музыкальный (4)"
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
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S09",
    "name": "Ким Виктор",
    "pin": "1802",
    "momPhone": "+7 701 849 62 67",
    "dadPhone": "+7 702 759 46 72",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
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
              "done": true
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
        "details": "21.07.2011",
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
        "details": "Врач",
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
        "title": "Гарри Поттер",
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
        "value": "Silver"
      },
      {
        "name": "KBO final",
        "value": "Bronze"
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
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "6"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "1"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "6"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Логико-математический (1), Музыкальный (2), Внутриличностный (3), Визуально-пространственный (4)"
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
    "id": "S10",
    "name": "Кузнецов Артём",
    "pin": "9648",
    "momPhone": "+7 707 100 19 60",
    "dadPhone": "",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Лидерские качества, инициативность",
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
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
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
      "comment": "Нужно больше внимания домашним заданиям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "13.10.2011",
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
        "details": "5",
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
        "title": "Робототехника",
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
        "section": "Хобби",
        "title": "робототехника",
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
        "title": "Поступить в НИШ/BIL лицей старших классов",
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
        "value": "Ағылшын тілі"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "9"
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
        "value": "Визуально-пространственный (0), Кинестетический (2), Лингвистический (1), Музыкальный (3)"
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
    "id": "S11",
    "name": "Муратов Данияр",
    "pin": "4658",
    "momPhone": "+7 707 326 43 47",
    "dadPhone": "+7 747 607 88 33",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Лидерские качества, инициативность",
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
        "details": "05.02.2012",
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
        "details": "5",
        "date": ""
      },
      {
        "section": "Достижения",
        "title": "Конкурс проектов",
        "details": "1 место",
        "date": "2024"
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
        "section": "Хобби",
        "title": "плавание",
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
        "value": "Тарих"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "8"
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
        "value": "Визуально-пространственный (1), Кинестетический (3), Межличностный (0), Внутриличностный (2)"
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
    "id": "S12",
    "name": "Нурланов Жанибек",
    "pin": "5295",
    "momPhone": "+7 702 865 18 87",
    "dadPhone": "+7 705 443 88 15",
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
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
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
        "details": "05.04.2011",
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
        "title": "Поступить в Назарбаев Университет",
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
        "value": "Информатика"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "8"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "2"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "2"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Кинестетический (4), Межличностный (3), Визуально-пространственный (1), Внутриличностный (2)"
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
    "pin": "7489",
    "momPhone": "+7 702 290 41 40",
    "dadPhone": "+7 747 292 51 18",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
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
        "details": "09.05.2011",
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
        "title": "гитара",
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
        "section": "Поездки",
        "title": "Египет, Шарм-эль-Шейх",
        "details": "",
        "date": "ноябрь 2023"
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
        "value": "22"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "5"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "2"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "8"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Межличностный (1), Кинестетический (1), Музыкальный (3), Визуально-пространственный (3)"
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
    "id": "S14",
    "name": "Петров Илья",
    "pin": "7942",
    "momPhone": "+7 705 759 35 60",
    "dadPhone": "+7 702 106 65 30",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Логическое мышление, усидчивость",
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
        "details": "31.05.2011",
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
        "section": "Хобби",
        "title": "футбол",
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
        "title": "Шерлок Холмс",
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
        "section": "Поездки",
        "title": "Алматы, Медеу",
        "details": "",
        "date": "март 2025"
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
        "value": "127"
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
        "value": "8"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Логико-математический (4), Межличностный (0), Лингвистический (1), Визуально-пространственный (3)"
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
        "value": false
      }
    ]
  },
  {
    "id": "S15",
    "name": "Рахимов Асет",
    "pin": "8181",
    "momPhone": "+7 707 415 84 41",
    "dadPhone": "+7 775 476 67 74",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Логическое мышление, усидчивость",
      "goals": [
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
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
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
      "comment": "Хороший прогресс, продолжай в том же темпе!"
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "15.02.2011",
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
        "title": "Быстрая арифметика",
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
        "title": "Алматы, Медеу",
        "details": "",
        "date": "март 2025"
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
        "value": "Silver"
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
        "value": "Nope"
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
        "value": "Межличностный (2), Лингвистический (0), Визуально-пространственный (1), Музыкальный (1)"
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
    "id": "S16",
    "name": "Сабитов Руслан",
    "pin": "9776",
    "momPhone": "+7 775 978 56 67",
    "dadPhone": "+7 747 805 23 42",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Лидерские качества, инициативность",
      "goals": [
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
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-05-25",
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
        "details": "04.02.2011",
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
        "title": "волейбол",
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
        "title": "Абай жолы",
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
        "value": "Химия"
      },
      {
        "name": "KBO final 2",
        "value": "71"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "9"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "3"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "6"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Лингвистический (4), Межличностный (4), Визуально-пространственный (1), Внутриличностный (2)"
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
        "value": true
      },
      {
        "name": "Боулинг",
        "value": false
      }
    ]
  },
  {
    "id": "S17",
    "name": "Сейткали Амир",
    "pin": "2008",
    "momPhone": "+7 747 554 87 76",
    "dadPhone": "+7 702 269 10 15",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Логическое мышление, усидчивость",
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
          "done": true
        }
      ],
      "comment": "Обрати внимание на сроки по целям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "16.01.2012",
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
        "value": false
      }
    ]
  },
  {
    "id": "S18",
    "name": "Смирнов Андрей",
    "pin": "4472",
    "momPhone": "+7 747 814 10 13",
    "dadPhone": "+7 775 339 83 49",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Логическое мышление, усидчивость",
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
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": true
        },
        {
          "title": "Прочитать 5 книг",
          "area": "",
          "deadline": "до конца 8 класса",
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
        "details": "08.11.2011",
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
        "title": "Конкурс проектов",
        "details": "Грамота",
        "date": "2024"
      },
      {
        "section": "Сертификаты",
        "title": "Скорочтение",
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
        "title": "футбол",
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
        "value": "Robotics"
      },
      {
        "name": "KBO final 2",
        "value": "134"
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
        "value": "5"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Логико-математический (2), Лингвистический (1), Музыкальный (1), Визуально-пространственный (1)"
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
    "id": "S19",
    "name": "Султанов Мирас",
    "pin": "9103",
    "momPhone": "+7 777 868 16 10",
    "dadPhone": "+7 701 603 98 33",
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
      "comment": "Отличная работа на уроках."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "16.01.2011",
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
        "details": "Врач",
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
        "title": "Областная олимпиада",
        "details": "1 место",
        "date": "2024"
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
        "section": "Сертификаты",
        "title": "Скорочтение",
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
        "title": "робототехника",
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
        "value": "Bronze"
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
        "value": "95"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "7"
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
        "value": "Музыкальный (3), Внутриличностный (0), Лингвистический (3), Логико-математический (4)"
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
    "id": "S20",
    "name": "Тлеубаев Камиль",
    "pin": "5600",
    "momPhone": "+7 702 251 48 48",
    "dadPhone": "+7 702 211 91 23",
    "idp": {
      "mentor": "Сарсенова А.Б.",
      "strengths": "Лидерские качества, инициативность",
      "goals": [
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
              "done": false
            }
          ]
        },
        {
          "title": "Английский B2",
          "area": "Английский язык",
          "deadline": "2027-03-15",
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
          "title": "10 подтягиваний на турнике",
          "area": "",
          "deadline": "до конца 8 класса",
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
        "details": "09.09.2011",
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
        "title": "баскетбол",
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
        "value": "Bronze"
      },
      {
        "name": "Olympiad",
        "value": "Информатика"
      },
      {
        "name": "KBO final 2",
        "value": "33"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "7"
      },
      {
        "name": "Сенситивтілік (С)",
        "value": "8"
      },
      {
        "name": "Нервоздық (Н)",
        "value": "5"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Лингвистический (4), Визуально-пространственный (1), Внутриличностный (1), Музыкальный (1)"
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
        "value": true
      },
      {
        "name": "Боулинг",
        "value": true
      }
    ]
  },
  {
    "id": "S21",
    "name": "Усенов Бауыржан",
    "pin": "1927",
    "momPhone": "+7 707 315 97 33",
    "dadPhone": "+7 777 225 88 55",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Хорошая память, ответственность",
      "goals": [
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
              "done": true
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": true
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
          "title": "Закончить четверть отличником",
          "area": "",
          "deadline": "до конца четверти",
          "steps": [],
          "done": true
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
        "details": "13.01.2012",
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
        "title": "Стать программистом",
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
        "value": "Bronze"
      },
      {
        "name": "Olympiad",
        "value": "Химия"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "7"
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
        "value": "Музыкальный (2), Межличностный (4), Логико-математический (1), Лингвистический (1)"
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
    "id": "S22",
    "name": "Федоров Сергей",
    "pin": "8404",
    "momPhone": "+7 701 771 47 42",
    "dadPhone": "+7 747 246 39 33",
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
              "done": true
            },
            {
              "text": "Пройти пробный тест на 85%+",
              "done": true
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
        "details": "25.07.2011",
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
        "section": "Сертификаты",
        "title": "Быстрая арифметика",
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
        "title": "робототехника",
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
        "title": "Гарри Поттер",
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
        "value": "Тарих"
      },
      {
        "name": "KBO final 2",
        "value": "72"
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
        "value": "6"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Внутриличностный (4), Межличностный (0), Кинестетический (2), Лингвистический (1)"
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
    "id": "S23",
    "name": "Хасенов Адиль",
    "pin": "9297",
    "momPhone": "+7 707 513 52 74",
    "dadPhone": "",
    "idp": {
      "mentor": "Ли К.Н.",
      "strengths": "Творческий подход, коммуникабельность",
      "goals": [
        {
          "title": "Сделать исследовательский проект",
          "area": "Проект",
          "deadline": "2027-05-25",
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
          "title": "KBO — бронза или выше",
          "area": "",
          "deadline": "за 8 класс",
          "steps": [],
          "done": true
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
        "details": "29.09.2011",
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
        "title": "Областная олимпиада",
        "details": "Грамота",
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
        "section": "Прочитанные книги",
        "title": "Гарри Поттер",
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
        "title": "Шерлок Холмс",
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
        "section": "Поездки",
        "title": "Турция, Анталья",
        "details": "",
        "date": "июль 2024"
      },
      {
        "section": "Поездки",
        "title": "Алматы, Медеу",
        "details": "",
        "date": "март 2025"
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
        "value": "Математика"
      },
      {
        "name": "KBO final 2",
        "value": "12"
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
        "value": "9"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Межличностный (3), Визуально-пространственный (1), Логико-математический (2), Кинестетический (0)"
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
    "id": "S24",
    "name": "Шарипов Дамир",
    "pin": "3486",
    "momPhone": "+7 775 259 70 62",
    "dadPhone": "+7 701 759 70 37",
    "idp": {
      "mentor": "Орлова Е.В.",
      "strengths": "Логическое мышление, усидчивость",
      "goals": [
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
      "comment": "Обрати внимание на сроки по целям."
    },
    "portfolio": [
      {
        "section": "Личное",
        "title": "Дата рождения",
        "details": "06.01.2012",
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
        "details": "Архитектор",
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
        "details": "4",
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
        "details": "5",
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
        "title": "гитара",
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
        "value": "Nope"
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
        "value": "6"
      },
      {
        "name": "Гарднер (зият түрі)",
        "value": "Музыкальный (0), Внутриличностный (2), Визуально-пространственный (0), Межличностный (3)"
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
    "id": "S25",
    "name": "Юсупов Эльдар",
    "pin": "1692",
    "momPhone": "+7 705 532 30 85",
    "dadPhone": "",
    "idp": {
      "mentor": "Ли К.Н.",
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
              "done": false
            },
            {
              "text": "Создать свой проект",
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
          "title": "50 отжиманий за раз",
          "area": "",
          "deadline": "до Нового года",
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
        "details": "05.05.2011",
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
        "title": "Областная олимпиада",
        "details": "1 место",
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
        "title": "Английский язык",
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
        "title": "баскетбол",
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
        "value": "Информатика"
      },
      {
        "name": "KBO final 2",
        "value": "Nope"
      }
    ],
    "tests": [
      {
        "name": "Инерттілік (И)",
        "value": "7"
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
        "value": "Логико-математический (4), Лингвистический (0), Кинестетический (1), Внутриличностный (4)"
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
    {"date": "2026-09-01", "subject": "Информатика", "absent": [], "late": [], "excused": ["S16"]},
    {"date": "2026-09-01", "subject": "Математика", "absent": ["S02", "S15", "S19"], "late": ["S01"], "excused": []},
    {"date": "2026-09-01", "subject": "История", "absent": [], "late": ["S16"], "excused": []},
    {"date": "2026-09-01", "subject": "Физкультура", "absent": ["S02", "S19"], "late": [], "excused": ["S22"]},
    {"date": "2026-09-02", "subject": "Физика", "absent": ["S05"], "late": [], "excused": []},
    {"date": "2026-09-02", "subject": "Английский язык", "absent": ["S23"], "late": [], "excused": ["S08", "S20"]},
    {"date": "2026-09-02", "subject": "Литература", "absent": ["S02", "S06"], "late": ["S19", "S20"], "excused": []},
    {"date": "2026-09-02", "subject": "Биология", "absent": ["S05", "S09", "S15"], "late": [], "excused": []},
    {"date": "2026-09-03", "subject": "Математика", "absent": ["S01", "S20"], "late": ["S05"], "excused": []},
    {"date": "2026-09-03", "subject": "Химия", "absent": ["S02"], "late": ["S06", "S14"], "excused": ["S03"]},
    {"date": "2026-09-03", "subject": "Казахский язык", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-03", "subject": "География", "absent": ["S05", "S08"], "late": [], "excused": ["S17"]},
    {"date": "2026-09-04", "subject": "Английский язык", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-04", "subject": "Информатика", "absent": ["S14"], "late": [], "excused": []},
    {"date": "2026-09-04", "subject": "Математика", "absent": ["S03"], "late": [], "excused": []},
    {"date": "2026-09-04", "subject": "Классный час", "absent": ["S03"], "late": [], "excused": []},
    {"date": "2026-09-07", "subject": "Математика", "absent": ["S15"], "late": [], "excused": ["S16"]},
    {"date": "2026-09-07", "subject": "Русский язык", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-07", "subject": "Английский язык", "absent": ["S20", "S25"], "late": [], "excused": ["S02"]},
    {"date": "2026-09-07", "subject": "Физика", "absent": ["S24"], "late": ["S25"], "excused": []},
    {"date": "2026-09-08", "subject": "Информатика", "absent": ["S20"], "late": [], "excused": []},
    {"date": "2026-09-08", "subject": "Математика", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-08", "subject": "История", "absent": [], "late": ["S08"], "excused": []},
    {"date": "2026-09-08", "subject": "Физкультура", "absent": [], "late": [], "excused": ["S05"]},
    {"date": "2026-09-09", "subject": "Физика", "absent": ["S23"], "late": ["S05"], "excused": []},
    {"date": "2026-09-09", "subject": "Английский язык", "absent": ["S15", "S20"], "late": ["S14"], "excused": []},
    {"date": "2026-09-09", "subject": "Литература", "absent": ["S06"], "late": ["S20"], "excused": []},
    {"date": "2026-09-09", "subject": "Биология", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-10", "subject": "Математика", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-10", "subject": "Химия", "absent": ["S19"], "late": [], "excused": ["S08"]},
    {"date": "2026-09-10", "subject": "Казахский язык", "absent": ["S06", "S15"], "late": [], "excused": []},
    {"date": "2026-09-10", "subject": "География", "absent": ["S11"], "late": ["S23"], "excused": []},
    {"date": "2026-09-11", "subject": "Английский язык", "absent": ["S04", "S08"], "late": ["S03"], "excused": []},
    {"date": "2026-09-11", "subject": "Информатика", "absent": ["S24"], "late": ["S03"], "excused": []},
    {"date": "2026-09-11", "subject": "Математика", "absent": [], "late": ["S03"], "excused": []},
    {"date": "2026-09-11", "subject": "Классный час", "absent": ["S05", "S23"], "late": ["S03"], "excused": []},
    {"date": "2026-09-14", "subject": "Математика", "absent": ["S24"], "late": ["S01"], "excused": []},
    {"date": "2026-09-14", "subject": "Русский язык", "absent": [], "late": ["S12", "S13"], "excused": []},
    {"date": "2026-09-14", "subject": "Английский язык", "absent": ["S02", "S24"], "late": ["S08", "S19"], "excused": []},
    {"date": "2026-09-14", "subject": "Физика", "absent": ["S06", "S09", "S12", "S23"], "late": [], "excused": []},
    {"date": "2026-09-15", "subject": "Информатика", "absent": ["S19"], "late": [], "excused": []},
    {"date": "2026-09-15", "subject": "Математика", "absent": ["S04"], "late": ["S11", "S20"], "excused": []},
    {"date": "2026-09-15", "subject": "История", "absent": ["S03", "S08"], "late": [], "excused": []},
    {"date": "2026-09-15", "subject": "Физкультура", "absent": ["S23"], "late": [], "excused": ["S14", "S16"]},
    {"date": "2026-09-16", "subject": "Физика", "absent": ["S02"], "late": [], "excused": []},
    {"date": "2026-09-16", "subject": "Английский язык", "absent": ["S07"], "late": ["S16"], "excused": []},
    {"date": "2026-09-16", "subject": "Литература", "absent": ["S04"], "late": [], "excused": []},
    {"date": "2026-09-16", "subject": "Биология", "absent": [], "late": [], "excused": []},
    {"date": "2026-09-17", "subject": "Математика", "absent": ["S14", "S17"], "late": [], "excused": ["S24"]},
    {"date": "2026-09-17", "subject": "Химия", "absent": ["S05", "S09", "S14"], "late": [], "excused": []},
    {"date": "2026-09-17", "subject": "Казахский язык", "absent": ["S15", "S20"], "late": [], "excused": ["S02"]},
    {"date": "2026-09-17", "subject": "География", "absent": ["S13"], "late": [], "excused": []},
    {"date": "2026-09-18", "subject": "Английский язык", "absent": ["S07"], "late": [], "excused": []},
    {"date": "2026-09-18", "subject": "Информатика", "absent": ["S23"], "late": [], "excused": []},
    {"date": "2026-09-18", "subject": "Математика", "absent": [], "late": ["S05"], "excused": []},
    {"date": "2026-09-18", "subject": "Классный час", "absent": ["S19"], "late": ["S01", "S04"], "excused": []},
    {"date": "2026-09-21", "subject": "Математика", "absent": ["S12", "S19"], "late": [], "excused": []},
    {"date": "2026-09-21", "subject": "Русский язык", "absent": ["S09"], "late": [], "excused": ["S19"]},
    {"date": "2026-09-21", "subject": "Английский язык", "absent": ["S11"], "late": [], "excused": ["S21"]},
    {"date": "2026-09-21", "subject": "Физика", "absent": ["S03"], "late": ["S14"], "excused": []},
    {"date": "2026-09-22", "subject": "Информатика", "absent": ["S05"], "late": ["S08"], "excused": []},
    {"date": "2026-09-22", "subject": "Математика", "absent": ["S12"], "late": [], "excused": []},
    {"date": "2026-09-22", "subject": "История", "absent": ["S02"], "late": ["S12"], "excused": ["S24"]},
    {"date": "2026-09-22", "subject": "Физкультура", "absent": ["S11"], "late": [], "excused": []}
  ]
};
