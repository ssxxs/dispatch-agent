'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

/** Single transcript chunk from Vapi (partial or final). Parent decides how to aggregate. */
export interface TranscriptChunk {
  role: 'user' | 'assistant';
  text: string;
  isFinal: boolean;
}

interface CallButtonProps {
  publicKey: string;
  assistantId: string;
  onTranscript?: (chunk: TranscriptChunk) => void;
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

  // Hold the latest callback refs so the effect that owns the Vapi instance
  // can stay mounted for the lifetime of the component, instead of tearing
  // down the live call every time the parent passes a new inline closure.
  // Without this, parents like VerticalDemo that pass `onTranscript={(e) => ...}`
  // re-create the function on every render; updating local transcript state
  // re-renders the parent which would then trigger this effect's cleanup
  // mid-call, ejecting the user from the Daily.co room with a confusing
  // "Meeting has ended" error.
  const onTranscriptRef = useRef(onTranscript);
  const onCallStartRef = useRef(onCallStart);
  const onCallEndRef = useRef(onCallEnd);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onCallStartRef.current = onCallStart;
    onCallEndRef.current = onCallEnd;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!publicKey) return;
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setState('active');
      onCallStartRef.current?.();
    });
    vapi.on('call-end', () => {
      setState('ended');
      onCallEndRef.current?.();
    });
    vapi.on('message', (msg: any) => {
      if (msg?.type === 'transcript' && (msg?.transcriptType === 'final' || msg?.transcriptType === 'partial')) {
        onTranscriptRef.current?.({
          role: msg.role as 'user' | 'assistant',
          text: msg.transcript,
          isFinal: msg.transcriptType === 'final',
        });
      }
    });
    vapi.on('error', (err: any) => {
      const message = err?.message ?? err?.errorMsg ?? 'Vapi error';
      setErrorMsg(message);
      setState('error');
      onErrorRef.current?.(new Error(message));
    });

    // Demo recording backdoor: when the URL has ?demo_inject=1, expose an
    // injection function that streams a user message word-by-word as partial
    // transcripts (so the on-screen bubble types in naturally), then finalizes
    // and sends the full text to Vapi to trigger an AI response.
    //
    // Optional `durationMs` makes the typing animation match a paired TTS
    // audio clip — without it words stream too fast for the audio playback.
    if (
      typeof window !== 'undefined' &&
      window.location?.search?.includes('demo_inject=1')
    ) {
      const w = window as Window & {
        __vapiInject?: (content: string, durationMs?: number) => Promise<void>;
        __vapi?: Vapi;
      };
      w.__vapi = vapi;
      w.__vapiInject = async (content: string, durationMs?: number) => {
        // eslint-disable-next-line no-console
        console.log('[__vapiInject] sending:', content.slice(0, 60), 'duration:', durationMs);

        const words = content.split(/\s+/);
        // Default ~80ms/word if no duration given. Otherwise spread evenly
        // across `durationMs` so typing finishes when the TTS audio finishes.
        const perWord = durationMs ? Math.max(40, durationMs / words.length) : 80;

        for (let i = 1; i <= words.length; i++) {
          const partial = words.slice(0, i).join(' ');
          onTranscriptRef.current?.({
            role: 'user',
            text: partial,
            isFinal: false,
          });
          await new Promise((r) => setTimeout(r, perWord));
        }

        onTranscriptRef.current?.({
          role: 'user',
          text: content,
          isFinal: true,
        });

        try {
          vapi.send({
            type: 'add-message',
            message: { role: 'user', content },
            triggerResponseEnabled: true,
          });
          // eslint-disable-next-line no-console
          console.log('[__vapiInject] vapi.send returned');
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[__vapiInject] vapi.send threw:', err);
        }
      };
    }

    return () => {
      try {
        vapi.stop();
      } catch {
        /* ignore */
      }
    };
    // Intentionally only depends on publicKey: callbacks come from refs above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

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
