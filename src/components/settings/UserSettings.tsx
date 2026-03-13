import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Lock, ArrowLeft } from 'lucide-react';

interface UserSettingsProps {
  onNavigate?: (view: string) => void;
}

export default function UserSettings({ onNavigate }: UserSettingsProps) {
  const { profile, user, updateProfile, changePassword } = useAuth();

  // Profile Form state
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    setProfileSaving(true);
    
    // Quick validation
    if (!email.trim() || !fullName.trim()) {
      setProfileFeedback({ type: 'error', message: 'Veuillez remplir votre nom complet et votre adresse email.' });
      setProfileSaving(false);
      return;
    }

    const { error } = await updateProfile(fullName.trim(), email.trim());
    if (error) {
      setProfileFeedback({ type: 'error', message: `Erreur: ${error.message}` });
    } else {
      setProfileFeedback({ type: 'success', message: 'Votre profil a été mis à jour avec succès.' });
    }
    setProfileSaving(false);
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Veuillez remplir tous les champs de mot de passe.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'Le nouveau mot de passe doit être différent de l\'actuel.' });
      return;
    }

    setPasswordSaving(true);
    const { error } = await changePassword(currentPassword, newPassword);
    if (error) {
      setPasswordFeedback({ type: 'error', message: `Erreur: ${error.message}` });
    } else {
      setPasswordFeedback({ type: 'success', message: 'Votre mot de passe a été modifié.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordSaving(false);
  };

  return (
    <div className="w-full">
      <div className="mb-10">
         <button
            onClick={() => onNavigate?.('settings')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
         >
            <ArrowLeft className="w-4 h-4" />
            Retour aux paramètres
         </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Profil utilisateur</h1>
          <p className="text-gray-500 text-lg max-w-2xl mt-2">
            Mettez à jour vos informations personnelles et sécurisez votre compte.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">
              Informations personnelles
            </h2>
            
            {profileFeedback && (
              <div className={`p-4 rounded-xl mb-6 text-sm ${profileFeedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {profileFeedback.message}
              </div>
            )}

            <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                  placeholder="jean.dupont@example.com"
                  required
                />
              </div>

               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle</label>
                <input
                  type="text"
                  value={profile?.role || 'Utilisateur'}
                  disabled
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </form>
          </div>
          <div className="px-6 md:px-8 py-5 border-t border-gray-50 bg-gray-50 flex justify-end">
             <button
                type="submit"
                form="profile-form"
                disabled={profileSaving}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center shadow-md transition-all active:scale-95 gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Mettre à jour le profil</span>
              </button>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">
              Mot de passe
            </h2>

            {passwordFeedback && (
              <div className={`p-4 rounded-xl mb-6 text-sm ${passwordFeedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {passwordFeedback.message}
              </div>
            )}

            <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                  required
                />
              </div>
              
              <div className="pt-2 border-t border-gray-50">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                  required
                />
              </div>

               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors"
                  required
                />
              </div>
            </form>
          </div>
           <div className="px-6 md:px-8 py-5 border-t border-gray-50 bg-gray-50 flex justify-end">
             <button
                type="submit"
                form="password-form"
                disabled={passwordSaving}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center shadow-md transition-all active:scale-95 gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Changer le mot de passe</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
