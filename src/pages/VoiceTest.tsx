import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useParticipants,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  token: string;
  participantName: string;
};

function VoiceTestRoomInner() {
  const room = useRoomContext();
  const participants = useParticipants();
  const [muted, setMuted] = useState(false);

  const connectionStateLabel =
    room.state === ConnectionState.Connected
      ? 'Connected'
      : room.state === ConnectionState.Connecting
        ? 'Connecting…'
        : room.state === ConnectionState.Reconnecting
          ? 'Reconnecting…'
          : 'Disconnected';

  const toggleMic = useCallback(() => {
    room.localParticipant.setMicrophoneEnabled(muted);
    setMuted((m) => !m);
  }, [room.localParticipant, muted]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-500">Status</span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              room.state === ConnectionState.Connected
                ? 'bg-green-100 text-green-800'
                : room.state === ConnectionState.Connecting ||
                    room.state === ConnectionState.Reconnecting
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {connectionStateLabel}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          You’re in the room. Talk to the groomer voice agent — try: “I’d like to book a groom for my dog” or “What are your hours?”
        </p>

        <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
          <span>Participants in room: {participants.length}</span>
        </div>

        <RoomAudioRenderer />

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={toggleMic}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              muted
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <button
            type="button"
            onClick={() => room.disconnect()}
            className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
          >
            <PhoneOff className="h-4 w-4" />
            End call
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VoiceTest() {
  const [details, setDetails] = useState<ConnectionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartCall = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get token');
      setDetails({
        serverUrl: data.serverUrl,
        roomName: data.roomName,
        token: data.token,
        participantName: data.participantName || 'Guest',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDisconnected = useCallback(() => {
    setDetails(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-slate-800">Voice agent test</h1>
      <p className="text-slate-600 max-w-xl">
        Connect to a LiveKit room and talk to the groomer voice agent. Make sure the backend is running and <code className="rounded bg-slate-100 px-1 text-sm">pnpm run agent:dev</code> is active so the agent can join.
      </p>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      {!details ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm max-w-md">
          <p className="text-slate-600 text-sm text-center">
            Click below to get a token and join the room. Your microphone will be used to talk to the agent.
          </p>
          <button
            type="button"
            onClick={handleStartCall}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {loading ? 'Connecting…' : 'Start call'}
          </button>
        </div>
      ) : (
        <LiveKitRoom
          serverUrl={details.serverUrl}
          token={details.token}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={handleDisconnected}
          className="min-h-[400px]"
        >
          <VoiceTestRoomInner />
        </LiveKitRoom>
      )}
    </div>
  );
}
