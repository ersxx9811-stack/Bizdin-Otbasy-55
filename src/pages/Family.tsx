import { useState } from 'react';
import { byId } from '../data/photos';
import { MEMBERS, GENERATIONS } from '../data/content';
import { Img } from '../components/Img';
import { Reveal } from '../components/Reveal';
import { Tilt } from '../components/Tilt';
import { SectionHead } from '../components/Chrome';
import { Timeline } from '../components/Timeline';
import { Shanyrak } from '../components/Shanyrak';
import { Link } from '../router';

export default function Family() {
  const [gen, setGen] = useState(GENERATIONS[0].id);
  const g = GENERATIONS.find((x) => x.id === gen)!;
  const cover = byId('family-12');

  return (
    <>
      <section className="page-hero">
        <div className="ph-bg" data-parallax="-0.1"><Img photo={cover} sizes="100vw" eager className="hero-img" pos="50% 40%" /></div>
        <div className="hero-veil" />
        <Shanyrak className="hero-ring" draw spin />
        <div className="wrap ph-in">
          <span className="eyebrow light"><i />Бір шаңырақ, бір жүрек</span>
          <h1>{'Отбасымыз'.split('').map((c, i) => <span key={i} className="ch" style={{ ['--i' as any]: i }}>{c}</span>)}</h1>
          <p>Алты жүрек — Ғалымжан, Асель, Ерасыл, Шапагат, Әбілмансұр және Айнамкөз: біздің шаңырақтың жылы портреттері мен жылнамасы.</p>
        </div>
      </section>

      {/* Отбасы мүшелері */}
      <section className="sec" id="mushe">
        <div className="wrap">
          <Reveal><SectionHead eyebrow="Отбасы мүшелері" title="Бізбен" em="танысыңыз" text="Алты жан — бір шаңырақ. Әр карточкада отбасы мүшесінің есімі мен орны көрсетілген." /></Reveal>
          <div className="members">
            {MEMBERS.map((m, i) => {
              const p = byId(m.photo);
              return (
                <Reveal key={m.id} delay={(i % 3) * 0.1}>
                  <Tilt className="member" max={8}>
                    <div className="member-photo"><Img photo={p} sizes="(min-width:900px) 30vw, 90vw" pos={m.focus} zoom={m.zoom} origin={m.origin} className="member-img" /><span className="member-role">{m.role}</span></div>
                    <div className="member-body">
                      <h3>{m.name ?? m.title}</h3>
                      {m.name && <span className="member-sub">{m.title}</span>}
                      <p>{m.note}</p>
                      <dl>
                        <div><dt>Отбасындағы орны</dt><dd>{m.role}</dd></div>
                        {m.birth && <div><dt>Туған күні</dt><dd>{m.birth}</dd></div>}
                        <div><dt>Түскен күні</dt><dd>{p.date}</dd></div>
                      </dl>
                    </div>
                  </Tilt>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Шежіре */}
      <section className="sec green" id="shezhire">
        <Shanyrak className="green-art" spin />
        <div className="wrap">
          <Reveal><SectionHead light eyebrow="Отбасылық шежіре" title="Алты жан —" em="бір тамыр" text="Топты таңдаңыз: ата-ана, ұлдар немесе кенже қызымыз — суреті мен сипаттамасы ашылады." /></Reveal>
          <Reveal>
            <div className="tree" role="tablist" aria-label="Шежіре буындары">
              <svg className="tree-lines" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden>
                <path d="M300 0 V50 M300 50 H0 V120 M300 50 H600 V120" pathLength={1} />
              </svg>
              <button className="node top" role="tab" aria-selected={gen === GENERATIONS[0].id} onClick={() => setGen(GENERATIONS[0].id)}><NodePhoto id={GENERATIONS[0].photo} pos={GENERATIONS[0].focus} /><b>{GENERATIONS[0].label}</b><small>{GENERATIONS[0].sub}</small></button>
              <div className="tree-row">
                {GENERATIONS.slice(1).map((x) => (
                  <button key={x.id} className="node" role="tab" aria-selected={gen === x.id} onClick={() => setGen(x.id)}><NodePhoto id={x.photo} pos={x.focus} /><b>{x.label}</b><small>{x.sub}</small></button>
                ))}
              </div>
            </div>
          </Reveal>
          <div className="gen-panel" key={g.id} role="tabpanel">
            <div className="gen-photo"><Img photo={byId(g.photo)} sizes="(min-width:900px) 40vw, 90vw" pos={g.focus} className="rounded" /></div>
            <div className="gen-text"><span className="eyebrow light"><i />{g.sub}</span><h3>{g.label}</h3><p>{g.text}</p></div>
          </div>
        </div>
      </section>

      {/* Уақыт желісі */}
      <section className="sec" id="tarih">
        <div className="wrap">
          <Reveal><SectionHead center eyebrow="Біздің тарихымыз" title="Жылдар бойғы" em="жылнама" text="Фотолардың түсірілген күндеріне сай жасалған уақыт желісі." /></Reveal>
          <Timeline />
          <Reveal className="center-cta"><Link to="/estelikter" className="btn dark">Барлық естеліктерді көру <span className="arr">→</span></Link></Reveal>
        </div>
      </section>
    </>
  );
}

function NodePhoto({ id, pos }: { id: string; pos?: string }) {
  return <span className="node-photo"><Img photo={byId(id)} sizes="120px" pos={pos} /></span>;
}
