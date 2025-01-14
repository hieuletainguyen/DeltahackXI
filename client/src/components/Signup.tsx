import React, { useState } from 'react';
import { User, Lock, Mail } from 'lucide-react';

interface SignupProps {
    onSignup: (token: string) => void;
    onLoginClick: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onLoginClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState<'customer' | 'provider'>('customer');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password,
                    userType 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            onSignup(data.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                    <p className="text-gray-600">Sign up to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md 
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md 
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* User Type Selection */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setUserType('customer')}
                                className={`
                                    p-4 rounded-lg border-2 transition-all duration-200 ease-in-out
                                    ${userType === 'customer' 
                                        ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="text-center">
                                    <div className={`
                                        font-medium mb-1
                                        ${userType === 'customer' ? 'text-blue-600' : 'text-gray-700'}
                                    `}>
                                        Customer
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Looking to charge
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setUserType('provider')}
                                className={`
                                    p-4 rounded-lg border-2 transition-all duration-200 ease-in-out
                                    ${userType === 'provider' 
                                        ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="text-center">
                                    <div className={`
                                        font-medium mb-1
                                        ${userType === 'provider' ? 'text-blue-600' : 'text-gray-700'}
                                    `}>
                                        Provider
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Offering charging
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white 
                                 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={onLoginClick}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Already have an account? Log in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;