// Contenido N4–N3: vocabulario, gramática (completar el hueco) y charlas más naturales para los vecinos.

const LECCIONES = {
  'N4 · Sustantivos': `経験|けいけん|experiencia
準備|じゅんび|preparación
説明|せつめい|explicación
約束|やくそく|promesa, compromiso
予定|よてい|plan, agenda
趣味|しゅみ|hobby
景色|けしき|paisaje
研究|けんきゅう|investigación
試験|しけん|examen
意見|いけん|opinión
理由|りゆう|razón, motivo
世話|せわ|cuidado, atención
具合|ぐあい|estado, condición
味|あじ|sabor
匂い|におい|olor
香り|かおり|aroma`,
  'N4 · Adjetivos': `特別|とくべつ|especial
十分|じゅうぶん|suficiente
必要|ひつよう|necesario
安心|あんしん|tranquilidad, alivio
心配|しんぱい|preocupación
残念|ざんねん|una lástima
複雑|ふくざつ|complicado
簡単|かんたん|simple, fácil
丁寧|ていねい|cortés, prolijo
熱心|ねっしん|aplicado, entusiasta`,
  'N4 · Verbos': `集める|あつめる|juntar, reunir
届ける|とどける|entregar
調べる|しらべる|averiguar, investigar
比べる|くらべる|comparar
続ける|つづける|continuar
決める|きめる|decidir
変える|かえる|cambiar (algo)
間に合う|まにあう|llegar a tiempo
慣れる|なれる|acostumbrarse
壊れる|こわれる|romperse
遅れる|おくれる|llegar tarde
運ぶ|はこぶ|llevar, transportar
選ぶ|えらぶ|elegir
育てる|そだてる|criar, cultivar`,
  'N3 · Estudio y vida': `挑戦|ちょうせん|desafío
努力|どりょく|esfuerzo
成長|せいちょう|crecimiento
目標|もくひょう|objetivo, meta
習慣|しゅうかん|hábito
効果|こうか|efecto
影響|えいきょう|influencia
状態|じょうたい|estado, situación
基本|きほん|fundamento, lo básico
自信|じしん|confianza en uno mismo
緊張|きんちょう|nervios, tensión
感覚|かんかく|sensación, sentido
集中|しゅうちゅう|concentración
記憶|きおく|memoria
表現|ひょうげん|expresión
発音|はつおん|pronunciación
苦労|くろう|penurias, trabajo duro
我慢|がまん|aguante, paciencia
工夫|くふう|ingenio, idear una mejora`,
  'N3 · Verbos y adjetivos': `身につける|みにつける|adquirir (una habilidad)
諦める|あきらめる|rendirse, resignarse
繰り返す|くりかえす|repetir
覚える|おぼえる|memorizar, recordar
増える|ふえる|aumentar
減る|へる|disminuir
迷う|まよう|dudar, perderse
感じる|かんじる|sentir
伝える|つたえる|transmitir, comunicar
任せる|まかせる|dejar en manos de
支える|ささえる|sostener, apoyar
落ち着く|おちつく|calmarse
目指す|めざす|apuntar a, aspirar a
豊か|ゆたか|rico, abundante
穏やか|おだやか|apacible, sereno
確か|たしか|seguro, cierto
深い|ふかい|profundo`,
  'Café y piano en japonés': `淹れる|いれる|preparar (café, té)
挽く|ひく|moler
豆|まめ|grano (de café)
焙煎|ばいせん|tueste
深煎り|ふかいり|tueste oscuro
浅煎り|あさいり|tueste claro
蒸らす|むらす|dejar reposar al vapor (bloom)
濃い|こい|concentrado, intenso
薄い|うすい|aguado, ligero
苦味|にがみ|amargor
酸味|さんみ|acidez
香ばしい|こうばしい|con aroma tostado
鍵盤|けんばん|teclado (del piano)
楽譜|がくふ|partitura
指使い|ゆびづかい|digitación
両手|りょうて|ambas manos
演奏|えんそう|interpretación musical
和音|わおん|acorde
拍子|ひょうし|compás`,
};

export const VOCAB_AVANZADO = Object.entries(LECCIONES).flatMap(([leccion, txt]) =>
  txt.trim().split('\n').map(l => {
    const [p, r, s] = l.split('|');
    return { p, r, s, leccion, nivel: leccion.startsWith('N3') || leccion.startsWith('Café') ? 'n3' : 'n4' };
  }));
export const LECCIONES_AVANZADAS = Object.keys(LECCIONES);

// Gramática: s = oración con ＿＿, o = opciones (la 1ª es la correcta; se mezclan al mostrar)
export const GRAMATICA = [
  { n: 'n4', s: '毎日ピアノを練習する＿＿しています。', o: ['ように', 'ために', 'そうに', 'ことに'], es: 'Procuro practicar piano todos los días.', e: '～ようにする = procurar hacer algo, convertirlo en hábito.' },
  { n: 'n4', s: '来月から大阪で働く＿＿なりました。', o: ['ことに', 'ように', 'ために', 'はずに'], es: 'Se decidió que desde el mes que viene trabajo en Osaka.', e: '～ことになる = quedó decidido (no lo decidiste solo vos). ～ことにする = lo decidís vos.' },
  { n: 'n4', s: '空が暗いですね。雨が降り＿＿です。', o: ['そう', 'よう', 'らしい', 'みたい'], es: 'El cielo está oscuro. Parece que va a llover.', e: 'Raíz del verbo + そうだ = parece que está por pasar (por lo que se ve).' },
  { n: 'n4', s: 'このコーヒーは苦＿＿て、飲めません。', o: ['すぎ', 'そう', 'やすく', 'にくく'], es: 'Este café es demasiado amargo, no lo puedo tomar.', e: 'Raíz + すぎる = demasiado.' },
  { n: 'n4', s: '先生にほめ＿＿、うれしかったです。', o: ['られて', 'させて', 'させられて', 'てあげて'], es: 'Me elogió el profesor y me puse contento.', e: 'Pasiva: ほめる → ほめられる (recibir la acción).' },
  { n: 'n4', s: '母は子どもに野菜を食べ＿＿。', o: ['させました', 'られました', 'てくれました', 'たがりました'], es: 'La mamá hizo que el chico comiera verduras.', e: 'Causativa: 食べる → 食べさせる (hacer / dejar que alguien haga).' },
  { n: 'n4', s: '窓が開け＿＿あります。', o: ['て', 'た', 'る', 'ない'], es: 'La ventana está abierta (alguien la dejó así a propósito).', e: 'Verbo transitivo + てある = estado que quedó tras una acción intencional.' },
  { n: 'n4', s: '説明を聞いた＿＿、まだよく分かりません。', o: ['のに', 'ので', 'から', 'ために'], es: 'Aunque escuché la explicación, todavía no entiendo bien.', e: 'のに = aunque (con frustración o sorpresa).' },
  { n: 'n4', s: '日本で桜を見た＿＿がありますか。', o: ['こと', 'もの', 'の', 'ところ'], es: '¿Alguna vez viste los cerezos en Japón?', e: 'Forma た + ことがある = experiencia.' },
  { n: 'n4', s: '今、ちょうどコーヒーを淹れている＿＿です。', o: ['ところ', 'こと', 'はず', 'ばかり'], es: 'Justo estoy preparando café.', e: 'ている + ところ = justo en medio de la acción.' },
  { n: 'n4', s: '日本に来て＿＿、毎日日本語を話しています。', o: ['から', 'まで', 'ので', 'ながら'], es: 'Desde que vine a Japón hablo japonés todos los días.', e: 'て形 + から = después de / desde que.' },
  { n: 'n4', s: '音楽を聞き＿＿勉強します。', o: ['ながら', 'ために', 'まま', 'ところ'], es: 'Estudio mientras escucho música.', e: 'Raíz + ながら = mientras (dos acciones a la vez).' },
  { n: 'n4', s: '会議の前に資料をコピーして＿＿。', o: ['おきます', 'あります', 'います', 'しまいます'], es: 'Antes de la reunión dejo hechas las copias.', e: 'て + おく = hacer algo de antemano / dejarlo listo.' },
  { n: 'n4', s: '大事なカップを割って＿＿。', o: ['しまいました', 'おきました', 'ありました', 'みました'], es: 'Rompí (sin querer) la taza importante.', e: 'て + しまう = terminar haciendo algo (a menudo con arrepentimiento).' },
  { n: 'n3', s: '彼は来ると言っていたから、もうすぐ来る＿＿だ。', o: ['はず', 'わけ', 'よう', 'ばかり'], es: 'Dijo que venía, así que debería llegar pronto.', e: 'はずだ = debería (expectativa lógica).' },
  { n: 'n3', s: 'ピアノが上手な＿＿ではないけど、弾くのは好きだ。', o: ['わけ', 'はず', 'こと', 'もの'], es: 'No es que toque bien, pero me gusta tocar.', e: 'わけではない = no es que…' },
  { n: 'n3', s: '彼女は最近、甘いもの＿＿食べている。', o: ['ばかり', 'だけに', 'しか', 'さえ'], es: 'Últimamente ella no come más que cosas dulces.', e: 'ばかり = nada más que (con matiz de exceso). しか va con negativo.' },
  { n: 'n3', s: '練習すれば＿＿ほど、上手になる。', o: ['する', 'した', 'して', 'しよう'], es: 'Cuanto más practicás, mejor te sale.', e: '～ば～ほど = cuanto más…, más…' },
  { n: 'n3', s: '雨＿＿、試合は中止になった。', o: ['のせいで', 'のおかげで', 'にとって', 'について'], es: 'Por culpa de la lluvia se suspendió el partido.', e: 'せいで = por culpa de (negativo). おかげで = gracias a (positivo).' },
  { n: 'n3', s: '先生の＿＿、試験に合格できました。', o: ['おかげで', 'せいで', 'くせに', 'わりに'], es: 'Gracias al profesor pude aprobar el examen.', e: 'おかげで = gracias a.' },
  { n: 'n3', s: '私＿＿、音楽は生きがいだ。', o: ['にとって', 'について', 'によって', 'に対して'], es: 'Para mí, la música es mi razón de vivir.', e: 'にとって = para (desde el punto de vista de alguien).' },
  { n: 'n3', s: '初心者＿＿、上手に弾けますね。', o: ['にしては', 'として', 'にとって', 'ばかりか'], es: 'Para ser principiante, tocás muy bien.', e: 'にしては = para ser (contra lo que uno esperaría).' },
  { n: 'n3', s: 'この豆は値段の＿＿、おいしくない。', o: ['わりに', 'くせに', 'おかげで', 'ために'], es: 'Este café no es rico para lo caro que es.', e: 'わりに = para lo que es / en proporción a.' },
  { n: 'n3', s: '知っている＿＿、教えてくれなかった。', o: ['くせに', 'おかげで', 'ように', 'ことに'], es: '¡Lo sabía y encima no me lo dijo!', e: 'くせに = a pesar de (con reproche).' },
  { n: 'n3', s: '試験に合格する＿＿、毎日三時間勉強している。', o: ['ために', 'ように', 'のに', 'ことに'], es: 'Estudio tres horas por día para aprobar el examen.', e: 'ために = con el fin de (verbo volitivo). Con potencial se usa ように: 合格できるように.' },
  { n: 'n3', s: '漢字が読める＿＿、毎日新聞を読んでいます。', o: ['ように', 'ために', 'ことに', 'ばかりに'], es: 'Leo el diario todos los días para poder leer kanji.', e: 'Potencial / no volitivo + ように = para que (llegue a poder).' },
  { n: 'n3', s: 'お客様、こちらのコーヒーをどうぞ＿＿ください。', o: ['召し上がって', '頂いて', '参って', '申して'], es: 'Señor/a, sírvase este café, por favor.', e: '召し上がる = honorífico (sonkeigo) de 食べる/飲む. いただく es humilde: lo usás para vos.' },
  { n: 'n3', s: '明日、私が駅までお迎えに＿＿。', o: ['参ります', 'いらっしゃいます', 'なさいます', 'くださいます'], es: 'Mañana lo voy a buscar a la estación.', e: '参る = humilde (kenjougo) de 行く/来る. いらっしゃる es para el otro.' },
  { n: 'n3', s: '疲れていたので、電気をつけた＿＿寝てしまった。', o: ['まま', 'ながら', 'ところ', 'うちに'], es: 'Estaba tan cansado que me dormí con la luz prendida.', e: 'た形 + まま = tal cual, sin cambiar el estado.' },
  { n: 'n3', s: '若い＿＿、いろいろなことに挑戦したい。', o: ['うちに', 'あいだ', 'までに', 'ところで'], es: 'Mientras soy joven, quiero animarme a muchas cosas.', e: 'うちに = mientras todavía (antes de que cambie la situación).' },
];

// Charlas de vecinos más naturales (para N4–N3, cuando la IA está apagada)
export const CHARLAS_N3 = [
  { ja: '[最近|さいきん|últimamente]、[何|なに|qué][か|algo][新しい|あたらしい|nuevo][こと|cosa][を|(obj)][始めました|はじめました|empezaste][か|¿?]？', es: '¿Empezaste algo nuevo últimamente?',
    r: [{ ja: '[ピアノ|piano][を|(obj)][習い始めました|ならいはじめました|empecé a aprender]。', es: 'Empecé a aprender piano.', ok: 1 }, { ja: '[はい|sí]、[昨日|きのう|ayer][でした|fue]。', es: 'Sí, fue ayer.' }, { ja: '[いいえ|no]、[お腹|おなか|panza][が|(suj)][いっぱい|llena][です|está]。', es: 'No, estoy lleno.' }] },
  { ja: '[コーヒー|café][を|(obj)][淹れる|いれる|preparar][の|(nominaliza)][が|(suj)][上手|じょうず|hábil][になった|te volviste][そう|según dicen][ですね|¿no?]。', es: 'Dicen que te volviste bueno preparando café, ¿no?',
    r: [{ ja: '[いえいえ|no, para nada]、[まだまだ|todavía me falta][です|es]。', es: 'No, no, todavía me falta mucho.', ok: 1 }, { ja: '[はい|sí]、[雨|あめ|lluvia][が|(suj)][降りそう|ふりそう|parece que llueve][です|es]。', es: 'Sí, parece que va a llover.' }, { ja: '[駅|えき|estación][まで|hasta][お願いします|おねがいします|por favor]。', es: 'Hasta la estación, por favor.' }] },
  { ja: '[もし|si][時間|じかん|tiempo][が|(suj)][あれば|hubiera]、[お茶|おちゃ|té][でも|o algo así][飲みませんか|のみませんか|¿no tomamos?]？', es: 'Si tenés tiempo, ¿no tomamos un té o algo?',
    r: [{ ja: '[ぜひ|con gusto]！[喜んで|よろこんで|encantado]。', es: '¡Con gusto! Encantado.', ok: 1 }, { ja: '[すみません|perdón]、[今日|きょう|hoy][は|わ|(tema)][ちょっと|es que…]…', es: 'Perdón, hoy es medio complicado…', ok: 1 }, { ja: '[お茶|おちゃ|té][は|わ|(tema)][青い|あおい|azul][です|es]。', es: 'El té es azul.' }] },
  { ja: '[練習|れんしゅう|práctica][を|(obj)][続けて|つづけて|continuar][いれば|si seguís]、[きっと|seguro][上手|じょうず|hábil][になります|te volverás]よ。', es: 'Si seguís practicando, seguro que vas a mejorar.',
    r: [{ ja: '[ありがとうございます|muchas gracias]。[頑張ります|がんばります|me voy a esforzar]！', es: '¡Gracias! Me voy a esforzar.', ok: 1 }, { ja: '[いいえ|no]、[魚|さかな|pescado][が|(suj)][好き|すき|gusta][です|es]。', es: 'No, me gusta el pescado.' }, { ja: '[いただきます|¡a comer!]。', es: '¡A comer!' }] },
  { ja: '[この|este][辺|へん|zona][に|en][おいしい|rico][喫茶店|きっさてん|cafetería][って|eso de][ありますか|¿hay?]？', es: '¿Hay alguna cafetería rica por esta zona?',
    r: [{ ja: '[ありますよ|sí hay]。[あそこ|allá][の|de][角|かど|esquina][を|(obj)][曲がった|まがった|doblar][ところ|lugar][です|es]。', es: 'Sí, hay. Es doblando en esa esquina.', ok: 1 }, { ja: '[毎朝|まいあさ|cada mañana][六時|ろくじ|seis][に|a][起きます|おきます|me levanto]。', es: 'Me levanto todos los días a las seis.' }, { ja: '[ピアノ|piano][は|わ|(tema)][重い|おもい|pesado][です|es]。', es: 'El piano es pesado.' }] },
  { ja: '[日本語|にほんご|japonés][が|(suj)][ずいぶん|bastante][上手|じょうず|hábil][になりました|te volviste]ね。[どうやって|cómo][勉強した|べんきょうした|estudiaste][んですか|¿?]？', es: 'Tu japonés mejoró bastante. ¿Cómo estudiaste?',
    r: [{ ja: '[毎日|まいにち|todos los días][少し|すこし|un poco][ずつ|de a poco][続けて|つづけて|seguir][いる|estoy][だけ|solo][です|es]。', es: 'Solo sigo un poquito cada día.', ok: 1 }, { ja: '[明日|あした|mañana][は|わ|(tema)][晴れる|はれる|despejar][でしょう|probablemente]。', es: 'Mañana probablemente esté despejado.' }, { ja: '[どういたしまして|de nada]。', es: 'De nada.' }] },
];
