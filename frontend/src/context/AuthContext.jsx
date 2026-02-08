import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Role, points, etc.
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                // Fetch user from Node.js backend
                const response = await axios.get(`${API_URL}/users/profile`);
                if (response.data) {
                    setUser({ uid: response.data._id, email: response.data.email });
                    setUserData(response.data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setUser(null);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/users/login`, { email, password });
            if (response.data) {
                const userData = response.data;
                setUser({ uid: userData._id, email: userData.email });
                setUserData(userData);
                return { success: true, userData };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    };

    const signup = async (name, email, password, role) => {
        try {
            const response = await axios.post(`${API_URL}/users/signup`, { name, email, password, role });
            if (response.data) {
                const userData = response.data;
                setUser({ uid: userData._id, email: userData.email });
                setUserData(userData);
                return { success: true, userData };
            }
        } catch (error) {
            console.error("Signup error:", error);
            return { success: false, message: error.response?.data?.message || "Signup failed" };
        }
    };

    const logout = () => {
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, signup, logout }}>
            {loading ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
                    <div className="w-16 h-16 relative mb-4">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-900 font-bold text-lg animate-pulse">LearnSphere is sparking magic...</p>
                    <p className="text-slate-400 text-sm mt-2">Connecting to our neural networks</p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
