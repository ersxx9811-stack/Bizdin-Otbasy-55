import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { api, ApiError } from './api';

interface Ctx {
  admin: boolean; login: () => void; logout: () => void;
  prompt: (o: { title: string; label: string; initial?: string; ok?: string }) => Promise<string | null>;
  confirm: (o: { title: string; text: string; ok?: string }) => Promise<boolean>;
  toast: (msg: string, kind?: 'ok' | 'err') => void;
}
const C = createContext<Ctx>(null as any);
export const useUI = () => useContext(C);

type Dlg = { kind: 'login' } | { kind: 'prompt'; o: any; done: (v: string | null) => void } | { kind: 'confirm'; o: any; done: (v: boolean) => void };

export function UIProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState(false);
  const [dlg, setDlg] = useState<Dlg | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: string }[]>([]);
  const n = useRef(0);

  useEffect(() => { api.me().then((r) => setAdmin(r.admin)).catch(() => {}); }, []);
  useEffect(() => { document.documentElement.classList.toggle('is-admin', admin); }, [admin]);
  useEffect(() => { document.documentElement.classList.toggle('dlg-open', !!dlg); }, [dlg]);

  const toast = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = ++n.current; setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'err' ? 7000 : 3200);
  }, []);
  const prompt: Ctx['prompt'] = useCallback((o) => new Promise((done) => setDlg({ kind: 'prompt', o, done })), []);
  const confirm: Ctx['confirm'] = useCallback((o) => new Promise((done) => setDlg({ kind: 'confirm', o, done })), []);
  const login = useCallback(() => setDlg({ kind: 'login' }), []);
  const logout = useCallback(async () => { try { await api.logout(); } catch {} setAdmin(false); toast('Админ режимінен шықтыңыз'); }, [toast]);
  const close = () => setDlg(null);

  return (
    <C.Provider value={{ admin, login, logout, prompt, confirm, toast }}>
      {children}
      {dlg && createPortal(
        <div className="dlg-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) { if (dlg.kind === 'prompt') dlg.done(null); if (dlg.kind === 'confirm') dlg.done(false); close(); } }}>
          {dlg.kind === 'login' && <LoginDlg onDone={(ok) => { if (ok) { setAdmin(true); toast('Админ режимі қосылды'); } close(); }} />}
          {dlg.kind === 'prompt' && <PromptDlg o={dlg.o} onDone={(v) => { dlg.done(v); close(); }} />}
          {dlg.kind === 'confirm' && <ConfirmDlg o={dlg.o} onDone={(v) => { dlg.done(v); close(); }} />}
        </div>, document.body)}
      {createPortal(<div className="toasts" aria-live="polite">{toasts.map((t) => <div key={t.id} className={`toast ${t.kind}`}>{t.msg}</div>)}</div>, document.body)}
    </C.Provider>
  );
}

function useEsc(fn: () => void) { useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && fn(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [fn]); }

function LoginDlg({ onDone }: { onDone: (ok: boolean) => void }) {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  useEsc(() => onDone(false));
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!pw) return setErr('Құпия сөзді енгізіңіз');
    setBusy(true); setErr('');
    try { await api.login(pw); onDone(true); } catch (x) { setErr(x instanceof ApiError ? x.message : 'Қате шықты'); setBusy(false); }
  };
  return (
    <form className="dlg" onSubmit={submit} role="dialog" aria-modal="true" aria-label="Админ ретінде кіру">
      <h3>Админ ретінде кіру</h3>
      <p>Бөлім, тақырып және фото қосу үшін құпия сөзді енгізіңіз.</p>
      <input type="password" autoFocus autoComplete="current-password" placeholder="Құпия сөз" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <div className="dlg-err" role="alert">{err}</div>}
      <div className="dlg-act"><button type="button" className="btn-s" onClick={() => onDone(false)}>Бас тарту</button><button className="btn-s pri" disabled={busy}>{busy ? 'Тексерілуде…' : 'Кіру'}</button></div>
    </form>
  );
}
function PromptDlg({ o, onDone }: { o: { title: string; label: string; initial?: string; ok?: string }; onDone: (v: string | null) => void }) {
  const [v, setV] = useState(o.initial ?? ''); const [err, setErr] = useState('');
  useEsc(() => onDone(null));
  const submit = (e: FormEvent) => { e.preventDefault(); const t = v.trim(); if (!t) return setErr('Атауын жазыңыз'); onDone(t); };
  return (
    <form className="dlg" onSubmit={submit} role="dialog" aria-modal="true" aria-label={o.title}>
      <h3>{o.title}</h3>
      <label>{o.label}<input autoFocus maxLength={80} value={v} onChange={(e) => { setV(e.target.value); setErr(''); }} /></label>
      {err && <div className="dlg-err" role="alert">{err}</div>}
      <div className="dlg-act"><button type="button" className="btn-s" onClick={() => onDone(null)}>Бас тарту</button><button className="btn-s pri">{o.ok ?? 'Сақтау'}</button></div>
    </form>
  );
}
function ConfirmDlg({ o, onDone }: { o: { title: string; text: string; ok?: string }; onDone: (v: boolean) => void }) {
  useEsc(() => onDone(false));
  return (
    <div className="dlg" role="alertdialog" aria-modal="true" aria-label={o.title}>
      <h3>{o.title}</h3><p>{o.text}</p>
      <div className="dlg-act"><button className="btn-s" autoFocus onClick={() => onDone(false)}>Бас тарту</button><button className="btn-s danger" onClick={() => onDone(true)}>{o.ok ?? 'Өшіру'}</button></div>
    </div>
  );
}
