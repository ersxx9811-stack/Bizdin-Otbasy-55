import { useCallback, useMemo, useState } from 'react';
import { PHOTOS, SECTIONS, type Section, type Photo } from '../data/photos';
import type { Category } from '../data/captions';
import { Gallery } from '../components/Gallery';
import { Lightbox } from '../components/Lightbox';
import { Reveal } from '../components/Reveal';
import { Img } from '../components/Img';
import { byId } from '../data/photos';
import { Shanyrak } from '../components/Shanyrak';

const CATS: Category[] = ['Мерекелер', 'Саяхаттар', 'Ерекше күндер'];
const YEARS = Array.from(new Set(PHOTOS.map((p) => p.year))).sort();

export default function Memories() {
  const [tab, setTab] = useState<'all' | Section>('all');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [year, setYear] = useState<number | 'all'>('all');
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(() => PHOTOS.filter((p) => (tab === 'all' || p.section === tab) && (cat === 'all' || p.cat === cat) && (year === 'all' || p.year === year)), [tab, cat, year]);
  const blocks = SECTIONS.map((s) => ({ s, items: visible.filter((p) => p.section === s.key) })).filter((b) => b.items.length);
  const flat = useMemo(() => blocks.flatMap((b) => b.items), [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  const openPhoto = useCallback((p: Photo) => setOpen(flat.indexOf(p)), [flat]);
  const reset = () => { setTab('all'); setCat('all'); setYear('all'); };
  const count = (s: Section) => PHOTOS.filter((p) => p.section === s).length;
  const cover = byId('memory-06');

  return (
    <>
      <section className="page-hero short">
        <div className="ph-bg" data-parallax="-0.1"><Img photo={cover} sizes="100vw" eager className="hero-img" pos="50% 60%" /></div>
        <div className="hero-veil" />
        <Shanyrak className="hero-ring" draw spin />
        <div className="wrap ph-in">
          <span className="eyebrow light"><i />Фотогалерея</span>
          <h1>{'Естеліктер'.split('').map((c, i) => <span key={i} className="ch" style={{ ['--i' as any]: i }}>{c}</span>)}</h1>
          <p>{PHOTOS.length} фотосурет — мереке, саяхат және ерекше күндер. Кез келген суретті басып, толық экранда көріңіз.</p>
        </div>
      </section>

      <section className="sec gal-sec">
        <div className="wrap">
          <div className="filters" role="region" aria-label="Сүзгілер">
            <div className="tabs" role="tablist" aria-label="Бөлімдер">
              <button role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')}>Барлығы <small>{PHOTOS.length}</small></button>
              {SECTIONS.map((s) => <button key={s.key} role="tab" aria-selected={tab === s.key} onClick={() => setTab(s.key)}>{s.short} <small>{count(s.key)}</small></button>)}
            </div>
            <div className="chips">
              <span className="chips-l">Санат</span>
              <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>Барлығы</button>
              {CATS.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
            </div>
            <div className="chips">
              <span className="chips-l">Жыл</span>
              <button className={year === 'all' ? 'on' : ''} onClick={() => setYear('all')}>Барлығы</button>
              {YEARS.map((y) => <button key={y} className={year === y ? 'on' : ''} onClick={() => setYear(y)}>{y}</button>)}
            </div>
            <p className="found" aria-live="polite">Көрсетілген: <b>{visible.length}</b> фото</p>
          </div>

          {blocks.length === 0 && (
            <div className="empty"><p>Бұл сүзгі бойынша фото табылмады.</p><button className="btn dark" onClick={reset}>Сүзгілерді тазалау</button></div>
          )}

          {blocks.map(({ s, items }) => (
            <div className="g-block" key={s.key + tab + cat + year}>
              <Reveal>
                <div className="g-head">
                  <span className="g-roman">{s.roman}</span>
                  <div><h2>{s.title}</h2><p>{s.desc}</p></div>
                  <span className="g-count">{items.length} фото</span>
                </div>
              </Reveal>
              <Gallery photos={items} onOpen={openPhoto} flatIndexOf={(p) => p.index} />
            </div>
          ))}
        </div>
      </section>

      {open !== null && flat[open] && <Lightbox photos={flat} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </>
  );
}
