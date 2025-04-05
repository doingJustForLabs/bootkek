import { createContext, useState, useContext, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setUser(null);
                return;
            }
            const userData = await authService.getMe();
            setUser(userData);
        } catch (error) {
            // Если токен невалидный, делаем логаут
            await authService.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            const userData = await authService.getMe();

            console.log('User data after login:', userData); // Проверьте данные

            if (!userData?.id) {
                throw new Error('User ID not received');
            }

            setUser(userData); // Важно: сохраняем полный объект пользователя
            navigate("/profile");
        } catch (error) {
            console.error("Login error:", error);
            setUser(null);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);