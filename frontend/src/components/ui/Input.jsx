import React from 'react';

const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`
          w-full px-4 py-2 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm
          focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          placeholder:text-slate-400
          ${error ? 'border-red-500 focus:ring-red-500' : 'hover:border-slate-300'}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
