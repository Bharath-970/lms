'use client';

import { MessageCircle, ExternalLink, Users, Mic, Hash } from 'lucide-react';

export default function DiscordPage() {
  const DISCORD_INVITE = 'https://discord.gg/your-invite-link';

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Live Sessions</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100">
          <MessageCircle className="h-10 w-10 text-indigo-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">Join Our Discord Server</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          All live sessions, doubt clearing, and team discussions happen on Discord.
          Join the server to stay connected with mentors and fellow interns.
        </p>

        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <ExternalLink className="h-4 w-4" />
          Join Discord Server
        </a>

        <div className="mt-10 grid grid-cols-3 gap-6">
          <div className="rounded-xl bg-gray-50 p-4">
            <Hash className="mx-auto mb-2 h-6 w-6 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Channels</p>
            <p className="mt-1 text-xs text-gray-500">Topic-wise discussion channels for each week</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <Mic className="mx-auto mb-2 h-6 w-6 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Live Sessions</p>
            <p className="mt-1 text-xs text-gray-500">Saturday learning sessions and demos</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <Users className="mx-auto mb-2 h-6 w-6 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Community</p>
            <p className="mt-1 text-xs text-gray-500">Connect with mentors and peers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
