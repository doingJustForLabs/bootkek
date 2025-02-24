# bootkek

## Запуск серверов

### Backend:

```shell
python -m venv venv
venv/Scripts/activate
pip install -r requirements.txt
```

После запускайте `main.py`, или
```shell
uvicorn src.main:app --reload
```

Переходите по ссылке в терминале и вы увидете Message: Api is working

! Если хотите открыть Swagger (посмотреть все ручки): в запросе допишите /docs
(http://127.0.0.1:8000/docs или http://localhost:8000/docs)

### Frontend

```shell
npm install
npm run dev
```

После этого в терминале появится ссылочка на сервер фронтендика где можно потыкать дефолтные ручки которые создал Vite