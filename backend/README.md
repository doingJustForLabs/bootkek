# Granite (Backend)

## Alembic (_новое!_)

### Основные команды

Все команды нужно запускать из папки `src` иначе он просто не увидит alembic

#### Обновление и откат миграций

```shell
alembic upgrade head
alembic downgrade -1
```

#### Создание новой миграции

```shell
alembic revision --autogenerate -m "название миграции"
```

> **Важно!** Для создания новой миграции нужно обязательно:
> - Проверить миграцию (в папке `versions`), что все корректно создается
> - Импортировать _новые модели_ в файл `alembic/env.py` как сделано сейчас
>   ```
>   from api.auth.models import User
>   from api.profiles.models import Profile
>   
>   # Например создал новую модель -> импортируй
>   from api.followers.models import Follower
>   ``` 

## Запуск серверов

### Установка зависимостей (_обновление!_)

Скачиваем репозиторий
```shell
git clone https://github.com/doingJustForLabs/bootkek.git
cd backend/
```

В версии `0.4.0` добавлен новый пакетный менеджер - [uv](https://habr.com/ru/articles/828016/)

#### Установка зависимостей через pip

```
python -m venv venv
venv/Scripts/activate
pip install -r requirements.txt
```

! В дальнейшем `requirements.txt` не будет поддерживаться, так как сейчас появился аналог в виде удобного `pyproject.toml` 

#### Установка зависимостей через uv

```shell
uv venv venv
venv/Scripts/activate
uv sync

# -- Основные команды --
uv add ...    # Аналог pip install ...
uv remove ... # Аналог pip uninstall ...
```


**P.S.** Предварительно необходимо его скачать `pip install uv`

> **Важно!** Установите папку `src` как [Root-папку](https://www.google.com/search?q=%D0%BA%D0%B0%D0%BA+%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C+%D0%BF%D0%B0%D0%BF%D0%BA%D1%83+%D0%BA%D0%B0%D0%BA+root+%D0%B2+pycharm&sca_esv=e1158a711e1314a4&sxsrf=AHTn8zqYP_yIgsYfz-8yX9JlVqeSTfZgSQ%3A1741775319828&ei=12HRZ_ykMoT1i-gPzJCMiAQ&ved=0ahUKEwi87N3ZqoSMAxWE-gIHHUwIA0EQ4dUDCBA&uact=5&oq=%D0%BA%D0%B0%D0%BA+%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C+%D0%BF%D0%B0%D0%BF%D0%BA%D1%83+%D0%BA%D0%B0%D0%BA+root+%D0%B2+pycharm&gs_lp=Egxnd3Mtd2l6LXNlcnAiPdC60LDQuiDRg9GB0YLQsNC90L7QstC40YLRjCDQv9Cw0L_QutGDINC60LDQuiByb290INCyIHB5Y2hhcm0yBRAhGJ8FMgUQIRifBTIFECEYnwUyBRAhGJ8FMgUQIRifBTIFECEYnwUyBRAhGJ8FMgUQIRifBTIFECEYnwUyBRAhGJ8FSLMoUDBYlCRwBXgAkAEAmAGeAaAB4g6qAQQxLjE0uAEDyAEA-AEBmAIToALADsICChAAGLADGNYEGEfCAgUQIRigAcICCRAhGKABGAoYKsICBxAhGKABGArCAggQABiiBBiJBcICBRAAGO8FwgIIEAAYgAQYogSYAwCIBgGQBgiSBwQ1LjE0oAeGZA&sclient=gws-wiz-serp), чтобы корректно работали импорты.

### Запуск сервера

```shell
python main.py
```

Если запуск происходит через **PyCharm**, импорты будут работать корректно

### Тестирование с pytest

Для запуска тестирования в консоль необходимо ввести команду

```shell
# Для обычного вывода
pytest
# Для красивого вывода
pytest -v
```

После запуска `pytest` сам найдет все тесты и выведет в консоль результаты

### Доступ к документации API

После запуска сервера можно открыть Swagger-документацию: [Swagger UI](http://127.0.0.1:8000/docs)

## Конфигурация

### Файл переменных окружения

Необходимо создать файл `.env`, ориентируясь на `.env.example`.

С развитием проекта могут добавляться новые переменные, поэтому рекомендуется регулярно проверять этот файл.

### Файл переменных окружения (для тестов)

Аналогично предыдущему блоку создать файл `.test.env` ориентируясь теперь на `.test.env.example`
Также необходимо создать новую базу данных для тестирования 

### БД (PostgreSQL)

Для подключения к базе данных необходимо создать сервер в **pgAdmin** и использовать соответствующие параметры в `.env`.

> В будущем планируется добавить поддержку `docker-compose.yml`.

#### Пример конфигурации `.env`

```text
# DSN для подключения к PostgreSQL
DB__URL = postgresql+asyncpg://{user}:{pass}@{host}:{port}/{name}

# Включение/выключение логирования SQL-запросов (0 - выключено, 1 - включено)
DB__ECHO = 0
```

#### Пример конфигурации `.test.env`

```text
# DSN для подключения к PostgreSQL
DB__URL = postgresql+asyncpg://{user}:{pass}@{host}:{port}/{test-name}

# Включение/выключение логирования SQL-запросов (0 - выключено, 1 - включено)
DB__ECHO = 0

# Тип базы данных (обязательно TEST)
DB__MODE = TEST
```

### JWT

Для корректной работы JWT-токенов в `.env` необходимо указать секретный ключ:

```text
JWT__SECRET_KEY=SECRET_KEY
```

Сгенерировать секретный ключ можно с помощью функции `generate_secret_key()` в файле `utils.py`.

