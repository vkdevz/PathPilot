'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Award,
  Clock,
  BookOpen,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  UserCog,
  Calendar,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import type { AdminUserRecord, AdminOverviewStats } from '../../types';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'learner' | 'admin'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State for Role Change
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUserRecord | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewData, usersData] = await Promise.all([
        apiClient.getAdminOverview(),
        apiClient.getAdminUsers({
          search: searchQuery || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          limit: 150,
        }),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
    } catch (err: any) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/auth');
      } else if (user.role !== 'admin') {
        router.replace('/dashboard');
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminData();
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const updated = await apiClient.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
      );
      setNotification(`Successfully updated ${updated.display_name}'s role to ${newRole.toUpperCase()}.`);
      setTimeout(() => setNotification(null), 4000);
      setSelectedUserForRole(null);
      await fetchAdminData();
    } catch (err: any) {
      console.error('Failed to update role:', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (authLoading || (user && user.role !== 'admin')) {
    return (
      <div className="min-h-screen surface-base flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF4E0] dark:bg-[#FF9F0A]/20 border border-[#FF9F0A]/30 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-5 h-5 text-[#FF9F0A]" />
          </div>
          <span className="text-xs font-medium text-[#6E6E73] dark:text-[#AEAEB2]">Verifying Administrator Permissions...</span>
        </div>
      </div>
    );
  }

  const formatHoursMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <AppShell
      pageTitle="Client & Learner Administration"
      pageSubtitle="Audited overview of registered clients, platform learning metrics, and access role management."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
            title="Refresh Admin Overview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {notification && (
          <div className="p-3 rounded-xl bg-[#EAF8EE] dark:bg-[#30D158]/15 border border-[#34C759]/30 text-[#34C759] text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-[#34C759] hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ADMIN KPI METRICS CARDS
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Registered Users */}
          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#007AFF] mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#86868B]">Registered Clients</span>
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {overview?.total_registered_users ?? 0}
            </h3>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] font-medium">
              {overview?.total_learners ?? 0} Learners • {overview?.total_admins ?? 0} Admins
            </p>
          </div>

          {/* Total Study Effort */}
          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#34C759] mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#86868B]">Logged Study Time</span>
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatHoursMinutes(overview?.total_study_minutes_logged ?? 0)}
            </h3>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
              Across {overview?.total_study_sessions_logged ?? 0} study sessions
            </p>
          </div>

          {/* Total XP Awarded */}
          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#FF9F0A] mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#86868B]">Total XP Awarded</span>
              <Zap className="w-4 h-4 fill-[#FF9F0A]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {(overview?.total_xp_awarded ?? 0).toLocaleString()} XP
            </h3>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
              Verified gamification points
            </p>
          </div>

          {/* Total Completed Courses */}
          <div className="surface-card rounded-2xl p-5 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[#FF453A] mb-1">
              <span className="text-[10px] font-semibold uppercase text-[#86868B]">Verified Completions</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {overview?.total_verified_completions ?? 0}
            </h3>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
              Modules & projects completed
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CAREER DISTRIBUTION SUMMARY
            ═══════════════════════════════════════════════════════════════ */}
        {overview?.career_distribution && overview.career_distribution.length > 0 && (
          <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Learner Distribution Across Career Tracks</h3>
              </div>
              <span className="text-xs text-[#86868B]">
                {overview.career_distribution.length} Active Tracks
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              {overview.career_distribution.map((cd) => (
                <div
                  key={cd.career_name}
                  className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-center space-y-1"
                >
                  <span className="text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block truncate" title={cd.career_name}>
                    {cd.career_name}
                  </span>
                  <span className="text-base font-bold text-[#007AFF]">{cd.learner_count}</span>
                  <span className="text-[10px] text-[#86868B] block">Learners</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            REGISTERED CLIENTS / USERS TABLE
            ═══════════════════════════════════════════════════════════════ */}
        <div className="surface-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5E5EA] dark:border-[#2C2C2E] pb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#007AFF]" />
              <div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Registered Client Directory</h3>
                <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2]">
                  {users.length} {users.length === 1 ? 'client account' : 'client accounts'} registered on PathPilot
                </p>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role Toggle Filter */}
              <div className="flex items-center rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] p-0.5 border border-[#E5E5EA] dark:border-[#38383A] text-xs">
                {(['all', 'learner', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-all cursor-pointer font-medium ${
                      roleFilter === r
                        ? 'bg-white dark:bg-[#1C1C1E] text-[#007AFF] shadow-sm font-semibold'
                        : 'text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email..."
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF] w-48"
                  />
                </div>
                <Button variant="secondary" size="sm" type="submit">
                  Filter
                </Button>
              </form>
            </div>
          </div>

          {loading ? (
            <SkeletonCard />
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5EA] dark:border-[#2C2C2E] text-[10px] uppercase font-semibold text-[#86868B] tracking-wider">
                    <th className="py-2.5 px-3">Client / Learner</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Target Career</th>
                    <th className="py-2.5 px-3">XP & Streak</th>
                    <th className="py-2.5 px-3">Study Time</th>
                    <th className="py-2.5 px-3">Completions</th>
                    <th className="py-2.5 px-3">Registered Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FBFBFD] dark:hover:bg-[#2C2C2E]/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#EAF3FF] dark:bg-[#0A84FF]/20 text-[#007AFF] flex items-center justify-center font-bold text-xs shrink-0 border border-[#007AFF]/20">
                            {u.display_name ? u.display_name.charAt(0).toUpperCase() : 'L'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                              {u.display_name}
                            </span>
                            <span className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {u.role === 'admin' ? (
                          <Badge variant="warning" size="sm">Admin</Badge>
                        ) : (
                          <Badge variant="slate" size="sm">Learner</Badge>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {u.target_career_name ? (
                          <span className="font-medium text-[#007AFF]">
                            {u.target_career_name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#86868B] italic">
                            Unselected
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#FF9F0A]">{u.xp} XP</span>
                          <span>•</span>
                          <span className="text-[#34C759] font-medium">{u.streak_days}d</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {formatHoursMinutes(u.total_study_minutes)}
                        </span>
                        <span className="text-[10px] text-[#86868B] block">
                          {u.total_study_sessions} sessions
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-[#34C759]">
                          {u.total_completed_learning} modules
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-[#86868B]">
                        {new Date(u.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedUserForRole(u)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007AFF] hover:underline cursor-pointer"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          <span>Manage Role</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Users className="w-8 h-8 text-[#86868B] mx-auto opacity-50" />
              <p className="text-xs text-[#86868B]">No registered clients found matching your query.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          USER ROLE MANAGEMENT MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm surface-elevated rounded-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] dark:border-[#38383A]">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Manage User Role
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#FBFBFD] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-xs space-y-1">
                <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                  {selectedUserForRole.display_name}
                </span>
                <span className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] block font-mono">
                  {selectedUserForRole.email}
                </span>
                <span className="text-[10px] text-[#86868B] block">
                  Current Role: <span className="font-semibold uppercase">{selectedUserForRole.role}</span>
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Assign Platform Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleUpdate(selectedUserForRole.id, 'learner')}
                    disabled={updatingUserId === selectedUserForRole.id}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedUserForRole.role === 'learner'
                        ? 'bg-[#EAF3FF] dark:bg-[#0A84FF]/20 border-[#007AFF] text-[#007AFF]'
                        : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                    }`}
                  >
                    Learner (Client)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleUpdate(selectedUserForRole.id, 'admin')}
                    disabled={updatingUserId === selectedUserForRole.id}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedUserForRole.role === 'admin'
                        ? 'bg-[#FFF4E0] dark:bg-[#FF9F0A]/20 border-[#FF9F0A] text-[#FF9F0A]'
                        : 'bg-[#FBFBFD] dark:bg-[#2C2C2E] border-[#E5E5EA] dark:border-[#38383A] text-[#6E6E73] dark:text-[#AEAEB2] hover:text-[#1D1D1F]'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUserForRole(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
