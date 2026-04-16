import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import emailjs from '@emailjs/browser';

/* ─── EmailJS credentials ───────────────────────────────────────
   1. Sign up free at https://emailjs.com
   2. Add > Email Services  → connect your Gmail / Outlook
   3. Email Templates → create a template using these variables:
        {{from_name}}  {{reply_to}}  {{message}}
      Set the template's "To" address to your own email.
   4. Account → API Keys → copy your Public Key
   Then paste the three IDs below.
──────────────────────────────────────────────────────────────── */
const EJS_SERVICE  = 'YOUR_SERVICE_ID';   // e.g. 'service_abc123'
const EJS_TEMPLATE = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xyz789'
const EJS_KEY      = 'YOUR_PUBLIC_KEY';   // e.g. 'AbCdEfGhIjKlMnOp'

/* ══════════════════════════════════════════════════════════════
   SPACESHIP  (built from Three.js primitives)
══════════════════════════════════════════════════════════════ */
function createSpaceship() {
  const group   = new THREE.Group();
  const metal   = new THREE.MeshPhongMaterial({ color: 0x4a5568, shininess: 160, specular: 0x8899cc });
  const dark    = new THREE.MeshPhongMaterial({ color: 0x1f2937, shininess: 70 });
  const glass   = new THREE.MeshPhongMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5, shininess: 220, specular: 0xffffff });
  const accent  = new THREE.MeshBasicMaterial({ color: 0x818cf8 });

  // Fuselage
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 2.0, 8), metal));
  // Nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 8), dark);
  nose.position.y = 1.42;
  group.add(nose);
  // Cockpit dome
  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  cockpit.position.y = 0.5;
  group.add(cockpit);
  // Accent rings
  [0.12, -0.44].forEach((y) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.022, 6, 24), accent);
    r.rotation.x = Math.PI / 2; r.position.y = y; group.add(r);
  });
  // Swept wings
  const ws = new THREE.Shape();
  ws.moveTo(0, 0.28); ws.lineTo(0, -0.60); ws.lineTo(1.2, -0.82); ws.lineTo(0.95, 0.06); ws.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(ws, { depth: 0.04, bevelEnabled: false });
  const wingMat = new THREE.MeshPhongMaterial({ color: 0x374151, shininess: 50, side: THREE.DoubleSide });
  const lw = new THREE.Mesh(wingGeo, wingMat); lw.position.set(0.3, 0, -0.02); group.add(lw);
  const rw = new THREE.Mesh(wingGeo, wingMat); rw.scale.x = -1; rw.position.set(-0.3, 0, -0.02); group.add(rw);
  // Nacelles
  const nacMat = new THREE.MeshPhongMaterial({ color: 0x111827 });
  [-0.54, 0.54].forEach((x) => {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.55, 8), nacMat);
    n.position.set(x, -0.95, 0); group.add(n);
  });
  // Engine glows + lights
  const glowGeo = new THREE.SphereGeometry(0.115, 8, 8);
  const glowMeshes = [], glowLights = [];
  [-0.54, 0.54].forEach((x) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.9 });
    const gm = new THREE.Mesh(glowGeo, mat); gm.position.set(x, -1.28, 0); group.add(gm); glowMeshes.push(gm);
    const pl = new THREE.PointLight(0x60a5fa, 1.2, 5); pl.position.set(x, -1.5, 0); group.add(pl); glowLights.push(pl);
  });
  // Dorsal fin
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.32), dark);
  fin.position.set(0, 0.32, 0.18); group.add(fin);
  group.scale.setScalar(0.52);
  return { group, glowMeshes, glowLights };
}

/* ══════════════════════════════════════════════════════════════
   MODAL CONTENT COMPONENTS
══════════════════════════════════════════════════════════════ */
function AboutContent() {
  return (
    <div className="modal-body">
      <div className="modal-planet-row">
        <div className="modal-mini earth-mini" aria-hidden="true" />
        <h2>About Me</h2>
      </div>
      <p>Hi, I'm Aia Ahmed, a passionate and driven software engineering student at Gannon University, currently ending my senior year. At 21 years old, I'm actively seeking a software engineering, business analyst, product management, and other related tech full time jobs or internships where I can apply and grow my skills in a real-world environment. I'm also currently pursuing a part time job as a digital associate at Walmart.</p>
      <p>Through my academic journey, I've completed coursework in data structures and algorithms, java, python, linux, c++, html, css, javascript, swift, database management systems, project requirements &amp; management, and more. I hold a Google Career Certificate in computer programming and I've been recognized by the National Technical Honor Society for my technical proficiency.</p>
      <p>I'm enthusiastic about collaborating with teams, learning through new challenges, and contributing to software solutions.</p>
    </div>
  );
}

function ProjectsContent() {
  const ref = useRef(null);
  useEffect(() => {
    const cards = ref.current?.querySelectorAll('.project') ?? [];
    const onMove = (e) => {
      const c = e.currentTarget, r = c.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const rx = ((my - r.height / 2) / (r.height / 2)) * 8;
      const ry = ((r.width  / 2 - mx) / (r.width  / 2)) * 8;
      c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
      c.style.setProperty('--sx', `${(mx / r.width)  * 100}%`);
      c.style.setProperty('--sy', `${(my / r.height) * 100}%`);
    };
    const onLeave = (e) => { e.currentTarget.style.transform = ''; };
    cards.forEach((c) => { c.addEventListener('mousemove', onMove); c.addEventListener('mouseleave', onLeave); });
    return () => cards.forEach((c) => { c.removeEventListener('mousemove', onMove); c.removeEventListener('mouseleave', onLeave); });
  }, []);

  return (
    <div className="modal-body" ref={ref}>
      <div className="modal-planet-row">
        <div className="modal-mini saturn-mini" aria-hidden="true">
          <div className="mini-ring mr1" /><div className="mini-ring mr2" />
        </div>
        <h2>My Projects</h2>
      </div>

      <div className="project">
        <h3>Homemade Food Ordering App</h3>
        <video width="400" controls>
          <source src="/videos/Mobile App 2 Project recording.mp4" type="video/mp4" />
        </video>
        <p>Was part of a team where we worked on a homemade food ordering app in sophomore year of university. We used Android Studio as our IDE and Java as our language. My teammate Blossom and I were in charge of the provider page where the provider can view the customer's orders and choose to accept or decline them. They can also view the pending orders. We also used the Google Maps API so customers can search for restaurants on the map.</p>
        <a href="https://github.com/QuangPhuLy7227/HomeMadeFood.git" target="_blank" rel="noreferrer">View on GitHub</a>
      </div>

      <div className="project">
        <h3>Sleep Analysis and Tracking App</h3>
        <video width="400" controls>
          <source src="/videos/SleepApp.mp4" type="video/mp4" />
        </video>
        <p>Is currently a part of team of 3 to develop a sleep analysis on Xcode using Swift. We have integrated motion sensors, microphone, and snore detection. We are currently working on smartwatch integration to include the heart rate sensor.</p>
        <a href="https://github.com/alberico007/smarterpillow" target="_blank" rel="noreferrer">View on GitHub</a>
      </div>

      <div className="project">
        <h3>Cat Cafe Website</h3>
        <video width="400" controls>
          <source src="/videos/CatCafe.mp4" type="video/mp4" />
        </video>
        <p>Personally developed a cat cafe website using HTML, CSS, and JavaScript. It includes a hero section, cafe featured cats, gallery section, and testimonials.</p>
        <a href="https://github.com/AiaA07/CatCafe" target="_blank" rel="noreferrer">View on GitHub</a>
      </div>

      <div className="project">
        <h3>FTP Client Software Versions Comparison</h3>
        <div className="image-row">
          <a href="/images/3.2 Dependency Graph.png" target="_blank" rel="noreferrer">
            <img src="/images/3.2 Dependency Graph.png" alt="3.2 Dependency Graph" />
          </a>
          <a href="/images/3.3 Depenedency Graph.png" target="_blank" rel="noreferrer">
            <img src="/images/3.3 Depenedency Graph.png" alt="3.3 Dependency Graph" />
          </a>
          <a href="/images/StrategyPattern.png" target="_blank" rel="noreferrer">
            <img src="/images/StrategyPattern.png" alt="Strategy Pattern" />
          </a>
        </div>
        <p>Was part of a team where we worked on an FTP Client software versions comparison project. We compared version to version. I was in charge of versions 3.2 and 3.3. After comparing all versions from 3.2 to 3.6, we combined our findings and concluded that as the version evolves, fewer and fewer changes happen to it, which might signify stability. We also identified software design patterns — I identified the strategy design pattern, which dynamically switches between different FTP server listing parsers at runtime. The Understand tool was also used to extract the dependency graph of each version.</p>
      </div>

      <div className="project">
        <h3>Calculator App Testing</h3>
        <video width="400" controls>
          <source src="/videos/CalcApp.mp4" type="video/mp4" />
        </video>
        <p>Was part of a team where we worked on testing a calculator app. We added several features to the app and tested it using different Java testing methods. I added the factorial and square root function. I then implemented unit testing. We also used Jenkins integration testing.</p>
        <a href="https://github.com/AiaA07/CalcAppGradle.git" target="_blank" rel="noreferrer">View on GitHub</a>
      </div>
    </div>
  );
}

function ContactContent() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  // 'idle' | 'sending' | 'sent-direct' | 'sent-client'
  const [status, setStatus] = useState('idle');

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!fields.name.trim())    e.name    = 'Name is required.';
    if (!fields.email.trim())   e.email   = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                e.email   = 'Enter a valid email address.';
    if (!fields.message.trim()) e.message = 'Message is required.';
    return e;
  };

  // Always-reliable fallback: open the user's mail client with fields pre-filled
  const openMailto = () => {
    const subject = encodeURIComponent(`Portfolio message from ${fields.name}`);
    const body    = encodeURIComponent(
      `From: ${fields.name} <${fields.email}>\n\n${fields.message}`
    );
    const a = document.createElement('a');
    a.href = `mailto:ayooa0717@gmail.com?subject=${subject}&body=${body}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus('sending');

    // If EmailJS credentials haven't been configured yet, skip straight to mailto
    const emailjsReady = !EJS_SERVICE.startsWith('YOUR_');
    if (emailjsReady) {
      try {
        await emailjs.send(
          EJS_SERVICE, EJS_TEMPLATE,
          { from_name: fields.name, reply_to: fields.email, message: fields.message },
          EJS_KEY
        );
        setFields({ name: '', email: '', message: '' });
        setStatus('sent-direct');
        return;
      } catch (err) {
        // Log for debugging, then fall through to mailto
        console.error('[EmailJS]', err);
      }
    }

    // Mailto fallback — always works
    openMailto();
    setFields({ name: '', email: '', message: '' });
    setStatus('sent-client');
  };

  const reset = () => setStatus('idle');

  const PlanetHeader = () => (
    <div className="modal-planet-row">
      <div className="modal-mini neptune-mini" aria-hidden="true">
        <div className="mini-ring ice-mini-ring" />
      </div>
      <h2>Contact</h2>
    </div>
  );

  if (status === 'sent-direct') {
    return (
      <div className="modal-body">
        <PlanetHeader />
        <div className="contact-success">
          <div className="success-icon">✓</div>
          <p className="success-title">Message sent!</p>
          <p className="success-sub">I'll get back to you soon.</p>
          <button className="retry-btn" onClick={reset}>Send another</button>
        </div>
      </div>
    );
  }

  if (status === 'sent-client') {
    return (
      <div className="modal-body">
        <PlanetHeader />
        <div className="contact-success">
          <div className="success-icon mail-icon">✉</div>
          <p className="success-title">Email client opened!</p>
          <p className="success-sub">
            Your message is pre-filled and ready — just hit&nbsp;<strong>Send</strong> in your
            email app.
          </p>
          <p className="success-sub">
            Nothing opened?{' '}
            <a href="mailto:ayooa0717@gmail.com">Email me directly</a>
          </p>
          <button className="retry-btn" onClick={reset}>Start over</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-body">
      <PlanetHeader />
      <p className="contact-direct">
        Or reach me directly at{' '}
        <a href="mailto:ayooa0717@gmail.com">ayooa0717@gmail.com</a>
      </p>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="cf-name">Name</label>
            <input
              id="cf-name" type="text" placeholder="Your name"
              value={fields.name} onChange={set('name')}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="cf-email">Email</label>
            <input
              id="cf-email" type="email" placeholder="you@example.com"
              value={fields.email} onChange={set('email')}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
        </div>

        <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
          <label htmlFor="cf-msg">Message</label>
          <textarea
            id="cf-msg" rows={5} placeholder="What's on your mind?"
            value={fields.message} onChange={set('message')}
          />
          {errors.message && <span className="field-error">{errors.message}</span>}
        </div>

        <button type="submit" className="send-btn" disabled={status === 'sending'}>
          {status === 'sending'
            ? <><span className="btn-spinner" /> Sending…</>
            : 'Send Message →'}
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════════ */
export default function App() {
  const canvasRef = useRef(null);
  const [modal, setModal] = useState(null);

  /* ── Escape key closes modal ─────────────────────────────── */
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setModal(null); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  /* ── Three.js galaxy scene ───────────────────────────────── */
  useEffect(() => {
    /* custom cursor */
    const cursor    = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    let cx = 0, cy = 0, tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cursorRaf;
    const tickCursor = () => {
      cx += (tx - cx) * 0.13; cy += (ty - cy) * 0.13;
      cursor.style.transform    = `translate(${cx - 18}px, ${cy - 18}px)`;
      cursorDot.style.transform = `translate(${tx - 3}px,  ${ty - 3}px)`;
      cursorRaf = requestAnimationFrame(tickCursor);
    };
    tickCursor();

    /* Three.js renderer */
    const canvas   = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.z = 6;

    /* lights */
    scene.add(new THREE.AmbientLight(0x080818, 1.2));
    const sun = new THREE.DirectionalLight(0xffeedd, 2);
    sun.position.set(8, 10, 5); scene.add(sun);
    const fill = new THREE.DirectionalLight(0x1a1a4a, 0.5);
    fill.position.set(-5, -5, -5); scene.add(fill);

    /* ── stars ── */
    const sN = 14000;
    const sPos = new Float32Array(sN * 3), sCol = new Float32Array(sN * 3);
    for (let i = 0; i < sN; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      const r  = 55 + Math.random() * 260;
      sPos.set([r*Math.sin(ph)*Math.cos(th), r*Math.sin(ph)*Math.sin(th), r*Math.cos(ph)], i*3);
      const t = Math.random();
      sCol.set(t < .25 ? [.6,.75,1] : t < .5 ? [1,.9,.7] : [1,1,1], i*3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    starGeo.setAttribute('color',    new THREE.BufferAttribute(sCol, 3));
    const stars = new THREE.Points(starGeo,
      new THREE.PointsMaterial({ size: 0.17, vertexColors: true, transparent: true, opacity: 0.9 }));
    scene.add(stars);

    /* ── nebulae ── */
    [
      { c:[.45,.12,.85], p:[-18, 10,-44], s:20 },
      { c:[.1, .45,1.0], p:[ 24,-12,-54], s:22 },
      { c:[.9, .18,.5 ], p:[ -8, 22,-47], s:16 },
      { c:[.1, .75,.6 ], p:[ 12,-25,-59], s:24 },
      { c:[.8, .35,.1 ], p:[-28,  -7,-50], s:18 },
    ].forEach(({ c, p, s }) => {
      const n = 900, pos = new Float32Array(n*3), col = new Float32Array(n*3);
      for (let i = 0; i < n; i++) {
        const r = Math.random() ** .6 * s, th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
        pos.set([p[0]+r*Math.sin(ph)*Math.cos(th), p[1]+r*Math.sin(ph)*Math.sin(th), p[2]+r*Math.cos(ph)], i*3);
        const f = .25 + .75*(1-r/s);
        col.set([c[0]*f, c[1]*f, c[2]*f], i*3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
      geo.setAttribute('color',    new THREE.BufferAttribute(col,3));
      scene.add(new THREE.Points(geo,
        new THREE.PointsMaterial({ size:1.8, vertexColors:true, transparent:true, opacity:.28, depthWrite:false })));
    });

    /* ── small background planets ── */
    const bgPlanets = [];
    [
      { x:-5.5, y: 3.6, z:-7,  r:.38, col:0xc0623a, ring:false },
      { x: 5.8, y:-3.5, z:-8,  r:.52, col:0x4888c8, ring:false },
      { x:-8.5, y:-4.5, z:-12, r:.28, col:0x888864, ring:false },
      { x: 9.2, y: 4.5, z:-14, r:.70, col:0xd48050, ring:true  },
      { x:-12,  y: 1.2, z:-20, r:1.1, col:0xb060c8, ring:false },
      { x: 11,  y:-7,   z:-18, r:.44, col:0x40b888, ring:false },
      { x:-4.5, y: 7.5, z:-16, r:.32, col:0xe8a050, ring:false },
      { x: 4,   y: 8.5, z:-18, r:.62, col:0x6090d8, ring:true  },
      { x:-16,  y:-4,   z:-26, r:1.4, col:0xc8a030, ring:false },
      { x: 14,  y: 9,   z:-22, r:.50, col:0xa03858, ring:false },
      { x: 0.5, y:-9,   z:-15, r:.35, col:0x50a0b0, ring:false },
      { x:-7,   y:-9,   z:-19, r:.55, col:0x9060a0, ring:true  },
    ].forEach(({ x, y, z, r, col, ring }) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 16, 16),
        new THREE.MeshPhongMaterial({ color: col, shininess: 55 })
      );
      mesh.position.set(x, y, z);
      scene.add(mesh);
      if (ring) {
        const rm = new THREE.Mesh(
          new THREE.TorusGeometry(r * 2.1, r * 0.09, 4, 30),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .38, side: THREE.DoubleSide })
        );
        rm.rotation.x = Math.PI / 2.4;
        mesh.add(rm);
      }
      bgPlanets.push(mesh);
    });

    /* ── spaceship ── */
    const { group: ship, glowMeshes, glowLights } = createSpaceship();
    ship.position.set(0, 0, -1);
    scene.add(ship);

    /* ── mouse tracking (NDC + cursor) ── */
    const mouseNDC = new THREE.Vector2(0, 0);
    const onMouseMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      mouseNDC.set(
        (e.clientX / window.innerWidth)  * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      /* cursor big on interactable */
      if (e.target.closest('a, button, .project, video'))
        cursor.classList.add('cursor-big');
      else
        cursor.classList.remove('cursor-big');
    };
    document.addEventListener('mousemove', onMouseMove);

    /* ── resize ── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /* ── cached animate-loop objects ── */
    const _rc = new THREE.Raycaster();
    const _pl = new THREE.Plane();
    const _pn = new THREE.Vector3(0, 0, 1);
    const _ix = new THREE.Vector3();
    const _dv = new THREE.Vector3();
    const _ya = new THREE.Vector3(0, 1, 0);
    const _tq = new THREE.Quaternion();
    let sTX = 0, sTY = 0, sCX = 0, sCY = 0;

    const startTime = performance.now();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) / 1000;

      /* ship follows cursor freely across full screen */
      sTX = mouseNDC.x * 3.0;
      sTY = mouseNDC.y * 2.2;
      sCX += (sTX - sCX) * 0.028;
      sCY += (sTY - sCY) * 0.028;
      ship.position.set(sCX, sCY, -1);

      /* nose (+Y) points toward mouse */
      _pl.set(_pn, -ship.position.z);
      _rc.setFromCamera(mouseNDC, camera);
      if (_rc.ray.intersectPlane(_pl, _ix)) {
        _dv.subVectors(_ix, ship.position).normalize();
        if (_dv.lengthSq() > 0.001) {
          _tq.setFromUnitVectors(_ya, _dv);
          ship.quaternion.slerp(_tq, 0.05);
        }
      }

      /* engine pulse */
      const pulse = 0.5 + 0.5 * Math.sin(t * 7);
      glowMeshes.forEach((gm) => { gm.material.opacity = pulse * 0.9; });
      glowLights.forEach((gl) => { gl.intensity = pulse * 1.3; });

      /* rotate bg planets slowly */
      bgPlanets.forEach((p, i) => {
        p.rotation.y = t * (0.10 + i * 0.015);
        p.rotation.x = t * (0.04 + i * 0.008);
      });

      /* drift star field */
      stars.rotation.y = t * 0.005;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(cursorRaf);
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  /* ── JSX ─────────────────────────────────────────────────── */
  const close = () => setModal(null);

  return (
    <>
      {/* custom cursor */}
      <div id="cursor" />
      <div id="cursor-dot" />

      {/* fixed Three.js galaxy */}
      <canvas ref={canvasRef} id="bg-canvas" />

      {/* page shell */}
      <div className="page-shell">
        {/* hero title */}
        <header className="site-header">
          <div className="mission-badge">✦ Mission Control ✦</div>
          <h1 className="hero-name">Aia Ahmed</h1>
          <p className="hero-tagline">Software Engineering Student · Builder · Problem Solver</p>
        </header>

        {/* 3 clickable planets */}
        <main className="planet-nav">

          {/* ── Earth – About ── */}
          <button className="planet-btn" onClick={() => setModal('about')}>
            <div className="planet earth-planet" aria-hidden="true" />
            <span className="planet-label">About Me</span>
            <span className="planet-hint">click to explore</span>
          </button>

          {/* ── Saturn – Projects ── */}
          <button className="planet-btn planet-btn--mid" onClick={() => setModal('projects')}>
            <div className="planet saturn-planet" aria-hidden="true">
              <div className="planet-ring r1" />
              <div className="planet-ring r2" />
            </div>
            <span className="planet-label">Projects</span>
            <span className="planet-hint">click to explore</span>
          </button>

          {/* ── Neptune – Contact ── */}
          <button className="planet-btn" onClick={() => setModal('contact')}>
            <div className="planet neptune-planet" aria-hidden="true">
              <div className="planet-ring ice-ring" />
            </div>
            <span className="planet-label">Contact</span>
            <span className="planet-hint">click to explore</span>
          </button>

        </main>

        <footer className="site-footer">© 2025 Aia Ahmed</footer>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={close} aria-label="Close">✕</button>
            {modal === 'about'    && <AboutContent />}
            {modal === 'projects' && <ProjectsContent />}
            {modal === 'contact'  && <ContactContent />}
          </div>
        </div>
      )}
    </>
  );
}
