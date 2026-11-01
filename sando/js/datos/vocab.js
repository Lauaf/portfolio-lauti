// Vocabulario N5 (y algo de N4) agrupado en lecciones. Formato: palabra|lectura|significado
const LECCIONES = {
  'Saludos': `こんにちは|こんにちは|hola (de día)
おはよう|おはよう|buen día
こんばんは|こんばんは|buenas noches (saludo)
ありがとう|ありがとう|gracias
すみません|すみません|disculpe / perdón
はい|はい|sí
いいえ|いいえ|no
おやすみ|おやすみ|que descanses
さようなら|さようなら|adiós
よろしく|よろしく|un gusto / cuento con vos
いただきます|いただきます|¡a comer! (antes de comer)
ごちそうさま|ごちそうさま|gracias por la comida`,
  'Personas': `私|わたし|yo
あなた|あなた|vos / usted
人|ひと|persona
友達|ともだち|amigo/a
先生|せんせい|profesor/a
学生|がくせい|estudiante
家族|かぞく|familia
母|はは|(mi) mamá
父|ちち|(mi) papá
子供|こども|niño/a
名前|なまえ|nombre
日本人|にほんじん|japonés/a (persona)`,
  'Café y comida': `コーヒー|コーヒー|café
お茶|おちゃ|té (verde)
水|みず|agua
牛乳|ぎゅうにゅう|leche
砂糖|さとう|azúcar
パン|パン|pan
ご飯|ごはん|arroz / comida
喫茶店|きっさてん|cafetería tradicional
カップ|カップ|taza
熱い|あつい|caliente (al tacto)
冷たい|つめたい|frío (al tacto)
甘い|あまい|dulce
苦い|にがい|amargo
美味しい|おいしい|rico, sabroso
食べる|たべる|comer
飲む|のむ|beber`,
  'Música': `音楽|おんがく|música
ピアノ|ピアノ|piano
歌|うた|canción
歌う|うたう|cantar
弾く|ひく|tocar (instrumento de cuerda/teclas)
聞く|きく|escuchar / preguntar
練習|れんしゅう|práctica
上手|じょうず|hábil
下手|へた|torpe, malo en algo
好き|すき|que te gusta
音|おと|sonido
静か|しずか|tranquilo, silencioso`,
  'Lugares': `家|いえ|casa
学校|がっこう|escuela
駅|えき|estación
店|みせ|tienda
町|まち|pueblo, ciudad
山|やま|montaña
川|かわ|río
海|うみ|mar
神社|じんじゃ|santuario sintoísta
道|みち|camino
部屋|へや|habitación
日本|にほん|Japón`,
  'Tiempo': `今|いま|ahora
今日|きょう|hoy
明日|あした|mañana (día)
昨日|きのう|ayer
毎日|まいにち|todos los días
朝|あさ|mañana (parte del día)
夜|よる|noche
時間|じかん|tiempo, horas
天気|てんき|clima
雨|あめ|lluvia
春|はる|primavera
桜|さくら|cerezo`,
  'Verbos': `行く|いく|ir
来る|くる|venir
帰る|かえる|volver (a casa)
見る|みる|ver
話す|はなす|hablar
読む|よむ|leer
書く|かく|escribir
買う|かう|comprar
待つ|まつ|esperar
寝る|ねる|dormir
起きる|おきる|levantarse
する|する|hacer
分かる|わかる|entender
作る|つくる|hacer, preparar`,
  'Adjetivos': `大きい|おおきい|grande
小さい|ちいさい|chico
新しい|あたらしい|nuevo
古い|ふるい|viejo (cosas)
高い|たかい|alto / caro
安い|やすい|barato
楽しい|たのしい|divertido
難しい|むずかしい|difícil
易しい|やさしい|fácil
忙しい|いそがしい|ocupado
元気|げんき|bien, con energía
綺麗|きれい|lindo / limpio`,
  'Números': `一|いち|uno
二|に|dos
三|さん|tres
四|よん|cuatro
五|ご|cinco
六|ろく|seis
七|なな|siete
八|はち|ocho
九|きゅう|nueve
十|じゅう|diez
百|ひゃく|cien
円|えん|yen`,
  'Preguntas': `何|なに|qué
誰|だれ|quién
どこ|どこ|dónde
いつ|いつ|cuándo
どう|どう|cómo
いくら|いくら|cuánto cuesta
どれ|どれ|cuál
なぜ|なぜ|por qué`,
};

export const VOCAB = Object.entries(LECCIONES).flatMap(([leccion, txt], li) =>
  txt.trim().split('\n').map(l => {
    const [p, r, s] = l.split('|');
    return { p, r, s, leccion, li };
  }));
export const NOMBRES_LECCIONES = Object.keys(LECCIONES);
export const claveVoc = v => `voc:${v.p}`;
