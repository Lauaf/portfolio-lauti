// Laboratorio de visión: los trabajos de Procesamiento de Imágenes (UNR) portados a JavaScript.
// Cada función sigue al código Python original (OpenCV + NumPy) paso a paso; sin dependencias.
// Imágenes en escala de grises: { w, h, d: Uint8Array }.
(function (root) {
  'use strict';
  const V = {};

  // ---------- Operaciones básicas ----------

  // Misma conversión entera que cv2.cvtColor(..., COLOR_BGR2GRAY).
  V.gris = (rgba, w, h) => {
    const d = new Uint8Array(w * h);
    for (let i = 0, j = 0; i < d.length; i++, j += 4) d[i] = (rgba[j] * 4899 + rgba[j + 1] * 9617 + rgba[j + 2] * 1868 + 8192) >> 14;
    return { w, h, d };
  };

  const reflect101 = (i, n) => {
    if (n === 1) return 0;
    while (i < 0 || i >= n) i = i < 0 ? -i : 2 * n - 2 - i;
    return i;
  };
  const replicar = (i, n) => (i < 0 ? 0 : i >= n ? n - 1 : i);

  // Filtro separable con núcleo de enteros (suma = 2^bits) y redondeo como el punto fijo de OpenCV.
  function separableEntero(img, k, bits, borde) {
    const { w, h, d } = img, r = k.length >> 1, tmp = new Int32Array(w * h), out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0;
      for (let t = -r; t <= r; t++) s += k[t + r] * d[y * w + borde(x + t, w)];
      tmp[y * w + x] = s;
    }
    const div = 1 << (2 * bits), half = div >> 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0;
      for (let t = -r; t <= r; t++) s += k[t + r] * tmp[borde(y + t, h) * w + x];
      out[y * w + x] = Math.min(255, Math.floor((s + half) / div));
    }
    return { w, h, d: out };
  }
  // cv2.GaussianBlur(img, (5, 5), 0): núcleo fijo [1 4 6 4 1] / 16, borde REFLECT_101.
  V.gauss5 = img => separableEntero(img, [1, 4, 6, 4, 1], 4, reflect101);

  // Gaussiano con sigma derivado del tamaño (como getGaussianKernel con sigma <= 0), borde REPLICATE.
  function gaussTam(img, n) {
    const sigma = 0.3 * ((n - 1) * 0.5 - 1) + 0.8, r = n >> 1, k = [];
    let s = 0;
    for (let i = 0; i < n; i++) { const v = Math.exp(-((i - r) ** 2) / (2 * sigma * sigma)); k.push(v); s += v; }
    for (let i = 0; i < n; i++) k[i] /= s;
    const { w, h, d } = img, tmp = new Float64Array(w * h), out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let a = 0;
      for (let t = -r; t <= r; t++) a += k[t + r] * d[y * w + replicar(x + t, w)];
      tmp[y * w + x] = a;
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let a = 0;
      for (let t = -r; t <= r; t++) a += k[t + r] * tmp[replicar(y + t, h) * w + x];
      out[y * w + x] = Math.min(255, Math.round(a));
    }
    return { w, h, d: out };
  }

  // Umbral de Otsu, igual que getThreshVal_Otsu_8u de OpenCV.
  V.otsu = img => {
    const hist = new Float64Array(256), N = img.d.length;
    for (const v of img.d) hist[v]++;
    let mu = 0;
    for (let i = 0; i < 256; i++) { hist[i] /= N; mu += i * hist[i]; }
    let q1 = 0, mu1 = 0, maxS = 0, maxV = 0;
    const EPS = 1.1920929e-7;
    for (let i = 0; i < 256; i++) {
      const p = hist[i];
      mu1 *= q1; q1 += p;
      const q2 = 1 - q1;
      if (Math.min(q1, q2) < EPS || Math.max(q1, q2) > 1 - EPS) continue;
      mu1 = (mu1 + i * p) / q1;
      const mu2 = (mu - q1 * mu1) / q2, s = q1 * q2 * (mu1 - mu2) ** 2;
      if (s > maxS) { maxS = s; maxV = i; }
    }
    return maxV;
  };
  V.umbral = (img, t) => ({ w: img.w, h: img.h, d: img.d.map(v => (v > t ? 255 : 0)) });

  // Elementos estructurantes como cv2.getStructuringElement.
  V.rect = (kw, kh) => ({ kw, kh, m: new Uint8Array(kw * kh).fill(1) });
  V.elipse = k => {
    const m = new Uint8Array(k * k), r = k >> 1, c = r, inv = r ? 1 / (r * r) : 0;
    for (let i = 0; i < k; i++) {
      const dy = i - r;
      if (Math.abs(dy) > r) continue;
      const dx = Math.round(c * Math.sqrt((r * r - dy * dy) * inv));
      for (let j = Math.max(c - dx, 0); j < Math.min(c + dx + 1, k); j++) m[i * k + j] = 1;
    }
    return { kw: k, kh: k, m };
  };
  // Rectángulo lleno: mínimo/máximo separable (mismo resultado, mucho más rápido).
  function morfoRect(img, se, esErosion) {
    const { w, h, d } = img, ax = se.kw >> 1, ay = se.kh >> 1, tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
    const pasada = (src, dst, n, paso, filas, filaPaso, a, k) => {
      for (let f = 0; f < filas; f++) {
        const base = f * filaPaso;
        for (let i = 0; i < n; i++) {
          const i0 = i - a < 0 ? 0 : i - a, i1 = i - a + k - 1 >= n ? n - 1 : i - a + k - 1;
          let v = esErosion ? 255 : 0;
          for (let t = i0; t <= i1; t++) { const p = src[base + t * paso]; if (esErosion ? p < v : p > v) v = p; }
          dst[base + i * paso] = v;
        }
      }
    };
    pasada(d, tmp, w, 1, h, w, ax, se.kw);
    pasada(tmp, out, h, w, w, 1, ay, se.kh);
    return { w, h, d: out };
  }
  function morfo(img, se, esErosion) {
    if (se.m.every(Boolean)) return morfoRect(img, se, esErosion);
    const { w, h, d } = img, out = new Uint8Array(w * h), ax = se.kw >> 1, ay = se.kh >> 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = esErosion ? 255 : 0;
      for (let j = 0; j < se.kh; j++) {
        const yy = y + j - ay;
        if (yy < 0 || yy >= h) continue;
        for (let i = 0; i < se.kw; i++) {
          if (!se.m[j * se.kw + i]) continue;
          const xx = x + i - ax;
          if (xx < 0 || xx >= w) continue;
          const p = d[yy * w + xx];
          if (esErosion ? p < v : p > v) v = p;
        }
      }
      out[y * w + x] = v;
    }
    return { w, h, d: out };
  }
  V.erosion = (img, se) => morfo(img, se, true);
  V.dilatacion = (img, se) => morfo(img, se, false);
  V.apertura = (img, se) => V.dilatacion(V.erosion(img, se), se);
  V.clausura = (img, se) => V.erosion(V.dilatacion(img, se), se);

  // cv2.connectedComponentsWithStats: etiquetas en orden de aparición (barrido por filas).
  V.componentes = (fg, w, h, conectividad = 8) => {
    const lab = new Int32Array(w * h), stats = [null], cola = new Int32Array(w * h);
    const vec = conectividad === 8 ? [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] : [[0, -1], [-1, 0], [1, 0], [0, 1]];
    for (let p = 0; p < w * h; p++) {
      if (!fg[p] || lab[p]) continue;
      const id = stats.length;
      let x0 = w, y0 = h, x1 = -1, y1 = -1, area = 0, sx = 0, sy = 0, a = 0, b = 0;
      lab[p] = id; cola[b++] = p;
      while (a < b) {
        const q = cola[a++], x = q % w, y = (q - x) / w;
        area++; sx += x; sy += y;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        for (const [dx, dy] of vec) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const n = ny * w + nx;
          if (fg[n] && !lab[n]) { lab[n] = id; cola[b++] = n; }
        }
      }
      stats.push({ x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, area, cx: sx / area, cy: sy / area });
    }
    return { lab, stats };
  };

  // Contornos externos (cv2.findContours con RETR_EXTERNAL): área y perímetro de cada borde.
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  function dirDe(dx, dy) { for (let i = 0; i < 8; i++) if (DIRS[i][0] === dx && DIRS[i][1] === dy) return i; return 4; }
  function trazarBorde(fg, w, h, inicio) {
    const en = (x, y) => x >= 0 && y >= 0 && x < w && y < h && fg[y * w + x];
    const x0 = inicio % w, y0 = (inicio - x0) / w, pts = [[x0, y0]];
    const siguiente = (bx, by, dc) => {
      for (let k = 0; k < 8; k++) {
        const d = (dc + k) % 8, nx = bx + DIRS[d][0], ny = by + DIRS[d][1];
        if (en(nx, ny)) {
          const pd = (dc + k + 7) % 8, cx = bx + DIRS[pd][0], cy = by + DIRS[pd][1];
          return [nx, ny, dirDe(cx - nx, cy - ny)];
        }
      }
      return null;
    };
    const primero = siguiente(x0, y0, 4);
    if (!primero) return pts;
    let [bx, by, dc] = primero;
    const [x1, y1] = primero;
    for (let guard = 0; guard < 4 * w * h; guard++) {
      if (bx === x0 && by === y0) {
        const n = siguiente(bx, by, dc);
        if (n[0] === x1 && n[1] === y1) break;
      }
      pts.push([bx, by]);
      [bx, by, dc] = siguiente(bx, by, dc);
    }
    return pts;
  }
  V.contornosExternos = (fg, w, h) => {
    // Fondo conectado al exterior (4-conectividad): un objeto rodeado por otro no es externo.
    const fuera = new Uint8Array(w * h), cola = new Int32Array(w * h);
    let a = 0, b = 0;
    const sembrar = p => { if (!fg[p] && !fuera[p]) { fuera[p] = 1; cola[b++] = p; } };
    for (let x = 0; x < w; x++) { sembrar(x); sembrar((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { sembrar(y * w); sembrar(y * w + w - 1); }
    while (a < b) {
      const q = cola[a++], x = q % w, y = (q - x) / w;
      if (x > 0) sembrar(q - 1); if (x < w - 1) sembrar(q + 1); if (y > 0) sembrar(q - w); if (y < h - 1) sembrar(q + w);
    }
    const { lab, stats } = V.componentes(fg, w, h, 8), externo = new Uint8Array(stats.length), inicio = new Int32Array(stats.length).fill(-1);
    for (let p = 0; p < w * h; p++) {
      const l = lab[p];
      if (!l) continue;
      if (inicio[l] < 0) inicio[l] = p;
      if (externo[l]) continue;
      const x = p % w, y = (p - x) / w;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || fuera[p - 1] || fuera[p + 1] || fuera[p - w] || fuera[p + w]) externo[l] = 1;
    }
    const res = [];
    for (let l = 1; l < stats.length; l++) {
      if (!externo[l]) continue;
      const pts = trazarBorde(fg, w, h, inicio[l]);
      let area = 0, per = 0;
      for (let i = 0; i < pts.length; i++) {
        const [xa, ya] = pts[i], [xb, yb] = pts[(i + 1) % pts.length];
        area += xa * yb - xb * ya;
        per += Math.hypot(xb - xa, yb - ya);
      }
      res.push({ area: Math.abs(area) / 2, perimetro: pts.length > 1 ? per : 0, x: stats[l].x, y: stats[l].y, w: stats[l].w, h: stats[l].h });
    }
    return res;
  };

  // ---------- TP1 · Ejercicio 1: ecualización local de histograma ----------
  V.ecualizarLocal = (img, kw, kh) => {
    const blur = V.gauss5(img), { w, h } = img, mw = kw >> 1, mh = kh >> 1;
    const pw = w + 2 * mw, ph = h + 2 * mh, pad = new Uint8Array(pw * ph);
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) pad[y * pw + x] = blur.d[replicar(y - mh, h) * w + replicar(x - mw, w)];
    const out = new Uint8Array(w * h), hist = new Int32Array(256), N = kw * kh;
    const f = Math.fround;
    for (let i = 0; i < h; i++) {
      hist.fill(0);
      for (let y = i; y < i + kh; y++) for (let x = 0; x < kw; x++) hist[pad[y * pw + x]]++;
      for (let j = 0; j < w; j++) {
        if (j > 0) for (let y = i; y < i + kh; y++) { hist[pad[y * pw + j - 1]]--; hist[pad[y * pw + j + kw - 1]]++; }
        const v = pad[(i + mh) * pw + j + mw];
        let acc = 0;
        for (let t = 0; t <= v; t++) acc = f(acc + f(hist[t] / N));
        out[i * w + j] = Math.min(255, Math.trunc(f(acc * 255)));
      }
    }
    return { w, h, d: out };
  };
  V.histograma = img => { const hh = new Uint32Array(256); for (const v of img.d) hh[v]++; return hh; };

  // ---------- TP1 · Ejercicio 2: validación de formularios ----------
  function grupos(arr) {
    const g = [];
    for (const v of arr) { if (g.length && g[g.length - 1][0] === v) g[g.length - 1][1]++; else g.push([v, 1]); }
    return g;
  }
  function contarElementos(oscuro, w, h, umbral) {
    const proy = [];
    for (let x = 0; x < w; x++) { let a = false; for (let y = 0; y < h && !a; y++) a = !!oscuro[y * w + x]; proy.push(a); }
    const g = grupos(proy);
    if (!g.length) return 0;
    const medio = g.slice(1, -1).map(([v, c]) => (!v && c < umbral ? [true, c] : [v, c]));
    const limpio = [g[0], ...medio, g[g.length - 1]].flatMap(([v, c]) => Array(c).fill(v));
    return grupos(limpio).filter(([v]) => v).length;
  }
  function validarTexto(campo, c) {
    if (!campo || !campo.w || !campo.h) return false;
    const palabras = contarElementos(campo.d, campo.w, campo.h, 10);
    const caracteres = contarElementos(campo.d, campo.w, campo.h, 1) + palabras - 1;
    return c.minC <= caracteres && caracteres <= c.maxC && c.minP <= palabras && palabras <= c.maxP;
  }
  function filasDetectadas(oscuro, w, h, desde, hasta, eje, umbralSuma, distMin) {
    // np.diff sobre booleanos = XOR entre filas (eje 0) o columnas (eje 1) vecinas.
    const idx = [];
    if (eje === 0) {
      for (let y = desde; y < hasta - 1; y++) { let s = 0; for (let x = 0; x < w; x++) s += oscuro[y * w + x] !== oscuro[(y + 1) * w + x]; if (s > umbralSuma) idx.push(y - desde); }
    } else {
      for (let x = 0; x < w - 1; x++) { let s = 0; for (let y = desde; y < hasta; y++) s += oscuro[y * w + x] !== oscuro[y * w + x + 1]; if (s >= umbralSuma) idx.push(x); }
    }
    return idx.filter((v, i) => i === idx.length - 1 || idx[i + 1] - v > distMin);
  }
  V.analizarFormulario = img => {
    const { w, h, d } = img, oscuro = d.map(v => (v <= 150 ? 1 : 0)), campos = {}, cajas = [];
    const filas = filasDetectadas(oscuro, w, h, 0, h, 0, 900, 10);
    const nombres = { '1,1': 'nombre', '2,1': 'edad', '3,1': 'mail', '4,1': 'legajo', '6,1': 'preg1_si', '6,2': 'preg1_no', '7,1': 'preg2_si', '7,2': 'preg2_no', '8,1': 'preg3_si', '8,2': 'preg3_no', '9,1': 'comentario' };
    for (let i = 0; i + 1 < filas.length; i++) {
      const y0 = filas[i], y1 = filas[i + 1];
      const cols = filasDetectadas(oscuro, w, h, y0, y1, 1, 30, 2);
      if (cols.length < 2) continue;
      for (let j = 0; j + 1 < cols.length; j++) {
        const nombre = nombres[`${i},${j}`];
        if (!nombre) continue;
        const top = y0 + 2, bottom = y1 - 1, left = cols[j] + 1, right = cols[j + 1];
        const cw = Math.max(0, right - left), ch = Math.max(0, bottom - top), cd = new Uint8Array(cw * ch);
        for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) cd[y * cw + x] = oscuro[(top + y) * w + left + x];
        campos[nombre] = { w: cw, h: ch, d: cd };
        cajas.push({ nombre, x: left, y: top, w: cw, h: ch });
      }
    }
    const C = {
      nombre: { minP: 2, maxP: Infinity, minC: 1, maxC: 25 }, edad: { minP: 1, maxP: 1, minC: 2, maxC: 3 },
      mail: { minP: 1, maxP: 1, minC: 1, maxC: 25 }, legajo: { minP: 1, maxP: 1, minC: 8, maxC: 8 },
      preg: { minP: 1, maxP: 1, minC: 1, maxC: 1 }, comentario: { minP: 1, maxP: Infinity, minC: 1, maxC: 25 },
    };
    const ok = b => (b ? 'OK' : 'MAL'), uno = (a, b) => (a && !b) || (b && !a);
    const res = {
      'Nombre y apellido': ok(validarTexto(campos.nombre, C.nombre)),
      Edad: ok(validarTexto(campos.edad, C.edad)),
      Mail: ok(validarTexto(campos.mail, C.mail)),
      Legajo: ok(validarTexto(campos.legajo, C.legajo)),
    };
    for (const n of [1, 2, 3]) res[`Pregunta ${n}`] = ok(uno(validarTexto(campos[`preg${n}_si`], C.preg), validarTexto(campos[`preg${n}_no`], C.preg)));
    res.Comentarios = ok(validarTexto(campos.comentario, C.comentario));
    const campoDe = { 'Nombre y apellido': ['nombre'], Edad: ['edad'], Mail: ['mail'], Legajo: ['legajo'], 'Pregunta 1': ['preg1_si', 'preg1_no'], 'Pregunta 2': ['preg2_si', 'preg2_no'], 'Pregunta 3': ['preg3_si', 'preg3_no'], Comentarios: ['comentario'] };
    for (const c of cajas) c.ok = res[Object.keys(campoDe).find(k => campoDe[k].includes(c.nombre))] === 'OK';
    return { tipo: tipoFormulario(img), resultados: res, cajas };
  };
  function tipoFormulario(img) {
    const { w } = img, y0 = 5, hh = 40, fg = new Uint8Array(w * hh);
    for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) fg[y * w + x] = img.d[(y0 + y) * w + x] < 150 ? 1 : 0;
    const { lab, stats } = V.componentes(fg, w, hh, 8);
    const validas = [];
    for (let i = 1; i < stats.length; i++) {
      const s = stats[i], ratio = s.h > 0 ? s.w / s.h : 0;
      if (s.area > 45 && s.area < 600 && ratio < 3.5 && s.h > 7) validas.push(i);
    }
    if (!validas.length) return 'desconocido';
    validas.sort((a, b) => stats[a].x - stats[b].x);
    const l = validas[validas.length - 1], s = stats[l], perfil = [];
    for (let y = s.y; y < s.y + s.h; y++) { let c = 0; for (let x = s.x; x < s.x + s.w; x++) c += lab[y * w + x] === l; perfil.push(c); }
    const max = Math.max(...perfil);
    if (max <= 0) return 'desconocido';
    const n = perfil.map(v => v / max), t = Math.floor(n.length / 3), media = a => a.reduce((x, y) => x + y, 0) / a.length;
    const sup = t > 0 ? media(n.slice(0, t)) : 0, inf = t > 0 ? media(n.slice(2 * t)) : 0;
    const rel = sup > 0.1 ? inf / sup : 1;
    return rel >= 1.15 ? 'A' : rel >= 0.4 ? 'B' : 'C';
  }

  // ---------- TP2 · Ejercicio 2: caracteres de patentes ----------
  V.PARAMS_PATENTES = [
    { t: 160, area: [80, 30], asp: [1.2, 2.5], dist: 43 }, { t: 100, area: [80, 30], asp: [1.2, 2.5], dist: 43 },
    { t: 120, area: [180, 5], asp: [1, 5], dist: 43 }, { t: 160, area: [80, 30], asp: [1.2, 2.5], dist: 43 },
    { t: 160, area: [80, 30], asp: [1.2, 2.8], dist: 30 }, { t: 110, area: [100, 30], asp: [1.2, 2.8], dist: 30 },
    { t: 110, area: [100, 10], asp: [1.2, 2.8], dist: 30 }, { t: 140, area: [100, 10], asp: [1.2, 2.8], dist: 30 },
    { t: 100, area: [100, 15], asp: [1.2, 2.8], dist: 30 }, { t: 130, area: [100, 30], asp: [1.2, 2.5], dist: 30 },
    { t: 133, area: [100, 30], asp: [1.2, 2.5], dist: 30 }, { t: 100, area: [100, 15], asp: [1.8, 2.5], dist: 30 },
  ];
  V.segmentarPatente = (img, p) => {
    const fg = img.d.map(v => (v > p.t ? 1 : 0)), { stats } = V.componentes(fg, img.w, img.h, 8);
    const [amax, amin] = p.area, [smin, smax] = p.asp, filtro1 = [];
    for (let j = 1; j < stats.length; j++) {
      const s = stats[j], asp = s.h / s.w;
      if (amin < s.area && s.area < amax && smin < asp && asp < smax) filtro1.push(s);
    }
    const caracteres = filtro1.filter(s => filtro1.some(o => o !== s && Math.hypot(s.cx - o.cx, s.cy - o.cy) < p.dist));
    return { filtro1, caracteres, componentes: stats.length - 1 };
  };

  // ---------- TP3: dados en video ----------
  V.reducirMitad = (rgba, w, h) => {
    const W = Math.floor(w / 2), H = Math.floor(h / 2), out = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) {
      const a = ((2 * y) * w + 2 * x) * 4 + c, b = ((2 * y + 1) * w + 2 * x) * 4 + c;
      out[(y * W + x) * 4 + c] = (rgba[a] + rgba[a + 4] + rgba[b] + rgba[b + 4] + 2) >> 2;
    }
    return { rgba: out, w: W, h: H };
  };
  V.segmentarDados = (rgba, w, h) => {
    const roj = new Uint8Array(w * h);
    for (let i = 0, j = 0; i < roj.length; i++, j += 4) roj[i] = Math.max(0, rgba[j] - Math.max(rgba[j + 1], rgba[j + 2]));
    const blur = V.gauss5({ w, h, d: roj }), t = V.otsu(blur);
    let bin = V.umbral(blur, t), blancos = 0;
    for (const v of bin.d) blancos += v === 255;
    const ratio = blancos / bin.d.length;
    if (ratio < 0.001 || ratio > 0.35) {
      const r = new Uint8Array(w * h);
      for (let i = 0; i < r.length; i++) r[i] = rgba[i * 4] > 70 ? 255 : 0;
      bin = { w, h, d: r };
    }
    const k = V.rect(3, 3);
    return V.clausura(V.apertura(bin, k), k);
  };
  V.detectarDados = (rgba, w, h) => {
    const bin = V.segmentarDados(rgba, w, h), { stats } = V.componentes(bin.d, w, h, 8), cands = [];
    for (let i = 1; i < stats.length; i++) {
      const s = stats[i], ratio = s.h / s.w, areaBox = s.w * s.h;
      if (!(ratio > 0.65 && ratio < 1.35)) continue;
      if (s.area / areaBox < 0.14) continue;
      if (areaBox < 100 || areaBox > 10000) continue;
      cands.push({ x: s.x, y: s.y, w: s.w, h: s.h, areaBox });
    }
    if (cands.length < 5) return { dados: [], bin };
    const areas = cands.map(c => c.areaBox).sort((a, b) => a - b), m = areas.length >> 1;
    const med = areas.length % 2 ? areas[m] : (areas[m - 1] + areas[m]) / 2;
    const top = cands.map(c => ({ rel: Math.abs(c.areaBox - med) / (med + 1e-6), c }))
      .sort((a, b) => a.rel - b.rel).slice(0, 5).map(t => t.c).sort((a, b) => a.x - b.x);
    return { dados: top, bin };
  };
  V.contarPuntos = (rgba, W, caja) => {
    const { x: X, y: Y, w, h } = caja;
    if (!w || !h) return 0;
    const gray = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const j = ((Y + y) * W + X + x) * 4;
      gray[y * w + x] = (rgba[j] * 4899 + rgba[j + 1] * 9617 + rgba[j + 2] * 1868 + 8192) >> 14;
    }
    const bloque = Math.max(11, Math.floor(Math.min(w, h) / 6) | 1), media = gaussTam({ w, h, d: gray }, bloque);
    const m = Math.trunc(Math.max(2, Math.min(w, h) * 0.10)), bw = new Uint8Array(w * h);
    for (let y = m; y < h - m; y++) for (let x = m; x < w - m; x++) { const i = y * w + x; bw[i] = gray[i] - media.d[i] > 5 ? 255 : 0; }
    let k2 = Math.max(3, Math.trunc(Math.min(w, h) * 0.04));
    if (k2 % 2 === 0) k2++;
    const limpio = V.apertura({ w, h, d: bw }, V.elipse(k2));
    const area = w * h, amin = area * 0.011, amax = area * 0.096;
    let pts = 0;
    for (const c of V.contornosExternos(limpio.d, w, h)) {
      if (!(amin <= c.area && c.area <= amax) || c.perimetro <= 1e-6) continue;
      if (4 * Math.PI * c.area / (c.perimetro * c.perimetro) >= 0.74) pts++;
    }
    return pts;
  };
  // Un cuadro completo: detección a media resolución y conteo sobre el cuadro original.
  V.analizarCuadro = (rgba, w, h) => {
    const chico = V.reducirMitad(rgba, w, h), { dados, bin } = V.detectarDados(chico.rgba, chico.w, chico.h);
    const cajas = dados.map(d => {
      const X = Math.max(0, Math.min(w - 1, Math.round(d.x / 0.5))), Y = Math.max(0, Math.min(h - 1, Math.round(d.y / 0.5)));
      return { x: X, y: Y, w: Math.max(1, Math.min(w - X, Math.round(d.w / 0.5))), h: Math.max(1, Math.min(h - Y, Math.round(d.h / 0.5))) };
    });
    const puntos = cajas.map(c => V.contarPuntos(rgba, w, c));
    return { cajas, puntos, bin, chico };
  };

  // ---------- Interfaz (solo en el navegador) ----------
  const BASE = 'assets/pdi/';
  const VIDEOS = [{ n: 1, frames: 146 }, { n: 2, frames: 145 }, { n: 3, frames: 146 }, { n: 4, frames: 88 }];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const espera = () => new Promise(r => setTimeout(r, 0));
  const cache = {};
  function cargarImagen(nombre) {
    if (!cache[nombre]) cache[nombre] = new Promise((ok, mal) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas');
        c.width = im.naturalWidth; c.height = im.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(im, 0, 0);
        const px = ctx.getImageData(0, 0, c.width, c.height);
        ok({ im, gris: V.gris(px.data, c.width, c.height) });
      };
      im.onerror = () => mal(new Error('No se pudo cargar ' + nombre));
      im.src = BASE + nombre;
    });
    return cache[nombre];
  }
  function pintarGris(canvas, img) {
    canvas.width = img.w; canvas.height = img.h;
    const ctx = canvas.getContext('2d'), out = ctx.createImageData(img.w, img.h);
    for (let i = 0; i < img.d.length; i++) { out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = img.d[i]; out.data[i * 4 + 3] = 255; }
    ctx.putImageData(out, 0, 0);
    return ctx;
  }
  function pintarHistograma(canvas, hist, color) {
    const w = canvas.width = 256, h = canvas.height = 90, ctx = canvas.getContext('2d'), max = Math.max(...hist);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    for (let i = 0; i < 256; i++) { const v = Math.round((hist[i] / max) * (h - 4)); ctx.fillRect(i, h - v, 1, v); }
  }
  const opciones = (n, sel, fmt) => Array.from({ length: n }, (_, i) => `<option value="${i + 1}"${i + 1 === sel ? ' selected' : ''}>${fmt(i + 1)}</option>`).join('');
  const dos = n => String(n).padStart(2, '0');

  const SUB = {
    eq: {
      titulo: 'Ecualización local',
      html: `<div class="demo-grid"><div class="panel"><div class="toolrow"><label class="vlabel">Ventana<select class="input" id="v-eq-k">${['5x5', '11x11', '21x21', '51x51', '111x111'].map(k => `<option${k === '21x21' ? ' selected' : ''}>${k}</option>`).join('')}</select></label><button class="btn primary small" id="v-eq-run">Ecualizar ↗</button></div><div class="vpair"><figure><canvas id="v-eq-a" class="vcanvas pixel"></canvas><figcaption>Original</figcaption></figure><figure><canvas id="v-eq-b" class="vcanvas pixel"></canvas><figcaption id="v-eq-cap">Ecualizada</figcaption></figure></div></div><div class="panel"><div class="eyebrow">Histogramas</div><canvas id="v-eq-h1" class="vhist"></canvas><p class="vnote">Original</p><canvas id="v-eq-h2" class="vhist"></canvas><p class="vnote">Ecualizada</p><div class="out" id="v-eq-out">Cada píxel se reemplaza por la distribución acumulada de su vecindario, después de un suavizado gaussiano de 5×5. Con ventanas medianas aparecen los detalles escondidos: un cuadrado, una línea diagonal, una letra «a», cuatro líneas horizontales y un círculo.</div></div></div>`,
      async iniciar() {
        const { gris } = await cargarImagen('detalles.png');
        pintarGris(document.getElementById('v-eq-a'), gris);
        pintarHistograma(document.getElementById('v-eq-h1'), V.histograma(gris), '#86654d');
        const correr = async () => {
          const k = +document.getElementById('v-eq-k').value.split('x')[0];
          document.getElementById('v-eq-cap').textContent = 'Calculando…';
          await espera();
          const t = performance.now(), out = V.ecualizarLocal(gris, k, k), ms = Math.round(performance.now() - t);
          pintarGris(document.getElementById('v-eq-b'), out);
          pintarHistograma(document.getElementById('v-eq-h2'), V.histograma(out), '#47543d');
          document.getElementById('v-eq-cap').textContent = `Ecualizada · ventana ${k}×${k} · ${ms} ms`;
        };
        document.getElementById('v-eq-run').onclick = correr;
        document.getElementById('v-eq-k').onchange = correr;
        await correr();
      },
    },
    form: {
      titulo: 'Formularios',
      html: `<div class="demo-grid"><div class="panel"><div class="toolrow"><label class="vlabel">Formulario<select class="input" id="v-form-n">${opciones(5, 1, n => 'formulario_' + dos(n))}</select></label></div><canvas id="v-form-c" class="vcanvas"></canvas><p class="vnote">Verde: campo válido · rojo: campo inválido.</p></div><div class="panel"><div class="eyebrow">Validación</div><div class="metric" id="v-form-m">—</div><div class="out" id="v-form-out"></div></div></div>`,
      async iniciar() {
        const correr = async () => {
          const n = +document.getElementById('v-form-n').value, { gris } = await cargarImagen(`formulario_${dos(n)}.png`);
          const r = V.analizarFormulario(gris), ctx = pintarGris(document.getElementById('v-form-c'), gris);
          ctx.lineWidth = 2;
          for (const c of r.cajas) { ctx.strokeStyle = c.ok ? '#3f8f4f' : '#c0392b'; ctx.fillStyle = c.ok ? 'rgba(63,143,79,.12)' : 'rgba(192,57,43,.12)'; ctx.fillRect(c.x, c.y, c.w, c.h); ctx.strokeRect(c.x, c.y, c.w, c.h); }
          const todos = Object.values(r.resultados).every(v => v === 'OK');
          document.getElementById('v-form-m').textContent = `Tipo ${r.tipo} · ${todos ? 'Correcto' : 'Con errores'}`;
          document.getElementById('v-form-out').textContent = Object.entries(r.resultados).map(([k, v]) => `${v === 'OK' ? '✓' : '✗'} ${k.padEnd(18)} ${v}`).join('\n') +
            '\n\nLas filas y columnas del formulario se ubican por cambios bruscos en las proyecciones; en cada campo se cuentan caracteres y palabras por los huecos entre columnas con tinta. El tipo (A, B o C) sale del perfil de la letra del encabezado.';
        };
        document.getElementById('v-form-n').onchange = correr;
        await correr();
      },
    },
    patente: {
      titulo: 'Patentes',
      html: `<div class="demo-grid"><div class="panel"><div class="toolrow"><label class="vlabel">Imagen<select class="input" id="v-pat-n">${opciones(12, 1, n => 'img' + dos(n))}</select></label><label class="vcheck"><input type="checkbox" id="v-pat-f1"> Ver descartes del primer filtro</label></div><canvas id="v-pat-c" class="vcanvas"></canvas></div><div class="panel"><div class="eyebrow">Caracteres encontrados</div><div class="metric" id="v-pat-m">—</div><canvas id="v-pat-z" class="vcanvas pixel" aria-label="Zoom sobre la patente"></canvas><div class="out" id="v-pat-out"></div></div></div>`,
      async iniciar() {
        const correr = async () => {
          const n = +document.getElementById('v-pat-n').value, p = V.PARAMS_PATENTES[n - 1], { gris } = await cargarImagen(`img${dos(n)}.png`);
          const r = V.segmentarPatente(gris, p), ctx = pintarGris(document.getElementById('v-pat-c'), gris);
          if (document.getElementById('v-pat-f1').checked) {
            ctx.strokeStyle = '#d4a017'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
            for (const s of r.filtro1) if (!r.caracteres.includes(s)) ctx.strokeRect(s.x - 1.5, s.y - 1.5, s.w + 3, s.h + 3);
            ctx.setLineDash([]);
          }
          ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 2;
          for (const s of r.caracteres) ctx.strokeRect(s.x - 1.5, s.y - 1.5, s.w + 3, s.h + 3);
          const z = document.getElementById('v-pat-z');
          if (r.caracteres.length) {
            const x0 = Math.max(0, Math.min(...r.caracteres.map(c => c.x)) - 12), y0 = Math.max(0, Math.min(...r.caracteres.map(c => c.y)) - 12);
            const x1 = Math.min(gris.w, Math.max(...r.caracteres.map(c => c.x + c.w)) + 12), y1 = Math.min(gris.h, Math.max(...r.caracteres.map(c => c.y + c.h)) + 12);
            z.width = (x1 - x0) * 4; z.height = (y1 - y0) * 4; z.style.display = '';
            const zc = z.getContext('2d'); zc.imageSmoothingEnabled = false;
            zc.drawImage(document.getElementById('v-pat-c'), x0, y0, x1 - x0, y1 - y0, 0, 0, z.width, z.height);
          } else z.style.display = 'none';
          document.getElementById('v-pat-m').textContent = `${r.caracteres.length} caracteres`;
          document.getElementById('v-pat-out').textContent = `Umbral: ${p.t}\nComponentes conectados: ${r.componentes}\nPasan área (${p.area[1]}–${p.area[0]} px) y alto/ancho (${p.asp[0]}–${p.asp[1]}): ${r.filtro1.length}\nTienen un vecino a menos de ${p.dist} px: ${r.caracteres.length}\n\nLos parámetros son los ajustados en el TP para cada foto.`;
        };
        document.getElementById('v-pat-n').onchange = correr;
        document.getElementById('v-pat-f1').onchange = correr;
        await correr();
      },
    },
    dados: {
      titulo: 'Dados en video',
      html: `<div class="demo-grid"><div class="panel"><div class="toolrow"><label class="vlabel">Tirada<select class="input" id="v-dad-n">${opciones(4, 1, n => 'tirada_' + n)}</select></label><button class="btn primary small" id="v-dad-run">Analizar tirada ↗</button></div><div class="vpair"><figure><video id="v-dad-v" class="vcanvas" muted playsinline controls preload="metadata"></video><figcaption>Video original</figcaption></figure><figure><canvas id="v-dad-c" class="vcanvas"></canvas><figcaption id="v-dad-cap">Cuadro analizado</figcaption></figure></div></div><div class="panel"><div class="eyebrow">Resultado</div><div class="metric" id="v-dad-m">—</div><div class="out" id="v-dad-out">Tocá «Analizar tirada». Se recorre la segunda mitad del video, donde los dados ya frenaron, y se elige el cuadro con cinco dados válidos y más puntos.</div></div></div>`,
      async iniciar() {
        const video = document.getElementById('v-dad-v'), sel = document.getElementById('v-dad-n');
        const cargar = () => { video.src = `${BASE}tirada_${sel.value}.mp4`; document.getElementById('v-dad-m').textContent = '—'; };
        sel.onchange = cargar; cargar();
        const lienzo = document.getElementById('v-dad-c'), boton = document.getElementById('v-dad-run'), log = document.getElementById('v-dad-out');
        const dibujar = (src, w, h, cajas, puntos, color) => {
          const esc2 = 360 / w;
          lienzo.width = 360; lienzo.height = Math.round(h * esc2);
          const ctx = lienzo.getContext('2d');
          ctx.drawImage(src, 0, 0, lienzo.width, lienzo.height);
          ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2; ctx.font = 'bold 15px sans-serif';
          cajas.forEach((c, i) => { ctx.strokeRect(c.x * esc2, c.y * esc2, c.w * esc2, c.h * esc2); ctx.fillText(String(puntos[i]), c.x * esc2, c.y * esc2 - 4); });
        };
        boton.onclick = async () => {
          boton.disabled = true;
          const { frames } = VIDEOS[sel.value - 1], fps = 30, paso = Math.max(3, Math.trunc(fps * 0.14));
          if (video.readyState < 1) await new Promise(ok => video.addEventListener('loadedmetadata', ok, { once: true }));
          video.pause();
          const w = video.videoWidth, h = video.videoHeight, tmp = document.createElement('canvas');
          tmp.width = w; tmp.height = h;
          const ctx = tmp.getContext('2d', { willReadFrequently: true }), lineas = [];
          let mejor = null;
          const analizar = f => {
            ctx.drawImage(video, 0, 0, w, h);
            const r = V.analizarCuadro(ctx.getImageData(0, 0, w, h).data, w, h);
            const valido = r.cajas.length === 5 && r.puntos.every(p => p >= 1 && p <= 6), total = r.puntos.reduce((a, b) => a + b, 0);
            lineas.push(`Cuadro ${f}: ${r.cajas.length === 5 ? `puntos [${r.puntos.join(', ')}]${valido ? '' : ' · descartado'}` : 'no hay cinco dados quietos'}`);
            dibujar(tmp, w, h, r.cajas, r.puntos, valido ? '#f1c40f' : '#95a5a6');
            document.getElementById('v-dad-cap').textContent = `Analizando cuadro ${f}…`;
            log.textContent = lineas.join('\n');
            if (valido && (!mejor || total > mejor.total)) {
              const copia = document.createElement('canvas'); copia.width = w; copia.height = h; copia.getContext('2d').drawImage(tmp, 0, 0);
              mejor = { f, total, cajas: r.cajas, puntos: r.puntos, copia };
            }
          };
          // Se reproduce la segunda mitad y se pausa en cada cuadro a analizar (cada `paso` cuadros, como el TP).
          // Buscar cuadro por cuadro con currentTime no siempre actualiza la imagen que se dibuja en el canvas.
          const inicio = Math.trunc(frames * 0.45), limite = Math.min(frames, Math.trunc(frames * 0.95));
          await new Promise(fin => {
            let objetivo = inicio, terminado = false;
            const cerrar = () => { if (!terminado) { terminado = true; video.pause(); fin(); } };
            const cb = async (_, md) => {
              if (terminado) return;
              const f = Math.round(md.mediaTime * fps);
              if (f >= limite) return cerrar();
              if (f >= objetivo) {
                video.pause();
                analizar(f);
                objetivo = f + paso;
                await espera();
                video.play();
              }
              video.requestVideoFrameCallback(cb);
            };
            video.addEventListener('ended', cerrar, { once: true });
            video.currentTime = Math.max(0, inicio - 1) / fps;
            video.requestVideoFrameCallback(cb);
            video.play().catch(cerrar);
          });
          if (mejor) {
            dibujar(mejor.copia, w, h, mejor.cajas, mejor.puntos, '#f1c40f');
            document.getElementById('v-dad-m').textContent = `${mejor.total} puntos`;
            document.getElementById('v-dad-cap').textContent = `Cuadro ${mejor.f}: ${mejor.puntos.join(' · ')}`;
            log.textContent = `Resultado: cuadro ${mejor.f}, 5 dados, puntos [${mejor.puntos.join(', ')}], total ${mejor.total}.\n\n` + lineas.join('\n');
            video.currentTime = (mejor.f + 0.5) / fps;
          } else {
            document.getElementById('v-dad-m').textContent = 'Sin resultado';
            log.textContent = 'No se encontró un cuadro con cinco dados válidos.\n\n' + lineas.join('\n');
          }
          boton.disabled = false;
        };
      },
    },
    monedas: {
      titulo: 'Monedas y dados',
      html: `<div class="demo-grid"><div class="panel"><div class="toolrow"><button class="btn small" id="v-mon-t">Ver original</button></div><img id="v-mon-img" class="vcanvas" src="${BASE}monedas_resultado.jpg" alt="Monedas y dados detectados: círculos naranjas para 10 centavos, verdes para 1 peso, azules para 50 centavos y recuadros amarillos en los dados" loading="lazy"></div><div class="panel"><div class="eyebrow">Conteo</div><div class="metric">$ 7,40</div><div class="out">10 centavos  ×9   $ 0,90\n1 peso       ×5   $ 5,00\n50 centavos  ×3   $ 1,50\n\nDados: 5 y 3\n\nPipeline: suavizado gaussiano, Canny, clausura y dilatación, círculos de Hough y clasificación por radio. Los dados salen de los componentes grandes que quedan al tapar las monedas.</div><div class="notice">Este resultado se generó con el código original en Python: Canny y la transformada de Hough no se reimplementaron en el navegador.</div></div></div>`,
      iniciar() {
        const b = document.getElementById('v-mon-t'), im = document.getElementById('v-mon-img');
        b.onclick = () => { const orig = im.src.includes('original'); im.src = BASE + (orig ? 'monedas_resultado.jpg' : 'monedas_original.jpg'); b.textContent = orig ? 'Ver original' : 'Ver detección'; };
      },
    },
  };

  let abrirSub = null;
  V.montar = (contenedor, sub) => {
    if (!contenedor) return;
    if (contenedor.dataset.listo) { if (sub && SUB[sub]) abrirSub(sub); return; }
    contenedor.dataset.listo = '1';
    const tabs = contenedor.querySelector('.vtabs'), cuerpo = contenedor.querySelector('.vbody');
    tabs.innerHTML = Object.entries(SUB).map(([id, s], i) => `<button class="chip${i ? '' : ' active'}" data-v="${id}">${esc(s.titulo)}</button>`).join('');
    const abrir = id => {
      [...tabs.children].forEach(b => b.classList.toggle('active', b.dataset.v === id));
      cuerpo.innerHTML = SUB[id].html;
      Promise.resolve(SUB[id].iniciar()).catch(e => { cuerpo.insertAdjacentHTML('beforeend', `<p class="notice">${esc(e.message)}</p>`); });
    };
    tabs.onclick = e => { if (e.target.dataset.v) abrir(e.target.dataset.v); };
    abrirSub = abrir;
    abrir(sub && SUB[sub] ? sub : 'eq');
  };

  if (typeof module === 'object' && module.exports) module.exports = V;
  else root.Vision = V;
})(typeof window !== 'undefined' ? window : globalThis);
