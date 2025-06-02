import React, { useState, useEffect, useCallback, useRef  } from 'react';
import 'styles/ui/Notification.css'; // Создадим этот файл позже

const Notification = ({ id, message, onClose, duration = 5000, chatId, onClick }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, onClose, duration]);

    return (
        <div className="custom-notification" onClick={() => onClick(chatId)}> {/* Добавлен onClick */}
            {message}
            <button className="notification-close-button" onClick={(e) => {
                e.stopPropagation(); // Предотвращаем срабатывание onClick на div
                onClose(id);
            }}>×</button>
        </div>
    );
};

const NotificationContainer = ({ onShowNotification, onNotificationClick  }) => {
    const [notifications, setNotifications] = useState([]);
    const showNotificationRef = useRef(null);

    const showNotification = useCallback((message, duration, chatId) => {
        const id = Date.now();
        setNotifications(prevNotifications => [...prevNotifications, { id, message, duration, chatId }]);
    }, [notifications, onShowNotification]);

    useEffect(() => {
        showNotificationRef.current = showNotification;
        if (onShowNotification) {
            onShowNotification(showNotification);
        }
    }, [onShowNotification, showNotification]);

    const handleClose = useCallback((id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    }, [notifications]);

    return (
        <div className="notification-container">
            {notifications.map(note => (
                <Notification
                    key={note.id}
                    id={note.id}
                    message={note.message}
                    onClose={handleClose}
                    duration={note.duration}
                    chatId={note.chatId}
                    onClick={onNotificationClick}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;
export { NotificationContainer }; // Экспортируем для использования в NavLayout