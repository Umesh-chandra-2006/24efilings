import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { User } from '../../types';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Camera } from 'lucide-react';

interface ProfileSettingsProps {
    currentUser: User;
    showToast: (type: 'success' | 'error', message: string) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, showToast }) => {
    const { updateUser } = useApi();
    const { refreshProfile } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
        avatar_url: currentUser.avatar_url || '',
        preferences: (currentUser as any).preferences || { language: 'en', timezone: 'UTC', theme: 'system' }
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUser({
                ...currentUser,
                name: profileData.name,
                phone_number: profileData.phone_number,
                avatar_url: profileData.avatar_url,
                // Cast to any for new fields until types are updated
                ...{ preferences: profileData.preferences } as any
            });
            await refreshProfile();
            showToast('success', "Profile updated successfully");
        } catch (e: any) {
            showToast('error', e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        const file = event.target.files[0];
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
            showToast('success', "Avatar uploaded");
        } catch (error: any) {
            showToast('error', error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                            ) : profileData.avatar_url ? (
                                <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-slate-400">{profileData.name.charAt(0)}</span>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm"
                            title="Upload Avatar"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h3 className="font-medium text-lg">{currentUser.name || 'User'}</h3>
                        <p className="text-slate-500 text-sm">{currentUser.role}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input value={profileData.email} disabled className="bg-slate-100 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mobile Number</label>
                        <Input value={profileData.phone_number} onChange={e => setProfileData({ ...profileData, phone_number: e.target.value })} placeholder="+91..." />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Preferences</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-600">Language</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={profileData.preferences.language}
                                onChange={e => setProfileData({ ...profileData, preferences: { ...profileData.preferences, language: e.target.value } })}
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="te">Telugu</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-600">Timezone</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={profileData.preferences.timezone}
                                onChange={e => setProfileData({ ...profileData, preferences: { ...profileData.preferences, timezone: e.target.value } })}
                            >
                                <option value="UTC">UTC</option>
                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-600">Theme</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={profileData.preferences.theme}
                                onChange={e => setProfileData({ ...profileData, preferences: { ...profileData.preferences, theme: e.target.value } })}
                            >
                                <option value="system">System Default</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Changes'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
