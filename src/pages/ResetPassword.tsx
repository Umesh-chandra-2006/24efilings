import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { Button } from '../components/ui/Button';
import { EfilingLogo, LockIcon, EyeIcon, EyeOffIcon } from '../components/icons';

interface ResetPasswordProps {
  onPasswordUpdate: (password: string) => Promise<void>;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onPasswordUpdate }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.addToast("Password must be at least 6 characters long.", 'error');
            return;
        }
        if (password !== confirmPassword) {
            toast.addToast("Passwords do not match.", 'error');
            return;
        }

        setLoading(true);
        try {
            await onPasswordUpdate(password);
            // Success toast is handled in App.tsx to coordinate with sign out.
        } catch (err: any) {
            toast.addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: "url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/80 z-10" />
            
            <main className="relative z-20 w-full max-w-md mx-auto px-4">
                <div className="text-center mb-8">
                    <EfilingLogo className="h-8 w-auto mb-4 inline-block text-white" />
                    <h1 className="text-3xl font-bold text-white tracking-tight">Reset Your Password</h1>
                    <p className="text-slate-300 mt-1">Enter a new password for your account below.</p>
                </div>
                
                <div className="w-full p-8 space-y-6 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-white">
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                                New Password
                            </label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/30 text-white placeholder-slate-400 rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none transition"
                                required
                                placeholder="Enter new password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">Must be at least 6 characters</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="confirmPassword">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/30 text-white placeholder-slate-400 rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none transition"
                                required
                                placeholder="Confirm new password"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full py-3 font-semibold text-base"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Set New Password'}
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ResetPassword;