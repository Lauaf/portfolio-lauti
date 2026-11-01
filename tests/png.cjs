// Decodificador PNG mínimo (8 bits, sin entrelazado) para las pruebas: gris, gris+alfa, RGB y RGBA.
const zlib = require('node:zlib');
const fs = require('node:fs');
module.exports = function leerPNG(ruta) {
  const buf = fs.readFileSync(ruta);
  let pos = 8, w, h, tipo, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), t = buf.toString('ascii', pos + 4, pos + 8), dat = buf.subarray(pos + 8, pos + 8 + len);
    if (t === 'IHDR') { w = dat.readUInt32BE(0); h = dat.readUInt32BE(4); tipo = dat[9]; if (dat[8] !== 8 || dat[12]) throw new Error('PNG no soportado'); }
    if (t === 'IDAT') idat.push(dat);
    pos += 12 + len;
  }
  const canales = { 0: 1, 4: 2, 2: 3, 6: 4 }[tipo], raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * canales;
  const px = new Uint8Array(w * h * canales);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], fila = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= canales ? px[y * stride + x - canales] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= canales && y ? px[(y - 1) * stride + x - canales] : 0;
      let v = fila[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const s = px.subarray(i * canales, (i + 1) * canales);
    if (canales <= 2) { rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = s[0]; rgba[i * 4 + 3] = canales === 2 ? s[1] : 255; }
    else { rgba[i * 4] = s[0]; rgba[i * 4 + 1] = s[1]; rgba[i * 4 + 2] = s[2]; rgba[i * 4 + 3] = canales === 4 ? s[3] : 255; }
  }
  return { w, h, rgba };
};
