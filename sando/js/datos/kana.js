// Hiragana y katakana organizados por filas (se desbloquean en orden).
const FILAS_H = [
  ['vocales', 'あ い う え お', 'a i u e o'],
  ['k', 'か き く け こ', 'ka ki ku ke ko'],
  ['s', 'さ し す せ そ', 'sa shi su se so'],
  ['t', 'た ち つ て と', 'ta chi tsu te to'],
  ['n', 'な に ぬ ね の', 'na ni nu ne no'],
  ['h', 'は ひ ふ へ ほ', 'ha hi fu he ho'],
  ['m', 'ま み む め も', 'ma mi mu me mo'],
  ['y', 'や ゆ よ', 'ya yu yo'],
  ['r', 'ら り る れ ろ', 'ra ri ru re ro'],
  ['w', 'わ を ん', 'wa wo n'],
  ['dakuten g/z', 'が ぎ ぐ げ ご ざ じ ず ぜ ぞ', 'ga gi gu ge go za ji zu ze zo'],
  ['dakuten d/b/p', 'だ ぢ づ で ど ば び ぶ べ ぼ ぱ ぴ ぷ ぺ ぽ', 'da ji zu de do ba bi bu be bo pa pi pu pe po'],
  ['combinados', 'きゃ きゅ きょ しゃ しゅ しょ ちゃ ちゅ ちょ にゃ にゅ にょ ひゃ ひゅ ひょ みゃ みゅ みょ りゃ りゅ りょ ぎゃ ぎゅ ぎょ じゃ じゅ じょ びゃ びゅ びょ ぴゃ ぴゅ ぴょ',
    'kya kyu kyo sha shu sho cha chu cho nya nyu nyo hya hyu hyo mya myu myo rya ryu ryo gya gyu gyo ja ju jo bya byu byo pya pyu pyo'],
];

const aKata = s => [...s].map(c => {
  const n = c.charCodeAt(0);
  return n >= 0x3041 && n <= 0x3096 ? String.fromCharCode(n + 0x60) : c;
}).join('');

function construir(tipo) {
  return FILAS_H.map(([nombre, kanas, romas], fila) => {
    const ks = kanas.split(' ');
    const rs = romas.split(' ');
    return {
      nombre, fila,
      kana: ks.map((k, i) => ({ k: tipo === 'k' ? aKata(k) : k, r: rs[i], tipo, fila })),
    };
  });
}

export const HIRAGANA = construir('h');
export const KATAKANA = construir('k');
export const todosKana = tipo => (tipo === 'k' ? KATAKANA : HIRAGANA).flatMap(f => f.kana);
export const claveKana = k => `kana:${k.tipo}:${k.k}`;

// Mnemotecnias en castellano para las básicas (ayudan mucho al principio).
export const MNEMO = {
  あ: 'Una "a"-guja atravesando una cruz', い: 'Dos palitos: "i"-guales', う: 'Una "u"-ña con una rayita arriba',
  え: 'Un "e"-nano con sombrero bailando', お: 'Un g"o"lfista con la pelota al costado', か: 'Un "ca"-ballero con espada',
  き: 'Una "lla-ki" (llave) con dos dientes', く: 'El pico de un pájaro: "cu-cu"', け: 'Un "ke"-tchup al lado de la pared',
  こ: 'Dos "co"-sas paralelas', さ: 'Un "sa"-ble chueco', し: 'Un anzuelo de pescar: "shi"', す: 'Un columpio con nudo: "su"-be y baja',
  せ: 'Una "se"-ñora con boca grande', そ: 'Un zig-zag: "so"-nrisa de rayo', た: 'Ta + "ta": la t y la a juntas',
  ち: 'Un "chi"-co sonriendo con la boca para el otro lado', つ: 'Una ola de "tsu"-nami', て: 'Una "te"-la colgando',
  と: 'Un dedo del pie con una astilla: "to"', な: 'Una monja rezando (nun): "na"', に: 'Una "ni"-ña al lado de un cartel',
  ぬ: 'Fideos con un palito: "nu"-dles', ね: 'Un gato ("neko") con la cola enrulada', の: 'Una señal de "no" pasar',
  は: 'Alguien riendo "ja-ja": "ha"', ひ: 'Una sonrisa "hi hi"', ふ: 'El monte "Fu"-ji', へ: 'Una montaña chiquita: "he"',
  ほ: 'Una casa con chimenea: "ho"-gar', ま: 'Un "ma"-stil con dos cruces', み: 'Un 21: "mi"', む: 'Una vaca diciendo "muu"',
  め: 'Un ojo ("me") con lágrima', も: 'Un anzuelo con "mo"-re carnada', や: 'Un "ya"-k con cuernos', ゆ: 'Un pez "yu"-ni',
  よ: 'Un "yo"-yo', ら: 'Un "ra"-pero con gorra', り: 'Juncos de un "ri"-o', る: 'Un "ru"-lo con moño al final',
  れ: 'Alguien arrodillado: "re"-zando', ろ: 'Un 3 sin moño: "ro"', わ: 'Una cascada de "wa"-ter', を: 'Alguien gritando "woah"',
  ん: 'Una "n" en cursiva',
};
