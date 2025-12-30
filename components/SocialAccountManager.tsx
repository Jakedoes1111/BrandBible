import React, { useState, useEffect } from 'react';

interface SocialAccount {
    id: string;
    platform: string;
    username: string;
    status: 'connected' | 'disconnected';
}

const PLATFORMS = [
    { name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
    { name: 'Instagram', icon: '📸', color: 'bg-pink-600' },
    { name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
];

const SocialAccountManager: React.FC = () => {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [loading, setLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/social/accounts');
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (err) {
            console.error("Failed to fetch accounts:", err);
        }
    };

    const handleConnect = async (platform: string) => {
        setLoading(platform);
        try {
            const res = await fetch('http://localhost:3001/api/social/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform }),
            });

            if (res.ok) {
                await fetchAccounts();
            }
        } catch (err) {
            console.error("Failed to connect:", err);
        } finally {
            setLoading(null);
        }
    };

    const handleDisconnect = async (platform: string) => {
        setLoading(platform);
        try {
            const res = await fetch('http://localhost:3001/api/social/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform }),
            });

            if (res.ok) {
                await fetchAccounts();
            }
        } catch (err) {
            console.error("Failed to disconnect:", err);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Connected Accounts</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLATFORMS.map((platform) => {
                    const account = accounts.find(a => a.platform === platform.name);
                    const isConnected = !!account;
                    const isLoading = loading === platform.name;

                    return (
                        <div key={platform.name} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${platform.color} text-white`}>
                                    {platform.icon}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{platform.name}</h3>
                                    <p className="text-sm text-gray-400">
                                        {isConnected ? account.username : 'Not connected'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => isConnected ? handleDisconnect(platform.name) : handleConnect(platform.name)}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${isConnected
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50'
                                    : 'bg-white text-black hover:bg-gray-200'
                                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Processing...' : isConnected ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-200 text-sm">
                <p><strong>Note:</strong> This is currently running in <strong>Simulation Mode</strong>. Connecting accounts will simulate a successful OAuth flow without redirecting you to external providers.</p>
            </div>
        </div>
    );
};

export default SocialAccountManager;
