import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

type Call = {
  id: string;
  caller_phone: string | null;
  livekit_room_name: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
};

type Turn = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

type Request = {
  id: string;
  type: string;
  outcome: string | null;
  pet_name: string | null;
  pet_breed: string | null;
  service_requested: string | null;
  preferred_date: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  notes: string | null;
  next_action: string | null;
  created_at: string;
};

export default function CallDetail() {
  const { callId } = useParams<{ callId: string }>();
  const [call, setCall] = useState<Call | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !callId) {
      if (!callId) setError('Missing call ID');
      else if (!supabase) setError('Supabase not configured.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [callRes, turnsRes, requestsRes] = await Promise.all([
          supabase
            .from('calls')
            .select('id, caller_phone, livekit_room_name, status, started_at, ended_at')
            .eq('id', callId)
            .single(),
          supabase
            .from('conversation_turns')
            .select('id, role, content, created_at')
            .eq('call_id', callId)
            .order('created_at', { ascending: true }),
          supabase
            .from('requests')
            .select('id, type, outcome, pet_name, pet_breed, service_requested, preferred_date, owner_name, owner_phone, notes, next_action, created_at')
            .eq('call_id', callId)
            .order('created_at', { ascending: true }),
        ]);

        if (callRes.error) throw callRes.error;
        setCall(callRes.data);
        setTurns(turnsRes.data ?? []);
        setRequests(requestsRes.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load call');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [callId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="space-y-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error ?? 'Call not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h1 className="text-xl font-semibold text-slate-800">Call details</h1>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <dt className="text-slate-500">Caller</dt>
          <dd className="text-slate-800">{call.caller_phone ?? '—'}</dd>
          <dt className="text-slate-500">Room</dt>
          <dd className="font-mono text-slate-600">{call.livekit_room_name ?? '—'}</dd>
          <dt className="text-slate-500">Status</dt>
          <dd className="text-slate-600">{call.status}</dd>
          <dt className="text-slate-500">Started</dt>
          <dd className="text-slate-600">{formatDate(call.started_at)}</dd>
          <dt className="text-slate-500">Ended</dt>
          <dd className="text-slate-600">{call.ended_at ? formatDate(call.ended_at) : '—'}</dd>
        </dl>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-700">Transcript</h2>
        {turns.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-500">
            No transcript stored for this call. Conversation turns can be persisted by the agent or via egress.
          </p>
        ) : (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
            {turns.map((t) => (
              <div
                key={t.id}
                className={`rounded px-3 py-2 text-sm ${
                  t.role === 'user'
                    ? 'bg-blue-50 text-blue-900'
                    : t.role === 'assistant'
                    ? 'bg-slate-100 text-slate-800'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                <span className="font-medium">{t.role}:</span> {t.content}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-700">Requests</h2>
        {requests.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-500">
            No requests for this call.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                    {r.type}
                  </span>
                  {r.outcome && (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                      {r.outcome}
                    </span>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {r.pet_name && (
                    <>
                      <dt className="text-slate-500">Pet</dt>
                      <dd className="text-slate-800">{r.pet_name}{r.pet_breed ? ` (${r.pet_breed})` : ''}</dd>
                    </>
                  )}
                  {r.service_requested && (
                    <>
                      <dt className="text-slate-500">Service</dt>
                      <dd className="text-slate-800">{r.service_requested}</dd>
                    </>
                  )}
                  {r.preferred_date && (
                    <>
                      <dt className="text-slate-500">Preferred date</dt>
                      <dd className="text-slate-800">{r.preferred_date}</dd>
                    </>
                  )}
                  {r.owner_name && (
                    <>
                      <dt className="text-slate-500">Owner</dt>
                      <dd className="text-slate-800">{r.owner_name}</dd>
                    </>
                  )}
                  {r.owner_phone && (
                    <>
                      <dt className="text-slate-500">Phone</dt>
                      <dd className="text-slate-800">{r.owner_phone}</dd>
                    </>
                  )}
                  {r.next_action && (
                    <>
                      <dt className="text-slate-500">Next action</dt>
                      <dd className="text-slate-800">{r.next_action}</dd>
                    </>
                  )}
                  {r.notes && (
                    <>
                      <dt className="text-slate-500">Notes</dt>
                      <dd className="text-slate-800">{r.notes}</dd>
                    </>
                  )}
                </dl>
                <p className="mt-2 text-xs text-slate-400">{formatDate(r.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
