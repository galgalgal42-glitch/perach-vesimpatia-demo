/* Shop facts: public listings checked 2026-10-12 (B144, Easy owner-managed page,
   the shop's Zerli store page, Facebook). Bouquet names, prices and photos are
   demo content for the pitch; prices follow the range on the Zerli store page. */
window.SHOP = {
  name: 'פרח וסימפטיה',
  owner: 'שמעון משה',
  address: 'החלוצים 4, זכרון יעקב',
  whatsapp: '972507453315',
  phone: '+972507453315',
  phoneDisplay: '050-745-3315',
  facebook: 'https://www.facebook.com/flowerofsympathy',
  b144: 'https://www.b144.co.il/b144_sip/481404134470655D4E120C134675605A4F/',
  timeZone: 'Asia/Jerusalem',
  // 0 = Sunday ... 6 = Saturday; null = closed
  hours: [
    ['08:00', '20:00'],
    ['08:00', '20:00'],
    ['08:00', '20:00'],
    ['08:00', '20:00'],
    ['08:00', '20:00'],
    ['08:00', '16:00'],
    null
  ],
  // Delivery towns as listed on the shop's own Zerli store page (checked 2026-10-13).
  towns: [
    'זכרון יעקב', 'אור עקיבא', 'בית אורן', 'בית חנניה', 'בנימינה־גבעת עדה', 'גבע כרמל',
    'דור', 'הבונים', 'החותרים', 'חדרה', 'כפר גלים', 'כרם מהר״ל',
    'מאיר שפיה', 'מגדים', 'מעגן מיכאל', 'נווה ים', 'נחשולים', 'ניר עציון',
    'עופר', 'עין איילה', 'עין הוד', 'עין כרמל', 'עתלית', 'פרדס חנה־כרכור',
    'צרופה', 'קיסריה', 'שדות ים'
  ],
  rating: { score: '5.0', count: 41, source: 'B144', checked: 'אוקטובר 2026' }
};

window.REVIEWS = [
  {
    text: 'קיבלתי שרות מצוין, שירות מהיר ואדיב, באמת התחשבות וזמינות מטורפת לשינויים ובקשות. יצא מהממם וכבר תוך שעתיים קיבלנו הפרחים',
    name: 'גילה ק.',
    date: '29.07.2026'
  },
  {
    text: 'קיבלתי שרות מצוין, המשלוח הגיע בזמן',
    name: 'שרית ת.',
    date: '08.09.2026'
  }
];

window.OCCASIONS = [
  { id: 'love', label: 'אהבה ורומנטיקה', cover: 'red' },
  { id: 'birthday', label: 'יום הולדת', cover: 'morning' },
  { id: 'thanks', label: 'תודה והוקרה', cover: 'sunset' },
  { id: 'baby', label: 'לידה', cover: 'welcome' },
  { id: 'shabbat', label: 'שבת וחג', cover: 'shabbat' },
  { id: 'wedding', label: 'חתונה ואירוסין', cover: 'bride' },
  { id: 'plants', label: 'עציצים וסחלבים', cover: 'orchid' },
  { id: 'condolence', label: 'אבל ותנחומים', cover: 'condolence', quiet: true }
];

window.COUPON = { code: 'PERACH10', percent: 10, min: 250 };

window.SIZES = ['רגיל', 'גדול', 'מפואר'];

window.ADDONS = [
  { id: 'chocolate', name: 'קופסת פרלינים', price: 49, img: 'assets/img/addon-chocolate.jpg' },
  { id: 'wine', name: 'בקבוק יין אדום', price: 89, img: 'assets/img/addon-wine.jpg' },
  { id: 'balloons', name: 'בלוני הליום', price: 35, img: 'assets/img/addon-balloons.jpg' },
  { id: 'vase', name: 'אגרטל זכוכית', price: 45, img: 'assets/img/addon-vase.jpg' }
];

window.PRODUCTS = [
  {
    id: 'peach', featured: true,
    name: 'אפרסק וחמאה',
    flowers: 'נוריות באפרסק, בשמנת ובוורוד, וגיפסנית',
    desc: 'זר עגול ורך בגווני אפרסק ושמנת, קשור ביד בחוט פשתן. מתאים כמעט לכל הזדמנות.',
    img: 'assets/img/card1.jpg',
    occasions: ['love', 'birthday', 'thanks'], colors: ['pastel', 'warm'],
    prices: [200, 250, 320]
  },
  {
    id: 'shabbat', featured: true,
    name: 'לבן של שבת',
    flowers: 'ליזיאנטוס לבן, ורדים לבנים, הורטנזיה ירוקה ומתיולה לבנה',
    desc: 'סידור לבן וירוק באגרטל זכוכית, מוכן לשולחן השבת.',
    img: 'assets/img/card2.jpg',
    occasions: ['shabbat', 'thanks'], colors: ['white'],
    prices: [180, 230, 290]
  },
  {
    id: 'red', featured: true,
    name: 'ורדים אדומים',
    flowers: 'ורדים אדומים בגבעול ארוך',
    desc: 'הקלאסיקה: ורדים אדומים בגבעול ארוך, עטופים בנייר טבעי וקשורים בחוט.',
    img: 'assets/img/card5.jpg',
    occasions: ['love'], colors: ['red'],
    prices: [240, 300, 390]
  },
  {
    id: 'roses-white',
    name: 'ורדים לבנים',
    flowers: 'ורדי גן לבנים ושנהב, ציפורנים לבנות ואקליפטוס',
    desc: 'ורדי גן לבנים ומלאים עם כמה ציפורנים לבנות ואקליפטוס, עטופים בנייר שנהב. נקי, אלגנטי ומתאים כמעט לכל רגע.',
    img: 'assets/img/roses-white.jpg',
    occasions: ['love', 'thanks', 'wedding', 'shabbat'], colors: ['white'],
    prices: [230, 290, 370]
  },
  {
    id: 'roses-pink',
    name: 'ורדים ורודים',
    flowers: 'ורדי גן בוורוד פודרה ובוורוד עתיק, ורדי ענף וירק עדין',
    desc: 'שפע של ורדי גן בגווני ורוד רך, עם ורדי ענף קטנים וירק אוורירי. זר רומנטי ועדין.',
    img: 'assets/img/roses-pink.jpg',
    occasions: ['love', 'birthday', 'baby'], colors: ['pastel'],
    prices: [220, 280, 350]
  },
  {
    id: 'roses-coral',
    name: 'ורדים באלמוג ואפרסק',
    flowers: 'ורדים בגווני אלמוג, אפרסק וכתום, ורדים בשמנת ואקליפטוס',
    desc: 'ורדים בגוונים חמים של אלמוג ואפרסק, עם ורדים בצבע שמנת. זר שמח ליום הולדת או לתודה.',
    img: 'assets/img/roses-coral.jpg',
    occasions: ['birthday', 'thanks'], colors: ['warm'],
    prices: [220, 280, 350]
  },
  {
    id: 'anemones',
    name: 'כלניות אדומות',
    flowers: 'כלניות אדומות, אקליפטוס וירק',
    desc: 'כלניות אדומות עם לב שחור, הפרח של החורף בארץ, עם אקליפטוס וירק עדין, עטופות בנייר שנהב.',
    img: 'assets/img/anemones.jpg',
    occasions: ['love', 'thanks', 'birthday'], colors: ['red'],
    prices: [190, 240, 310]
  },
  {
    id: 'gerberas',
    name: 'גרברות שמחות',
    flowers: 'גרברות בכתום, בצהוב, בוורוד עז ובאלמוג, וירק',
    desc: 'זר עגול ומלא גרברות בצבעים חמים ושמחים, עם ענפי ירק. מתאים במיוחד ליום הולדת או להחלמה.',
    img: 'assets/img/gerberas.jpg',
    occasions: ['birthday', 'thanks'], colors: ['warm'],
    prices: [170, 220, 290]
  },
  {
    id: 'lisianthus',
    name: 'ליזיאנטוס בסגול ולבן',
    flowers: 'ליזיאנטוס בסגול, בלילך ובלבן, וירק',
    desc: 'זר שופע של ליזיאנטוס בשלושה גוונים, סגול עמוק, לילך ולבן, עם ניצנים וירק. עדין ומרשים יחד.',
    img: 'assets/img/lisianthus.jpg',
    occasions: ['love', 'thanks', 'shabbat'], colors: ['pastel', 'white'],
    prices: [200, 260, 330]
  },
  {
    id: 'peonies-roses',
    name: 'ענן פיוניות',
    flowers: 'פיוניות ורודות, ורדי גן לבנים ואקליפטוס',
    desc: 'זר שופע של פיוניות ורודות פתוחות לצד ורדי גן לבנים וענפי אקליפטוס, עטוף בנייר שנהב. פיוניות בעונה מינואר עד יוני, ובשאר השנה בהזמנה מראש.',
    img: 'assets/img/peonies-roses.jpg',
    occasions: ['love', 'birthday', 'thanks', 'wedding'], colors: ['pastel'],
    prices: [320, 420, 560]
  },
  {
    id: 'blush',
    name: 'סומק',
    flowers: 'פיוניות ורודות, ורדי גן ונוריות בוורוד, ושעוונית ורודה',
    desc: 'זר מעורב בגוון אחד של ורוד: פיוניות, ורדי גן, נוריות ושעוונית, כל אחד במרקם אחר. רך, יוקרתי ומתאים במיוחד לאהבה וללידה.',
    img: 'assets/img/blush.jpg',
    occasions: ['love', 'birthday', 'baby', 'wedding'], colors: ['pastel'],
    prices: [340, 440, 590]
  },
  {
    id: 'lilies-white',
    name: 'ירח זוהר',
    flowers: 'ליליות לבנות, ורדים לבנים ואקליפטוס',
    desc: 'ליליות לבנות גבוהות, חלקן פתוחות וחלקן בניצן, עם ורדים לבנים ואקליפטוס. זר מבושם שנפתח בבית במשך ימים.',
    img: 'assets/img/lilies-white.jpg',
    occasions: ['thanks', 'shabbat', 'condolence'], colors: ['white'],
    prices: [230, 290, 370]
  },
  {
    id: 'moshava',
    name: 'המושבה',
    flowers: 'ורדי גן באפרסק ובקפה-אוליה, ציפורנים באפרסק, ורדי ענף בשמנת וענפי זית',
    desc: 'זר הדגל שלנו: ורדי גן גדולים בגוני אפרסק וקפה-אוליה, ציפורנים מסולסלות באפרסק, ורדי ענף בשמנת וניצני ליזיאנטוס, עם ענפי זית שמזכירים את הכרמל. עטוף בנייר שמנת וקשור בחבל יוטה.',
    img: 'assets/img/moshava.jpg',
    occasions: ['love', 'birthday', 'thanks'], colors: ['warm', 'pastel'],
    prices: [290, 380, 490]
  },
  {
    id: 'pnina',
    name: 'פנינה',
    flowers: 'חרציות לבנות גדולות, ליזיאנטוס לבן, ורדי ענף בשמנת ואקליפטוס',
    desc: 'זר לבן ושקט: חרציות לבנות גדולות ומלאות, ליזיאנטוס לבן, ורדי ענף בשמנת ועלי אקליפטוס כסופים. עטוף בנייר שמנת וקשור בחבל יוטה.',
    img: 'assets/img/pnina.jpg',
    occasions: ['thanks', 'shabbat', 'condolence', 'baby'], colors: ['white'],
    prices: [220, 280, 360]
  },
  {
    id: 'lilies-pink',
    name: 'פשוט לאהוב',
    flowers: 'ליליות ורודות, ליזיאנטוס ורוד, חרציות בסגול שזיף, ורדים ורודים ואקליפטוס',
    desc: 'ליליות ורודות מבושמות, חלקן פתוחות וחלקן בניצן, עם ליזיאנטוס ורוד, חרציות בסגול שזיף, ורדים ורודים ועלי אקליפטוס. זר עשיר בגוני ורוד וסגול, עטוף בנייר שמנת וקשור בחבל יוטה.',
    img: 'assets/img/lilies-pink.jpg',
    occasions: ['love', 'birthday', 'thanks'], colors: ['pastel'],
    prices: [250, 320, 410]
  },
  {
    id: 'nachsholim',
    name: 'נחשולים',
    flowers: 'דלפיניום כחול, ורדים לבנים, ליזיאנטוס לבן, אריגיום כחול ואקליפטוס',
    desc: 'זר בכחול ולבן כמו הים בנחשולים: שבלים גבוהות של דלפיניום כחול, ורדים לבנים וורדי ענף, ליזיאנטוס לבן ופרחי אריגיום כחולים, עם אקליפטוס. עטוף בנייר שמנת וקשור בחבל יוטה.',
    img: 'assets/img/nachsholim.jpg',
    occasions: ['thanks', 'birthday', 'baby'], colors: ['white'],
    prices: [260, 330, 420]
  },
  {
    id: 'lilies-orange',
    name: 'שקיעה כתומה',
    flowers: 'ליליות כתומות, נוריות כתומות, ורדים באפרסק, ליזיאנטוס לבן וענפי זית',
    desc: 'ליליות כתומות, פתוחות ובניצן, עם נוריות כתומות, ורדים בגוון אפרסק וליזיאנטוס לבן, ובין כולם ענפי זית. זר חם בצבעי שקיעה, עטוף בנייר שמנת וקשור בחבל יוטה.',
    img: 'assets/img/lilies-orange.jpg',
    occasions: ['birthday', 'thanks'], colors: ['warm'],
    prices: [240, 310, 400]
  },
  {
    id: 'carmel',
    name: 'שביל הכרמל',
    flowers: 'ליזיאנטוס בלילך ולבן, סקביוזה סגולה, מטריקריה, שעווית ורודה ועלים ירוקים',
    desc: 'זר אוורירי בסגנון גן: ליזיאנטוס בלילך ובלבן, סקביוזה סגולה, פרחי מטריקריה לבנים קטנים ושעווית ורודה, בין עלים ירוקים דקים. כמו טיול בשבילי הכרמל, עטוף בנייר שמנת וקשור בחבל יוטה.',
    img: 'assets/img/carmel.jpg',
    occasions: ['love', 'thanks', 'shabbat', 'birthday'], colors: ['pastel'],
    prices: [210, 270, 350]
  },
  {
    id: 'morning', featured: true,
    name: 'שמש של בוקר',
    flowers: 'נוריות כתומות, צבעונים צהובים, ורדים בכתום ובאפרסק וזהבית',
    desc: 'זר שמח בגוונים חמים, בדיוק בשביל יום הולדת או בוקר שצריך קצת צבע.',
    img: 'assets/img/card4.jpg',
    occasions: ['birthday', 'thanks'], colors: ['warm'],
    prices: [180, 230, 290]
  },
  {
    id: 'sunset', featured: true,
    name: 'שקיעה בזכרון',
    flowers: 'ורדי גן בגוון משמש, נוריות לבנות ואקליפטוס',
    desc: 'ורדי גן בגוון משמש עם נוריות לבנות וענפי אקליפטוס, עטופים בנייר שנהב.',
    img: 'assets/img/card7.jpg',
    occasions: ['love', 'thanks', 'birthday'], colors: ['warm', 'pastel'],
    prices: [220, 280, 350]
  },
  {
    id: 'harvest', featured: true,
    name: 'בציר',
    flowers: 'דליות בורדו, ורדים כהים, סקביוזה ועלווה בגוון יין',
    desc: 'זר בגווני יין עמוקים, עם עלווה כהה בגוון בורדו. כמו זכרון יעקב בעונת הבציר.',
    img: 'assets/img/card6.jpg',
    occasions: ['love', 'birthday'], colors: ['red'],
    prices: [240, 300, 370]
  },
  {
    id: 'welcome', featured: true,
    name: 'ברוכים הבאים',
    flowers: 'נוריות ורודות ולבנות, אפונה ריחנית, שעוונית ועלי כסף',
    desc: 'זר עדין בוורוד ובלבן, לברך את ההורים הטריים ואת מי שרק הגיע לעולם.',
    img: 'assets/img/card8.jpg',
    occasions: ['baby'], colors: ['pastel'],
    prices: [180, 230, 290]
  },
  {
    id: 'orchid', featured: true,
    name: 'סחלב לבן',
    flowers: 'סחלב פלנופסיס בעציץ קרמיקה',
    desc: 'סחלב לבן עם ענף פריחה מתפצל, בעציץ קרמיקה לבן. מחזיק שבועות ארוכים בבית או במשרד.',
    img: 'assets/img/orchid.jpg',
    occasions: ['plants', 'thanks'], colors: ['white'],
    prices: [190, 250, 320], sizeLabels: ['עציץ אחד', 'שני עציצים', 'שלושה עציצים']
  },
  {
    id: 'colorful', featured: true,
    name: 'פינוק צבעוני',
    flowers: 'ורדים בוורוד עז, בכתום ובצהוב, דלפיניום כחול ולוע ארי ירוק',
    desc: 'זר עליז בהרבה צבעים, למי שאוהב שמח. מתאים ליום הולדת, להחלמה או סתם כי בא לכם.',
    img: 'assets/img/colorful.jpg',
    occasions: ['birthday', 'thanks'], colors: ['warm'],
    prices: [180, 230, 290]
  },
  {
    id: 'peony', pick: 1,
    note: 'פיוניות שמגיעות בניצן ונפתחות בבית, והזר מתמלא מיום ליום.',
    name: 'פיוניות ורודות',
    flowers: 'פיוניות ורודות בניצנים ועלווה ירוקה',
    desc: 'צרור פיוניות ורודות שמגיעות בניצן ונפתחות בבית לאט, ומתמלאות מיום ליום. פיוניות בעונה מינואר עד יוני, ובשאר השנה בהזמנה מראש.',
    img: 'assets/img/peony.jpg',
    occasions: ['love', 'birthday', 'thanks'], colors: ['pastel'],
    prices: [260, 330, 420]
  },
  {
    id: 'boy',
    name: 'להולדת הבן',
    flowers: 'דלפיניום כחול, ורדים לבנים, שעוונית לבנה ואקליפטוס',
    desc: 'זר בכחול ובלבן לברכת ההורים על הולדת הבן, עם דלפיניום, ורדים לבנים וסרט תכלת.',
    img: 'assets/img/boy.jpg',
    occasions: ['baby'], colors: ['white'],
    prices: [180, 230, 290]
  },
  {
    id: 'bride',
    name: 'כלה בלבן',
    flowers: 'ורדים לבנים, מתיולה לבנה, פריחה לבנה בפעמונים וירק כסוף',
    desc: 'זר כלה גבוה ואוורירי בלבן ובירוק כסוף, שגבעוליו עטופים בסרט משי. מומלץ לתאם מראש עם השוזר.',
    img: 'assets/img/card3.jpg',
    occasions: ['wedding'], colors: ['white'],
    prices: [380, 480, 600]
  },
  {
    id: 'engagement', pick: 4,
    note: 'ורוד עתיק ורך, לרגעים שרוצים לזכור.',
    name: 'ורוד של אירוסין',
    flowers: 'ורדי גן בוורוד עתיק ובסלמון, לימוניום כסוף ופרחים לבנים קטנים',
    desc: 'זר רומנטי בגווני ורוד עתיק, להצעת נישואין, לאירוסין או לערב שכדאי לזכור.',
    img: 'assets/img/engagement.jpg',
    occasions: ['wedding', 'love'], colors: ['pastel'],
    prices: [260, 330, 420]
  },
  {
    id: 'tulips', pick: 3,
    note: 'צבעונים ממשיכים לצמוח גם באגרטל, אז הזר נראה אחרת כל בוקר.',
    name: 'צבעונים ורודים',
    flowers: 'צבעונים ורודים ולבנים באגרטל זכוכית',
    desc: 'צבעונים ורודים ולבנים באגרטל זכוכית פשוט. הם ממשיכים לצמוח ולהיפתח גם באגרטל.',
    img: 'assets/img/tulips.jpg',
    occasions: ['love', 'thanks', 'birthday'], colors: ['pastel'],
    prices: [170, 220, 280]
  },
  {
    id: 'harmony',
    name: 'הרמוניה בסגול',
    flowers: 'פרוטאה ורודה, יקינטון סגול, דלפיניום כחול, ורד ורוד וכדורי ירק',
    desc: 'זר מלא בסגול, בכחול ובוורוד, עם פרוטאה במרכז, בקנקן קרמיקה לבן.',
    img: 'assets/img/harmony.jpg',
    occasions: ['birthday', 'thanks'], colors: ['pastel'],
    prices: [180, 230, 290]
  },
  {
    id: 'field', pick: 2,
    note: 'ריח של לבנדר ועשבי תיבול, כמו טיול בשדות סביב זכרון יעקב.',
    name: 'שדה פתוח',
    flowers: 'לבנדר, לימוניום, קמומיל ועשבי תיבול',
    desc: 'זר כפרי ואוורירי בהשראת השדות סביב זכרון יעקב: לבנדר, לימוניום, קמומיל ועשבי תיבול ריחניים.',
    img: 'assets/img/field.jpg',
    occasions: ['thanks', 'shabbat'], colors: ['pastel'],
    prices: [160, 200, 250]
  },
  {
    id: 'sunflower', pick: 5,
    note: 'חמניות גדולות עם אקליפטוס, זר שמכניס שמש לכל חדר.',
    name: 'חמניות',
    flowers: 'חמניות, אקליפטוס וגיפסנית',
    desc: 'חמניות גדולות עם אקליפטוס וגיפסנית, עטופות בנייר שנהב. זר שמחייך מכל פינה בחדר.',
    img: 'assets/img/sunflower.jpg',
    occasions: ['birthday', 'thanks'], colors: ['warm'],
    prices: [160, 200, 250]
  },
  {
    id: 'hyacinth',
    name: 'יקינטונים בעציץ',
    flowers: 'שלושה יקינטונים בעציץ אבן',
    desc: 'יקינטונים כחולים, לבנים וורודים בעציץ אבן אפור. פורחים בבית ומבשמים את החדר.',
    img: 'assets/img/card10.jpg',
    occasions: ['plants', 'thanks'], colors: ['pastel'],
    prices: [150, 200, 250], sizeLabels: ['עציץ אחד', 'שני עציצים', 'שלושה עציצים']
  },
  {
    id: 'condolence', featured: true, quiet: true,
    name: 'סידור תנחומים לבן',
    flowers: 'ליליום לבן, ורדים לבנים, חרציות לבנות וירוקות ואקליפטוס',
    desc: 'סידור נמוך ושקט בלבן ובירוק כסוף, לבית האבלים. אפשר לצרף כרטיס בכתב יד.',
    img: 'assets/img/card9.jpg',
    occasions: ['condolence'], colors: ['white'],
    prices: [260, 340, 430]
  },
  {
    id: 'wreath', quiet: true,
    name: 'זר אבל',
    flowers: 'ורדים לבנים, חרציות וירק כסוף',
    desc: 'זר אבל לבן בסידור עגול, להלוויה או לאזכרה. נתאם איתכם את המועד והמקום בשיחה.',
    img: 'assets/img/wreath.jpg',
    occasions: ['condolence'], colors: ['white'],
    prices: [350, 450, 600]
  }
];
