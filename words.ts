export interface SpanishWord {
  id: string;
  word: string; // Correct word with accent, e.g., "canción"
  wordNoAccent: string; // Without graphic stress, for game prompt, e.g., "cancion"
  syllables: string[]; // e.g., ["can", "cion"]
  stressedSyllableIndex: number; // 0-based index from left, e.g., 1 for "cion"
  category: 'Aguda' | 'Llana' | 'Esdrújula' | 'Sobreesdrújula';
  translationArm: string; // Armenian translation
  transliterationArm: string; // Armenian phonetic help
  explanationArm: string; // Accentuation explanation in Armenian
  exampleSentence: string; // Spanish example
  exampleTranslationArm: string; // Translation of example
  hasWrittenAccent: boolean; // Does it have a "tilde"?
}

export const SPANISH_WORDS: SpanishWord[] = [
  {
    id: '1',
    word: 'canción',
    wordNoAccent: 'cancion',
    syllables: ['can', 'ción'],
    stressedSyllableIndex: 1,
    category: 'Aguda',
    translationArm: 'երգ',
    transliterationArm: 'կանսյոն',
    explanationArm: 'Շեշտն ընկնում է վերջին վանկի վրա (Aguda): Քանի որ բառը վերջանում է «n»-ով, այն պահանջում է գրավոր շեշտ (tilde) «o» տառի վրա:',
    exampleSentence: 'Me gusta esta canción española.',
    exampleTranslationArm: 'Ինձ դուր է գալիս այս իսպանական երգը:',
    hasWrittenAccent: true
  },
  {
    id: '2',
    word: 'árbol',
    wordNoAccent: 'arbol',
    syllables: ['ár', 'bol'],
    stressedSyllableIndex: 0,
    category: 'Llana',
    translationArm: 'ծառ',
    transliterationArm: 'արբոլ',
    explanationArm: 'Շեշտը նախավերջին վանկի վրա է (Llana): Քանի որ բառը վերջանում է բաղաձայնով (բացի «n» և «s»-ից), այն պահանջում է գրավոր շեշտ «á»-ի վրա:',
    exampleSentence: 'El árbol es muy viejo.',
    exampleTranslationArm: 'Ծառը շատ հին է:',
    hasWrittenAccent: true
  },
  {
    id: '3',
    word: 'música',
    wordNoAccent: 'musica',
    syllables: ['mú', 'si', 'ca'],
    stressedSyllableIndex: 0,
    category: 'Esdrújula',
    translationArm: 'երաժշտություն',
    transliterationArm: 'մուսիկա',
    explanationArm: 'Շեշտը նախանախավերջին վանկի վրա է (Esdrújula): Այս տիպի բոլոր բառերը առանց բացառության ստանում են գրավոր շեշտ (tilde):',
    exampleSentence: 'La música nos une.',
    exampleTranslationArm: 'Երաժշտությունը միավորում է մեզ:',
    hasWrittenAccent: true
  },
  {
    id: '4',
    word: 'hablar',
    wordNoAccent: 'hablar',
    syllables: ['ha', 'blar'],
    stressedSyllableIndex: 1,
    category: 'Aguda',
    translationArm: 'խոսել',
    transliterationArm: 'աբլար',
    explanationArm: 'Շեշտը վերջին վանկի վրա է (Aguda): Քանի որ վերջանում է «r» բաղաձայնով (որը «n» կամ «s» չէ), գրավոր շեշտի նշան չի պահանջվում:',
    exampleSentence: 'Quiero hablar español contigo.',
    exampleTranslationArm: 'Ուզում եմ քեզ հետ իսպաներեն խոսել:',
    hasWrittenAccent: false
  },
  {
    id: '5',
    word: 'fácil',
    wordNoAccent: 'facil',
    syllables: ['fá', 'cil'],
    stressedSyllableIndex: 0,
    category: 'Llana',
    translationArm: 'հեշտ',
    transliterationArm: 'ֆասիլ',
    explanationArm: 'Շեշտը նախավերջին վանկի վրա է (Llana): Վերջանում է «l»-ով, ուստի պարտադիր է դնել գրավոր շեշտ «á»-ի վրա:',
    exampleSentence: 'El español es fácil.',
    exampleTranslationArm: 'Իսպաներենը հեշտ է:',
    hasWrittenAccent: true
  },
  {
    id: '6',
    word: 'café',
    wordNoAccent: 'cafe',
    syllables: ['ca', 'fé'],
    stressedSyllableIndex: 1,
    category: 'Aguda',
    translationArm: 'սուրճ / սրճարան',
    transliterationArm: 'կաֆե',
    explanationArm: 'Շեշտն ընկնում է վերջին վանկի վրա (Aguda): Քանի որ այն վերջանում է ձայնավորով (e), պահանջվում է գրավոր շեշտ (tilde):',
    exampleSentence: 'Tomo un café caliente.',
    exampleTranslationArm: 'Ես տաք սուրճ եմ խմում:',
    hasWrittenAccent: true
  },
  {
    id: '7',
    word: 'bolígrafo',
    wordNoAccent: 'boligrafo',
    syllables: ['bo', 'lí', 'gra', 'fo'],
    stressedSyllableIndex: 1,
    category: 'Esdrújula',
    translationArm: 'գրիչ',
    transliterationArm: 'բոլիգրաֆո',
    explanationArm: 'Շեշտված է նախանախավերջին վանկը (Esdrújula)՝ «lí»: Բոլոր Esdrújula բառերը միշտ ստանում են գրավոր շեշտ:',
    exampleSentence: '¿Tienes un bolígrafo azul?',
    exampleTranslationArm: 'Կապույտ գրիչ ունե՞ս:',
    hasWrittenAccent: true
  },
  {
    id: '8',
    word: 'casa',
    wordNoAccent: 'casa',
    syllables: ['ca', 'sa'],
    stressedSyllableIndex: 0,
    category: 'Llana',
    translationArm: 'տուն',
    transliterationArm: 'կասա',
    explanationArm: 'Շեշտը նախավերջին վանկի վրա է (Llana)՝ «ca»: Քանի որ բառը վերջանում է ձայնավորով (a), գրավոր շեշտ (tilde) չի պահանջվում:',
    exampleSentence: 'Mi casa es tu casa.',
    exampleTranslationArm: 'Իմ տունը քո տունն է (իմ տունը հյուրընկալ է):',
    hasWrittenAccent: false
  },
  {
    id: '9',
    word: 'teléfono',
    wordNoAccent: 'telefono',
    syllables: ['te', 'lé', 'fo', 'no'],
    stressedSyllableIndex: 1,
    category: 'Esdrújula',
    translationArm: 'հեռախոս',
    transliterationArm: 'տելեֆոնո',
    explanationArm: 'Շեշտված է նախանախավերջին վանկը (Esdrújula)՝ «lé»: Բոլոր այսպիսի բառերին միշտ տրվում է գրավոր շեշտ:',
    exampleSentence: 'Contesta el teléfono, por favor.',
    exampleTranslationArm: 'Խնդրում եմ, պատասխանիր հեռախոսին:',
    hasWrittenAccent: true
  },
  {
    id: '10',
    word: 'libertad',
    wordNoAccent: 'libertad',
    syllables: ['li', 'ber', 'tad'],
    stressedSyllableIndex: 2,
    category: 'Aguda',
    translationArm: 'ազատություն',
    transliterationArm: 'լիբերտադ',
    explanationArm: 'Շեշտը վերջին վանկի վրա է (Aguda): Քանի որ վերջանում է «d» բաղաձայնով (որը «n», «s» կամ ձայնավոր չէ), ապա գրավոր շեշտ չի դրվում:',
    exampleSentence: 'Queremos paz y libertad.',
    exampleTranslationArm: 'Մենք ուզում ենք խաղաղություն և ազատություն:',
    hasWrittenAccent: false
  },
  {
    id: '11',
    word: 'lápiz',
    wordNoAccent: 'lapiz',
    syllables: ['lá', 'piz'],
    stressedSyllableIndex: 0,
    category: 'Llana',
    translationArm: 'մատիտ',
    transliterationArm: 'լապիս',
    explanationArm: 'Շեշտը նախավերջին վանկի վրա է (Llana): Վերջանում է «z»-ով, ուստի անհրաժեշտ է գրավոր շեշտ դնել «á»-ի վրա:',
    exampleSentence: 'Escribo con un lápiz negro.',
    exampleTranslationArm: 'Ես գրում եմ սև մատիտով:',
    hasWrittenAccent: true
  },
  {
    id: '12',
    word: 'rápido',
    wordNoAccent: 'rapido',
    syllables: ['rá', 'pi', 'do'],
    stressedSyllableIndex: 0,
    category: 'Esdrújula',
    translationArm: 'արագ',
    transliterationArm: 'ռապիդո',
    explanationArm: 'Շեշտը նախանախավերջին վանկի վրա է (Esdrújula)՝ «rá»: Միշտ ստանում է գրավոր շեշտ (tilde):',
    exampleSentence: 'El coche es muy rápido.',
    exampleTranslationArm: 'Ավտոմեքենան շատ արագ է:',
    hasWrittenAccent: true
  },
  {
    id: '13',
    word: 'corazón',
    wordNoAccent: 'corazon',
    syllables: ['co', 'ra', 'zón'],
    stressedSyllableIndex: 2,
    category: 'Aguda',
    translationArm: 'սիրտ',
    transliterationArm: 'կորասոն',
    explanationArm: 'Շեշտը վերջին վանկի վրա է (Aguda)՝ «zón»: Վերջանում է «n»-ով, ուստի պահանջում է գրավոր շեշտ:',
    exampleSentence: 'Te amo con todo mi corazón.',
    exampleTranslationArm: 'Սիրում եմ քեզ իմ ամբողջ սրտով:',
    hasWrittenAccent: true
  },
  {
    id: '14',
    word: 'examen',
    wordNoAccent: 'examen',
    syllables: ['e', 'xa', 'men'],
    stressedSyllableIndex: 1,
    category: 'Llana',
    translationArm: 'քննություն',
    transliterationArm: 'էքսամեն',
    explanationArm: 'Շեշտը նախավերջին վանկի վրա է (Llana)՝ «xa»: Քանի որ բառը վերջանում է «n»-ով, այն չի ստանում գրավոր շեշտ:',
    exampleSentence: 'Tengo un examen de español hoy.',
    exampleTranslationArm: 'Այսօր իսպաներենի քննություն ունեմ:',
    hasWrittenAccent: false
  },
  {
    id: '15',
    word: 'fácilmente',
    wordNoAccent: 'facilmente',
    syllables: ['fá', 'cil', 'men', 'te'],
    stressedSyllableIndex: 0,
    category: 'Sobreesdrújula',
    translationArm: 'հեշտությամբ',
    transliterationArm: 'ֆասիլմենտե',
    explanationArm: 'Sobreesdrújula բառերը շեշտվում են նախանախավերջինից առաջ (չորրորդ վանկ սկզբից)։ Մակբայների դեպքում, եթե հիմնական ածականն ուներ շեշտ (fácil), այն պահպանվում է:',
    exampleSentence: '¡Podemos aprender español fácilmente!',
    exampleTranslationArm: 'Մենք կարող ենք հեշտությամբ սովորել իսպաներեն:',
    hasWrittenAccent: true
  }
];

export interface GuitarChord {
  name: string;
  notes: number[]; // MIDI or relative note offsets
  strings: (number | null)[]; // Fret on strings [Low E, A, D, G, B, High E] (null means don't play)
}

export const GUITAR_CHORDS: GuitarChord[] = [
  { name: 'C Major', notes: [48, 52, 55, 60, 64], strings: [null, 3, 2, 0, 1, 0] },
  { name: 'A Minor', notes: [45, 52, 57, 60, 64], strings: [null, 0, 2, 2, 1, 0] },
  { name: 'G Major', notes: [43, 47, 50, 55, 59, 67], strings: [3, 2, 0, 0, 0, 3] },
  { name: 'E Minor', notes: [40, 47, 52, 55, 59, 64], strings: [0, 2, 2, 0, 0, 0] },
  { name: 'D Minor', notes: [50, 57, 62, 65], strings: [null, null, 0, 2, 3, 1] },
  { name: 'F Major', notes: [41, 45, 48, 53, 57, 65], strings: [1, 3, 3, 2, 1, 1] }
];

export const STRING_FREQUENCIES = [
  82.41,  // E2 (String 6 - Thickest)
  110.00, // A2 (String 5)
  146.83, // D3 (String 4)
  196.00, // G3 (String 3)
  246.94, // B3 (String 2)
  329.63  // E4 (String 1 - Thinnest)
];

export const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];
