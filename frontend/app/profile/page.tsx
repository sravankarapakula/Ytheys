'use client';

import Link from 'next/link';
import { ArrowLeft, User, Settings, Bell, Shield } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Coming Soon Card */}
        <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-3xl p-12 backdrop-blur-sm text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full mb-6">
              <User className="w-12 h-12 text-yellow-400" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Profile Coming Soon
            </h1>
            
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              We're working on an amazing profile experience. Stay tuned for personalized features!
            </p>
          </div>

          {/* Planned Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-neutral-800/40 border border-neutral-700/40 rounded-xl p-6">
              <Settings className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">Account Settings</h3>
              <p className="text-sm text-neutral-400">Manage your account and preferences</p>
            </div>

            <div className="bg-neutral-800/40 border border-neutral-700/40 rounded-xl p-6">
              <Bell className="w-8 h-8 text-orange-400 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
              <p className="text-sm text-neutral-400">Stay updated with your activity</p>
            </div>

            <div className="bg-neutral-800/40 border border-neutral-700/40 rounded-xl p-6">
              <Shield className="w-8 h-8 text-pink-400 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
              <p className="text-sm text-neutral-400">Protect your account</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:scale-105"
            >
              Explore Agencies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
