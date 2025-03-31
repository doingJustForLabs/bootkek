const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Создаем новое Express-приложение и HTTP-сервер
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Обрабатываем новое подключение
io.on('connection', (socket) => {
  console.log('Новое соединение установлено.');

  // Обрабатываем полученное сообщение от клиента
  socket.on('message', (message) => {
    console.log('Получено сообщение: %s', message);
    // Отправляем эхо-сообщение обратно клиенту
    socket.send(`Эхо: ${message}`);
  });

  // Обрабатываем отключение клиента
  socket.on('disconnect', () => {
    console.log('Соединение закрыто.');
  });
});

// Запуск сервера на порту 8080
server.listen(8080, () => {
  console.log('Сервер запущен на порту 8080.');
});

// const WebSocket = require('ws');

// // Создаем новый сервер WebSocket на порту 8080
// const wss = new WebSocket.Server({ port: 8080});

// wss.on('connection', (ws) => {
//     console.log('Новое соединение установлено');

//     // Обрабатываем полученное сообщение от клиента
//     ws.on('message', (message) => {
//         /* Обязательно превращаем message в строку,
//         поскольку по умолчанию message - это т.н. blob,
//         более низкоуровневая сущность, оптимизированная для передачи по сети*/
//         const messageString = message.toString();
//         console.log(`Получено сообщение: ${messageString}`);

//         // Рассылаем сообщения всем подключенным клиентам
//         wss.clients.forEach((client) => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(messageString);
//             }
//         });
//     });

//     // Обрабатываем закрытия соединения
//     ws.on('close', () => {
//         console.log('Соединение закрыто.');
//     });
// });

// console.log('Сервер WevSocket запущен на порту 8080.');