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
            if (!userData?.id) {
                throw new Error("Invalid user data");
            }
            setUser(userData);
        } catch (error) {
            // Если токен невалидный, делаем логаут
            console.error("Auth check failed:", error);
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
            const loginResponse = await authService.login(email, password);
            const userData = await authService.getMe();

            if (!userData?.id) {
                throw new Error("User ID not received");
            }

            setUser(userData); // Важно: сохраняем полный объект пользователя
            navigate("/profile");
            return true;
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
//     const [accessToken, setAccessToken] = useState(null);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
//         <AuthContext.Provider value={{ accessToken, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);