import { useCallback, useEffect, useRef, useState } from 'react';
import { api, uploadPhoto, ApiError, type ApiPhoto, type ApiSection, type ApiTopic } from '../api';
import { useUI } from '../ui';
import { byId, type Photo } from '../data/photos';
import { useTopicId, openTopic } from '../router';
import { Img } from '../components/Img';
import { Reveal } from '../components/Reveal';
import { Shanyrak } from '../components/Shanyrak';
import { Gallery } from '../components/Gallery';
import { Lightbox } from '../components/Lightbox';

declare const __LITE__: boolean;
const GRAY = 'data:image/gif;base64,R0lGODlhAQABAIAAAOnjd////yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const MONTHS = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
const fmt = (iso: string) => { const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const errText = (e: unknown) => (e instanceof ApiError ? e.message : 'Күтпеген қате шықты. Қайталап көріңіз.');

/** Сервер фотосын сайттағы бар Photo пішініне келтіру — дизайн бірдей болады */
const toPhoto = (p: ApiPhoto, i: number, section: string, topic: string): Photo => ({
  id: p.id, section: 'gallery', file: p.url, orig: p.name, w: p.w, h: p.h, blur: GRAY, color: '#e9e2d0', widths: [720, p.w],
  src: p.url, large: p.url, srcSet: `${p.thumb} 720w, ${p.url} ${Math.max(p.w, 1200)}w`, ratio: p.w / p.h, index: i + 1,
  title: `${topic} — ${i + 1}`, note: section, date: fmt(p.at), year: new Date(p.at).getFullYear(), cat: section as any,
});

const Ico = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
const EDIT = 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4';
const TRASH = 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3';

export default function Albums() {
  const topicId = useTopicId();
  return (
    <>
      <section className="page-hero short">
        <div className="ph-bg" data-parallax="-0.1"><Img photo={byId('family-12')} sizes="100vw" eager className="hero-img" pos="50% 40%" /></div>
        <div className="hero-veil" />
        <Shanyrak className="hero-ring" draw spin />
        <div className="wrap ph-in">
          <span className="eyebrow light"><i />Бөлім · Тақырып · Фото</span>
          <h1>{'Альбомдар'.split('').map((c, i) => <span key={i} className="ch" style={{ ['--i' as any]: i }}>{c}</span>)}</h1>
          <p>Саяхат, той, үйдегі күндер — әр бөлімнің ішінде өз тақырыптары мен фотолары бар.</p>
        </div>
      </section>
      <section className="sec gal-sec"><div className="wrap">{__LITE__ ? <Note title="Бұл бөлім сервер нұсқасында жұмыс істейді" text="Альбомдар мен админ режимі сайт серверге орналастырылғанда ашылады." /> : topicId ? <TopicView id={topicId} /> : <SectionsView />}</div></section>
    </>
  );
}

function Note({ title, text, retry }: { title: string; text: string; retry?: () => void }) {
  return <div className="empty"><h3>{title}</h3><p>{text}</p>{retry && <button className="btn dark" onClick={retry}>Қайталау</button>}</div>;
}

/* ---------------- Бөлімдер мен тақырыптар ---------------- */
function SectionsView() {
  const { admin, prompt, confirm, toast } = useUI();
  const [data, setData] = useState<ApiSection[] | null>(null); const [err, setErr] = useState('');
  const load = useCallback(async () => { try { setErr(''); setData((await api.albums()).sections); } catch (e) { setErr(errText(e)); } }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<unknown>, ok: string) => { try { await fn(); toast(ok); await load(); } catch (e) { toast(errText(e), 'err'); } };
  const addSection = async () => { const n = await prompt({ title: 'Жаңа бөлім', label: 'Бөлім атауы (мысалы: Саяхат)', ok: 'Қосу' }); if (n) run(() => api.addSection(n), 'Бөлім қосылды'); };
  const renameSection = async (s: ApiSection) => { const n = await prompt({ title: 'Бөлім атын өзгерту', label: 'Жаңа атауы', initial: s.name }); if (n && n !== s.name) run(() => api.renameSection(s.id, n), 'Атауы өзгертілді'); };
  const delSection = async (s: ApiSection) => {
    const c = s.topics.reduce((a, t) => a + t.count, 0);
    if (await confirm({ title: `«${s.name}» бөлімін өшіру`, text: `Бөлімнің ішіндегі ${s.topics.length} тақырып пен ${c} фото біржола өшеді. Қайтару мүмкін емес.` })) run(() => api.deleteSection(s.id), 'Бөлім өшірілді');
  };
  const addTopic = async (s: ApiSection) => { const n = await prompt({ title: `«${s.name}» — жаңа тақырып`, label: 'Тақырып атауы (мысалы: Алматы)', ok: 'Қосу' }); if (n) run(() => api.addTopic(s.id, n), 'Тақырып қосылды'); };
  const renameTopic = async (t: ApiTopic) => { const n = await prompt({ title: 'Тақырып атын өзгерту', label: 'Жаңа атауы', initial: t.name }); if (n && n !== t.name) run(() => api.renameTopic(t.id, n), 'Атауы өзгертілді'); };
  const delTopic = async (t: ApiTopic) => { if (await confirm({ title: `«${t.name}» тақырыбын өшіру`, text: `Ішіндегі ${t.count} фото біржола өшеді. Қайтару мүмкін емес.` })) run(() => api.deleteTopic(t.id), 'Тақырып өшірілді'); };

  if (err && !data) return <Note title="Альбомдар жүктелмеді" text={err} retry={load} />;
  if (!data) return <div className="loading" role="status"><i /><span>Жүктелуде…</span></div>;
  return (
    <>
      {admin && <div className="admin-bar"><span><b>ADMIN</b> режимі қосулы</span><button className="btn-s pri" onClick={addSection}>+ Жаңа бөлім</button></div>}
      {data.length === 0 && <Note title="Әзірге альбом жоқ" text={admin ? '«+ Жаңа бөлім» батырмасын басып, алғашқы бөлімді құрыңыз.' : 'Альбомдар жақында қосылады.'} />}
      {data.map((s, si) => (
        <div className="g-block" key={s.id}>
          <Reveal>
            <div className="g-head">
              <span className="g-roman">{si + 1}</span>
              <div><h2>{s.name}</h2><p>{s.topics.length ? `${s.topics.length} тақырып` : 'Тақырып жоқ'}</p></div>
              {admin && (
                <span className="adm-tools">
                  <button className="btn-s pri" onClick={() => addTopic(s)}>+ Жаңа тақырып</button>
                  <button className="ico" onClick={() => renameSection(s)} aria-label="Бөлім атын өзгерту" title="Атын өзгерту"><Ico d={EDIT} /></button>
                  <button className="ico danger" onClick={() => delSection(s)} aria-label="Бөлімді өшіру" title="Өшіру"><Ico d={TRASH} /></button>
                </span>
              )}
            </div>
          </Reveal>
          {s.topics.length === 0 && <p className="sec-empty">Бұл бөлімде әзірге тақырып жоқ.</p>}
          <div className="topics">
            {s.topics.map((t, i) => (
              <Reveal key={t.id} kind="up" delay={Math.min(0.4, i * 0.06)}>
                <article className="tcard">
                  <button className="tcard-btn" onClick={() => openTopic(t.id)}>
                    <span className="tcard-frame">
                      {t.cover ? <img src={t.cover} alt="" loading="lazy" decoding="async" /> : <span className="tcard-none"><Shanyrak className="tcard-mark" /></span>}
                      <span className="pcard-shade" />
                    </span>
                    <span className="tcard-cap"><span className="pcard-title">{t.name}</span><span className="pcard-meta"><i>{t.count} фото</i></span></span>
                  </button>
                  {admin && <span className="tcard-tools"><button className="ico" onClick={() => renameTopic(t)} aria-label="Тақырып атын өзгерту"><Ico d={EDIT} /></button><button className="ico danger" onClick={() => delTopic(t)} aria-label="Тақырыпты өшіру"><Ico d={TRASH} /></button></span>}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------------- Тақырып галереясы ---------------- */
function TopicView({ id }: { id: string }) {
  const { admin, confirm, toast } = useUI();
  const [d, setD] = useState<{ topic: { id: string; name: string; sectionName: string }; photos: ApiPhoto[] } | null>(null);
  const [err, setErr] = useState(''); const [open, setOpen] = useState<number | null>(null);
  const [up, setUp] = useState<{ done: number; total: number; frac: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => { try { setErr(''); setD(await api.topic(id)); } catch (e) { setErr(errText(e)); } }, [id]);
  useEffect(() => { setD(null); setOpen(null); load(); }, [load]);

  const photos: Photo[] = d ? d.photos.map((p, i) => toPhoto(p, i, d.topic.sectionName, d.topic.name)) : [];

  const onFiles = async (files: FileList | null) => {
    const list = files ? Array.from(files) : []; if (input.current) input.current.value = ''; if (!list.length || !d) return;
    let ok = 0; const bad: string[] = [];
    for (let i = 0; i < list.length; i++) {
      setUp({ done: i, total: list.length, frac: 0 });
      try {
        const ph = await uploadPhoto(id, list[i], (f) => setUp({ done: i, total: list.length, frac: f }));
        setD((cur) => (cur ? { ...cur, photos: [...cur.photos, ph] } : cur)); ok++;   // парақты жаңартпай-ақ бірден көрінеді
      } catch (e) { bad.push(errText(e)); if (e instanceof ApiError && e.status === 401) { bad.push('Сессия аяқталды — қайта кіріңіз.'); break; } }
    }
    setUp(null);
    if (ok) toast(ok === 1 ? 'Фото қосылды' : `${ok} фото қосылды`);
    if (bad.length) toast(bad[0] + (bad.length > 1 ? ` (және тағы ${bad.length - 1} қате)` : ''), 'err');
  };
  const del = async (p: Photo) => {
    if (!(await confirm({ title: 'Фотоны өшіру', text: 'Бұл фото біржола өшеді. Қайтару мүмкін емес.' }))) return;
    try { await api.deletePhoto(p.id); setD((cur) => (cur ? { ...cur, photos: cur.photos.filter((x) => x.id !== p.id) } : cur)); toast('Фото өшірілді'); } catch (e) { toast(errText(e), 'err'); }
  };

  if (err && !d) return <><Back /><Note title="Тақырып жүктелмеді" text={err} retry={load} /></>;
  if (!d) return <><Back /><div className="loading" role="status"><i /><span>Жүктелуде…</span></div></>;
  const pct = up ? Math.round(((up.done + up.frac) / up.total) * 100) : 0;
  return (
    <>
      <Back section={d.topic.sectionName} />
      <div className="g-head">
        <span className="g-roman">★</span>
        <div><h2>{d.topic.name}</h2><p>{d.topic.sectionName}</p></div>
        <span className="g-count">{photos.length} фото</span>
      </div>
      {admin && (
        <div className="admin-bar">
          <span><b>ADMIN</b> режимі қосулы</span>
          <button className="btn-s pri" disabled={!!up} onClick={() => input.current?.click()}>+ Фото қосу</button>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        </div>
      )}
      {up && (
        <div className="upbar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div><span>Жүктелуде: {Math.min(up.done + 1, up.total)} / {up.total}</span><b>{pct}%</b></div><i style={{ width: pct + '%' }} />
        </div>
      )}
      {photos.length === 0
        ? <Note title="Бұл тақырыпта әзірге фото жоқ" text={admin ? '«+ Фото қосу» батырмасын басып, бірнеше фотоны бірден таңдаңыз.' : 'Фотолар жақында қосылады.'} />
        : <Gallery photos={photos} onOpen={(p) => setOpen(photos.findIndex((x) => x.id === p.id))} flatIndexOf={(p) => p.index}
            actions={admin ? (p) => <button className="pcard-del" onClick={() => del(p)} aria-label="Фотоны өшіру" title="Өшіру"><Ico d={TRASH} /></button> : undefined} />}
      {open !== null && photos[open] && <Lightbox photos={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </>
  );
}
const Back = ({ section }: { section?: string }) => <button className="back" onClick={() => openTopic(null)}><span aria-hidden>←</span> Барлық альбомдар{section ? ` · ${section}` : ''}</button>;
