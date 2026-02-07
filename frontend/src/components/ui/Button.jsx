import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 focus:ring-blue-500",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500",
        outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
        danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 focus:ring-red-500",
        ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
