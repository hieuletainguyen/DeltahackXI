import React, { useState } from 'react';

interface ProviderSettingsProps {
    onClose: () => void;
    onSubmit: (data: ProviderFormData) => void;
    setShowCustomerSettings: (show: boolean) => void;
}

interface ProviderFormData {
    chargerName: string;
    powerEfficiency: number;
    pricePerHour: number;
    location: string;
}

const ProviderSettings: React.FC<ProviderSettingsProps> = ({ onClose, onSubmit, setShowCustomerSettings }) => {
    const [formData, setFormData] = useState<ProviderFormData>({
        chargerName: '',
        powerEfficiency: 90,
        pricePerHour: 10,
        location: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const switchToCustomer = () => {
        onClose();
        setShowCustomerSettings(true);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 2000,
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '0',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                position: 'relative',
            }}>
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #eee',
                    marginBottom: '20px',
                }}>
                    <button
                        onClick={switchToCustomer}
                        style={{
                            flex: 1,
                            padding: '15px',
                            backgroundColor: '#f5f5f5',
                            color: '#666',
                            border: 'none',
                            borderTopLeftRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}
                    >
                        Customer
                    </button>
                    <button
                        style={{
                            flex: 1,
                            padding: '15px',
                            backgroundColor: '#007aff',
                            color: 'white',
                            border: 'none',
                            borderTopRightRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}
                    >
                        Provider
                    </button>
                </div>
                <div style={{ padding: '0 30px 30px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontSize: '0.9rem'
                            }}>
                                Charger Name
                            </label>
                            <input
                                type="text"
                                value={formData.chargerName}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    chargerName: e.target.value
                                }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontSize: '0.9rem'
                            }}>
                                Power Efficiency (%)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={formData.powerEfficiency}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    powerEfficiency: Number(e.target.value)
                                }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontSize: '0.9rem'
                            }}>
                                Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    location: e.target.value
                                }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                                required
                                placeholder="Enter your charger's location"
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#555',
                                fontSize: '0.9rem'
                            }}>
                                Price Per Hour ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.pricePerHour}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    pricePerHour: Number(e.target.value)
                                }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    color: '#333',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    backgroundColor: '#007aff',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProviderSettings; 