# Біздің отбасы — отбасылық сайт

3 беттен тұрады: **Басты бет**, **Отбасымыз**, **Естеліктер** (галерея).

## Іске қосу
```
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ папкасы — хостингке жүктеуге дайын
```

## Фотолар
- `public/images/family/family-01.jpg …`  — 1-топ
- `public/images/memories/memory-01.jpg …` — 2-топ
- `public/images/gallery/gallery-01.jpg …` — 3-топ

Түпнұсқалар өзгертілмеген. Жылдам жүктелу үшін `public/images/optimized/` ішінде WEBP нұсқалары бар
(640 / 1280 / 2400 px). Жаңа фото қосқанда: `scripts/process_photos.py` ішіндегі тізімді толықтырып,
`npm run photos` іске қосыңыз, содан кейін `src/data/captions.ts` ішіне атау мен күнін жазыңыз.

## Мәтінді өзгерту
- `src/data/content.ts` — отбасы мүшелері (есім `name`, туған күн `birth` қосуға болады), тарих, құндылықтар
- `src/data/captions.ts` — әр фотоның атауы, күні, санаты


## Альбомдар және админ режимі (сервер)

Құрылым: **Бөлім → Тақырып → Фото** (`#/albomdar`). Қарапайым келуші тек көреді; «Кіру» → құпия сөз → ADMIN режимі.

### Іске қосу
```bash
npm install
SLIM=1 npm run build   # (SLIM — түпнұсқа ауыр фотосыз, тек оптимизацияланған нұсқалармен)
ADMIN_PASSWORD="өз-құпия-сөзіңіз" DATA_DIR=./data npm start     # http://localhost:8080
```
- Құпия сөз тек серверде (`ADMIN_PASSWORD` ортасында). HTML/JS ішінде жоқ. Кіргеннен кейін HttpOnly cookie-сессия беріледі, қате әрекеттер шектеледі.
- Барлық деректер мен фотолар `DATA_DIR` папкасында (`db.json` + `media/`). Серверді қайта қосқанда сақталады.

### Интернетке шығару (cloud)
`Dockerfile` дайын. Render / Railway / Fly.io / VPS-те:
1. Репозиторийді жүктеңіз, **Docker** (немесе Node: build `npm install && SLIM=1 npm run build`, start `npm start`) таңдаңыз.
2. `ADMIN_PASSWORD` ортасын қойыңыз.
3. **Тұрақты диск (Persistent Disk / Volume)** қосып, `/data` жолына тіркеңіз (`DATA_DIR=/data`). Диск болмаса, хостинг қайта қосылғанда жүктелген фотолар жоғалады.

### Ескерту
`Bizdin-otbasy.html` (бір файл) — тек офлайн көру үшін; онда альбомдар мен «Кіру» болмайды, себебі сервер керек.
