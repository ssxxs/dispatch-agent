'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import type { TranscriptEntry } from '@/lib/types';

interface CallButtonProps {
  publicKey: string;
  assistantId: string;
  onTranscript?: (entry: TranscriptEntry) => void;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onError?: (err: Error) => void;
}

type CallState = 'idle' | 'connecting' | 'active' | 'ended' | 'error';

export function CallButton({
  publicKey,
  assistantId,
  onTranscript,
  onCallStart,
  onCallEnd,
  onError,
}: CallButtonProps) {
  const vapiRef = useRef<Vapi | null>(null);
  const [state, setState] = useState<CallState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setState('active');
      onCallStart?.();
    });
    vapi.on('call-end', () => {
      setState('ended');
      onCallEnd?.();
    });
    vapi.on('message', (msg: any) => {
      // Vapi sends transcripts as { type: 'transcript', role: 'user'|'assistant', transcript: string, transcriptType: 'partial'|'final' }
      if (msg?.type === 'transcript' && msg?.transcriptType === 'final') {
        onTranscript?.({
          role: msg.role as 'user' | 'assistant',
          text: msg.transcript,
          ts: new Date().toISOString(),
        });
      }
    });
    vapi.on('error', (err: any) => {
      const message = err?.message ?? err?.errorMsg ?? 'Vapi error';
      setErrorMsg(message);
      setState('error');
      onError?.(new Error(message));
    });

    return () => {
      try {
        vapi.stop();
      } catch {
        /* ignore */
      }
    };
  }, [publicKey, onCallStart, onCallEnd, onTranscript, onError]);

  async function handleStart() {
    if (!vapiRef.current || !assistantId) {
      setErrorMsg('Vapi not configured — check env vars');
      setState('error');
      return;
    }
    setState('connecting');
    setErrorMsg(null);
    try {
      await vapiRef.current.start(assistantId);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to start call');
      setState('error');
    }
  }

  function handleStop() {
    vapiRef.current?.stop();
    setState('ended');
  }

  const isActive = state === 'active' || state === 'connecting';

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={isActive ? handleStop : handleStart}
        disabled={state === 'connecting'}
        className={`px-8 py-4 rounded-full font-semibold text-white transition-all shadow-lg disabled:opacity-50 ${
          isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {state === 'idle' && '📞 Call the HVAC Receptionist'}
        {state === 'connecting' && 'Connecting…'}
        {state === 'active' && '⏹ End Call'}
        {state === 'ended' && '↻ Call Again'}
        {state === 'error' && '↻ Retry'}
      </button>
      <p className="text-sm text-zinc-500 text-center max-w-md">
        {state === 'idle' && 'Click to start a live demo call (uses your mic)'}
        {state === 'connecting' && 'Waking up the AI…'}
        {state === 'active' && '🟢 Connected. Speak naturally.'}
        {state === 'ended' && 'Call ended. Review the transcript below.'}
        {state === 'error' && errorMsg}
      </p>
    </div>
  );
}
