import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");

        if (saved === null) {
            return true;
        }

        return saved === "true";
    });

    useEffect(() => {
        localStorage.setItem("darkMode", String(darkMode));
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((current) => !current);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;