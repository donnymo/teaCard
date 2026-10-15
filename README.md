# Карточка товара «Ананасовый улун»

HTML, SCSS, JavaScript.

## Запуск

Стили уже собраны в `css/main.css`, поэтому достаточно открыть `index.html` в браузере.

Через локальный сервер:

```
npm install
npm start
```

Страница откроется на http://localhost:3000.

## Команды

```
npm run build     # собрать scss/main.scss → css/main.css
npm run watch     # пересобирать стили при изменениях
npm run lint      # проверить SCSS (stylelint) и JS (eslint)
```

## Структура

```
index.html
css/main.css      # собранные стили
js/main.js        # интерактив
img/              # фото товара и логотип
scss/             # исходники стилей: abstracts, base, blocks (один БЭМ-блок — один файл)
```
