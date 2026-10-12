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
  towns: ['זכרון יעקב', 'בנימינה־גבעת עדה', 'פרדס חנה־כרכור', 'קיסריה', 'אור עקיבא', 'עתלית'],
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
    flowers: 'נוריות אפרסק ושמנת, ורדים לבנים וגיפסנית',
    desc: 'זר עגול ורך בגווני אפרסק ושמנת, קשור ביד בחוט פשתן. מתאים כמעט לכל הזדמנות.',
    img: 'assets/img/card1.jpg',
    occasions: ['love', 'birthday', 'thanks'], colors: ['pastel', 'warm'],
    prices: [200, 250, 320]
  },
  {
    id: 'shabbat', featured: true,
    name: 'לבן של שבת',
    flowers: 'ליזיאנטוס, ורדים לבנים והורטנזיה ירוקה',
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
    id: 'morning', featured: true,
    name: 'שמש של בוקר',
    flowers: 'נוריות כתומות, צבעונים צהובים וורדי אלמוג',
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
    flowers: 'דליות בורדו, ורדים כהים ועלי גפן',
    desc: 'זר בגווני יין עמוקים, עם עלי גפן. כמו זכרון יעקב בסוף הקיץ.',
    img: 'assets/img/card6.jpg',
    occasions: ['love', 'birthday'], colors: ['red'],
    prices: [240, 300, 370]
  },
  {
    id: 'welcome', featured: true,
    name: 'ברוכים הבאים',
    flowers: 'אפונה ריחנית, נוריות ורודות ושעוונית',
    desc: 'זר עדין בוורוד ובלבן, לברך את ההורים הטריים ואת מי שרק הגיע לעולם.',
    img: 'assets/img/card8.jpg',
    occasions: ['baby'], colors: ['pastel'],
    prices: [180, 230, 290]
  },
  {
    id: 'orchid', featured: true,
    name: 'סחלב לבן',
    flowers: 'סחלב פלנופסיס בעציץ קרמיקה',
    desc: 'סחלב לבן עם שני ענפי פריחה בעציץ קרמיקה לבן. מחזיק שבועות ארוכים בבית או במשרד.',
    img: 'assets/img/orchid.jpg',
    occasions: ['plants', 'thanks'], colors: ['white'],
    prices: [190, 250, 320], sizeLabels: ['עציץ אחד', 'שני עציצים', 'שלושה עציצים']
  },
  {
    id: 'colorful', featured: true,
    name: 'פינוק צבעוני',
    flowers: 'ורדים בוורוד ובאלמוג, ליזיאנטוס סגול ונוריות צהובות',
    desc: 'זר עליז בהרבה צבעים, למי שאוהב שמח. מתאים ליום הולדת, להחלמה או סתם כי בא לכם.',
    img: 'assets/img/colorful.jpg',
    occasions: ['birthday', 'thanks'], colors: ['warm'],
    prices: [180, 230, 290]
  },
  {
    id: 'peony', pick: 1,
    note: 'אדמוניות שנפתחות לאט, והזר משתנה ומתמלא מיום ליום.',
    name: 'אדמוניות ורודות',
    flowers: 'אדמוניות בוורוד רך ועלווה ירוקה',
    desc: 'אדמוניות שופעות בוורוד רך, בעונתן. זר שנפתח לאט ומתמלא מיום ליום.',
    img: 'assets/img/peony.jpg',
    occasions: ['love', 'birthday', 'thanks'], colors: ['pastel'],
    prices: [260, 330, 420]
  },
  {
    id: 'boy',
    name: 'להולדת הבן',
    flowers: 'דלפיניום כחול, ורדים לבנים וגיפסנית',
    desc: 'זר בכחול ובלבן לברכת ההורים על הולדת הבן, עם דלפיניום, ורדים לבנים וגיפסנית.',
    img: 'assets/img/boy.jpg',
    occasions: ['baby'], colors: ['white'],
    prices: [180, 230, 290]
  },
  {
    id: 'bride',
    name: 'כלה בלבן',
    flowers: 'ורדי גן, אדמוניות ויסמין מטפס',
    desc: 'זר כלה אוורירי בלבן ובשנהב, שגבעוליו עטופים בסרט משי. מומלץ לתאם מראש עם השוזר.',
    img: 'assets/img/card3.jpg',
    occasions: ['wedding'], colors: ['white'],
    prices: [380, 480, 600]
  },
  {
    id: 'engagement', pick: 4,
    note: 'ורוד עתיק ורך, לרגעים שרוצים לזכור.',
    name: 'ורוד של אירוסין',
    flowers: 'ורדים בגוון ורוד עתיק, אדמוניות וליזיאנטוס',
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
    flowers: 'ליזיאנטוס סגול, ורדים ורודים וחרציות לבנות',
    desc: 'שילוב של סגול, ורוד ולבן בזר מלא ומאוזן.',
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
    id: 'sunflower',
    name: 'חמניות',
    flowers: 'חמניות, אקליפטוס וענפי זית',
    desc: 'חמניות גדולות עם אקליפטוס וענפי זית. זר שמחייך מכל פינה בחדר.',
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
    flowers: 'שושנים, ורדים וחרציות לבנים',
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
