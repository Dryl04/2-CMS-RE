import { useState, useEffect } from 'react';
import { X, UserPlus, Shield, Pencil, Eye, Crown, Trash2, Search } from 'lucide-react';
import type {
  SEODocumentWithAuthor,
  SEODocumentPermission,
  PermissionLevel,
} from '@/lib/redactionTypes';
import { grantPermission, revokePermission } from '@/lib/redactionPermissions';
import { logDocumentActivity } from '@/lib/redactionActivity';
import { supabase } from '@/lib/supabase';

interface ShareDocumentModalProps {
  document: SEODocumentWithAuthor;
  userId: string;
  userRole: string;
  permissions: SEODocumentPermission[];
  onClose: () => void;
}

interface UserOption {
  id: string;
  email: string;
  full_name?: string;
}

export default function ShareDocumentModal({
  document: doc,
  userId,
  userRole,
  permissions,
  onClose,
}: ShareDocumentModalProps) {
  const [perms, setPerms] = useState(permissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<PermissionLevel>('editor');
  const [working, setWorking] = useState(false);

  const isOwnerOrAdmin =
    doc.owner_user_id === userId || userRole === 'admin' || userRole === 'seo_manager';

  // Rechercher des utilisateurs
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('id, email, full_name')
          .or(`email.ilike.%${searchQuery.trim()}%,full_name.ilike.%${searchQuery.trim()}%`)
          .limit(10);

        // Exclure les utilisateurs qui ont déjà une permission
        const existingUserIds = new Set([doc.owner_user_id, ...perms.map((p) => p.user_id)]);
        setSearchResults((data ?? []).filter((u) => !existingUserIds.has(u.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, perms, doc.owner_user_id]);

  const handleGrant = async (targetUserId: string, targetName: string) => {
    setWorking(true);
    try {
      const perm = await grantPermission(doc.id, targetUserId, selectedLevel, userId);
      setPerms((prev) => [...prev, perm]);
      setSearchQuery('');
      setSearchResults([]);
      await logDocumentActivity(
        doc.id,
        userId,
        'permission_granted',
        `Droit « ${selectedLevel} » accordé à ${targetName}`,
        { target_user_id: targetUserId, level: selectedLevel }
      );
    } catch (err) {
      console.error('[ShareModal] Erreur:', err);
    } finally {
      setWorking(false);
    }
  };

  const handleRevoke = async (perm: SEODocumentPermission & { user_profile?: UserOption }) => {
    if (!confirm(`Retirer les droits de ${perm.user_profile?.full_name || perm.user_profile?.email || 'cet utilisateur'} ?`)) return;
    setWorking(true);
    try {
      await revokePermission(doc.id, perm.user_id);
      setPerms((prev) => prev.filter((p) => p.id !== perm.id));
      await logDocumentActivity(
        doc.id,
        userId,
        'permission_revoked',
        `Droits retirés pour ${perm.user_profile?.full_name || perm.user_profile?.email || perm.user_id}`,
        { target_user_id: perm.user_id }
      );
    } catch (err) {
      console.error('[ShareModal] Erreur revoke:', err);
    } finally {
      setWorking(false);
    }
  };

  const handleUpdateLevel = async (perm: SEODocumentPermission & { user_profile?: UserOption }, newLevel: PermissionLevel) => {
    setWorking(true);
    try {
      await grantPermission(doc.id, perm.user_id, newLevel, userId);
      setPerms((prev) =>
        prev.map((p) => (p.id === perm.id ? { ...p, permission_level: newLevel } : p))
      );
    } catch (err) {
      console.error('[ShareModal] Erreur update:', err);
    } finally {
      setWorking(false);
    }
  };

  const LEVEL_ICON: Record<PermissionLevel, typeof Eye> = {
    reader: Eye,
    editor: Pencil,
    owner: Crown,
  };

  const LEVEL_LABEL: Record<PermissionLevel, string> = {
    reader: 'Lecteur',
    editor: 'Éditeur',
    owner: 'Propriétaire',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Partager le document</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{doc.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Recherche utilisateur */}
        {isOwnerOrAdmin && (
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un utilisateur (email ou nom)…"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                    focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as PermissionLevel)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                  focus:border-emerald-500 outline-none"
              >
                <option value="reader">Lecteur</option>
                <option value="editor">Éditeur</option>
              </select>
            </div>

            {/* Résultats recherche */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm max-h-40 overflow-y-auto">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleGrant(u.id, u.full_name || u.email)}
                    disabled={working}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-emerald-50 transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0 text-left">
                      {u.full_name && <span className="font-medium text-gray-900">{u.full_name}</span>}
                      <span className="text-gray-500 ml-1">{u.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searching && (
              <p className="text-xs text-gray-400 mt-2">Recherche en cours…</p>
            )}
          </div>
        )}

        {/* Liste des collaborateurs */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Collaborateurs
          </h3>

          {/* Owner : toujours premier */}
          <div className="flex items-center gap-3 py-2.5 border-b border-gray-100">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {doc.owner_profile?.full_name || doc.owner_profile?.email || 'Propriétaire'}
              </p>
              <p className="text-xs text-gray-500">Propriétaire</p>
            </div>
          </div>

          {/* Permissions */}
          {perms.map((perm: any) => {
            const LevelIcon = LEVEL_ICON[perm.permission_level as PermissionLevel];
            return (
              <div key={perm.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <LevelIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {perm.user_profile?.full_name || perm.user_profile?.email || perm.user_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {LEVEL_LABEL[perm.permission_level as PermissionLevel]}
                  </p>
                </div>

                {isOwnerOrAdmin && (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={perm.permission_level}
                      onChange={(e) => handleUpdateLevel(perm, e.target.value as PermissionLevel)}
                      disabled={working}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white
                        focus:border-emerald-500 outline-none disabled:opacity-50"
                    >
                      <option value="reader">Lecteur</option>
                      <option value="editor">Éditeur</option>
                    </select>
                    <button
                      onClick={() => handleRevoke(perm)}
                      disabled={working}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Retirer l'accès"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {perms.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucun collaborateur ajouté
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            Tous les utilisateurs authentifiés peuvent lire ce document. Seuls les éditeurs et propriétaires peuvent le modifier.
          </p>
        </div>
      </div>
    </div>
  );
}
