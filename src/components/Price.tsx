import React from 'react';
import '../styles/price.css';

interface PriceProps {
    price: number;
}

const Price: React.FC<PriceProps> = ({ price }) => {
    return (
        <div className="price-container">
            <span className="price-currency">$</span>
            <span className="price-amount">{price.toFixed(2)}</span>
        </div>
    );
};

export default Price; 