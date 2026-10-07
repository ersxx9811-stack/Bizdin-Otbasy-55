import { byId, PHOTOS } from '../data/photos';
import { TIMELINE, VALUES } from '../data/content';
import { Img } from '../components/Img';
import { Reveal } from '../components/Reveal';
import { Tilt } from '../components/Tilt';
import { Counter } from '../components/Counter';
import { Shanyrak } from '../components/Shanyrak';
import { SectionHead } from '../components/Chrome';
import { Link } from '../router';

const split = (s: string) => s.split(' ').map((w, i) => (
  <span className="w" key={i}><span style={{ ['--i' as any]: i }}>{w}</span>{' '}</span>
));

export default function Home() {
  const hero = byId('family-12');
  const secs = ['gallery', 'memories', 'family'].map((k) => PHOTOS.filter((p) => p.section === k));
  const strip = Array.from({ length: Math.max(...secs.map((a) => a.length)) }).flatMap((_, i) => secs.map((a) => a[i]).filter(Boolean));
  const mosaic = ['family-07', 'memory-02', 'gallery-09', 'gallery-01', 'family-11'].map(byId);

  return (
    <>
      {/* 1. Басты экран */}
      <section className="hero" aria-label="Басты экран">
        <div className="hero-bg" data-parallax="-0.12">
          <Img photo={hero} sizes="100vw" eager className="hero-img" pos="50% 35%" alt="Біздің отбасы — алты жан бір кадрда" />
        </div>
        <div className="hero-veil" />
        <div className="hero-grain" />
        <Shanyrak className="hero-ring" draw spin />
        <div className="wrap hero-in">
          <span className="eyebrow light hero-eyebrow"><i />Қош келдіңіз</span>
          <h1>{split('Біздің отбасы')}</h1>
          <p className="hero-sub">«Бір шаңырақ астындағы махаббат, бірлік пен мәңгілік естеліктер.»</p>
          <div className="hero-cta">
            <Link to="/otbasy" className="btn gold">Отбасымызбен танысыңыз <span className="arr">→</span></Link>
            <Link to="/estelikter" className="btn ghost">Галереяны ашу</Link>
          </div>
        </div>
        <a className="scroll-cue" href="#tanysu" onClick={(e) => { e.preventDefault(); document.getElementById('tanysu')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <span>Төмен жылжыңыз</span><i />
        </a>
      </section>

      {/* ұйқас жолағы */}
      <div className="ribbon" aria-hidden>
        <div className="ribbon-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k}>{['Бірлік', 'Мейірім', 'Құрмет', 'Дәстүр', 'Махаббат', 'Шаңырақ'].map((t) => <span key={t}>{t}<i>✦</i></span>)}</div>
          ))}
        </div>
      </div>

      {/* 2. Отбасымызбен танысыңыз */}
      <section className="sec" id="tanysu">
        <div className="wrap split">
          <div>
            <Reveal><SectionHead eyebrow="Отбасымызбен танысыңыз" title="Үлкен шаңырақ," em="жылы жүрек" /></Reveal>
            <Reveal delay={0.1}><p className="lead">Біз — алты жан: Ғалымжан, Асель, Ерасыл, Шапагат, Әбілмансұр және Айнамкөз. Бір шаңырақтың астында әке мен ананың мейірімі, ұлдардың жігері және кенже қыздың күлкісі қатар жүреді.</p></Reveal>
            <Reveal delay={0.18}><p>Осы сайтта біз жылдар бойы жинаған суреттерімізді бір жерге топтадық: киіз үйдегі бүркітпен түскен ұлттық кадрлар, Көк төбенің күн батысы, мерейтой кеші және үйдегі қарапайым қуаныштар.</p></Reveal>
            <Reveal delay={0.24} className="stats">
              <div><b><Counter to={PHOTOS.length} /></b><span>фотосурет</span></div>
              <div><b><Counter to={6} /></b><span>жан — біздің<br />отбасымыз</span></div>
              <div><b><Counter to={1} /></b><span>ортақ шаңырақ</span></div>
            </Reveal>
            <Reveal delay={0.3}><Link to="/otbasy" className="btn dark">Толығырақ <span className="arr">→</span></Link></Reveal>
          </div>
          <div className="collage">
            <Reveal kind="zoom" className="c1"><div data-parallax="0.06"><Tilt><Img photo={byId('family-14')} sizes="(min-width:900px) 30vw, 70vw" className="rounded" /></Tilt></div></Reveal>
            <Reveal kind="zoom" delay={0.15} className="c2"><div data-parallax="-0.08"><Tilt><Img photo={byId('family-03')} sizes="(min-width:900px) 24vw, 55vw" className="rounded" /></Tilt></div></Reveal>
            <Reveal kind="zoom" delay={0.3} className="c3"><div data-parallax="0.1"><Tilt><Img photo={byId('memory-04')} sizes="(min-width:900px) 20vw, 45vw" className="rounded" /></Tilt></div></Reveal>
            <Shanyrak className="collage-art" draw />
          </div>
        </div>
      </section>

      {/* 3. Біздің тарихымыз */}
      <section className="sec dark" id="tarih">
        <div className="wrap">
          <Reveal><SectionHead light eyebrow="Біздің тарихымыз" title="Жылдар," em="жылы кадрлар" text="2023 жылдан бастап бүгінге дейін — әр кезеңнің өз естелігі бар." /></Reveal>
        </div>
        <div className="hscroll" tabIndex={0} aria-label="Тарих лентасы">
          <div className="hscroll-in">
            {TIMELINE.map((m, i) => (
              <Reveal key={m.title + m.date} kind="up" delay={i * 0.06} className="h-card">
                <Tilt max={6}>
                  <Img photo={byId(m.photos[0])} sizes="(min-width:900px) 340px, 75vw" className="h-img" />
                  <div className="h-body"><span>{m.year} · {m.date}</span><h3>{m.title}</h3></div>
                </Tilt>
              </Reveal>
            ))}
            <div className="h-end"><Link to="/otbasy" anchor="tarih" className="btn gold">Толық тарих <span className="arr">→</span></Link></div>
          </div>
        </div>
      </section>

      {/* 4. Отбасылық құндылықтар */}
      <section className="sec">
        <div className="wrap">
          <Reveal><SectionHead center eyebrow="Отбасылық құндылықтар" title="Бізді біріктіретін" em="төрт тірек" /></Reveal>
          <div className="values">
            {VALUES.map((v, i) => (
              <Reveal key={v.n} delay={i * 0.08}>
                <Tilt className="value">
                  <span className="value-n">{v.n}</span>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                  <span className="value-line" />
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Ерекше сәттер */}
      <section className="sec tint">
        <div className="wrap">
          <Reveal><SectionHead eyebrow="Ерекше сәттер" title="Есте қалатын" em="кадрлар" text="Күн батысы, ұлттық киім, ортақ күлкі — әрқайсысы өз тарихын айтады." /></Reveal>
          <div className="mosaic">
            {mosaic.map((p, i) => (
              <Reveal key={p.id} kind="clip" delay={i * 0.08} className={`mo mo${i + 1}`}>
                <figure data-parallax={i % 2 ? '-0.05' : '0.05'}>
                  <Img photo={p} sizes="(min-width:900px) 38vw, 90vw" className="mo-img" pos={p.ratio < 1 ? '50% 35%' : '50% 50%'} />
                  <figcaption><b>{p.title}</b><span>{p.date}</span></figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Шежіре */}
      <section className="sec green" id="shezhire-teaser">
        <Shanyrak className="green-art" spin />
        <div className="wrap shezhire-teaser">
          <Reveal><SectionHead light eyebrow="Отбасымыздың шежіресі" title="Тамырымыз терең," em="бұтағымыз кең" text="Үлкендерден — аманат, кішілерден — үміт. Ата-ана, ұлдар және кенже қызымыз — интерактивті шежіреден көріңіз." /></Reveal>
          <Reveal delay={0.15}><Link to="/otbasy" anchor="shezhire" className="btn gold">Шежірені ашу <span className="arr">→</span></Link></Reveal>
        </div>
      </section>

      {/* 7. Жылы естеліктер */}
      <section className="sec nopad" id="estelik-lenta">
        <div className="wrap"><Reveal><SectionHead eyebrow="Жылы естеліктер" title="Бір ғана сәт — " em="мәңгілік" /></Reveal></div>
        <div className="marquee" aria-label="Фотолар лентасы">
          {[0, 1].map((k) => (
            <div className="marquee-row" key={k} aria-hidden={k === 1}>
              {strip.map((p) => (
                <Link to="/estelikter" key={p.id + k} className="mq">
                  <Img photo={p} sizes="260px" className="mq-img" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Әдемі фотосуреттер */}
      <section className="sec cta-sec">
        <div className="wrap cta">
          <div className="cta-photos" aria-hidden>
            {['family-13', 'family-07', 'family-11'].map((id, i) => (
              <Reveal key={id} kind="zoom" delay={i * 0.12} className={`cp cp${i + 1}`}><Img photo={byId(id)} sizes="220px" className="rounded" /></Reveal>
            ))}
          </div>
          <div className="cta-text">
            <Reveal><SectionHead eyebrow="Әдемі фотосуреттер" title="Барлық суреттер —" em="бір галереяда" text={`${PHOTOS.length} фото үш бөлімге топталған: толық экранда ашып, келесі мен алдыңғы суретке жылжуға болады.`} /></Reveal>
            <Reveal delay={0.12}><Link to="/estelikter" className="btn gold">Галереяны ашу <span className="arr">→</span></Link></Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
