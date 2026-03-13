import { UserCircle, Globe } from 'lucide-react';

interface SettingsHubProps {
  onNavigate: (view: string) => void;
}

export default function SettingsHub({ onNavigate }: SettingsHubProps) {
  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-lg max-w-2xl mt-2">
          Gérez votre profil utilisateur ou configurez les sites et noms de domaines de l'application.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <button
          onClick={() => onNavigate('user-settings')}
          className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left flex flex-col group active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
            <UserCircle className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil Utilisateur</h2>
          <p className="text-gray-500">
            Gérez vos informations personnelles, votre adresse email et votre mot de passe.
          </p>
        </button>

        <button
          onClick={() => onNavigate('site-settings')}
          className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left flex flex-col group active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
            <Globe className="w-7 h-7 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sites & domaines</h2>
          <p className="text-gray-500">
            Configurez vos environnements web, les domaines associés et la stratégie SEO par défaut.
          </p>
        </button>
      </div>
    </div>
  );
}
