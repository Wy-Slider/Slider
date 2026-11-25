'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type { WySliderApp } from '@/lib/types';
import WySliderLogo from './WySliderLogo';
import AppLogoImage from './AppLogoImage';

interface AdminClientProps {
  initialAuthenticated: boolean;
  initialApps: WySliderApp[];
}

async function processLogoFile(file: File): Promise<string> {
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 256;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/png', 0.92));
      };
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

function previewSlug(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'app-route'
  );
}

export default function AdminClient({
  initialAuthenticated,
  initialApps,
}: AdminClientProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [apps, setApps] = useState<WySliderApp[]>(initialApps);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // New App form state
  const [logo, setLogo] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const newLogoInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal state
  const [editingApp, setEditingApp] = useState<WySliderApp | null>(null);
  const [editLogo, setEditLogo] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAppUrl, setEditAppUrl] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const editLogoInputRef = useRef<HTMLInputElement>(null);

  // Remove confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function refreshApps() {
    const res = await fetch('/api/apps', { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as { apps: WySliderApp[] };
      setApps(data.apps);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password || authLoading) return;
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as {
        authenticated?: boolean;
        error?: string;
      };
      if (!res.ok || !data.authenticated) {
        setAuthError(data.error || 'Incorrect password.');
        return;
      }
      setAuthenticated(true);
      setPassword('');
      await refreshApps();
    } catch {
      setAuthError('Unable to verify password. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthenticated(false);
  }

  async function handleNewLogoSelect(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await processLogoFile(file);
      setLogo(dataUrl);
      setFeedback(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to import logo.',
      });
    }
  }

  async function handleEditLogoSelect(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await processLogoFile(file);
      setEditLogo(dataUrl);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to import logo.',
      });
    }
  }

  async function handleAddApp(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFeedback(null);

    if (!logo) {
      setFeedback({
        type: 'error',
        text: 'Please import a logo image before adding the app.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo,
          name: name.trim(),
          description: description.trim(),
          appUrl: appUrl.trim(),
          slug: customSlug.trim(),
        }),
      });
      const data = (await res.json()) as { app?: WySliderApp; error?: string };
      if (!res.ok || !data.app) {
        throw new Error(data.error || 'Failed to add app.');
      }

      setApps((prev) => [...prev, data.app!]);
      setLogo('');
      setName('');
      setDescription('');
      setAppUrl('');
      setCustomSlug('');
      if (newLogoInputRef.current) {
        newLogoInputRef.current.value = '';
      }
      setFeedback({
        type: 'success',
        text: `"${data.app.name}" added. About page case examples will update automatically.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save app.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(app: WySliderApp) {
    setEditingApp(app);
    setEditLogo(app.logo);
    setEditName(app.name);
    setEditDescription(app.description);
    setEditAppUrl(app.appUrl || '');
    setEditSlug(app.slug);
    setFeedback(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingApp || savingEdit) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/apps/${editingApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo: editLogo,
          name: editName.trim(),
          description: editDescription.trim(),
          appUrl: editAppUrl.trim(),
          slug: editSlug.trim(),
        }),
      });
      const data = (await res.json()) as { app?: WySliderApp; error?: string };
      if (!res.ok || !data.app) {
        throw new Error(data.error || 'Failed to update app.');
      }

      setApps((prev) =>
        prev.map((a) => (a.id === editingApp.id ? data.app! : a))
      );
      setEditingApp(null);
      setFeedback({
        type: 'success',
        text: `"${data.app.name}" updated. About page case examples will reflect this change.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update app.',
      });
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleConfirmDelete(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/apps/${id}`, { method: 'DELETE' });
      const data = (await res.json()) as { deleted?: boolean; error?: string };
      if (!res.ok || !data.deleted) {
        throw new Error(data.error || 'Failed to remove app.');
      }
      setApps((prev) => prev.filter((a) => a.id !== id));
      setConfirmDeleteId(null);
      setFeedback({
        type: 'success',
        text: 'App removed from WySlider. About page case examples will update accordingly.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to remove app.',
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0B1120] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <WySliderLogo size="md" />
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </span>
          </div>

          <h1 className="mt-6 font-display text-xl font-semibold tracking-tight text-[#0B1120]">
            WySlider Admin Access
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Enter the administrator password to register, update, or remove WySlider tools.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                required
                className="w-full h-11 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 text-sm text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              />
            </div>

            {authError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={!password || authLoading}
              className="w-full h-11 rounded-xl bg-[#1D4ED8] text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying…</span>
                </>
              ) : (
                <span>Unlock Admin Console</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0B1120] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalVisits = apps.reduce((sum, a) => sum + (a.visitCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1120] flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          <Link href="/" className="whitespace-nowrap shrink-0">
            <WySliderLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-[#0B1120] transition-colors whitespace-nowrap shrink-0">
              Home
            </Link>
            <Link href="/about" className="hover:text-[#0B1120] transition-colors whitespace-nowrap shrink-0">
              About
            </Link>
            <span className="text-[#1D4ED8] whitespace-nowrap shrink-0">
              Admin Console
            </span>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Centered Admin Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1120]">
              WySlider Admin Console
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Register new WySlider tools, manage existing apps, and monitor Workspace visits.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div>
              <span className="text-slate-400 mr-2">Apps</span>
              <span className="font-mono font-semibold tabular-nums text-[#0B1120]">
                {apps.length}
              </span>
            </div>
            <span className="text-slate-300" aria-hidden="true">
              /
            </span>
            <div>
              <span className="text-slate-400 mr-2">Total Visits</span>
              <span className="font-mono font-semibold tabular-nums text-[#0B1120]">
                {totalVisits}
              </span>
            </div>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="text-current opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3.2 New App Form */}
        <section
          aria-labelledby="new-app-heading"
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8"
        >
          <h2
            id="new-app-heading"
            className="font-display text-lg font-semibold text-[#0B1120]"
          >
            New app
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Import a logo, name the app, and describe the manual task it replaces.
          </p>

          <form onSubmit={handleAddApp} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Logo Import */}
              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Logo import
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dropped = e.dataTransfer.files?.[0];
                    void handleNewLogoSelect(dropped);
                  }}
                  className="border border-dashed border-slate-300 rounded-xl p-4 bg-[#F8FAFC] flex flex-col items-center justify-center text-center gap-3 min-h-[164px]"
                >
                  {logo ? (
                    <div className="flex flex-col items-center gap-3">
                      <AppLogoImage
                        src={logo}
                        name={name || 'New App'}
                        sizeClass="w-16 h-16"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => newLogoInputRef.current?.click()}
                          className="text-xs font-medium text-[#1D4ED8] hover:underline cursor-pointer"
                        >
                          Replace
                        </button>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setLogo('');
                            if (newLogoInputRef.current) {
                              newLogoInputRef.current.value = '';
                            }
                          }}
                          className="text-xs font-medium text-slate-500 hover:text-red-600 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                        <ImagePlus className="w-5 h-5" />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => newLogoInputRef.current?.click()}
                          className="text-xs font-medium text-[#1D4ED8] hover:underline cursor-pointer"
                        >
                          Choose logo image
                        </button>
                        <p className="mt-1 text-xs text-slate-400">
                          PNG, JPG, SVG, or WebP
                        </p>
                      </div>
                    </>
                  )}
                  <input
                    ref={newLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      void handleNewLogoSelect(e.target.files?.[0])
                    }
                    className="hidden"
                  />
                </div>
              </div>

              {/* Name & Description Inputs */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="new-app-name"
                      className="text-xs font-medium text-slate-700"
                    >
                      Name input
                    </label>
                    <span className="text-xs font-mono text-slate-400">
                      /{customSlug.trim() ? previewSlug(customSlug) : previewSlug(name)}
                    </span>
                  </div>
                  <input
                    id="new-app-name"
                    type="text"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. ProposalForge"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 text-sm text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-app-description"
                    className="block text-xs font-medium text-slate-700 mb-1.5"
                  >
                    Description input
                  </label>
                  <textarea
                    id="new-app-description"
                    required
                    maxLength={500}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain what manual work this WySlider tool eliminates…"
                    className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors leading-relaxed"
                  />
                </div>

                {/* Optional External URL / Custom Route */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0B1120] transition-colors cursor-pointer"
                  >
                    {showAdvanced ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                    <span>Optional: External app URL or custom route</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <label
                          htmlFor="new-app-url"
                          className="block text-xs font-medium text-slate-600 mb-1"
                        >
                          Embed URL (optional)
                        </label>
                        <input
                          id="new-app-url"
                          type="url"
                          value={appUrl}
                          onChange={(e) => setAppUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full h-10 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 text-xs text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="new-app-slug"
                          className="block text-xs font-medium text-slate-600 mb-1"
                        >
                          Custom route slug (optional)
                        </label>
                        <input
                          id="new-app-slug"
                          type="text"
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value)}
                          placeholder="proposal-forge"
                          className="w-full h-10 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 text-xs font-mono text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting || !name.trim() || !description.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1D4ED8] rounded-xl hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding…</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* 3.2 Apps List */}
        <section
          aria-labelledby="apps-list-heading"
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2
              id="apps-list-heading"
              className="font-display text-lg font-semibold text-[#0B1120]"
            >
              Apps list
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {apps.length} registered
            </span>
          </div>

          {apps.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No apps registered yet. Use the New app form above to add your first WySlider tool.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-medium text-slate-500">
                    <th className="py-3 px-6">Logo &amp; Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">
                      Visit count
                    </th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {apps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/70 transition-colors align-middle"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5 min-w-[200px]">
                          <AppLogoImage
                            src={app.logo}
                            name={app.name}
                            sizeClass="w-10 h-10"
                          />
                          <div className="min-w-0">
                            <div className="font-display font-semibold text-[#0B1120] truncate">
                              {app.name}
                            </div>
                            <Link
                              href={`/${app.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-[#1D4ED8] transition-colors"
                            >
                              <span>/{app.slug}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-md">
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          {app.description}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums font-medium text-[#0B1120]">
                        {app.visitCount}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {confirmDeleteId === app.id ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled={deletingId === app.id}
                              onClick={() => void handleConfirmDelete(app.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                            >
                              {deletingId === app.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Confirm</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-[#0B1120] rounded-lg border border-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(app)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-[#1D4ED8] border border-slate-200 hover:border-blue-300 rounded-lg bg-white transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Update</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(app.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg bg-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Update App Modal */}
      <AnimatePresence>
        {editingApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
            onClick={() => setEditingApp(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-display text-lg font-semibold text-[#0B1120]">
                  Update {editingApp.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  aria-label="Close modal"
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
                <div className="flex items-center gap-4">
                  <AppLogoImage
                    src={editLogo}
                    name={editName || editingApp.name}
                    sizeClass="w-14 h-14"
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => editLogoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Import new logo</span>
                    </button>
                    <input
                      ref={editLogoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        void handleEditLogoSelect(e.target.files?.[0])
                      }
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-app-name"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="edit-app-name"
                    type="text"
                    required
                    maxLength={80}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 text-sm text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-app-description"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-app-description"
                    required
                    maxLength={500}
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="edit-app-slug"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Route slug
                    </label>
                    <input
                      id="edit-app-slug"
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 text-xs font-mono text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-app-url"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Embed URL (optional)
                    </label>
                    <input
                      id="edit-app-url"
                      type="url"
                      value={editAppUrl}
                      onChange={(e) => setEditAppUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full h-10 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 text-xs text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-[#0B1120] rounded-lg border border-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1D4ED8] hover:bg-blue-700 rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
