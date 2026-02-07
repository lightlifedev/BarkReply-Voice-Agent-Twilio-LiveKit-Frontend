import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

type Call = {
  id: string;
  caller_phone: string | null;
  livekit_room_name: string | null;
  status: string;
  started_at: string;
};

type Request = {
  id: string;
  call_id: string;
  type: string;
  outcome: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  pet_name: string | null;
  next_action: string | null;
  created_at: string;
};

export default function Dashboard() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }
    const client = supabase;

    const load = async () => {
      try {
        const [callsRes, requestsRes] = await Promise.all([
          client
            .from('calls')
            .select('id, caller_phone, livekit_room_name, status, started_at')
            .order('started_at', { ascending: false })
            .limit(50),
          client
            .from('requests')
            .select('id, call_id, type, outcome, owner_name, owner_phone, pet_name, next_action, created_at')
            .order('created_at', { ascending: false })
            .limit(50),
        ]);

        if (callsRes.error) throw callsRes.error;
        if (requestsRes.error) throw requestsRes.error;
        setCalls(callsRes.data ?? []);
        setRequests(requestsRes.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-700">Recent calls</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Caller</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Room</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {calls.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No calls yet.
                  </td>
                </tr>
              ) : (
                calls.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-600">
                      {formatDate(c.started_at)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{c.caller_phone ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{c.status}</td>
                    <td className="px-4 py-2 text-sm text-slate-500 font-mono">{c.livekit_room_name ?? '—'}</td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/calls/${c.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-700">Recent requests (bookings / follow-ups)</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Outcome</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Pet / Owner</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Next action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    No requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-600">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{r.type}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{r.outcome ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {[r.pet_name, r.owner_name, r.owner_phone].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-2 text-sm text-slate-500">
                      {r.next_action ?? '—'}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/calls/${r.call_id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Call
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
