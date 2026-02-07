import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
