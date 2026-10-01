// @ts-nocheck
/* מנוע "ים חכם": נתונים, שירותי תחזית וחישובי ניקוד. ה-UI נמצא ב-React. */

/* =====================================================================
   דייג חכם – Israel Fishing Calculator
   /data       DEFAULT_SPOTS, DEFAULT_TECHNIQUES, DEFAULT_SPECIES, RIGS, DEFAULT_REGS
   /engine     DEFAULT_CONFIG, windCalculator, wavePower, moon, scoreTechnique,
               safetyScore, speciesScore, techAdvice, sessionPlan, checklist, learning
   /services   weatherService, marineService, demoService
   /components render* (UI only)
   ===================================================================== */

const TERRAIN_HE = {sand:"חוף חולי", pier:"מזח / נמל", breakwater:"שובר גלים", rocks:"סלעים", reef:"ריף / טבלת גידוד", mixed:"מעורב חול וסלעים"};

/* ============================ /data/spots.json ============================
   ⚠ קואורדינטות וכיווני חוף משוערים (verified:false). עדכן בלשונית "נקודות". */
const DEFAULT_SPOTS = [
  {id:"achziv",    name:"אכזיב",               lat:33.047, lon:35.100, facing:270, terrain:"reef",       verified:false, notes:"סמוך לשמורה ימית – בדוק גבולות"},
  {id:"nahariya",  name:"נהריה",               lat:33.007, lon:35.090, facing:270, terrain:"mixed",      verified:false},
  {id:"akko",      name:"עכו – חומות ונמל",     lat:32.919, lon:35.066, facing:255, terrain:"rocks",      verified:false},
  {id:"kiryatyam", name:"קריית ים",             lat:32.852, lon:35.063, facing:295, terrain:"sand",       verified:false},
  {id:"batgalim",  name:"בת גלים – שובר גלים",  lat:32.832, lon:34.978, facing:345, terrain:"breakwater", verified:false},
  {id:"atlit",     name:"עתלית",               lat:32.700, lon:34.935, facing:270, terrain:"mixed",      verified:false},
  {id:"dor",       name:"דור",                 lat:32.612, lon:34.915, facing:270, terrain:"reef",       verified:false},
  {id:"caesarea",  name:"קיסריה",              lat:32.500, lon:34.890, facing:275, terrain:"rocks",      verified:false},
  {id:"michmoret", name:"מכמורת",              lat:32.407, lon:34.869, facing:280, terrain:"mixed",      verified:false},
  {id:"netanya",   name:"נתניה",               lat:32.330, lon:34.850, facing:285, terrain:"sand",       verified:false},
  {id:"herzliya",  name:"הרצליה – מרינה",       lat:32.162, lon:34.797, facing:285, terrain:"breakwater", verified:false},
  {id:"telaviv",   name:"תל אביב – נמל/הילטון", lat:32.090, lon:34.770, facing:290, terrain:"breakwater", verified:false},
  {id:"jaffa",     name:"יפו",                 lat:32.053, lon:34.750, facing:290, terrain:"rocks",      verified:false},
  {id:"ashdod",    name:"אשדוד",               lat:31.800, lon:34.635, facing:295, terrain:"sand",       verified:false},
  {id:"haifadado", name:"חיפה – חוף דדו / הכרמל", lat:32.797, lon:34.955, facing:275, terrain:"sand", verified:false},
  {id:"sdotyam",   name:"שדות ים",             lat:32.490, lon:34.887, facing:275, terrain:"sand",       verified:false},
  {id:"tagordon",  name:"תל אביב – חוף גורדון",  lat:32.083, lon:34.767, facing:285, terrain:"sand",       verified:false},
  {id:"ashkelon",  name:"אשקלון",              lat:31.670, lon:34.555, facing:295, terrain:"sand",       verified:false}
];

/* ============================ /data/techniques.json ======================
   score: wave/wind = ספים ({max, pts, label}); time = נקודות לפי חלון;
   terrain = נקודות לפי עמדה; שאר השדות = מתקנים אופציונליים.              */
const DEFAULT_TECHNIQUES = [
  { id:"spin", name:"ז׳ירז׳ור", family:"lure",
    desc:"זריקה ואיסוף של דמויים – Minnow, Pencil, סיליקון. דיג אקטיבי לטורפים מהחוף.",
    gear:{rod:"2.70–3.00 מ׳ · הטלה 10–40 גרם", reel:"3000–4000", line:"קלוע PE 0.8–1.2", leader:"פלורו 0.35–0.45 מ״מ · 1–1.5 מ׳"},
    rigs:["spinSetup"], knots:["FG או Albright – קלוע ללידר","Loop knot או סנאפ – לדמוי"],
    pack:["2–3 Minnow בגדלים שונים","Sinking Pencil + Pencil לפני המים","2 סיליקונים + ראשי עופרת","סנאפים רזרביים"],
    score:{ wave:[{max:0.15,pts:14,label:"ים כמעט פלטה"},{max:0.35,pts:22,label:"גל קל"},{max:0.7,pts:28,label:"גל אידיאלי לטורפים"},{max:1.0,pts:25,label:"ים עובד – טוב לטורפים"},{max:1.3,pts:null,label:"ים גבוה – תלוי בעמדה"},{max:1.6,pts:5,label:"ים גבוה מאוד"},{max:99,pts:0,label:"ים סוער"}],
      waveByTerrain:{sand:14,pier:12,mixed:11,breakwater:9,reef:6,rocks:5},
      wind:[{max:12,pts:18,label:"רוח חלשה"},{max:20,pts:12,label:"רוח בינונית"},{max:28,pts:5,label:"רוח חזקה – זריקות קשות"},{max:999,pts:0,label:"רוח חזקה מאוד"}],
      time:{goldenMorning:25,goldenEvening:22,day:8,midday:3,night:7}, timeNote:{goldenMorning:"שעת פעילות טורפים",goldenEvening:"שעת פעילות טורפים"},
      terrain:{reef:8,mixed:8,rocks:7,breakwater:7,pier:5,sand:5}, temp:8, cloud:4,
      movement:{min:0.3,max:1.0,pts:5,label:"תנועה וקצף – מסתור לטורפים"},
      offshore:{pts:3,maxKmh:20}, onshore:{pts:-5,fromKmh:15,label:"רוח מהים בפנים – זריקות קצרות"}, cross:{pts:-2,fromKmh:18}, gust:-4, pressure:3 } },
  { id:"lrf", name:"LRF – דיג קל", family:"lure",
    desc:"Light Rock Fishing: ראשי עופרת של 0.5–5 גרם וסיליקונים קטנים, ליד סלעים, מזחים ואורות. הרבה נגיעות, דגים קטנים עד בינוניים.",
    gear:{rod:"1.90–2.30 מ׳ · הטלה 0.5–7 גרם", reel:"1000–2000", line:"קלוע PE 0.2–0.4", leader:"פלורו 0.16–0.22 מ״מ · 0.8–1 מ׳"},
    rigs:["lrfJighead","dropShot"], knots:["FG / Double Uni – קלוע ללידר","Improved Clinch – לראש העופרת","Palomar – לקרס דרופשוט"],
    pack:["ראשי עופרת 0.8–5 גרם","סיליקונים 1.5–2.5 אינץ׳ (שקוף, לבן, זוהר)","קרסי דרופשוט + משקולות 3–7 גרם","לידר 0.18 רזרבי"],
    score:{ wave:[{max:0.15,pts:28,label:"ים שקט – אידיאלי ל-LRF"},{max:0.35,pts:22,label:"גל קל"},{max:0.6,pts:10,label:"קשה לשלוט בדמוי קל"},{max:1.0,pts:3,label:"ים גבוה ל-LRF"},{max:99,pts:0,label:"ים סוער"}],
      wind:[{max:6,pts:18,label:"כמעט בלי רוח"},{max:12,pts:14,label:"רוח חלשה"},{max:18,pts:5,label:"רוח מקשה על דמויים של 1–3 גרם"},{max:999,pts:0,label:"רוח חזקה"}],
      time:{night:25,goldenEvening:22,goldenMorning:18,day:8,midday:5}, timeNote:{night:"אורות מזח ונמל מושכים דגים קטנים"},
      terrain:{pier:10,breakwater:9,rocks:8,reef:7,mixed:6,sand:2}, temp:8,
      calm:{maxH:0.3,maxWind:10,pts:6,label:"מים שקטים – מרגישים כל נגיעה"}, cross:{pts:-4,fromKmh:10}, gust:-4 } },
  { id:"shorejig", name:"ג׳יגינג מהחוף", family:"lure",
    desc:"זריקות ארוכות של מתכות 25–60 גרם משובר גלים, מזח או סלעים לעומק. השיטה לפלמידה וגומבר בשחר.",
    gear:{rod:"2.90–3.30 מ׳ · הטלה 30–80 גרם", reel:"4000–6000", line:"קלוע PE 1.2–2.0", leader:"ניילון/פלורו 0.45–0.57 מ״מ · 1.5 מ׳"},
    rigs:["shoreJig"], knots:["FG – קלוע ללידר","Palomar – לטבעת הסולידית"],
    pack:["מתכות 25 / 40 / 60 גרם","קרסי אסיסט רזרביים","טבעות סולידיות + פיצול","משקפי שמש מקטבים לזיהוי להקות"],
    score:{ wave:[{max:0.15,pts:22,label:"ים שקט – מתכות עובדות"},{max:0.5,pts:28,label:"גל נוח לג׳יגינג"},{max:0.9,pts:22,label:"ים עובד – עדיין דיג"},{max:1.3,pts:8,label:"קשה לעבוד ולהנחית"},{max:99,pts:0,label:"ים סוער"}],
      wind:[{max:10,pts:18,label:"רוח חלשה"},{max:18,pts:13,label:"רוח בינונית"},{max:25,pts:5,label:"רוח חזקה"},{max:999,pts:0,label:"רוח חזקה מאוד"}],
      time:{goldenMorning:25,goldenEvening:18,day:10,midday:6,night:3}, timeNote:{goldenMorning:"להקות פלמידה וגומבר בשחר"},
      terrain:{breakwater:10,pier:10,rocks:8,reef:6,mixed:6,sand:5}, temp:8,
      offshore:{pts:6,maxKmh:25,label:"רוח מהיבשה – הזריקה הכי רחוקה"}, onshore:{pts:-6,fromKmh:12,label:"רוח בפנים – מקצרת זריקות"}, gust:-3, pressure:3 } },
  { id:"eging", name:"אגינג – דיונונים", family:"lure",
    desc:"דיג דיונונים עם אגי (דמוי שרימפס). מים שקטים וצלולים, דמדומים ולילה, ליד מזחים, סלעים ואורות.",
    gear:{rod:"2.40–2.60 מ׳ · חכת אגינג", reel:"2500", line:"קלוע PE 0.6–0.8", leader:"פלורו 0.22–0.26 מ״מ · 1.5–2 מ׳"},
    rigs:["eging"], knots:["FG – קלוע ללידר","Clinch – לסנאפ קטן"],
    pack:["אגי 2.5 / 3.0 / 3.5 בכמה צבעים","סנאפים קטנים","פנס ראש עם אור אדום","מגבת – הדיונון מתיז דיו"],
    score:{ wave:[{max:0.2,pts:28,label:"ים שקט – מים צלולים"},{max:0.45,pts:22,label:"גל קל"},{max:0.7,pts:10,label:"מים תנועתיים ועכורים"},{max:1.0,pts:3,label:"קשה"},{max:99,pts:0,label:"ים סוער"}],
      wind:[{max:8,pts:18,label:"רוח חלשה"},{max:15,pts:12,label:"רוח בינונית"},{max:22,pts:4,label:"רוח חזקה"},{max:999,pts:0,label:"רוח חזקה מאוד"}],
      time:{goldenEvening:25,night:22,goldenMorning:20,day:6,midday:3}, timeNote:{goldenEvening:"דיונונים מתקרבים לחוף בחשיכה",night:"ליד אורות"},
      terrain:{pier:10,breakwater:10,rocks:9,reef:9,mixed:6,sand:3}, temp:6,
      moon:5, moonNote:"אור עוזר לדיונון לראות את האגי",
      season:{months:[11,12,1,2,3,4,5],in:6,out:-15,label:"עונת דיונונים"}, cross:{pts:-3,fromKmh:12} } },
  { id:"surf", name:"פתיונות קרקעית (סרף)", family:"bait",
    desc:"פתיונות על הקרקעית עם משקולת – ריג שני קרסים או ריג רץ. החכה על מעמד ומחכים לנגיעה.",
    gear:{rod:"3.90–4.50 מ׳ · הטלה 100–200 גרם", reel:"5000–8000 / סליל סרף", line:"ניילון 0.28–0.35 מ״מ", leader:"לידר זעזועים 0.57–0.70 מ״מ"},
    rigs:["paternoster","runningLedger"], knots:["Uni-Uni או Shock leader knot – ניילון ללידר","Snell – קרס לחוט"],
    pack:["משקולות לפי הים + 2 רזרביות","3 ריגים מוכנים","מעמד חכה לחול / למזח","פתיונות בצידנית","פעמון או סטיק זוהר ללילה"],
    score:{ wave:[{max:0.2,pts:24,label:"ים שקט – דיג עדין"},{max:0.6,pts:28,label:"גל אידיאלי לפתיונות"},{max:1.0,pts:20,label:"אפשרי עם משקולת עוגנים"},{max:1.3,pts:9,label:"קשה להחזיק קרקעית"},{max:1.6,pts:3,label:"ים גבוה"},{max:99,pts:0,label:"ים סוער"}],
      wind:[{max:15,pts:18,label:"רוח חלשה"},{max:25,pts:12,label:"רוח בינונית"},{max:35,pts:5,label:"רוח חזקה – קשה לזהות נגיעות"},{max:999,pts:0,label:"רוח חזקה מאוד"}],
      time:{goldenEvening:22,night:20,goldenMorning:18,day:9,midday:6},
      terrain:{sand:10,mixed:9,pier:8,breakwater:7,reef:6,rocks:6}, temp:8, steady:5,
      movement:{min:0.3,max:0.9,pts:4,label:"קצף בינוני – מזון נחשף מהחול"},
      current:{fromKmh:1.5,pts:-3}, onshore:{pts:-4,fromKmh:20,label:"רוח חזקה מהים – קשה לזהות נגיעות"}, cross:{pts:-3,fromKmh:20}, gust:-3, pressure:2 } },
  { id:"float", name:"מצוף", family:"bait",
    desc:"פתיון תלוי מתחת למצוף בעומק קבוע, עם פיזור מזון. מעולה מסלעים ומזחים בים שקט.",
    gear:{rod:"4.00–5.00 מ׳ (בולונז) או 3.60 מ׳", reel:"3000", line:"ניילון 0.20–0.25 מ״מ", leader:"ניילון/פלורו 0.16–0.20 מ״מ"},
    rigs:["floatRig"], knots:["קשר עוצר (Stopper) – לעומק","Improved Clinch – למסתובב","Snell – לקרס"],
    pack:["מצופים 3 / 5 / 8 גרם","עוצרים וחרוזים","עופרות קטנות (Split shot)","לחם / שרימפס","פיזור – לחם רטוב או סרדין טחון"],
    score:{ wave:[{max:0.2,pts:28,label:"ים שקט – מצוף יציב"},{max:0.45,pts:22,label:"גל קל"},{max:0.7,pts:10,label:"המצוף קופץ – קשה לקרוא נגיעות"},{max:1.0,pts:3,label:"קשה"},{max:99,pts:0,label:"ים סוער"}],
      wind:[{max:8,pts:18,label:"רוח חלשה"},{max:15,pts:11,label:"המצוף נסחף"},{max:22,pts:4,label:"רוח חזקה"},{max:999,pts:0,label:"רוח חזקה מאוד"}],
      time:{goldenMorning:22,goldenEvening:22,day:15,midday:10,night:5},
      terrain:{rocks:10,pier:10,breakwater:10,reef:9,mixed:6,sand:3}, temp:8, steady:6,
      cross:{pts:-4,fromKmh:12}, onshore:{pts:-3,fromKmh:15}, gust:-3 } },
  { id:"livebait", name:"פתיון חי", family:"bait",
    desc:"דג פתיון חי על קרס מעגלי – חופשי או עם משקולת רצה. לטורפים גדולים בשחר, בערב ובקצף.",
    gear:{rod:"3.00–3.60 מ׳ · הטלה 40–100 גרם", reel:"4000–5000", line:"ניילון 0.35 מ״מ או PE 1.5", leader:"ניילון/פלורו 0.50–0.60 מ״מ · 1 מ׳"},
    rigs:["liveBait","runningLedger"], knots:["Uni – לקרס מעגלי","Uni-Uni – ללידר"],
    pack:["קרסים מעגליים 2/0–4/0","דלי עם מאוורר לפתיון חי","משקולות רצות 40–80 גרם","מעמד חכה"],
    score:{ wave:[{max:0.2,pts:18,label:"ים שקט – פחות גירוי"},{max:0.5,pts:24,label:"גל קל"},{max:1.0,pts:28,label:"ים עובד – טורפים ניזונים בקצף"},{max:1.3,pts:12,label:"קשה לשלוט"},{max:99,pts:2,label:"ים סוער"}],
      wind:[{max:15,pts:18,label:"רוח חלשה"},{max:25,pts:12,label:"רוח בינונית"},{max:32,pts:4,label:"רוח חזקה"},{max:999,pts:0,label:"רוח חזקה מאוד"}],
      time:{goldenMorning:25,goldenEvening:25,night:18,day:8,midday:4},
      terrain:{mixed:10,breakwater:9,pier:9,reef:8,rocks:7,sand:7}, temp:8,
      movement:{min:0.3,max:1.0,pts:5,label:"תנועה וקצף – טורפים צדים ליד החוף"}, gust:-3, pressure:3 } }
];

/* ============================ /data/species.json ==========================
   techniques = השיטות שבהן המין נתפס. ערכי פתיחה לכיול – לא אמת מדעית.     */
const DEFAULT_SPECIES = [
  {id:"lavrak", nameHebrew:"לברק", nameEnglish:"European seabass", techniques:["spin","livebait","surf"],
   preferredWaveMin:0.35, preferredWaveMax:1.2, preferredWind:{maxKmh:25, likes:"onshore"}, preferredWaterTemp:[13,22], preferredSeason:[11,12,1,2,3,4],
   preferredTimeOfDay:["goldenMorning","goldenEvening","night"], preferredTerrain:["mixed","rocks","reef","breakwater"], preferredWaterClarity:"עכור / קצף",
   preferredLureTypes:["Minnow","Soft Plastic","Sinking Pencil"], preferredBaits:["שרימפס","סרדין","תולעים"], hook:"1/0–3/0",
   notes:"אוהב קצף, שבירת גל ומעברים בין חול לסלע. עונת השיא בחורף."},
  {id:"gomber", nameHebrew:"גומבר", nameEnglish:"Bluefish", techniques:["spin","shorejig","livebait"],
   preferredWaveMin:0.2, preferredWaveMax:0.9, preferredWind:{maxKmh:22, likes:"any"}, preferredWaterTemp:[17,27], preferredSeason:[4,5,6,9,10,11,12],
   preferredTimeOfDay:["goldenMorning","goldenEvening"], preferredTerrain:["sand","mixed","breakwater","pier"], preferredWaterClarity:"בינונית",
   preferredLureTypes:["Pencil","Sinking Pencil","Jig","Minnow"], preferredBaits:["סרדין","רצועת דג"], hook:"1/0–3/0",
   notes:"עובד בלהקות ותוקף מהר. שיניים חדות – לידר עבה."},
  {id:"palamida", nameHebrew:"פלמידה", nameEnglish:"Atlantic bonito", techniques:["shorejig","spin"],
   preferredWaveMin:0.0, preferredWaveMax:0.6, preferredWind:{maxKmh:18, likes:"offshore"}, preferredWaterTemp:[16,24], preferredSeason:[10,11,12,1,2,3,4],
   preferredTimeOfDay:["goldenMorning"], preferredTerrain:["breakwater","pier","rocks","mixed"], preferredWaterClarity:"צלולה",
   preferredLureTypes:["Jig","Sinking Pencil"], preferredBaits:["סרדין בציפה"], hook:"אסיסט 1/0–2/0",
   notes:"דורש זריקות ארוכות ומים נוחים לעבודה עם מתכות."},
  {id:"trachon", nameHebrew:"טרכון", nameEnglish:"Leerfish", techniques:["spin","livebait","shorejig"],
   preferredWaveMin:0.2, preferredWaveMax:0.9, preferredWind:{maxKmh:22, likes:"any"}, preferredWaterTemp:[20,29], preferredSeason:[4,5,6,7,8,9,10,11],
   preferredTimeOfDay:["goldenMorning","goldenEvening"], preferredTerrain:["sand","mixed","breakwater","pier"], preferredWaterClarity:"בינונית",
   preferredLureTypes:["Pencil","Minnow","Soft Plastic"], preferredBaits:["דג פתיון חי"], hook:"3/0–5/0 מעגלי",
   notes:"רודף בורי ודגי פתיון קרוב לחוף, בעיקר בעונה החמה."},
  {id:"sargus", nameHebrew:"סרגוס", nameEnglish:"White seabream", techniques:["surf","float","lrf"],
   preferredWaveMin:0.3, preferredWaveMax:1.0, preferredWind:{maxKmh:25, likes:"onshore"}, preferredWaterTemp:[14,26], preferredSeason:[1,2,3,4,5,6,7,8,9,10,11,12],
   preferredTimeOfDay:["goldenEvening","night","goldenMorning"], preferredTerrain:["rocks","reef","breakwater","pier"], preferredWaterClarity:"קצף סביב סלעים",
   preferredLureTypes:["Soft Plastic קטן"], preferredBaits:["שרימפס","תולעים","סרטן","לחם"], hook:"#6–#2",
   notes:"ניזון בקצף סביב סלעים כשיש קצת תנועה."},
  {id:"marmir", nameHebrew:"מרמיר", nameEnglish:"Striped seabream", techniques:["surf","lrf"],
   preferredWaveMin:0.0, preferredWaveMax:0.6, preferredWind:{maxKmh:20, likes:"any"}, preferredWaterTemp:[18,29], preferredSeason:[5,6,7,8,9,10,11],
   preferredTimeOfDay:["day","goldenEvening","goldenMorning"], preferredTerrain:["sand","mixed"], preferredWaterClarity:"צלולה עד בינונית",
   preferredLureTypes:["סיליקון תולעת קטן"], preferredBaits:["תולעי חול","שרימפס","צדפות"], hook:"#8–#4",
   notes:"חופר בחול בקו הגלים הראשון. ים קל עד בינוני."},
  {id:"denis", nameHebrew:"דניס", nameEnglish:"Gilthead seabream", techniques:["surf","float"],
   preferredWaveMin:0.1, preferredWaveMax:0.7, preferredWind:{maxKmh:22, likes:"any"}, preferredWaterTemp:[14,26], preferredSeason:[9,10,11,12,1,2,3],
   preferredTimeOfDay:["goldenEvening","night","goldenMorning"], preferredTerrain:["sand","mixed","breakwater","pier"], preferredWaterClarity:"בינונית",
   preferredLureTypes:[], preferredBaits:["סרטן","שרימפס","מולים","תולעים"], hook:"#2–1/0",
   notes:"זהיר. קרקעית נוחה וריג עדין עוזרים."},
  {id:"muser", nameHebrew:"מוסר", nameEnglish:"(לאמת זיהוי)", techniques:["float","surf","lrf"],
   preferredWaveMin:0.2, preferredWaveMax:0.8, preferredWind:{maxKmh:22, likes:"any"}, preferredWaterTemp:[16,28], preferredSeason:[1,2,3,4,5,6,7,8,9,10,11,12],
   preferredTimeOfDay:["goldenEvening","night"], preferredTerrain:["rocks","reef","breakwater","pier"], preferredWaterClarity:"בינונית",
   preferredLureTypes:["Soft Plastic"], preferredBaits:["דג פתיון","דיונון","סרטן"], hook:"#1–2/0", identityVerified:false,
   notes:"פרופיל כללי לדג סלעים – עדכן לפי הניסיון שלך. ודא זיהוי ומעמד הגנה."},
  {id:"squid", nameHebrew:"דיונון", nameEnglish:"Squid", techniques:["eging"],
   preferredWaveMin:0.0, preferredWaveMax:0.5, preferredWind:{maxKmh:15, likes:"any"}, preferredWaterTemp:[15,24], preferredSeason:[11,12,1,2,3,4,5],
   preferredTimeOfDay:["goldenEvening","night","goldenMorning"], preferredTerrain:["pier","breakwater","rocks","reef"], preferredWaterClarity:"צלולה",
   preferredLureTypes:["אגי 2.5–3.5"], preferredBaits:["דג פתיון על מצוף"], hook:"אגי",
   notes:"מתקרב לחוף בדמדומים ובלילה, אוהב מים צלולים ואזורים מוארים."}
];

/* ============================ /data/regulations.json ===================== */
const DEFAULT_REGS = [
  {title:"תקופת רבייה בים התיכון", body:"לפי מה שפורסם ל-2026: 1 במאי עד 30 ביוני. לדיג בחכה מהחוף קיימת החרגה בתקנות הרלוונטיות – יש לוודא את הנוסח המעודכן לכל שנה.", status:"לאימות", year:2026},
  {title:"שמורות טבע ימיות", body:"בשמורות ימיות מוכרזות הדיג אסור או מוגבל (למשל באזור ראש הנקרה–אכזיב). בדוק את גבולות השמורה לפני שאתה נכנס לנקודה.", status:"כללי"},
  {title:"מינים מוגנים", body:"חלק ממיני הדגים מוגנים או מוגבלים (למשל חלק מהדקרים). בדוק רשימה עדכנית ושחרר כל דג שאינך בטוח לגביו.", status:"כללי"},
  {title:"גודל מינימלי ומכסות", body:"לחלק מהמינים קיים גודל מינימלי ומכסה יומית. מדוד לפני לקיחה.", status:"כללי"},
  {title:"פתיון חי", body:"בדוק אילו מינים מותר להחזיק ולהשתמש בהם כפתיון חי, ובאיזה גודל.", status:"כללי"},
  {title:"רישוי ומזחים", body:"בדוק אם נדרש רישיון לסוג הדיג שלך, והאם הדיג מותר במזח או בנמל הספציפי.", status:"כללי"}
];

/* ============================ /engine/config ============================= */
const DEFAULT_CONFIG = {
  goldenWindows:{ morningBeforeSunriseMin:60, morningAfterSunriseMin:120, eveningBeforeSunsetMin:120, eveningAfterSunsetMin:30, middayFrom:11, middayTo:15 },
  wave:{ refPeriod:6, periodFactorMin:0.85, periodFactorMax:1.35, longSwellMinH:0.5, longSwellPeriod:9, longSwellAdd:0.1 },
  temp:{ idealMin:18, idealMax:27, okMin:14, okMax:29 },
  gustGapKmh:15, rainMm:2, rainPenalty:-3,
  pressure:{ fallingHpa3h:-1.5, risingHpa3h:2 },
  safety:{
    baseLimitM:1.2,
    terrainFactor:{sand:1.0, pier:0.95, mixed:0.85, breakwater:0.7, reef:0.7, rocks:0.65},
    startFraction:0.6, maxWavePenalty:75, waveScale:90,
    longPeriodS:9, longPeriodMinH:0.6, longPeriodPenalty:-10,
    wind:[{min:35,pts:-15},{min:28,pts:-8}], gust:[{min:45,pts:-20},{min:35,pts:-10}],
    thunderPenalty:-45, heavyRainMm:4, heavyRainPenalty:-5, nightOnRocksPenalty:-5, warnAbsoluteM:1.6
  },
  overall:{ safetyFullAt:75, minFactor:0.55 },
  species:{ baseWeight:0.5, baseOffset:0, waveIn:10, waveOutPerM:25, waveOutMax:15, seasonIn:10, seasonOut:-15, timeIn:8, timeOut:-5, terrainIn:8, terrainOut:-8, tempIn:6, tempOut:-6, windOver:-8, windLikes:4, goodFrom:65, midFrom:45 }
};

const PHASE_HE = {goldenMorning:"חלון בוקר", goldenEvening:"חלון ערב", day:"יום", midday:"צהריים", night:"לילה"};
const WIND_CLS_HE = {onshore:"מהים", offshore:"מהיבשה", cross:"מהצד", unknown:"—"};
const TZ = "Asia/Jerusalem";

/* ============================ helpers ============================ */
const $ = (s, r=document) => r.querySelector(s);
const clamp = (x,a,b) => Math.max(a, Math.min(b, x));
const r1 = x => Math.round(x*10)/10, r2 = x => Math.round(x*100)/100;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toMin = t => { const m = /(\d{2}):(\d{2})/.exec(t.length > 5 ? t.slice(11) : t); return m ? (+m[1])*60 + (+m[2]) : null; };
const hhmm = m => { m = ((Math.round(m)%1440)+1440)%1440; return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); };
const fmt = (v, d=1, u="") => v == null || Number.isNaN(v) ? "—" : (d === 0 ? Math.round(v) : v.toFixed(d)) + u;
// טווחים כמו 10–25 או 06:00–09:00 מתהפכים בטקסט עברי – עוטפים אותם בבידוד LTR
// (לא נוגעים בתוך <svg> – span בתוך SVG שובר את השרטוט; שם משתמשים ב-isoRange)
const fixBidi = html => html.split(/(<svg[\s\S]*?<\/svg>)/).map((part, i) => i % 2 ? part : part.replace(/(\d[\d.:\/]*)–(\d[\d.:\/]*)/g, '<span dir="ltr">$1–$2</span>')).join("");
const isoRange = s => String(s).replace(/(\d[\d.:\/]*)–(\d[\d.:\/]*)/g, "⁦$1–$2⁩");
function isObj(o){ return o && typeof o === "object" && !Array.isArray(o); }
function deepMerge(base, over){ if(!isObj(over)) return base; const out = {...base}; for(const k of Object.keys(over)){ out[k] = isObj(base?.[k]) && isObj(over[k]) ? deepMerge(base[k], over[k]) : over[k]; } return out; }
const store = {
  get(k, d){ try { const v = localStorage.getItem("dg_"+k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem("dg_"+k, JSON.stringify(v)); return true; } catch(e){ return false; } },
  del(k){ try { localStorage.removeItem("dg_"+k); } catch(e){} }
};
function localISODate(d = new Date()){ const p = new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(d); const g = t => p.find(x=>x.type===t).value; return `${g("year")}-${g("month")}-${g("day")}`; }
function localHour(d = new Date()){ return +new Intl.DateTimeFormat("en-GB",{timeZone:TZ,hour:"2-digit",hour12:false}).format(d) % 24; }
function dayLabel(iso, idx){ if(idx===0) return "היום"; if(idx===1) return "מחר"; const d = new Date(iso+"T12:00:00"); return "יום " + ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"][d.getDay()]; }
function shortDate(iso){ return +iso.slice(8,10) + "." + +iso.slice(5,7); }

/* ============================ /engine/windCalculator ======================
   כיוון רוח = הכיוון שממנו היא מגיעה. shoreFacing = הכיוון שהחוף פונה אליו.
   הפרש ≤ 50° → מהים (Onshore) · ≥ 130° → מהיבשה (Offshore) · אחרת → צד.   */
const windCalculator = {
  angleDiff(a, b){ const d = Math.abs((((a - b) % 360) + 360) % 360); return d > 180 ? 360 - d : d; },
  classify(windFrom, facing){
    if(windFrom == null) return {cls:"unknown", he:"לא ידוע", short:"—", diff:null};
    const diff = this.angleDiff(windFrom, facing);
    if(diff <= 50)  return {cls:"onshore",  he:"מהים (Onshore)", short:"Onshore", diff};
    if(diff >= 130) return {cls:"offshore", he:"מהיבשה (Offshore)", short:"Offshore", diff};
    return {cls:"cross", he:"רוח צד (Cross-shore)", short:"Cross", diff};
  },
  compassHe(deg){ if(deg == null) return "—"; const n = ["צפונית","צפון-מזרחית","מזרחית","דרום-מזרחית","דרומית","דרום-מערבית","מערבית","צפון-מערבית"]; return n[Math.round((((deg % 360) + 360) % 360) / 45) % 8]; }
};

/* ============================ /engine/wavePower ===========================
   אנרגיית גל ∝ H²×T. גובה אפקטיבי: Heff = H × clamp(√(T/refPeriod)) (+ סוול ארוך).
   WavePowerIndex ≈ 0.49 × H² × T  (kW/m)                                     */
function wavePower(h, cfg){
  const W = cfg.wave, H = h.waveH ?? 0, T = h.wavePeriod ?? W.refPeriod;
  const factor = clamp(Math.sqrt(T / W.refPeriod), W.periodFactorMin, W.periodFactorMax);
  let heff = H * factor, swellAdd = 0;
  if((h.swellH ?? 0) >= W.longSwellMinH && (h.swellPeriod ?? 0) >= W.longSwellPeriod){ swellAdd = W.longSwellAdd; heff += swellAdd; }
  return { H, T, factor, swellAdd, heff: r2(heff), kw: r1(0.49 * H * H * T) };
}

/* ============================ /engine/moon ================================
   מופע ירח מחושב מקומית (חודש סינודי 29.53 ימים ממולד ידוע ב-6.1.2000).   */
const moonCache = {};
function moonInfo(iso){
  if(moonCache[iso]) return moonCache[iso];
  const [y,m,d] = iso.split("-").map(Number), syn = 29.530588853;
  const age = ((((Date.UTC(y,m-1,d,19) - Date.UTC(2000,0,6,18,14)) / 864e5) % syn) + syn) % syn;
  const illum = (1 - Math.cos(2 * Math.PI * age / syn)) / 2;
  const names = [[1.85,"מולד","🌑"],[5.54,"סהר עולה","🌒"],[9.23,"רבע ראשון","🌓"],[12.92,"ירח עולה","🌔"],[16.61,"ירח מלא","🌕"],[20.3,"ירח יורד","🌖"],[23.99,"רבע אחרון","🌗"],[27.68,"סהר יורד","🌘"],[31,"מולד","🌑"]];
  const n = names.find(x => age < x[0]);
  return moonCache[iso] = { age, illum, name:n[1], icon:n[2] };
}

function dayPhase(h, cfg){
  const g = cfg.goldenWindows, t = h.min + 30;
  if(t >= h.sunrise - g.morningBeforeSunriseMin && t <= h.sunrise + g.morningAfterSunriseMin) return "goldenMorning";
  if(t >= h.sunset - g.eveningBeforeSunsetMin && t <= h.sunset + g.eveningAfterSunsetMin) return "goldenEvening";
  if(t < h.sunrise - g.morningBeforeSunriseMin || t > h.sunset + g.eveningAfterSunsetMin) return "night";
  if(h.hour >= g.middayFrom && h.hour < g.middayTo) return "midday";
  return "day";
}
const band = (list, x) => list.find(b => x <= b.max) || list[list.length-1];
const isThunder = c => c === 95 || c === 96 || c === 99;
function tempPoints(sst, T, max){
  if(sst == null) return {pts:Math.round(max/2), label:"טמפ׳ מים לא זמינה"};
  if(sst >= T.idealMin && sst <= T.idealMax) return {pts:max, label:`מים ${fmt(sst,1)}° – טווח טוב`};
  if(sst >= T.okMin && sst <= T.okMax) return {pts:Math.round(max*0.6), label:`מים ${fmt(sst,1)}° – סביר`};
  return {pts:Math.round(max*0.3), label:`מים ${fmt(sst,1)}° – קיצוני`};
}

/* ============================ /engine/scoreTechnique ======================
   מנוע ניקוד אחד לכל השיטות – ההבדלים כולם בנתוני score של כל שיטה.       */
function scoreTechnique(t, h, x, cfg){
  const S = t.score, items = [], add = (p, l) => items.push({pts: Math.round(p), label: l});
  const wb = band(S.wave, x.wp.heff);
  add(wb.pts ?? (S.waveByTerrain?.[x.terrain] ?? 10), `${wb.label} (אפקטיבי ${fmt(x.wp.heff,2)} מ׳)`);
  const wind = h.windSpeed ?? 0, wnd = band(S.wind, wind);
  add(wnd.pts, `${wnd.label} (${fmt(wind,0)} קמ״ש)`);
  if(S.offshore && x.wind.cls === "offshore" && wind <= S.offshore.maxKmh) add(S.offshore.pts, S.offshore.label || "רוח מהיבשה – ים חלק וזריקות ארוכות");
  if(S.onshore && x.wind.cls === "onshore" && wind >= S.onshore.fromKmh) add(S.onshore.pts, S.onshore.label || "רוח חזקה מהים בפנים");
  if(S.cross && x.wind.cls === "cross" && wind >= S.cross.fromKmh) add(S.cross.pts, S.cross.label || "רוח צד – הקו נסחף");
  if(S.gust && h.gust != null && h.gust - wind >= cfg.gustGapKmh) add(S.gust, `משבים עד ${fmt(h.gust,0)} קמ״ש`);
  add(S.time[x.phase] ?? 0, PHASE_HE[x.phase] + (S.timeNote?.[x.phase] ? " – " + S.timeNote[x.phase] : ""));
  if(S.temp){ const tp = tempPoints(h.sst, cfg.temp, S.temp); add(tp.pts, tp.label); }
  if(S.cloud && x.phase !== "night" && h.cloud != null){ const oc = h.cloud >= 60; add(oc ? S.cloud : Math.round(S.cloud * 0.4), oc ? `עננות ${fmt(h.cloud,0)}% – פחות אור, דגים נועזים יותר` : `עננות ${fmt(h.cloud,0)}%`); }
  add(S.terrain[x.terrain] ?? 5, `עמדה: ${TERRAIN_HE[x.terrain]}`);
  if(S.movement && x.wp.heff >= S.movement.min && x.wp.heff <= S.movement.max) add(S.movement.pts, S.movement.label);
  if(S.calm && x.wp.heff <= S.calm.maxH && wind <= S.calm.maxWind) add(S.calm.pts, S.calm.label);
  if(S.steady && h.wavePeriod != null && h.wavePeriod >= 6 && (h.waveH ?? 0) <= 0.8) add(S.steady, "ים מסודר – שליטה טובה בציוד");
  if(S.current && h.current != null && h.current >= S.current.fromKmh) add(S.current.pts, `זרם ${fmt(h.current,1)} קמ״ש – יסחוף משקולת קלה`);
  if(S.pressure && h.pTrend != null){
    if(h.pTrend <= cfg.pressure.fallingHpa3h) add(S.pressure, `לחץ יורד (${fmt(h.pTrend,1)} hPa ב-3 שעות) – טורפים פעילים לפני מערכת`);
    else if(h.pTrend >= cfg.pressure.risingHpa3h) add(-S.pressure, `לחץ עולה חד (+${fmt(h.pTrend,1)}) – אחרי מערכת הדג איטי`);
  }
  if(S.moon && x.phase === "night") add(Math.round(S.moon * x.moon.illum), `ירח ${Math.round(x.moon.illum*100)}% – ${S.moonNote || ""}`);
  if(S.season){ const mo = +h.date.slice(5,7), inS = S.season.months.includes(mo); add(inS ? S.season.in : S.season.out, `${S.season.label} – ${inS ? "בעונה" : "מחוץ לעונה"}`); }
  if((h.precip ?? 0) >= cfg.rainMm) add(cfg.rainPenalty, `גשם ${fmt(h.precip,1)} מ״מ`);
  return { score: clamp(items.reduce((s,i)=>s+i.pts,0), 0, 100), items };
}

/* ============================ /engine/safetyScore =========================
   מתחיל מ-100. מגבלת הגל תלויה בעמדה: limit = baseLimit × terrainFactor.   */
function scoreSafety(h, x, cfg){
  const F = cfg.safety, items = [], add = (p, l) => items.push({pts: Math.round(p), label: l});
  const limit = F.baseLimitM * (F.terrainFactor[x.terrain] ?? 0.8);
  const excess = x.wp.heff - limit * F.startFraction;
  if(excess > 0) add(-Math.min(F.maxWavePenalty, excess / limit * F.waveScale), `גל אפקטיבי ${fmt(x.wp.heff,2)} מ׳ מול מגבלה ${fmt(limit,2)} מ׳ ל${TERRAIN_HE[x.terrain]}`);
  if((h.wavePeriod ?? 0) >= F.longPeriodS && (h.waveH ?? 0) >= F.longPeriodMinH) add(F.longPeriodPenalty, `period ארוך (${fmt(h.wavePeriod,1)} ש׳) – סטים חזקים מפתיעים`);
  const w = F.wind.find(r => (h.windSpeed ?? 0) >= r.min); if(w) add(w.pts, `רוח ${fmt(h.windSpeed,0)} קמ״ש`);
  const g = F.gust.find(r => (h.gust ?? 0) >= r.min); if(g) add(g.pts, `משבים ${fmt(h.gust,0)} קמ״ש`);
  if(isThunder(h.code)) add(F.thunderPenalty, "סופת רעמים – לצאת מהמים, מהסלעים ומהמזח");
  if((h.precip ?? 0) >= F.heavyRainMm) add(F.heavyRainPenalty, "גשם חזק – משטחים חלקים");
  if(x.phase === "night" && ["rocks","reef","breakwater"].includes(x.terrain)) add(F.nightOnRocksPenalty, "חושך על סלעים");
  if(!items.length) items.push({pts:0, label:"אין גורמי סיכון בולטים"});
  const score = clamp(100 + items.reduce((s,i)=>s+i.pts,0), 0, 100);
  return { score, items, level: score >= 75 ? "good" : score >= 50 ? "warn" : "bad", warnAbs: x.wp.heff >= F.warnAbsoluteM, limit };
}
function overallFrom(ms, safety, cfg){ const O = cfg.overall; return Math.round(ms * (O.minFactor + (1 - O.minFactor) * Math.min(1, safety / O.safetyFullAt))); }

/* ============================ /engine/speciesScore ========================
   ציון מין = ציון השיטה הטובה שלו × 0.5 + התאמות (גל, עונה, שעה, עמדה, מים, רוח). */
function scoreSpecies(sp, h, x, cfg, techIds){
  const cand = sp.techniques.filter(t => techIds.includes(t) && x.tech[t]);
  if(!cand.length) return null;
  const bestT = cand.reduce((p,q) => x.tech[q].score > x.tech[p].score ? q : p);
  const C = cfg.species, why = [TECH[bestT]?.name || bestT]; let adj = 0; const H = x.wp.heff;
  if(H >= sp.preferredWaveMin && H <= sp.preferredWaveMax){ adj += C.waveIn; why.push("גל מתאים"); }
  else { const d = H < sp.preferredWaveMin ? sp.preferredWaveMin - H : H - sp.preferredWaveMax; adj -= Math.min(C.waveOutMax, d * C.waveOutPerM); why.push(H < sp.preferredWaveMin ? "ים שקט מדי" : "ים גבוה מדי"); }
  const month = +h.date.slice(5,7);
  if(sp.preferredSeason.includes(month)){ adj += C.seasonIn; why.push("בעונה"); } else { adj += C.seasonOut; why.push("מחוץ לעונה"); }
  const ph = x.phase === "midday" ? "day" : x.phase;
  if(sp.preferredTimeOfDay.includes(ph)){ adj += C.timeIn; why.push("שעה טובה"); } else adj += C.timeOut;
  if(sp.preferredTerrain.includes(x.terrain)){ adj += C.terrainIn; why.push("עמדה מתאימה"); } else { adj += C.terrainOut; why.push("עמדה פחות מתאימה"); }
  if(h.sst != null){ const [a,b] = sp.preferredWaterTemp; if(h.sst >= a && h.sst <= b) adj += C.tempIn; else { adj += C.tempOut; why.push(h.sst > b ? "מים חמים מדי" : "מים קרים מדי"); } }
  const pw = sp.preferredWind || {};
  if(pw.maxKmh != null && (h.windSpeed ?? 0) > pw.maxKmh){ adj += C.windOver; why.push("רוח חזקה בשבילו"); }
  if(pw.likes && pw.likes !== "any" && x.wind.cls === pw.likes) adj += C.windLikes;
  const score = clamp(Math.round(x.tech[bestT].score * C.baseWeight + C.baseOffset + adj), 0, 100);
  const fit = score >= C.goodFrom ? "good" : score >= C.midFrom ? "warn" : "bad";
  return { id:sp.id, sp, tech:bestT, score, fit, fitHe: fit === "good" ? "מתאים לתנאים" : fit === "warn" ? "בינוני" : "פחות מתאים לתנאים", why };
}

/* ============================ analyzeHour ============================ */
function analyzeHour(h, spot, terrain, cfg){
  const x = { terrain, h, wp: wavePower(h, cfg), wind: windCalculator.classify(h.windDir, spot.facing), phase: dayPhase(h, cfg), moon: moonInfo(h.date), _sp:{} };
  x.tech = {}; for(const t of TECHS) x.tech[t.id] = scoreTechnique(t, h, x, cfg);
  x.safety = scoreSafety(h, x, cfg);
  analyzeActs(x, spot);
  return x;
}
function activeIds(){ const a = (PREFS.techs || []).filter(id => TECH[id]); return a.length ? a : TECHS.map(t => t.id); }
function methodOf(a, m){ if(m !== "auto" && a.tech[m]) return m; return activeIds().reduce((p,q) => a.tech[q].score > a.tech[p].score ? q : p); }
function scoreOf(a, m){ return overallFrom(a.tech[methodOf(a,m)].score, a.safety.score, CFG); }
function rankTechs(a){ return activeIds().map(id => ({id, t:TECH[id], score:a.tech[id].score})).sort((p,q) => q.score - p.score); }
function speciesFor(a, m){
  const key = m === "auto" ? "auto:" + activeIds().join(",") : m;
  if(!a._sp[key]){ const ids = m === "auto" ? activeIds() : [m]; a._sp[key] = SPECIES.map(sp => scoreSpecies(sp, a.h, a, CFG, ids)).filter(Boolean).sort((p,q) => q.score - p.score); }
  return a._sp[key];
}
function bestHours(list, m, n = 3){ return list.map(a => ({a, s: scoreOf(a,m)})).sort((p,q)=>q.s-p.s).slice(0,n); }
function bestWindow(list, m){
  if(!list.length) return null;
  const sc = list.map(a => scoreOf(a,m)); let bi = 0; sc.forEach((s,i) => { if(s > sc[bi]) bi = i; });
  const thr = sc[bi] - 7; let a = bi, b = bi;
  while(a > 0 && sc[a-1] >= thr && b - a < 3) a--;
  while(b < list.length-1 && sc[b+1] >= thr && b - a < 3) b++;
  return { from: list[a].h.min, to: list[b].h.min + 60, best: list[bi], score: sc[bi], hours: list.slice(a, b+1) };
}

/* ============================ /engine/techAdvice ==========================
   המלצות ציוד וריג לפי שיטה ותנאים. העדפת קל/כבד מוסיפה הנחיה לטווח.       */
function shiftRange(txt){ const p = PREFS.gearWeight; if(!p || p === "std") return txt; return txt + (p === "light" ? " – התחל בקצה הנמוך" : " – התחל בקצה הגבוה"); }
function techAdvice(id, a){
  const t = TECH[id], H = a.wp.heff, W = a.h.windSpeed ?? 0, cur = a.h.current ?? 0, night = a.phase === "night";
  const lowLight = night || a.phase.startsWith("golden") || (a.h.cloud ?? 0) >= 60;
  const tg = speciesFor(a, id).slice(0,3).map(s => s.sp);
  const rocky = ["rocks","reef","breakwater"].includes(a.terrain);
  const out = { rows: [], rig: t.rigs[0], rigWhy: "", retrieve: "", planB: "" };
  const R = (k, v) => out.rows.push([k, v]);
  if(id === "spin"){
    let w, types;
    if(H < 0.3 && W < 12){ w = "7–15 גרם"; types = "Minnow קל · Soft Plastic · Pencil על המים באור נמוך"; out.retrieve = "ים שקט: איסוף איטי ואחיד עם עצירות קצרות. זריקות במניפה, רחוק."; }
    else if(H < 0.8 && W < 20){ w = "10–25 גרם"; types = "Minnow · Sinking Pencil · Jig קל"; out.retrieve = "איסוף בינוני עם ג׳רקים קצרים בתוך הקצף ובמעברים. תן לדמוי רגע של עצירה אחרי כל גל."; }
    else { w = "20–40 גרם"; types = "Sinking Pencil · Jig · סיליקון על ראש עופרת כבד"; out.retrieve = "ים כבד: דמויים שוקעים, איסוף עם הגל ולא נגדו, קרוב לצד המוגן."; }
    R("משקל דמוי", shiftRange(w)); R("סוגים", types); R("צבעים", lowLight ? "סילואט כהה, לבן או זוהר" : "טבעי – כסוף, שקוף, סרדין");
    out.rigWhy = "קלוע לזריקה רחוקה ורגישות, לידר פלורו שקוף ועמיד לסלעים, סנאפ בלי מסתובב שלא יפגע בפעולת הדמוי.";
    out.planB = "החלף לדמוי שוקע או לצבע הפוך, שנה קצב, וזוז 50–100 מ׳ לאורך החוף.";
  } else if(id === "lrf"){
    const w = W < 8 && H < 0.25 ? "0.8–1.5 גרם" : W < 14 ? "1.5–3 גרם" : "3–5 גרם";
    out.rig = (H >= 0.3 || W >= 10 || cur >= 1) ? "dropShot" : "lrfJighead";
    R("ראש עופרת", shiftRange(w)); R("סיליקון", "1.5–2.5 אינץ׳ · תולעת או שרימפס"); R("צבעים", night ? "לבן, זוהר, שקוף עם נצנץ" : "שקוף, טבעי, ירוק-צהוב");
    out.rigWhy = out.rig === "dropShot" ? "יש תנועה או רוח – דרופשוט מחזיק את הפתיון מעל הקרקעית בלי לאבד מגע." : "ים שקט – ראש עופרת קל נופל לאט ונראה טבעי.";
    out.retrieve = "הפלה לתחתית, הרמות קצרות של קצה החכה ואיסוף איטי מאוד. ליד עמודים ואורות – גם בחצי עומק.";
    out.planB = "הקטן משקל ראש, החלף צבע סיליקון, ועבור לצל העמודים או לקו האור.";
  } else if(id === "shorejig"){
    const w = (a.wind.cls === "onshore" && W >= 12) || H >= 0.8 ? "45–60 גרם" : (a.wind.cls === "offshore" && W < 15) ? "25–40 גרם" : "30–45 גרם";
    R("משקל מתכת", shiftRange(w)); R("צבעים", lowLight ? "זהב, ורוד, זוהר" : "כסוף, כחול-כסוף, סרדין");
    out.rigWhy = "טבעת סולידית חזקה + אסיסט בראש – פחות היתקעויות ופחות קרסים שנתפסים בחוט.";
    out.retrieve = "זריקה מקסימלית, ספירה עד שהקו נרפה (תחתית), ואז איסוף מהיר עם הקפצות קצרות. בשחר – נסה גם איסוף עליון מהיר מאוד.";
    out.planB = "שנה משקל כדי להגיע לעומק אחר, נסה איסוף איטי עם הרמות, וחפש ציפורים וקפיצות על פני המים.";
  } else if(id === "eging"){
    const size = H < 0.3 && W < 10 ? "2.5–3.0" : "3.0–3.5";
    const col = night ? (a.moon.illum >= 0.5 ? "גב כתום/ורוד, בסיס זהב (יש ירח)" : "בסיס אדום/סגול או זוהר") : a.phase.startsWith("golden") ? "כתום/ורוד, בסיס זהב" : "טבעי – חום/ירוק, בסיס מראה";
    R("גודל אגי", size); R("צבעים", col);
    out.rigWhy = "לידר פלורו ארוך ודק כדי שהאגי ירחף טבעי; סנאפ קטן בלי מסתובב.";
    out.retrieve = "זריקה, ספירת שקיעה (בערך 3 שניות למטר), 2–3 ג׳רקים חדים ועצירה של 5–10 שניות. הדיונון תוקף בזמן העצירה.";
    out.planB = "החלף צבע בסיס (זהב ↔ אדום), הארך את זמן השקיעה, ועבור לאזור מואר או לפינת המזח.";
  } else if(id === "surf"){
    const sink = H < 0.3 && W < 15 && cur < 1 ? "40–60 גרם" : H < 0.7 && cur < 1.5 ? "60–100 גרם" : "100–150 גרם עם עוגנים";
    out.rig = rocky ? "runningLedger" : (H >= 0.4 ? "paternoster" : "runningLedger");
    const hooks = tg.map(s => s.hook).filter(Boolean)[0] || "#4–#1";
    R("משקולת", shiftRange(sink)); R("קרסים", hooks); R("פתיונות", [...new Set(tg.flatMap(s => s.preferredBaits))].slice(0,5).join(" · ") || "שרימפס · תולעים");
    out.rigWhy = out.rig === "paternoster" ? "ים עובד על חול – שני קרסים מעל משקולת עוגנים, מכסים שני עומקים ומחזיקים קרקעית." : rocky ? "קרקעית סלעית – ריג רץ עם מוביל קצר נתקע פחות." : "ים שקט – ריג רץ עם מוביל ארוך: הדג לוקח את הפתיון בלי להרגיש משקל.";
    out.retrieve = "זריקה אל מעבר לקו השבירה השני, מתיחת קו, חכה על מעמד בזווית גבוהה. רענן פתיון כל 10–15 דק׳.";
    out.planB = "קצר או הארך את הזריקה (קו שבירה ראשון או שני), החלף פתיון, והקטן קרס אם יש נגיעות בלי נעיצה.";
  } else if(id === "float"){
    const fw = W < 8 && H < 0.25 ? "3–5 גרם" : "6–10 גרם";
    R("מצוף", shiftRange(fw)); R("עומק התחלה", "1.5–2.5 מ׳ – ומשנים בחצי מטר"); R("פתיון", [...new Set(tg.flatMap(s => s.preferredBaits))].slice(0,4).join(" · ") || "לחם · שרימפס");
    out.rigWhy = "מצוף רץ עם עוצר – אפשר לקבוע כל עומק ועדיין לזרוק בקלות.";
    out.retrieve = "פיזור קטן כל כמה דקות באותה נקודה, זריקה לתוך הפיזור ונתינה למצוף להיסחף לאט. נעיצה ברגע שהמצוף שוקע.";
    out.planB = "שנה עומק בחצי מטר, הוסף פיזור, והקטן קרס ופתיון.";
  } else if(id === "livebait"){
    out.rig = H < 0.4 && W < 15 ? "liveBait" : "runningLedger";
    R("קרס", "מעגלי 2/0–4/0"); R("פתיון", "בורי או סרדין קטן – ודא שמותר");
    R("משקולת", out.rig === "liveBait" ? "בלי – הפתיון שוחה חופשי" : shiftRange("40–80 גרם רצה"));
    out.rigWhy = out.rig === "liveBait" ? "ים שקט – הפתיון שוחה חופשי וטבעי." : "ים עובד – משקולת רצה מחזיקה את הפתיון באזור הקצף.";
    out.retrieve = "זריקה עדינה (לא להרוג את הפתיון), קו רפוי מעט. עם קרס מעגלי לא נועצים – מסובבים סליל כשהקו נמתח.";
    out.planB = "החלף פתיון רענן, שנה מרחק, והנח אותו בשולי הקצף.";
  } else {
    out.retrieve = t.desc; out.planB = "שנה עומק, מיקום או פתיון.";
  }
  if(!RIGS[out.rig]) out.rig = Object.keys(RIGS)[0];
  R("ריג", RIGS[out.rig].name);
  return out;
}

/* ============================ /engine/readSpot ============================ */
const READ = {
  sand:["חפש תעלות – רצועות של מים כהים יותר שבהן הגל לא נשבר. זרוק לקצה התעלה ואסוף לאורכה.","קו הקצף הראשון עשיר במזון כשיש גל בינוני – אל תזרוק רק רחוק."],
  pier:["עבוד לאורך העמודים ובצל שלהם – שם הדגים מחכים.","בלילה – הקו בין אור לצל מתחת לפנסים הוא המקום לדיונונים ולדגים קטנים."],
  breakwater:["ראש שובר הגלים נותן מים עמוקים וזרם – המקום לג׳יגינג ולטורפים.","בגל בינוני – הקצף בבסיס הסלעים בצד החיצוני. בים גבוה – הצד הפנימי המוגן."],
  rocks:["עבוד על כיסי הקצף בין הסלעים ועל המעברים לחול.","לא לעמוד על סלע רטוב או ירוק – גם בגל קטן."],
  reef:["שפת טבלת הגידוד – המעבר למים עמוקים – היא קו הדיג העיקרי.","צפה בים 10 דקות לפני שאתה עולה על הטבלה. לא לעמוד על השפה כשיש סטים."],
  mixed:["המעברים בין חול לסלע הם המקום הכי חם – טורפים אורבים בשוליים.","עבוד במניפה: שלוש זריקות לכל כיוון לפני שזזים."]
};
function readTips(a){
  const out = [...(READ[a.terrain] || READ.mixed)], W = a.h.windSpeed ?? 0;
  if(a.wind.cls === "onshore" && W >= 10) out.push("רוח מהים דוחפת מזון לחוף – הדג יכול להיות קרוב. התחל בזריקות קצרות.");
  else if(a.wind.cls === "offshore") out.push("רוח מהיבשה – מים חלקים וצלולים יותר. זרוק רחוק ועבוד עדין.");
  else if(a.wind.cls === "cross" && W >= 12) out.push("רוח צד – זרוק מעט נגד הרוח ואסוף מיד את הקו הרפוי.");
  return out;
}

/* ============================ /engine/sessionPlan ========================= */
function trendText(a){
  const later = S.analyzed.filter(x => x.h.date === a.h.date && x.h.hour > a.h.hour && x.h.hour <= a.h.hour + 3);
  if(!later.length) return "";
  const mw = later.reduce((p,q) => q.wp.heff > p.wp.heff ? q : p), mv = later.reduce((p,q) => (q.h.windSpeed ?? 0) > (p.h.windSpeed ?? 0) ? q : p);
  const parts = [];
  if(mw.wp.heff - a.wp.heff >= 0.25) parts.push(`הים מתגבר – גל אפקטיבי ${fmt(mw.wp.heff,2)} מ׳ סביב ${hhmm(mw.h.min)}. שמור מרחק מהשפה.`);
  if((mv.h.windSpeed ?? 0) - (a.h.windSpeed ?? 0) >= 8) parts.push(`הרוח מתחזקת ל-${fmt(mv.h.windSpeed,0)} קמ״ש סביב ${hhmm(mv.h.min)}.`);
  return parts.join(" ") || "התנאים יציבים בשעות שאחרי.";
}
function sessionPlan(win, id){
  const a = win.best, adv = techAdvice(id, a), alt = rankTechs(a).find(r => r.id !== id);
  return [
    {t:"הגעה", d:`הגע ב-${hhmm(win.from - 25)} כדי להיות מוכן כשהחלון נפתח (${hhmm(win.from)}). השיא הצפוי ב-${hhmm(a.h.min)}.`},
    {t:"מה לקשור", d:`${RIGS[adv.rig].name}. ${adv.rigWhy}`},
    {t:"איפה להתחיל", d: readTips(a)[0]},
    {t:"איך לעבוד", d: adv.retrieve},
    {t:"אם אין פעילות תוך 30 דקות", d: adv.planB + (alt && alt.score >= 50 ? ` או עבור ל${alt.t.name} (ציון ${alt.score} באותה שעה).` : "")},
    {t:"מתי לסיים", d:`החלון נסגר ב-${hhmm(win.to)}. ${trendText(a)}`}
  ];
}

/* ============================ /engine/checklist =========================== */
function checklist(id, win){
  const t = TECH[id], a = win.best, items = [], add = (k, txt, why) => items.push({k, txt, why});
  add("rod", `חכה ${t.gear.rod}`); add("reel", `סליל ${t.gear.reel} · ${t.gear.line}`); add("leader", `לידר רזרבי: ${t.gear.leader}`);
  (t.pack || []).forEach((p,i) => add("p"+i, p));
  const hours = win.hours || [a];
  const dark = win.to > a.h.sunset - 20 || win.from < a.h.sunrise + 10 || hours.some(x => x.phase === "night");
  const maxW = Math.max(...hours.map(x => x.h.windSpeed ?? 0)), rain = hours.some(x => (x.h.precip ?? 0) > 0.2);
  if(dark) add("lamp", "פנס ראש + סוללה רזרבית", "חלק מהחלון בחושך");
  if(maxW >= 20) add("wind", "מעיל רוח", `רוח עד ${fmt(maxW,0)} קמ״ש`);
  if(rain) add("rain", "מעיל גשם ושקית אטומה לטלפון", "צפוי גשם");
  if(hours.some(x => x.phase !== "night")) add("sun", "כובע, משקפי שמש מקטבים וקרם הגנה", "מקטבים עוזרים גם לראות מבנה ודגים במים");
  if(["rocks","reef","breakwater"].includes(a.terrain)) add("shoes", "נעליים מונעות החלקה", "עמדה סלעית");
  if(["pier","breakwater"].includes(a.terrain)) add("net", "רשת הנחתה עם ידית ארוכה או גאף", "יש גובה מהמים");
  if(a.terrain === "sand" && t.family === "bait") add("spike", "מעמד חכה לחול");
  add("pliers", "פלאייר להוצאת קרס + מספריים לקלוע"); add("tape", "סרט מדידה", "לבדוק גודל מינימלי");
  add("water", "מים, מגבת ושקית לפסולת וחוטים");
  return items;
}

/* ============================ /engine/learning ============================ */
function learningInsights(log){
  if(log.length < 3) return [{text:`יש ${log.length} תפיסות ביומן. מ-3 תפיסות ומעלה יופיעו כאן תובנות על התנאים והשיטות שבהן אתה מצליח.`}];
  const out = [], pct = (n,d) => Math.round(n/d*100), nm = id => SPECIES.find(s=>s.id===id)?.nameHebrew || (id === "other" ? "אחר" : id);
  const groups = {}; log.forEach(e => { (groups[e.species] ||= []).push(e); });
  for(const [sid, list] of Object.entries(groups).sort((a,b)=>b[1].length-a[1].length)){
    const c = list.filter(e=>e.cond); if(c.length < 3) continue;
    const bins = [[0,0.4],[0.4,0.8],[0.8,1.2],[1.2,9]], counts = bins.map(([a,b]) => c.filter(e => e.cond.waveH >= a && e.cond.waveH < b).length);
    const bi = counts.indexOf(Math.max(...counts)), [a,b] = bins[bi];
    out.push({text:`${pct(counts[bi], c.length)}% מהתפיסות של ${nm(sid)} היו בגל ${a}–${b < 9 ? b : "+"} מ׳.`});
    const dawn = c.filter(e => e.cond.minsFromSunrise != null && Math.abs(e.cond.minsFromSunrise) <= 60).length;
    if(dawn) out.push({text:`${pct(dawn, c.length)}% מהתפיסות של ${nm(sid)} היו בטווח של שעה סביב הזריחה.`});
    const cls = {}; c.forEach(e => { cls[e.cond.windCls] = (cls[e.cond.windCls]||0)+1; });
    const tc = Object.entries(cls).sort((p,q)=>q[1]-p[1])[0];
    if(tc) out.push({text:`ב-${pct(tc[1], c.length)}% מהתפיסות של ${nm(sid)} הרוח הייתה ${WIND_CLS_HE[tc[0]] || "לא ידועה"}.`});
  }
  const bt = {}; log.forEach(e => { const k = e.method === "bait" ? "surf" : e.method; bt[k] = (bt[k]||0)+1; });
  const tb = Object.entries(bt).sort((a,b)=>b[1]-a[1])[0];
  if(tb) out.push({text:`${pct(tb[1], log.length)}% מהתפיסות שלך היו ב${TECH[tb[0]]?.name || tb[0]}.`});
  const lures = {}; log.forEach(e => { const k = (e.lure||"").trim(); if(k) lures[k] = (lures[k]||0)+1; });
  const tl = Object.entries(lures).sort((a,b)=>b[1]-a[1])[0];
  if(tl && tl[1] >= 2) out.push({text:`הדמוי או הפתיון שהכי הביא לך דגים: ${tl[0]} (${tl[1]} תפיסות).`});
  const spots = {}; log.forEach(e => { spots[e.spotName] = (spots[e.spotName]||0)+1; });
  const ts = Object.entries(spots).sort((a,b)=>b[1]-a[1])[0];
  if(ts) out.push({text:`הנקודה הכי פורייה שלך: ${ts[0]} (${ts[1]} תפיסות).`});
  return out;
}

/* ============================ /data/rigs + drawing ========================
   שרטוט סכמטי אנכי: החוט במרכז (x=205), תוויות משמאל.                    */
const LINEC = {braid:"var(--accent)", mono:"var(--fg)", leader:"var(--sea)"};
const RIGS = {
  spinSetup:{ name:"סט ז׳ירז׳ור – קלוע, לידר ודמוי", h:320, when:"לכל דיג דמויים מהחוף.",
    steps:["קשור קלוע ללידר בקשר FG – קשר דק שעובר חלק בטבעות.","אורך לידר 1–1.5 מ׳; בסלעים או לגומבר – עבה יותר.","סנאפ קטן בלי מסתובב, או Loop knot ישירות לדמוי."],
    parts:[{t:"line",y1:14,y2:118,kind:"braid",label:"חוט ראשי",spec:"קלוע PE 0.8–1.2"},{t:"knot",y:118,label:"קשר FG",spec:"קלוע ← לידר"},{t:"line",y1:118,y2:222,kind:"leader",label:"לידר",spec:"פלורו 0.35–0.45 · 1–1.5 מ׳"},{t:"snap",y:230,label:"סנאפ",spec:"בלי מסתובב"},{t:"minnow",y:268,label:"Minnow / Pencil",spec:"10–25 גרם לפי הים"}]},
  shoreJig:{ name:"ג׳יג מתכת עם אסיסט", h:320, when:"זריקות ארוכות לעומק, משובר גלים, מזח או סלעים.",
    steps:["FG בין הקלוע ללידר העבה.","Palomar לטבעת הסולידית; טבעת פיצול מחברת את המתכת.","קרס אסיסט בראש המתכת; קרס משולש בזנב – אופציונלי (פחות היתקעויות בלעדיו)."],
    parts:[{t:"line",y1:14,y2:118,kind:"braid",label:"חוט ראשי",spec:"קלוע PE 1.2–2.0"},{t:"knot",y:118,label:"קשר FG",spec:"קלוע ← לידר"},{t:"line",y1:118,y2:226,kind:"leader",label:"לידר",spec:"0.45–0.57 · 1.5 מ׳"},{t:"ring",y:234,label:"טבעת סולידית + פיצול",spec:"חזקה, לא נפתחת"},{t:"jig",y:272,label:"מתכת + אסיסט",spec:"25–60 גרם"}]},
  lrfJighead:{ name:"LRF – ראש עופרת וסיליקון", h:290, when:"ים שקט, מזחים, סלעים ואורות.",
    steps:["קלוע דק מאוד + לידר פלורו דק – רגישות מקסימלית.","Improved Clinch ישירות לעין של ראש העופרת.","השחל את הסיליקון ישר – חוד הקרס יוצא בגב."],
    parts:[{t:"line",y1:14,y2:112,kind:"braid",label:"חוט ראשי",spec:"קלוע PE 0.2–0.4"},{t:"knot",y:112,label:"FG / Double Uni",spec:"קלוע ← לידר"},{t:"line",y1:112,y2:236,kind:"leader",label:"לידר",spec:"פלורו 0.16–0.22 · 1 מ׳"},{t:"softjig",y:250,label:"ראש עופרת + סיליקון",spec:"0.8–3 גרם · 1.5–2.5 אינץ׳"}]},
  dropShot:{ name:"דרופשוט", h:340, when:"רוח, זרם או תנועה – מחזיק את הפתיון מעל הקרקעית.",
    steps:["קשור קרס בקשר Palomar והשאר זנב ארוך של 30–50 ס״מ.","העבר את הזנב חזרה דרך עין הקרס מלמעלה – החוד פונה למעלה.","משקולת דרופשוט בקצה הזנב; עבודה במקום עם רעידות קלות."],
    parts:[{t:"line",y1:14,y2:100,kind:"braid",label:"חוט ראשי",spec:"קלוע PE 0.2–0.4"},{t:"knot",y:100,label:"FG / Double Uni",spec:"קלוע ← לידר"},{t:"line",y1:100,y2:302,kind:"leader",label:"לידר",spec:"פלורו 0.18–0.22",ly:150},{t:"dsHook",y:204,label:"קרס בקשר Palomar",spec:"בולט מהקו + סיליקון"},{t:"dsWeight",y:302,label:"משקולת דרופשוט",spec:"3–7 גרם · 30–50 ס״מ מתחת"}]},
  eging:{ name:"אגינג – אגי לדיונונים", h:320, when:"דמדומים ולילה, מים צלולים, מזחים ואורות.",
    steps:["לידר פלורו ארוך (1.5–2 מ׳) – שקוף ועמיד לשיני הדיונון.","סנאפ קטן בלי מסתובב לאגי.","שמור על קו מתוח בזמן השקיעה – רוב המשיכות קורות אז."],
    parts:[{t:"line",y1:14,y2:112,kind:"braid",label:"חוט ראשי",spec:"קלוע PE 0.6–0.8"},{t:"knot",y:112,label:"קשר FG",spec:"קלוע ← לידר"},{t:"line",y1:112,y2:222,kind:"leader",label:"לידר",spec:"פלורו 0.22–0.26 · 1.5–2 מ׳"},{t:"snap",y:230,label:"סנאפ קטן",spec:"בלי מסתובב"},{t:"egi",y:268,label:"אגי",spec:"2.5–3.5 לפי עומק ורוח"}]},
  paternoster:{ name:"ריג סרף – שני קרסים (פטרנוסטר)", h:390, when:"חוף חולי עם גל – שני עומקים, משקולת עוגנים.",
    steps:["לידר זעזועים באורך פי 2 מהחכה + 5 סיבובים על הסליל – מונע קריעה בזריקה.","על גוף הריג: חרוזי עצירה משני צדי כל חיבור של חוט קרס.","חוטי קרס 20–30 ס״מ, קצרים מהמרחק ביניהם – שלא יסתבכו.","משקולת עוגנים בקצה – העוגנים ננעצים בחול ומחזיקים בגל."],
    parts:[{t:"line",y1:14,y2:66,kind:"mono",label:"חוט ראשי",spec:"ניילון 0.28–0.35",ly:30},{t:"knot",y:66,ly:70,label:"קשר לידר",spec:"Uni-Uni"},{t:"line",y1:66,y2:128,kind:"leader",label:"לידר זעזועים",spec:"0.57–0.70 מ״מ",ly:100},{t:"swivel",y:136,label:"מסתובב",spec:"חיבור לגוף הריג"},{t:"line",y1:144,y2:330,kind:"mono",label:"גוף הריג",spec:"ניילון 0.50–0.60",ly:306},{t:"snood",y:176,len:34,label:"חוט קרס + קרס",spec:"0.25–0.30 · 20–30 ס״מ"},{t:"snood",y:242,len:34,label:"חרוזי עצירה",spec:"קובעים את מיקום החוטים"},{t:"spider",y:352,label:"משקולת עוגנים",spec:"100–150 גרם"}]},
  runningLedger:{ name:"ריג רץ (קרולינה)", h:370, when:"ים שקט, דגים זהירים, או קרקעית סלעית (מוביל קצר).",
    steps:["השחל משקולת רצה על החוט הראשי, ואחריה חרוז מגן.","קשור מסתובב – הוא עוצר את המשקולת.","מוביל מהמסתובב לקרס: ארוך (1–1.5 מ׳) בחול, קצר (30–50 ס״מ) בסלעים.","הדג מושך – החוט רץ דרך המשקולת והוא לא מרגיש התנגדות."],
    parts:[{t:"line",y1:14,y2:168,kind:"mono",label:"חוט ראשי",spec:"ניילון 0.28–0.35",ly:52},{t:"olive",y:112,label:"משקולת רצה",spec:"40–100 גרם"},{t:"bead",y:156,ly:146,label:"חרוז מגן",spec:"שומר על הקשר"},{t:"swivel",y:176,ly:186,label:"מסתובב",spec:"עוצר את המשקולת"},{t:"line",y1:184,y2:322,kind:"leader",label:"מוביל",spec:"0.25–0.35 · 30–150 ס״מ"},{t:"hook",y:324,bait:true,label:"קרס + פתיון",spec:"לפי הדג"}]},
  floatRig:{ name:"מצוף רץ", h:390, when:"ים שקט, סלעים ומזחים, עם פיזור.",
    steps:["קשור קשר עוצר על החוט הראשי – המרחק ממנו לקרס הוא עומק הדיג.","חרוז, המצוף, חרוז, ואז עופרת ראשית ומסתובב.","מוביל דק עם 2–3 עופרות קטנות – הפתיון שוקע בהדרגה וטבעי.","טען את המצוף כך שרק האנטנה בולטת מעל המים."],
    parts:[{t:"water",y:150},{t:"line",y1:14,y2:214,kind:"mono",label:"חוט ראשי",spec:"ניילון 0.20–0.25",ly:34},{t:"stopper",y:64,label:"עוצר עומק",spec:"מזיזים = משנים עומק"},{t:"bead",y:76},{t:"float",y:150,label:"מצוף רץ",spec:"3–10 גרם"},{t:"bead",y:180},{t:"olive",y:198,ly:192,small:true,label:"עופרת ראשית",spec:"רוב משקל הטעינה"},{t:"swivel",y:222,ly:228,label:"מסתובב קטן"},{t:"line",y1:230,y2:336,kind:"leader",label:"מוביל",spec:"0.16–0.20 · 50–80 ס״מ",ly:256},{t:"shot",y:296,label:"עופרות קטנות",spec:"שקיעה הדרגתית"},{t:"hook",y:338,bait:true,label:"קרס #10–#6",spec:"לחם / שרימפס"}]},
  liveBait:{ name:"פתיון חי – קרס מעגלי", h:340, when:"שחר וערב, ליד קצף ומעברים, לטורפים גדולים.",
    steps:["מוביל חזק 0.50–0.60 – שיניים ולחץ של טורף גדול.","קרס מעגלי דרך השפתיים או האף, לא דרך הגוף – הפתיון נשאר חי.","ים עובד: משקולת רצה מעל המסתובב. ים שקט: בלי משקולת בכלל."],
    parts:[{t:"line",y1:14,y2:150,kind:"mono",label:"חוט ראשי",spec:"ניילון 0.35 / PE 1.5",ly:44},{t:"olive",y:104,label:"משקולת רצה",spec:"רק כשהים עובד"},{t:"bead",y:146},{t:"swivel",y:166,label:"מסתובב"},{t:"line",y1:174,y2:282,kind:"leader",label:"מוביל חזק",spec:"0.50–0.60 · 80–100 ס״מ"},{t:"livefish",y:296,label:"קרס מעגלי + פתיון",spec:"2/0–4/0 דרך האף"}]}
};
function hookPath(x, y, s = 1){ return `<circle cx="${x}" cy="${y}" r="${2.2*s}" fill="none" stroke="var(--fg)" stroke-width="1.4"/><path d="M${x} ${y+2*s} L${x} ${y+14*s} A${5*s} ${5*s} 0 1 1 ${x-10*s} ${y+14*s} L${x-10*s} ${y+9*s} l${3*s} ${3*s}" fill="none" stroke="var(--fg)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`; }
function treble(x, y){ return `<circle cx="${x}" cy="${y}" r="1.8" fill="none" stroke="var(--fg)" stroke-width="1.1"/><path d="M${x} ${y+2} L${x} ${y+9} M${x} ${y+9} q-6 5 -7 -2 M${x} ${y+9} q6 5 7 -2" fill="none" stroke="var(--fg)" stroke-width="1.2"/>`; }
const BAIT = (x, y) => `<ellipse cx="${x-5}" cy="${y+12}" rx="6.5" ry="9" fill="color-mix(in srgb, var(--bead) 60%, var(--accent))" opacity=".85"/>`;
const RIGDRAW = {
  line:(p,c)=>`<line x1="${c}" y1="${p.y1}" x2="${c}" y2="${p.y2}" stroke="${LINEC[p.kind]}" stroke-width="${p.kind==="braid"?2.4:1.7}" stroke-linecap="round"/>`,
  knot:(p,c)=>`<path d="M${c-6} ${p.y-5} l12 3 M${c-6} ${p.y-1} l12 3 M${c-6} ${p.y+3} l12 3" stroke="var(--fg)" stroke-width="1.5" stroke-linecap="round"/>`,
  swivel:(p,c)=>`<circle cx="${c}" cy="${p.y-7}" r="3" fill="var(--bg)" stroke="var(--muted)" stroke-width="1.6"/><rect x="${c-3.5}" y="${p.y-4.5}" width="7" height="9" rx="3" fill="var(--muted)"/><circle cx="${c}" cy="${p.y+7}" r="3" fill="var(--bg)" stroke="var(--muted)" stroke-width="1.6"/>`,
  snap:(p,c)=>`<path d="M${c} ${p.y-8} C${c+9} ${p.y-8} ${c+9} ${p.y+16} ${c} ${p.y+16} C${c-9} ${p.y+16} ${c-9} ${p.y-8} ${c} ${p.y-8}Z" fill="none" stroke="var(--muted)" stroke-width="1.6"/><line x1="${c}" y1="${p.y+16}" x2="${c}" y2="${p.y+28}" stroke="var(--muted)" stroke-width="1.2"/>`,
  bead:(p,c)=>`<circle cx="${c}" cy="${p.y}" r="4.5" fill="var(--bead)"/>`,
  stopper:(p,c)=>`<path d="M${c-7} ${p.y+3} l14 -5 M${c-7} ${p.y-2} l14 -5" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>`,
  olive:(p,c)=>{ const rx = p.small ? 5 : 7, ry = p.small ? 9 : 13; return `<ellipse cx="${c}" cy="${p.y}" rx="${rx}" ry="${ry}" fill="var(--lead)"/><line x1="${c}" y1="${p.y-ry}" x2="${c}" y2="${p.y+ry}" stroke="var(--bg)" stroke-width="1.2" opacity=".7"/>`; },
  spider:(p,c)=>`<circle cx="${c}" cy="${p.y-20}" r="3" fill="none" stroke="var(--muted)" stroke-width="1.5"/><path d="M${c} ${p.y-17} C${c+10} ${p.y-8} ${c+10} ${p.y+8} ${c} ${p.y+14} C${c-10} ${p.y+8} ${c-10} ${p.y-8} ${c} ${p.y-17}Z" fill="var(--lead)"/><path d="M${c-3} ${p.y+6} q-12 4 -16 -8 M${c+3} ${p.y+6} q12 4 16 -8 M${c-2} ${p.y+10} q-8 10 -14 4 M${c+2} ${p.y+10} q8 10 14 4" fill="none" stroke="var(--muted)" stroke-width="1.4"/>`,
  shot:(p,c)=>[-10,0,10].map(d=>`<circle cx="${c}" cy="${p.y+d}" r="3.4" fill="var(--lead)"/>`).join(""),
  dsWeight:(p,c)=>`<rect x="${c-4.5}" y="${p.y}" width="9" height="20" rx="4.5" fill="var(--lead)"/>`,
  ring:(p,c)=>`<circle cx="${c}" cy="${p.y-4}" r="4" fill="none" stroke="var(--muted)" stroke-width="2"/><circle cx="${c}" cy="${p.y+7}" r="5.5" fill="none" stroke="var(--muted)" stroke-width="1.5"/><line x1="${c}" y1="${p.y+12}" x2="${c}" y2="${p.y+28}" stroke="var(--muted)" stroke-width="1.2"/>`,
  water:(p,c,h)=>{ let d = `M0 ${p.y}`; for(let x = 0; x < 330; x += 22) d += ` q5.5 -4 11 0 t11 0`; return `<rect x="0" y="${p.y}" width="330" height="${h - p.y}" fill="color-mix(in srgb, var(--sea) 7%, transparent)"/><path d="${d}" fill="none" stroke="var(--sea)" stroke-width="1.4" opacity=".7"/><text x="322" y="${p.y-6}" direction="rtl" text-anchor="start" fill="var(--sea)" font-size="11">פני המים</text>`; },
  float:(p,c)=>`<line x1="${c}" y1="${p.y-46}" x2="${c}" y2="${p.y-26}" stroke="var(--fg)" stroke-width="2"/><circle cx="${c}" cy="${p.y-47}" r="2.8" fill="var(--accent)"/><path d="M${c} ${p.y-28} C${c+11} ${p.y-16} ${c+11} ${p.y+8} ${c} ${p.y+20} C${c-11} ${p.y+8} ${c-11} ${p.y-16} ${c} ${p.y-28}Z" fill="var(--surface-2)" stroke="var(--fg)" stroke-width="1.2"/><path d="M${c} ${p.y-28} C${c+7} ${p.y-21} ${c+10} ${p.y-13} ${c+10.3} ${p.y-8} L${c-10.3} ${p.y-8} C${c-10} ${p.y-13} ${c-7} ${p.y-21} ${c} ${p.y-28}Z" fill="var(--accent)"/>`,
  hook:(p,c)=>`${p.bait ? BAIT(c, p.y) : ""}${hookPath(c,p.y)}`,
  snood:(p,c)=>{ const x = c+46, y2 = p.y+10+p.len; return `<circle cx="${c}" cy="${p.y-6}" r="2.6" fill="var(--bead)"/><circle cx="${c}" cy="${p.y+6}" r="2.6" fill="var(--bead)"/><path d="M${c} ${p.y} L${x} ${p.y+10} L${x} ${y2}" fill="none" stroke="var(--fg)" stroke-width="1.2"/>${BAIT(x, y2)}${hookPath(x,y2)}`; },
  minnow:(p,c)=>{ const y = p.y; return `<line x1="${c}" y1="${y-10}" x2="${c}" y2="${y}" stroke="var(--muted)" stroke-width="1.2"/><path d="M${c} ${y} C${c+18} ${y-12} ${c+58} ${y-12} ${c+76} ${y-2} L${c+88} ${y-9} L${c+86} ${y+1} L${c+88} ${y+11} L${c+76} ${y+4} C${c+58} ${y+13} ${c+18} ${y+12} ${c} ${y}Z" fill="color-mix(in srgb, var(--sea) 45%, var(--fg))"/><path d="M${c+4} ${y-3} C${c+20} ${y-11} ${c+56} ${y-11} ${c+74} ${y-3} C${c+56} ${y-6} ${c+20} ${y-6} ${c+4} ${y-3}Z" fill="var(--sea)"/><circle cx="${c+10}" cy="${y-2}" r="2.4" fill="var(--bg)"/><path d="M${c+1} ${y+2} L${c-10} ${y+11} L${c-5} ${y+14}Z" fill="color-mix(in srgb, var(--sea) 40%, transparent)" stroke="var(--sea)" stroke-width=".8"/>${treble(c+30,y+10)}${treble(c+62,y+9)}`; },
  jig:(p,c)=>{ const y = p.y; return `<line x1="${c}" y1="${y-10}" x2="${c}" y2="${y}" stroke="var(--muted)" stroke-width="1.2"/><path d="M${c} ${y} C${c+12} ${y-8} ${c+58} ${y-9} ${c+74} ${y} C${c+58} ${y+9} ${c+12} ${y+8} ${c} ${y}Z" fill="color-mix(in srgb, var(--fg) 75%, var(--sea))"/><path d="M${c+10} ${y-1} L${c+64} ${y-1}" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/><path d="M${c} ${y} Q${c+6} ${y-16} ${c+18} ${y-18}" fill="none" stroke="var(--accent)" stroke-width="1.3"/>${hookPath(c+22,y-20,0.8)}`; },
  egi:(p,c)=>{ const y = p.y; let spikes = ""; for(let k = 0; k < 7; k++) spikes += `<line x1="${c+70}" y1="${y+2}" x2="${c+82}" y2="${y+2+(k-3)*3.2}" stroke="var(--fg)" stroke-width="1"/>`; return `<line x1="${c}" y1="${y-10}" x2="${c}" y2="${y}" stroke="var(--muted)" stroke-width="1.2"/><path d="M${c} ${y} C${c+14} ${y-10} ${c+50} ${y-11} ${c+66} ${y-4} L${c+70} ${y+2} C${c+52} ${y+10} ${c+14} ${y+8} ${c} ${y}Z" fill="var(--accent)"/><path d="M${c+8} ${y-4} C${c+24} ${y-10} ${c+50} ${y-10} ${c+64} ${y-4}" fill="none" stroke="color-mix(in srgb, var(--accent) 50%, var(--bad))" stroke-width="3"/><path d="M${c+30} ${y-8} l-6 -9 M${c+38} ${y-9} l-5 -9" stroke="var(--accent)" stroke-width="1.5"/><path d="M${c+3} ${y+3} l7 8 l7 -6Z" fill="var(--lead)"/><circle cx="${c+9}" cy="${y-2}" r="2.2" fill="var(--bg)"/>${spikes}`; },
  softjig:(p,c)=>{ const y = p.y; return `<line x1="${c}" y1="${y-14}" x2="${c}" y2="${y-6}" stroke="var(--muted)" stroke-width="1.2"/><path d="M${c+10} ${y} C${c+22} ${y-2} ${c+34} ${y-1} ${c+42} ${y+2}" fill="none" stroke="var(--sea)" stroke-width="7" stroke-linecap="round"/><path d="M${c+42} ${y+2} C${c+52} ${y+6} ${c+54} ${y+16} ${c+46} ${y+17} C${c+40} ${y+18} ${c+42} ${y+10} ${c+48} ${y+10}" fill="none" stroke="var(--sea)" stroke-width="3"/><circle cx="${c+2}" cy="${y}" r="6.5" fill="var(--lead)"/><path d="M${c+28} ${y} l0 -8 l-3 2" fill="none" stroke="var(--fg)" stroke-width="1.4"/>`; },
  dsHook:(p,c)=>{ const y = p.y; return `<path d="M${c} ${y} L${c+14} ${y} M${c+14} ${y} L${c+14} ${y-9} l-3 3" fill="none" stroke="var(--fg)" stroke-width="1.5"/><path d="M${c+14} ${y+2} C${c+26} ${y+4} ${c+34} ${y+6} ${c+40} ${y+12}" fill="none" stroke="var(--sea)" stroke-width="6" stroke-linecap="round"/><path d="M${c+40} ${y+12} q6 8 -2 12" fill="none" stroke="var(--sea)" stroke-width="2.5"/>`; },
  livefish:(p,c)=>{ const y = p.y; return `<path d="M${c+4} ${y} C${c+18} ${y-10} ${c+46} ${y-10} ${c+56} ${y-2} L${c+68} ${y-10} L${c+66} ${y} L${c+68} ${y+10} L${c+56} ${y+2} C${c+46} ${y+10} ${c+18} ${y+10} ${c+4} ${y}Z" fill="color-mix(in srgb, var(--fg) 55%, var(--sea))"/><circle cx="${c+12}" cy="${y-2}" r="2.2" fill="var(--bg)"/><path d="M${c} ${y-14} L${c} ${y-4} A8 8 0 1 0 ${c+12} ${y+2} L${c+9} ${y-4}" fill="none" stroke="var(--fg)" stroke-width="1.9" stroke-linecap="round"/>`; }
};
function rigLabel(p, c){
  if(!p.label) return "";
  const y = p.ly ?? (p.t === "line" ? (p.y1 + p.y2) / 2 : p.y);
  const x2 = c - (p.t === "float" || p.t === "spider" ? 14 : p.t === "olive" ? 10 : 8);
  return `<line x1="172" y1="${y}" x2="${x2}" y2="${y}" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/><text x="166" y="${y-1}" direction="rtl" text-anchor="start" fill="var(--fg)" font-size="12.5" font-weight="600">${esc(isoRange(p.label))}</text>${p.spec ? `<text x="166" y="${y+14}" direction="rtl" text-anchor="start" fill="var(--muted)" font-size="11">${esc(isoRange(p.spec))}</text>` : ""}`;
}
function rigSVG(id){
  const R = RIGS[id], c = 205; if(!R) return "";
  const order = ["water","line","snood","knot","stopper","bead","olive","swivel","snap","ring","float","shot","dsHook","dsWeight","spider","hook","minnow","jig","egi","softjig","livefish"];
  const parts = R.parts.slice().sort((a,b) => order.indexOf(a.t) - order.indexOf(b.t));
  return `<svg viewBox="0 0 330 ${R.h}" role="img" aria-label="${esc(R.name)}">${parts.map(p => RIGDRAW[p.t](p, c, R.h)).join("")}${R.parts.map(p => rigLabel(p, c)).join("")}</svg>`;
}
function rigBlock(id, extra = ""){
  const R = RIGS[id];
  return `<div class="rig"><h4>${esc(R.name)}</h4><div class="when">${esc(R.when)}${extra ? " " + esc(extra) : ""}</div><div class="rigbox">${rigSVG(id)}</div><ol>${R.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>`;
}

/* ============================ /data/colors ===============================
   צבעי דמויים. back/side/belly = צבע גב, צד ובטן לשרטוט.                    */
const COLORS = {
  sardine:   {name:"סרדין",               back:"#3a6b86", side:"#cfdde5", belly:"#f5f7f8", when:"יום צלול וים שקט – הכי טבעי"},
  blueSilver:{name:"כחול-כסוף",           back:"#1d4c9e", side:"#c9d5e1", belly:"#ffffff", when:"יום רגיל, מים בינוניים"},
  white:     {name:"לבן / זוהר",           back:"#e6f2e2", side:"#f6fbf4", belly:"#ffffff", when:"לילה, זריחה ושקיעה – נראה בחושך"},
  chartreuse:{name:"צהוב-ירוק (שרטרז)",    back:"#8cc63a", side:"#e5f07a", belly:"#fff6bd", when:"מים עכורים ביום"},
  pink:      {name:"ורוד",                back:"#d9488e", side:"#f2afcf", belly:"#fff2f8", when:"מים עכורים באור נמוך"},
  gold:      {name:"זהב",                 back:"#7a4f10", side:"#e3b146", belly:"#f7e1a0", when:"עננות ואור נמוך"},
  dark:      {name:"שחור-סגול (סילואט)",   back:"#1a1330", side:"#3a2c5c", belly:"#56477c", when:"לילה – צללית מול השמיים"},
  natural:   {name:"טבעי – ירוק זית",       back:"#4a5a28", side:"#a6b077", belly:"#e7e4cc", when:"LRF ואגי ביום"},
  red:       {name:"כתום-אדום",            back:"#b8372a", side:"#ef8a4a", belly:"#ffd3a6", when:"אגי בדמדומים"},
  clear:     {name:"שקוף עם נצנץ",          back:"#8fbcc6", side:"#d3ebf0", belly:"#f1fbfd", when:"LRF ביום צלול", alpha:.8}
};

/* ============================ /data/lures ================================
   cond: wave = טווח גל אפקטיבי, windMax, light = day|low|night,
   terr = עמדות מתאימות, targets = מינים. draw = צורת השרטוט.               */
const ALL_T = ["sand","pier","breakwater","rocks","reef","mixed"];
const LURES = {
  minnow:     {name:"Minnow צף עם לשון", draw:"minnow", techs:["spin"], size:"9–14 ס״מ · 10–20 גרם", depth:"0.5–1.5 מ׳",
               work:"איסוף אחיד עם עצירות קצרות. הלשון מורידה אותו, ובעצירה הוא עולה לאט – שם באות רוב התקיפות.",
               cond:{wave:[0.2,0.9], windMax:18, light:["low","night","day"], terr:["sand","mixed","reef","rocks"], targets:["lavrak","gomber","trachon"]}},
  sinkMinnow: {name:"Minnow שוקע", draw:"sinkMinnow", techs:["spin"], size:"8–12 ס״מ · 15–30 גרם", depth:"1–3 מ׳",
               work:"ספור 2–5 שניות אחרי הנחיתה, ואסוף עם טוויצ׳ים קצרים ועצירות.",
               cond:{wave:[0.3,1.2], windMax:25, light:["day","low"], terr:["rocks","breakwater","pier","mixed","reef"], targets:["lavrak","gomber"]}},
  pencil:     {name:"Pencil על פני המים", draw:"pencil", techs:["spin"], size:"12–16 ס״מ · 15–30 גרם", depth:"פני המים",
               work:"Walk-the-dog: טוויצ׳ים קצביים עם קו רפוי – הדמוי מזגזג על פני המים. תקיפה? חכה שנייה ואז הרם.",
               cond:{wave:[0.1,0.7], windMax:15, light:["low"], terr:ALL_T, targets:["gomber","trachon","lavrak"]}},
  popper:     {name:"פופר", draw:"popper", techs:["spin"], size:"10–14 ס״מ · 15–30 גרם", depth:"פני המים",
               work:"משיכה קצרה וחדה – 'בלופ' – ועצירה של 2 שניות. מושך להקות גומבר.",
               cond:{wave:[0.1,0.6], windMax:15, light:["low"], terr:ALL_T, targets:["gomber","trachon"]}},
  sinkPencil: {name:"Sinking Pencil", draw:"sinkPencil", techs:["spin","shorejig"], size:"9–13 ס״מ · 20–40 גרם", depth:"כל עומק",
               work:"זריקה רחוקה, ספירת שקיעה, ואיסוף מהיר-בינוני עם הרמות קצה. עובד גם ברוח.",
               cond:{wave:[0.2,1.3], windMax:28, light:["day","low","night"], terr:ALL_T, targets:["gomber","palamida","lavrak","trachon"]}},
  spoon:      {name:"כפית", draw:"spoon", techs:["spin","shorejig"], size:"15–30 גרם", depth:"1–4 מ׳",
               work:"איסוף אחיד ולא מהיר מדי – הכפית מתנדנדת ומבהיקה.",
               cond:{wave:[0.1,0.8], windMax:20, light:["day"], terr:ALL_T, targets:["gomber","palamida"]}},
  paddle:     {name:"סיליקון Paddle tail על ראש עופרת", draw:"paddle", techs:["spin"], size:"10–13 ס״מ · ראש 10–20 גרם", depth:"קרקעית עד חצי עומק",
               work:"איסוף איטי ליד הקרקעית – הזנב רועד לבד. בלילה עוד יותר לאט.",
               cond:{wave:[0.2,1.0], windMax:22, light:["night","low"], terr:["rocks","mixed","reef","breakwater"], targets:["lavrak","trachon"]}},
  jig:        {name:"ג׳יג מתכת", draw:"jig", techs:["shorejig","spin"], size:"25–60 גרם", depth:"כל עומק",
               work:"שקיעה לתחתית, איסוף מהיר עם הקפצות. בשחר – נסה גם בחלק העליון.",
               cond:{wave:[0,0.9], windMax:30, light:["day","low"], terr:["breakwater","pier","rocks"], targets:["palamida","gomber"]}},
  grub:       {name:"סיליקון Grub על ראש קל", draw:"grub", techs:["lrf"], size:"1.5–2.5 אינץ׳ · ראש 0.8–3 גרם", depth:"קרקעית עד חצי עומק",
               work:"הפלה, הרמות קצרות של הקצה ואיסוף איטי מאוד.",
               cond:{wave:[0,0.4], windMax:12, light:["night","low","day"], terr:["pier","breakwater","rocks","reef"], targets:["sargus","marmir","muser"]}},
  microJig:   {name:"מיקרו ג׳יג", draw:"jig", techs:["lrf"], size:"3–7 גרם", depth:"כל עומק",
               work:"זריקה, שקיעה, והקפצות קטנות בדרך חזרה. טוב ברוח קלה ובזרם.",
               cond:{wave:[0,0.5], windMax:16, light:["day","low"], terr:["pier","breakwater","rocks"], targets:["sargus"]}},
  egi:        {name:"אגי", draw:"egi", techs:["eging"], size:"2.5–3.5", depth:"קרקעית עד חצי עומק",
               work:"שקיעה (3 שניות למטר), 2–3 ג׳רקים חדים ועצירה של 5–10 שניות. התקיפה באה בעצירה.",
               cond:{wave:[0,0.5], windMax:15, light:["low","night","day"], terr:["pier","breakwater","rocks","reef"], targets:["squid"]}}
};

/* ============================ /data/baits ================================
   dur = עמידות על הקרס (1–3), scent = ריח (1–3). floatOk = טוב גם במצוף.  */
const BAITS = {
  shrimp: {name:"שרימפס", dur:1, scent:2, floatOk:true,
           prep:"שרימפס טרי או קפוא בגודל בינוני. קלוף את הקליפה; בדג גדול השאר את הזנב.",
           hook:"הכנס מהזנב לאורך הגוף, החוד יוצא בגב. שרימפס גדול – חצי שרימפס."},
  sardine:{name:"סרדין", dur:1, scent:3,
           prep:"פילה עם עור, חתוך לרצועות של 1×4 ס״מ או לקוביות. חצי קפוא מחזיק הרבה יותר.",
           hook:"הכנס פעמיים דרך העור. בים עובד – עטוף בחוט אלסטי."},
  squid:  {name:"רצועת דיונון (קלמרי)", dur:3, scent:1,
           prep:"חתוך רצועות של 0.5×5 ס״מ עם קצה מחודד – הרצועה מתנפנפת במים.",
           hook:"פעם אחת בקצה הרחב, שאר הרצועה חופשית."},
  worm:   {name:"תולעי ים / חול", dur:2, scent:2,
           prep:"שמור קר ולח בנייר עיתון לח. לא לשטוף במים מתוקים.",
           hook:"השחל לאורך הקרס ומעל העין, והשאר 1–2 ס״מ חופשי בקצה."},
  crab:   {name:"סרטן קטן", dur:3, scent:2,
           prep:"סרטן חוף קטן, 2–3 ס״מ – שלם או חצוי.",
           hook:"דרך הצד או הרגל האחורית, החוד בחוץ."},
  mussel: {name:"מולים", dur:1, scent:2,
           prep:"פתח מולים טריים והוצא את הבשר.",
           hook:"דרך החלק הקשה (הרגל) וכמה סיבובים של חוט אלסטי."},
  dough:  {name:"בצק", dur:2, scent:2, floatOk:true,
           prep:"פנים לחם לבן בלי קרום + מעט גבינה לבנה או בולגרית + כף שמן סרדין. ללוש עד שלא נדבק לידיים; אם רך – להוסיף קמח.",
           hook:"כדור של 1–1.5 ס״מ שמכסה את כל הקרס."},
  chicken:{name:"חזה עוף (שניצל)", dur:3, scent:1,
           prep:"קוביות של 1–1.5 ס״מ. השרייה של לילה בשמן סרדין או בשום מוסיפה ריח.",
           hook:"הכנס פעמיים, החוד בחוץ. נשאר על הקרס גם כשדגים קטנים מנקרים."},
  bread:  {name:"לחם", dur:1, scent:1, floatOk:true,
           prep:"פנים לחם טרי לקרס. לחם רטוב מעורב בחול לפיזור.",
           hook:"לחץ פיסת פנים לחם סביב הקרס, שתיראה כמו טיפה."},
  live:   {name:"דג פתיון חי (בורי / סרדין)", dur:3, scent:2,
           prep:"דלי עם מאוורר ומים שמתחלפים. בדוק שמותר להשתמש במין ובגודל.",
           hook:"קרס מעגלי דרך השפתיים או האף – לא דרך הגוף."}
};
/* פתיונות מועדפים לכל מין, לפי סדר עדיפות */
const SPECIES_BAITS = {
  lavrak:["shrimp","sardine","squid","worm"], gomber:["sardine","squid"], palamida:["sardine"], trachon:["live","sardine"],
  sargus:["shrimp","crab","worm","dough","bread","chicken"], marmir:["worm","shrimp","mussel"], denis:["crab","mussel","shrimp","worm"],
  muser:["squid","sardine","crab","chicken"], squid:[]
};

/* ============================ /engine/lurePicker ========================== */
function lightOf(a){ return a.phase === "night" ? "night" : (a.phase.startsWith("golden") || (a.h.cloud ?? 0) >= 60) ? "low" : "day"; }
function murkyOf(a){ return a.wp.heff >= 0.7 || (a.wind.cls === "onshore" && (a.h.windSpeed ?? 0) >= 20); }
function pickColors(a, id){
  const L = lightOf(a), murky = murkyOf(a);
  if(id === "eging"){
    if(L === "night") return a.moon.illum >= 0.5 ? ["gold","pink"] : ["dark","red"];
    if(L === "low") return ["red","pink"];
    return murky ? ["pink","red"] : ["natural","gold"];
  }
  if(id === "lrf") return L === "night" ? ["white","clear"] : murky ? ["chartreuse","white"] : ["clear","natural"];
  if(L === "night") return ["dark","white"];
  if(L === "low") return murky ? ["pink","gold"] : ["gold","white"];
  return murky ? ["chartreuse","blueSilver"] : (a.wp.heff < 0.3 ? ["sardine","clear"] : ["blueSilver","sardine"]);
}
function pickLures(a, id){
  const L = lightOf(a), H = a.wp.heff, W = a.h.windSpeed ?? 0, tg = speciesFor(a, id).slice(0,3).map(s => s.id);
  const cols = pickColors(a, id);
  const list = Object.entries(LURES).filter(([k,l]) => l.techs.includes(id)).map(([k,l]) => {
    const c = l.cond, why = []; let s = 50;
    if(H >= c.wave[0] && H <= c.wave[1]){ s += 15; why.push("מתאים לגובה הגל"); } else s -= Math.min(25, 30 * (H < c.wave[0] ? c.wave[0] - H : H - c.wave[1]));
    if(W <= c.windMax){ s += 10; } else { s -= 15; why.push("רוח חזקה בשבילו"); }
    if(c.light.includes(L)){ s += 10; if(L !== "day") why.push(L === "night" ? "עובד בלילה" : "עובד באור נמוך"); } else s -= 10;
    if(c.terr.includes(a.terrain)){ s += 8; } else s -= 6;
    const hit = c.targets.filter(t => tg.includes(t)); s += hit.length * 6;
    if(hit.length) why.push("ל" + hit.map(t => SPECIES.find(x => x.id === t)?.nameHebrew).filter(Boolean).join(" ול"));
    return { k, l, score: Math.round(s), why, color: cols[0], alt: cols[1] };
  }).sort((p,q) => q.score - p.score);
  // שיטה עם דמוי אחד (אגינג) – מציגים אותו בשני צבעים
  if(list.length === 1) return [list[0], {...list[0], color: cols[1], alt: cols[0], altVariant:true}];
  return list.slice(0,3);
}

/* ============================ /engine/baitPicker ==========================
   ניקוד = סדר העדיפות אצל כל מטרה × ציון המטרה, ומתקנים: ים עובד → עמידות,
   לילה → ריח, מצוף → פתיון שמתאים למצוף.                                   */
function pickBaits(a, id){
  if(id === "livebait") return [{b:"live", score:100, for:[], why:["זה הפתיון של השיטה"]}, {b:"sardine", score:40, for:[], why:["גיבוי – רצועה על אותו ריג"]}, {b:"squid", score:30, for:[], why:["גיבוי עמיד"]}];
  const tg = speciesFor(a, id).slice(0,3), acc = {};
  tg.forEach((s, ti) => (SPECIES_BAITS[s.id] || []).forEach((b, i) => {
    const e = acc[b] ||= {b, score:0, for:[], why:[]};
    e.score += (3 - i * 0.5) * (s.score / 100) * (ti === 0 ? 1.3 : 1); if(!e.for.includes(s.sp.nameHebrew)) e.for.push(s.sp.nameHebrew);
  }));
  const rough = a.wp.heff >= 0.6 || (a.h.current ?? 0) >= 1.2, night = a.phase === "night";
  Object.values(acc).forEach(e => { const B = BAITS[e.b]; if(!B) return;
    if(rough){ e.score *= 1 + 0.2 * (B.dur - 2); if(B.dur >= 3) e.why.push("עמיד – נשאר על הקרס בים עובד"); if(B.dur === 1) e.why.push("רך – בדוק כל כמה דקות"); }
    if(night){ e.score *= 1 + 0.12 * (B.scent - 2); if(B.scent >= 3) e.why.push("ריח חזק – עובד בחושך"); }
    if(id === "float"){ e.score *= B.floatOk ? 1.35 : 0.8; if(B.floatOk) e.why.push("מתאים למצוף"); }
    if(!rough && !night && B.dur === 1 && B.scent >= 2) e.why.push("טבעי ורך – טוב כשהים שקט");
  });
  const out = Object.values(acc).filter(e => BAITS[e.b]).sort((p,q) => q.score - p.score);
  return out.length ? out : [{b:"shrimp", score:1, for:[], why:["פתיון כללי טוב לרוב דגי החוף"]}];
}

/* ============================ lure & bait drawings ======================== */
let GID = 0;
function lureSVG(draw, colorKey){
  const c = COLORS[colorKey] || COLORS.sardine, id = "lg" + (++GID), op = c.alpha || 1;
  const g = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.back}"/><stop offset=".55" stop-color="${c.side}"/><stop offset="1" stop-color="${c.belly}"/></linearGradient></defs>`;
  const F = `fill="url(#${id})" fill-opacity="${op}" stroke="${c.back}" stroke-width=".8"`;
  const eye = (x,y,r=4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x+.6}" cy="${y}" r="${r*.5}" fill="#111"/>`;
  const tr = (x,y) => `<circle cx="${x}" cy="${y}" r="2" fill="none" stroke="var(--fg)" stroke-width="1.1"/><path d="M${x} ${y+2} L${x} ${y+10} M${x} ${y+10} q-7 6 -8 -2 M${x} ${y+10} q7 6 8 -2" fill="none" stroke="var(--fg)" stroke-width="1.3"/>`;
  const lead = "#8a959c";
  const D = {
    minnow:`<path d="M16 34 C32 20 92 18 130 28 L146 22 L144 34 L146 46 L130 40 C92 50 32 48 16 34Z" ${F}/><path d="M16 37 L3 52 L11 54 L21 41Z" fill="${c.side}" fill-opacity=".45" stroke="${c.back}" stroke-width=".8"/><path d="M38 26 q-5 8 0 16" fill="none" stroke="${c.back}" stroke-opacity=".5"/>${eye(28,31)}${tr(62,43)}${tr(106,42)}`,
    sinkMinnow:`<path d="M16 34 C30 16 94 16 132 28 L148 20 L146 34 L148 48 L132 40 C94 52 30 52 16 34Z" ${F}/><path d="M16 37 L9 45 L16 46 L22 40Z" fill="${c.side}" fill-opacity=".45" stroke="${c.back}" stroke-width=".8"/>${eye(28,31)}${tr(64,45)}${tr(108,43)}`,
    pencil:`<path d="M8 34 C20 24 100 24 138 30 L150 26 L148 34 L150 42 L138 38 C100 44 20 44 8 34Z" ${F}/>${eye(20,32,3.5)}${tr(56,40)}${tr(106,39)}`,
    sinkPencil:`<path d="M8 35 C24 27 104 26 140 31 L152 27 L150 34 L152 41 L140 37 C104 42 24 42 8 35Z" ${F}/>${eye(20,33,3)}${tr(62,39)}${tr(112,38)}`,
    popper:`<path d="M12 23 C44 22 110 26 138 30 L150 26 L148 34 L150 42 L138 38 C110 42 44 47 12 45Z" ${F}/><ellipse cx="12" cy="34" rx="4.5" ry="11" fill="${c.back}"/><ellipse cx="13" cy="34" rx="2.4" ry="7.5" fill="#0b0b0b" opacity=".55"/>${eye(26,30,3.5)}${tr(60,43)}${tr(110,40)}<path d="M146 34 l12 -8 M146 34 l13 0 M146 34 l12 8" stroke="${c.side}" stroke-width="2"/>`,
    jig:`<path d="M10 34 C22 25 112 24 152 32 C112 42 22 43 10 34Z" ${F}/><path d="M22 32 L140 31" stroke="#fff" stroke-opacity=".65" stroke-width="3" stroke-linecap="round"/><path d="M22 36 L130 35" stroke="${c.back}" stroke-opacity=".35" stroke-width="1.5"/>${eye(20,32,3)}<circle cx="6" cy="34" r="3.2" fill="none" stroke="var(--fg)" stroke-width="1.3"/><path d="M6 31 Q12 18 22 16" fill="none" stroke="var(--accent)" stroke-width="1.4"/>${hookPath(24,12,.75)}`,
    spoon:`<path d="M22 34 C22 20 62 14 112 26 C132 32 132 38 112 42 C62 54 22 48 22 34Z" ${F}/><ellipse cx="62" cy="30" rx="26" ry="5" fill="#fff" opacity=".35"/><circle cx="16" cy="34" r="4" fill="none" stroke="var(--fg)" stroke-width="1.3"/>${tr(130,38)}`,
    paddle:`<path d="M28 30 C50 26 92 28 114 32 L114 38 C92 42 50 42 28 38Z" ${F}/><path d="M114 30 C124 20 140 22 142 34 C140 46 124 48 114 38Z" ${F}/><circle cx="20" cy="34" r="9" fill="${lead}"/><circle cx="17" cy="32" r="2.4" fill="#fff"/><circle cx="17.5" cy="32" r="1.2" fill="#111"/><circle cx="20" cy="23" r="2.4" fill="none" stroke="var(--fg)" stroke-width="1.2"/><path d="M60 34 L60 24 l-3 3" fill="none" stroke="var(--fg)" stroke-width="1.5"/>`,
    grub:`<path d="M30 31 C46 29 62 30 72 33 L72 37 C62 40 46 40 30 37Z" ${F}/><path d="M72 35 C92 36 100 52 86 56 C74 59 72 46 84 46" fill="none" stroke="${c.side}" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="34" r="6.5" fill="${lead}"/><circle cx="24" cy="26" r="2" fill="none" stroke="var(--fg)" stroke-width="1.2"/><path d="M50 34 L50 26 l-3 2" fill="none" stroke="var(--fg)" stroke-width="1.4"/>`,
    egi:`<path d="M12 34 C26 20 92 18 122 28 L130 36 C98 48 26 48 12 34Z" ${F}/><path d="M22 30 C46 22 90 22 118 29" fill="none" stroke="${c.back}" stroke-width="4" stroke-opacity=".7"/><path d="M60 23 l-8 -13 M72 22 l-6 -13" stroke="${c.back}" stroke-width="3" stroke-linecap="round"/><path d="M14 37 l10 12 l10 -8Z" fill="${lead}"/>${eye(24,32,3.5)}${[...Array(7)].map((_,k)=>`<line x1="130" y1="36" x2="146" y2="${36+(k-3)*3.4}" stroke="var(--fg)" stroke-width="1"/>`).join("")}${[...Array(5)].map((_,k)=>`<line x1="127" y1="38" x2="140" y2="${40+(k-2)*3.4}" stroke="var(--fg)" stroke-width=".9"/>`).join("")}`
  };
  return `<svg viewBox="0 0 162 68" role="img" aria-label="${esc(c.name)}">${g}${D[draw] || D.minnow}</svg>`;
}
function baitSVG(b){
  const D = {
    shrimp:`<path d="M24 42 C22 24 62 14 92 22 C106 26 112 36 106 44 C98 52 82 50 72 46 C58 42 42 48 30 50Z" fill="#dca99a" stroke="#a8705f" stroke-width="1"/>${[40,52,64,76,88].map(x=>`<path d="M${x} ${x<60?22:20} q4 12 0 26" fill="none" stroke="#a8705f" stroke-width="1" opacity=".7"/>`).join("")}<path d="M24 42 L8 34 L10 46 L6 56 L26 49Z" fill="#c88f7e" stroke="#a8705f"/><path d="M106 32 C118 20 126 10 130 6 M106 34 C122 26 128 22 132 20" fill="none" stroke="#a8705f" stroke-width="1.2"/>${[54,64,74,84].map(x=>`<path d="M${x} 49 l-2 8" stroke="#a8705f" stroke-width="1.2"/>`).join("")}<circle cx="100" cy="30" r="2.4" fill="#222"/>`,
    sardine:`<path d="M18 22 L98 18 C112 26 112 44 98 50 L18 48 C12 40 12 30 18 22Z" fill="url(#bsd)" stroke="#2c5570" stroke-width=".8"/><ellipse cx="18" cy="35" rx="6" ry="13" fill="#b9606a"/><ellipse cx="18" cy="35" rx="3" ry="8" fill="#d98a8f"/>${[36,50,64,78].map(x=>`<circle cx="${x}" cy="27" r="1.6" fill="#1e3d52"/>`).join("")}<defs><linearGradient id="bsd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5f7c"/><stop offset=".5" stop-color="#cfdde5"/><stop offset="1" stop-color="#f4f6f7"/></linearGradient></defs>`,
    squid:`<path d="M8 30 C40 25 92 27 126 34 C92 41 40 45 8 40Z" fill="#f1ebe2" stroke="#c9bfb0"/><path d="M110 32 L128 30 M110 36 L128 38" stroke="#c9bfb0"/>${[22,34,46,58,70,84].map((x,i)=>`<circle cx="${x}" cy="${33+(i%2)*3}" r="1.5" fill="#a17b9c" opacity=".6"/>`).join("")}`,
    worm:`<path d="M8 40 C24 20 36 58 52 38 C66 20 78 56 96 38 C106 28 116 36 124 30" fill="none" stroke="#b5503f" stroke-width="7" stroke-linecap="round"/><path d="M8 40 C24 20 36 58 52 38 C66 20 78 56 96 38 C106 28 116 36 124 30" fill="none" stroke="#6e2a20" stroke-width="7" stroke-dasharray="1 5"/>`,
    crab:`${[-1,1].map(s=>[0,1,2].map(i=>`<path d="M${65+s*18} ${40+i*4} q${s*14} ${-4+i*4} ${s*22} ${6+i*3}" fill="none" stroke="#6a5a3c" stroke-width="2.4" stroke-linecap="round"/>`).join("")).join("")}<ellipse cx="65" cy="38" rx="24" ry="15" fill="#7c6a4a" stroke="#5a4b31"/><path d="M48 28 q-10 -10 -18 -6 q6 6 14 10 M82 28 q10 -10 18 -6 q-6 6 -14 10" fill="#8a7550" stroke="#5a4b31"/><circle cx="58" cy="26" r="2.2" fill="#111"/><circle cx="72" cy="26" r="2.2" fill="#111"/>`,
    mussel:`<path d="M20 40 C30 14 92 14 114 30 C106 52 40 60 20 40Z" fill="#1f2a44" stroke="#0f1628"/><path d="M26 40 C36 24 88 22 106 32 C98 46 46 52 26 40Z" fill="#e8904a"/><path d="M40 38 C56 32 80 32 96 36" fill="none" stroke="#c46a2a" stroke-width="1.5"/>`,
    dough:`<circle cx="62" cy="36" r="22" fill="#e6d3a8" stroke="#c7ad76"/>${[[54,28],[66,24],[72,38],[58,44],[50,36],[68,48]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="#b89c63"/>`).join("")}<circle cx="100" cy="46" r="9" fill="#e6d3a8" stroke="#c7ad76"/><circle cx="24" cy="48" r="7" fill="#e6d3a8" stroke="#c7ad76"/>`,
    chicken:`<rect x="26" y="24" width="24" height="24" rx="4" fill="#f2c3b6" stroke="#d99b8b" transform="rotate(-8 38 36)"/><rect x="56" y="20" width="26" height="26" rx="4" fill="#f5cabd" stroke="#d99b8b" transform="rotate(6 69 33)"/><rect x="88" y="28" width="22" height="22" rx="4" fill="#efbfb1" stroke="#d99b8b" transform="rotate(-4 99 39)"/><path d="M60 30 q8 4 18 0 M30 34 q8 4 16 0" fill="none" stroke="#e7a797" stroke-width="1.2"/>`,
    bread:`<path d="M34 58 L34 30 C34 10 96 10 96 30 L96 58Z" fill="#f3e3bf" stroke="#b98446" stroke-width="5" stroke-linejoin="round"/>${[[50,34],[62,28],[74,40],[58,46],[80,30],[70,52]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.4" fill="#d9c08f"/>`).join("")}`,
    live:`<path d="M14 34 C30 20 80 18 104 28 L122 18 L118 34 L122 50 L104 40 C80 50 30 48 14 34Z" fill="url(#blv)" stroke="#4b5a63" stroke-width=".8"/>${[26,32,38].map(y=>`<path d="M30 ${y} L100 ${y}" stroke="#56666f" stroke-opacity=".45"/>`).join("")}<circle cx="26" cy="31" r="3" fill="#fff"/><circle cx="26.5" cy="31" r="1.5" fill="#111"/><path d="M10 22 L10 30 A7 7 0 1 0 22 36 L19 30" fill="none" stroke="var(--fg)" stroke-width="1.8" stroke-linecap="round"/><defs><linearGradient id="blv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55656e"/><stop offset=".55" stop-color="#c3ccd1"/><stop offset="1" stop-color="#eef1f2"/></linearGradient></defs>`
  };
  const gid = "bg" + (++GID); return `<svg viewBox="0 0 134 68" role="img" aria-label="${esc(BAITS[b]?.name || b)}">${(D[b] || D.shrimp).replace(/bsd|blv/g, gid)}</svg>`;
}
const dots = n => `<span class="dots" aria-label="${n} מתוך 3">${[1,2,3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
const swatch = k => { const c = COLORS[k]; return c ? `<span class="swatch" style="background:linear-gradient(${c.back},${c.side} 55%,${c.belly})"></span>${esc(c.name)}` : ""; };

/* ---- רכיב "במה בדיוק להשתמש" ---- */
function quickPick(a, id){
  if(TECH[id].family === "lure"){ const p = pickLures(a, id)[0]; return p ? `${p.l.name} · ${COLORS[p.color].name}` : "—"; }
  const p = pickBaits(a, id)[0]; return p ? BAITS[p.b].name : "—";
}
function useCard(a, id){
  const t = TECH[id];
  if(t.family === "lure"){
    const picks = pickLures(a, id), W = techAdvice(id, a).rows.find(r => /משקל|ראש עופרת|גודל אגי/.test(r[0]));
    return `<div class="card" style="margin-top:12px"><h3>במה בדיוק להשתמש <span class="sub">${esc(t.name)} · לפי הגל, הרוח, האור והמטרות</span></h3>
      <div class="usegrid">${picks.map((p,i) => `<div class="ucard${i===0?" top":""}">
        <div class="rank">${i===0 ? "הבחירה הראשונה" : p.altVariant ? "צבע חלופי" : "חלופה " + i}</div>
        <div class="art">${lureSVG(p.l.draw, p.color)}</div>
        <b class="nm">${esc(p.l.name)}</b>
        <div class="colors">${swatch(p.color)}<span class="or">או</span>${swatch(p.alt)}</div>
        <dl class="kv sm"><dt>גודל</dt><dd>${esc(i===0 && W ? W[1] : p.l.size)}</dd><dt>עומק</dt><dd>${esc(p.l.depth)}</dd><dt>איך</dt><dd>${esc(p.l.work)}</dd></dl>
        ${p.why.length ? `<div class="why2">${esc(p.why.join(" · "))}</div>` : ""}
      </div>`).join("")}</div>
      <p class="note" style="margin:10px 0 0">הצבע נבחר לפי האור (${({day:"יום",low:"אור נמוך",night:"לילה"})[lightOf(a)]}) ולפי צלילות המים (${murkyOf(a) ? "צפויים עכורים" : "צפויים צלולים"}). השרטוטים הם הדגמה של הסוג – לא של דגם מסוים.</p></div>`;
  }
  const picks = pickBaits(a, id), p = picks[0], B = BAITS[p.b], tg = speciesFor(a, id)[0];
  const hook = id === "livebait" ? "מעגלי 2/0–4/0" : (tg?.sp.hook || "#4–#1");
  return `<div class="card" style="margin-top:12px"><h3>במה בדיוק להשתמש <span class="sub">${esc(t.name)} · לפי המטרות והתנאים</span></h3>
    <div class="baitmain">
      <div class="art">${baitSVG(p.b)}</div>
      <div style="min-width:0">
        <div class="rank">הפתיון הראשון</div><b class="nm big">${esc(B.name)}</b>
        ${p.for.length ? `<div class="note">ל${esc(p.for.join(", "))}</div>` : ""}
        <dl class="kv" style="margin-top:8px"><dt>הכנה</dt><dd>${esc(B.prep)}</dd><dt>על הקרס</dt><dd>${esc(B.hook)}</dd><dt>קרס</dt><dd>${esc(hook)}</dd><dt>עמידות</dt><dd>${dots(B.dur)}</dd><dt>ריח</dt><dd>${dots(B.scent)}</dd></dl>
        ${p.why.length ? `<div class="why2">${esc([...new Set(p.why)].join(" · "))}</div>` : ""}
      </div>
    </div>
    ${picks.length > 1 ? `<div class="usegrid" style="margin-top:12px">${picks.slice(1,4).map((q,i) => `<div class="ucard"><div class="rank">גיבוי ${i+1}</div><div class="art sm">${baitSVG(q.b)}</div><b class="nm">${esc(BAITS[q.b].name)}</b>${q.for.length ? `<div class="note">ל${esc(q.for.join(", "))}</div>` : ""}<div class="note" style="margin-top:4px">${esc(BAITS[q.b].hook)}</div></div>`).join("")}</div>` : ""}
    <div class="advice" style="font-size:13.5px"><b>להכין מהבית:</b> ${picks.slice(0,3).map(q => `${esc(BAITS[q.b].name)} – ${esc(BAITS[q.b].prep)}`).join(" · ")}</div>
  </div>`;
}
function catalogBlock(id){
  const t = TECH[id];
  if(t.family === "lure"){
    const ls = Object.values(LURES).filter(l => l.techs.includes(id));
    const cols = id === "eging" ? ["red","pink","gold","natural","dark"] : id === "lrf" ? ["clear","white","natural","chartreuse","pink"] : ["sardine","blueSilver","white","gold","pink","chartreuse","dark"];
    return `<div class="card" style="margin-top:12px"><h3>הדמויים של השיטה</h3><div class="usegrid">${ls.map(l => `<div class="ucard"><div class="art">${lureSVG(l.draw, id === "eging" ? "red" : id === "lrf" ? "clear" : "sardine")}</div><b class="nm">${esc(l.name)}</b><dl class="kv sm"><dt>גודל</dt><dd>${esc(l.size)}</dd><dt>עומק</dt><dd>${esc(l.depth)}</dd><dt>גל</dt><dd><span class="num">${l.cond.wave[0]}–${l.cond.wave[1]}</span> מ׳ · רוח עד <span class="num">${l.cond.windMax}</span></dd><dt>איך</dt><dd>${esc(l.work)}</dd></dl></div>`).join("")}</div>
      <h3 style="margin-top:16px">מתי איזה צבע</h3><div class="colorguide">${cols.map(k => `<div class="cg"><div class="art sm">${lureSVG(id === "eging" ? "egi" : id === "lrf" ? "grub" : "minnow", k)}</div><b>${esc(COLORS[k].name)}</b><span>${esc(COLORS[k].when)}</span></div>`).join("")}</div></div>`;
  }
  const keys = id === "livebait" ? ["live","sardine","squid"] : id === "float" ? ["bread","dough","shrimp","worm","mussel","crab"] : ["shrimp","sardine","squid","worm","crab","mussel","dough","chicken"];
  return `<div class="card" style="margin-top:12px"><h3>פתיונות – הכנה והשחלה</h3><div class="usegrid">${keys.map(k => { const B = BAITS[k]; const who = Object.entries(SPECIES_BAITS).filter(([s,l]) => l.includes(k)).map(([s]) => SPECIES.find(x => x.id === s)?.nameHebrew).filter(Boolean);
    return `<div class="ucard"><div class="art sm">${baitSVG(k)}</div><b class="nm">${esc(B.name)}</b>${who.length ? `<div class="note">ל${esc(who.join(", "))}</div>` : ""}<dl class="kv sm"><dt>הכנה</dt><dd>${esc(B.prep)}</dd><dt>על הקרס</dt><dd>${esc(B.hook)}</dd><dt>עמידות</dt><dd>${dots(B.dur)}</dd><dt>ריח</dt><dd>${dots(B.scent)}</dd></dl></div>`; }).join("")}</div></div>`;
}

/* =====================================================================
   /engine/activities – כל פעילויות החוף והים
   כל פעילות: פונקציית ניקוד (נקודות + הסבר), אזהרות, מדדים שמעניינים אותה,
   אזורי רוח ביחס לחוף, טיפים של מומחה ורשימת ציוד.
   ===================================================================== */
const KN = kmh => (kmh ?? 0) / 1.852;
const LEVEL_HE = {beginner:"מתחילים", intermediate:"בינוניים", advanced:"מתקדמים"};
const REL_HE = {onshore:"מהים", sideOn:"צד-מהים", side:"לאורך החוף", sideOff:"צד-מהיבשה", offshore:"מהיבשה", none:"—"};
/* כיוון רוח יחסי לחוף: signed 0 = מהים, ±180 = מהיבשה, +90 = מימין כשעומדים מול הים */
function relWind(windDir, facing){
  if(windDir == null) return {cls:"none", abs:null, signed:null};
  const signed = ((windDir - facing + 540) % 360) - 180, abs = Math.abs(signed);
  return { cls: abs <= 30 ? "onshore" : abs <= 65 ? "sideOn" : abs <= 115 ? "side" : abs <= 150 ? "sideOff" : "offshore", abs, signed };
}

const DEFAULT_ACT_CFG = {
  comfort:{ feels:[{max:16,pts:0.3,label:"קר"},{max:22,pts:0.7,label:"נעים-קריר"},{max:30,pts:1,label:"נעים"},{max:33,pts:0.6,label:"חם"},{max:36,pts:0.2,label:"חם מאוד"},{max:99,pts:0,label:"עומס חום"}], heatAlert:35, uvHigh:8 },
  surf:{ level:{beginner:[0.4,1.0], intermediate:[0.7,1.8], advanced:[1.0,3.0]},
    period:[{max:6,pts:5,label:"גל רוח קצר – רך ומבולגן"},{max:8,pts:15,label:"period בינוני"},{max:11,pts:25,label:"סוול טוב"},{max:99,pts:30,label:"סוול ארוך וחזק"}],
    glassyKmh:6, offshoreMaxKmh:18, onshoreBadKmh:12 },
  kite:{ windKn:[{max:10,pts:0,label:"אין מספיק רוח"},{max:12,pts:15,label:"גבולי – קייט גדול או פויל"},{max:16,pts:30,label:"רוח טובה"},{max:25,pts:40,label:"רוח מצוינת"},{max:30,pts:25,label:"חזק – קייט קטן, למנוסים"},{max:35,pts:5,label:"חזק מאוד"},{max:999,pts:0,label:"סערה"}],
    sizeFactor:2.2, gustKnGood:6, gustKnBad:10 },
  windsurf:{ windKn:[{max:8,pts:0,label:"אין מספיק רוח"},{max:12,pts:15,label:"רוח קלה – מפרש גדול"},{max:18,pts:35,label:"רוח טובה לפליינג"},{max:28,pts:40,label:"רוח מצוינת"},{max:35,pts:20,label:"חזק – מפרש קטן"},{max:999,pts:3,label:"סערה"}],
    sailFactor:1.34, gustKnGood:6, gustKnBad:10 },
  sup:{ wave:[{max:0.2,pts:30,label:"ים שקט – פלטה"},{max:0.4,pts:22,label:"גל קל"},{max:0.7,pts:8,label:"גלים – רק למנוסים"},{max:99,pts:0,label:"ים גבוה"}],
    wind:[{max:8,pts:30,label:"כמעט בלי רוח"},{max:14,pts:20,label:"רוח קלה"},{max:20,pts:6,label:"רוח שמקשה על החתירה"},{max:999,pts:0,label:"רוח חזקה"}], offshoreDangerKmh:10 },
  kayak:{ wave:[{max:0.3,pts:30,label:"ים שקט"},{max:0.6,pts:22,label:"גל קל"},{max:0.9,pts:8,label:"גלים – יציאה ונחיתה קשות"},{max:99,pts:0,label:"ים גבוה"}],
    wind:[{max:10,pts:30,label:"רוח חלשה"},{max:18,pts:20,label:"רוח בינונית"},{max:25,pts:6,label:"רוח חזקה"},{max:999,pts:0,label:"רוח חזקה מאוד"}], offshoreDangerKmh:12 },
  matkot:{ wind:[{max:8,pts:40,label:"כמעט בלי רוח – משחק נקי"},{max:14,pts:30,label:"רוח קלה"},{max:20,pts:15,label:"הכדור זז ברוח"},{max:28,pts:5,label:"רוח חזקה – קשה לשמור על ראלי"},{max:999,pts:0,label:"רוח חזקה מדי"}],
    alongFromKmh:10, offshoreFromKmh:12, gustGapKmh:10, wetSandMaxH:1.0 },
  footvolley:{ wind:[{max:8,pts:40,label:"כמעט בלי רוח – הכדור בשליטה"},{max:13,pts:30,label:"רוח קלה"},{max:18,pts:16,label:"הכדור נסחף – קשה לשלוט ברגל ובראש"},{max:25,pts:5,label:"רוח חזקה – קשה להחזיק ראלי"},{max:999,pts:0,label:"רוח חזקה מדי"}],
    offshoreFromKmh:10, alongFromKmh:12, gustGapKmh:8, hotSandTemp:29, hotSandUv:7, glareMin:90 },
  volleyball:{ wind:[{max:10,pts:35,label:"רוח חלשה"},{max:16,pts:25,label:"רוח קלה – מגישים נמוך"},{max:22,pts:12,label:"רוח שמשנה מסירות"},{max:999,pts:0,label:"רוח חזקה מדי"}], gustGapKmh:10, glareMin:90 },
  swim:{ wave:[{max:0.3,pts:35,label:"ים שקט"},{max:0.6,pts:25,label:"גל קל"},{max:0.9,pts:10,label:"גלים – זהירות מזרמים"},{max:99,pts:0,label:"ים מסוכן לשחייה"}], ripH:0.6, ripPeriod:7, jellyMonths:[6,7] },
  snorkel:{ calm24:[{max:0.3,pts:35,label:"ים שקט יממה – מים צפויים צלולים"},{max:0.5,pts:25,label:"ראות סבירה"},{max:0.8,pts:10,label:"ראות מוגבלת"},{max:99,pts:0,label:"עכור אחרי ים גבוה"}] },
  beach:{}
};

/* ---------- helpers ---------- */
function comfortPts(h, max, C){ if(h.feels == null) return {pts:Math.round(max/2), label:"טמפרטורה לא זמינה"}; const b = band(C.comfort.feels, h.feels); return {pts:Math.round(max*b.pts), label:`${b.label} (מרגיש ${fmt(h.feels,0)}°)`}; }
function isDaylight(h){ const t = h.min + 30; return t >= h.sunrise - 20 && t <= h.sunset + 20; }
function wetsuitFor(sst){ if(sst == null) return "—"; return sst >= 25 ? "בגד ים / לייקרה" : sst >= 22 ? "לייקרה או שורטי 2 מ״מ" : sst >= 19 ? "חליפה 3/2 מ״מ" : sst >= 16 ? "חליפה 4/3 מ״מ" : "חליפה 5/4 + נעלים"; }
function uvLabel(u){ return u == null ? "—" : u >= 11 ? "קיצוני" : u >= 8 ? "גבוה מאוד" : u >= 6 ? "גבוה" : u >= 3 ? "בינוני" : "נמוך"; }

/* ---------- ניקוד לכל פעילות ---------- */
const ACT_SCORE = {
  surf(h, x, C, P){
    const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l}), c = C.surf;
    const Hw = h.waveH ?? 0, lvl = P.surfLevel || "intermediate", [lo, hi] = c.level[lvl];
    if(Hw < lo) add(35 * Math.pow(Math.max(0, Hw / lo), 2), `גלים קטנים לרמה שלך (${fmt(Hw,1)} מ׳)`);
    else if(Hw <= hi) add(35, `גובה מתאים ל${LEVEL_HE[lvl]} (${fmt(Hw,1)} מ׳)`);
    else { add(Math.max(0, 35 - (Hw - hi) * 40), `גדול לרמה שלך (${fmt(Hw,1)} מ׳)`); al.push({lvl: Hw > hi + 0.5 ? "bad" : "warn", text:`הגלים גדולים מהטווח של ${LEVEL_HE[lvl]}`}); }
    const pb = band(c.period, h.wavePeriod ?? 5); add(pb.pts, `${pb.label} (${fmt(h.wavePeriod,1)} ש׳)`);
    const sd = h.swellDir ?? h.waveDir;
    if(sd != null){ const d = windCalculator.angleDiff(sd, x.facing); add(d <= 45 ? 10 : d <= 75 ? 5 : 0, d <= 45 ? "הסוול נכנס ישר לחוף" : d <= 75 ? "סוול בזווית" : "הסוול עוקף את החוף – פחות גלים"); }
    const W = h.windSpeed ?? 0, r = x.rel.cls;
    if(W <= c.glassyKmh) add(20, "כמעט בלי רוח – ים 'זכוכית'");
    else if((r === "offshore" || r === "sideOff") && W <= c.offshoreMaxKmh) add(20, "רוח מהיבשה – גלים נקיים ומחזיקים");
    else if(r === "offshore" || r === "sideOff") add(8, "רוח מהיבשה חזקה – קשה להיכנס לגל");
    else if(r === "onshore" || r === "sideOn") add(W < c.onshoreBadKmh ? 10 : 0, W < c.onshoreBadKmh ? "רוח קלה מהים" : "רוח מהים – ים מבולגן (צ׳ופי)");
    else add(W < 12 ? 12 : 4, "רוח צד");
    if(h.windWave != null && h.swellH != null && h.windWave > h.swellH && W > 12) add(-6, "יותר גל רוח מסוול – גלים רכים");
    if(Hw >= 1.5 && (h.wavePeriod ?? 0) >= 9) al.push({lvl:"warn", text:"סוול חזק – זרמים חוזרים ליד שוברי גלים וסלעים"});
    return {it, al};
  },
  kite(h, x, C, P){ return windSport(h, x, C.kite, P, "kite"); },
  windsurf(h, x, C, P){ return windSport(h, x, C.windsurf, P, "windsurf"); },
  sup(h, x, C, P){ return paddle(h, x, C.sup, C, "sup"); },
  kayak(h, x, C, P){ return paddle(h, x, C.kayak, C, "kayak"); },
  matkot(h, x, C){
    const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l}), c = C.matkot, W = h.windSpeed ?? 0, r = x.rel.cls;
    const wb = band(c.wind, W); add(wb.pts, `${wb.label} (${fmt(W,0)} קמ״ש)`);
    let dp = 15, dl = "כיוון רוח לא מפריע";
    if(r === "side" && W >= c.alongFromKmh){ dp -= Math.min(15, W - 6); dl = "רוח לאורך קו המשחק – צד אחד משחק נגד הרוח"; }
    else if((r === "offshore" || r === "sideOff") && W >= c.offshoreFromKmh){ dp -= Math.min(15, W - 8); dl = "רוח מהיבשה – משבית ולא צפויה"; }
    else if(r === "onshore" || r === "sideOn") dl = W >= 10 ? "רוח מהים – יציבה יחסית, הכדור נדחף ליבשה" : "רוח קלה מהים";
    add(Math.max(0, dp), dl);
    add((h.gust ?? W) - W >= c.gustGapKmh ? 0 : 10, (h.gust ?? W) - W >= c.gustGapKmh ? `משבים עד ${fmt(h.gust,0)} – הכדור 'קופץ'` : "רוח אחידה");
    const cf = comfortPts(h, 20, C); add(cf.pts, cf.label);
    const midday = h.hour >= 11 && h.hour < 15;
    add(x.phase.startsWith("golden") ? 10 : midday && (h.uv ?? 0) >= C.comfort.uvHigh ? 2 : 6, x.phase.startsWith("golden") ? "שעה נעימה לשחק" : midday && (h.uv ?? 0) >= C.comfort.uvHigh ? `UV ${fmt(h.uv,0)} – עדיף בוקר או אחה״צ` : "שעת יום");
    add(x.wp.heff >= c.wetSandMaxH ? 0 : 5, x.wp.heff >= c.wetSandMaxH ? "גלים עולים על החול הרטוב – פחות מקום" : "רצועת חול רטוב נוחה");
    return {it, al};
  },
  footvolley(h, x, C){
    const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l}), c = C.footvolley, W = h.windSpeed ?? 0, r = x.rel.cls;
    const wb = band(c.wind, W); add(wb.pts, `${wb.label} (${fmt(W,0)} קמ״ש)`);
    let dp = 15, dl = "כיוון רוח לא מפריע";
    if((r === "offshore" || r === "sideOff") && W >= c.offshoreFromKmh){ dp -= Math.min(15, W - 5); dl = "רוח מהיבשה – עוברת בין בניינים ומגיעה משבית ומסתחררת"; }
    else if(r === "side" && W >= c.alongFromKmh){ dp -= Math.min(15, W - 8); dl = "רוח לאורך החוף – חזקה ויציבה, צד אחד משחק נגדה"; }
    else if(r === "onshore" || r === "sideOn") dl = W >= 10 ? "רוח מהים – יציבה יחסית" : "רוח קלה מהים";
    add(Math.max(0, dp), dl);
    const gap = (h.gust ?? W) - W; add(gap >= c.gustGapKmh ? 0 : 10, gap >= c.gustGapKmh ? `משבים עד ${fmt(h.gust,0)} – הכדור משנה מסלול באוויר` : "רוח אחידה");
    const cf = comfortPts(h, 20, C); add(cf.pts, cf.label);
    const midday = h.hour >= 11 && h.hour < 16;
    add(x.phase.startsWith("golden") ? 10 : midday ? 3 : 7, x.phase.startsWith("golden") ? "שעה נוחה למשחק" : midday ? "שעות חמות" : "שעת יום");
    add((h.precip ?? 0) > 0.2 ? 0 : 5, (h.precip ?? 0) > 0.2 ? "גשם – חול כבד וכדור רטוב" : "חול יבש");
    if((h.temp ?? 0) >= c.hotSandTemp && (h.uv ?? 0) >= c.hotSandUv){ add(-8, "חול לוהט – משחקים יחפים"); al.push({lvl:"warn", text:"חול לוהט: להרטיב את המגרש או לשחק אחרי 16:00"}); }
    const westish = windCalculator.angleDiff(x.facing, 270) <= 45, t = h.min + 30;
    if(westish && t >= h.sunset - c.glareMin && t <= h.sunset) add(-5, "סנוור מהשמש השוקעת – קשה לקרוא כדור גבוה");
    if((r === "offshore" || r === "sideOff") && W >= 18) al.push({lvl:"warn", text:"רוח חזקה מהיבשה – הכדור יברח לים. שחקו במגרש מוגן"});
    return {it, al};
  },
  volleyball(h, x, C){
    const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l}), c = C.volleyball, W = h.windSpeed ?? 0, r = x.rel.cls;
    const wb = band(c.wind, W); add(wb.pts, `${wb.label} (${fmt(W,0)} קמ״ש)`);
    add((r === "offshore" || r === "sideOff") && W >= 12 ? 3 : 10, (r === "offshore" || r === "sideOff") && W >= 12 ? "רוח מהיבשה – משבית" : "כיוון רוח סביר");
    add((h.gust ?? W) - W >= c.gustGapKmh ? 0 : 10, (h.gust ?? W) - W >= c.gustGapKmh ? `משבים עד ${fmt(h.gust,0)}` : "רוח אחידה");
    const cf = comfortPts(h, 20, C); add(cf.pts, cf.label);
    const midday = h.hour >= 11 && h.hour < 15;
    add(midday && (h.uv ?? 0) >= C.comfort.uvHigh ? 2 : 10, midday && (h.uv ?? 0) >= C.comfort.uvHigh ? `UV ${fmt(h.uv,0)} בצהריים` : "שעה טובה למשחק");
    add((h.precip ?? 0) > 0.2 ? 0 : 15, (h.precip ?? 0) > 0.2 ? "גשם" : "יבש");
    const westish = windCalculator.angleDiff(x.facing, 270) <= 45, t = h.min + 30;
    if(westish && t >= h.sunset - c.glareMin && t <= h.sunset) add(-5, "סנוור מהשמש השוקעת מעל הים – החליפו צדדים");
    if((h.temp ?? 0) >= 30 && (h.uv ?? 0) >= 7) add(-5, "חול לוהט – גרבי חול או שעה מאוחרת");
    return {it, al};
  },
  swim(h, x, C){
    const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l}), c = C.swim, W = h.windSpeed ?? 0;
    const wb = band(c.wave, x.wp.heff); add(wb.pts, `${wb.label} (אפקטיבי ${fmt(x.wp.heff,2)} מ׳)`);
    if((x.wp.heff >= c.ripH && (h.wavePeriod ?? 0) >= c.ripPeriod) || (x.rel.cls === "onshore" && W >= 25) || x.wp.heff >= 0.9){ add(-10, "סיכון לזרם חוזר (מערבולת)"); al.push({lvl:"bad", text:"סכנת זרם חוזר – לשחות רק בחוף מוכרז עם מציל. נסחפת? לשחות במקביל לחוף"}); }
    const s = h.sst; add(s == null ? 12 : s >= 23 && s <= 29 ? 25 : s > 29 ? 18 : s >= 20 ? 15 : 5, s == null ? "טמפ׳ מים לא זמינה" : `מים ${fmt(s,1)}°`);
    add(W <= 15 ? 15 : W <= 25 ? 8 : 0, W <= 15 ? "רוח חלשה" : W <= 25 ? "רוח בינונית – גל רוח" : "רוח חזקה");
    const cf = comfortPts(h, 15, C); add(cf.pts, cf.label);
    const midday = h.hour >= 11 && h.hour < 15; add(midday && (h.uv ?? 0) >= C.comfort.uvHigh ? 4 : 10, midday && (h.uv ?? 0) >= C.comfort.uvHigh ? `UV ${fmt(h.uv,0)} – קרם עמיד למים` : "שעה נוחה");
    if(c.jellyMonths.includes(+h.date.slice(5,7))) al.push({lvl:"warn", text:"עונת מדוזות – בדוק דיווחים עדכניים לפני כניסה"});
    if((x.rel.cls === "offshore" || x.rel.cls === "sideOff") && W >= 15) al.push({lvl:"warn", text:"רוח מהיבשה – לא להתרחק ולא לצאת עם מזרון/גלגל"});
    return {it, al};
  },
  snorkel(h, x, C){
    const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l}), W = h.windSpeed ?? 0;
    const cb = band(C.snorkel.calm24, h.maxWave24 ?? h.waveH ?? 0); add(cb.pts, `${cb.label} (עד ${fmt(h.maxWave24 ?? h.waveH,1)} מ׳ ב-24 ש׳)`);
    const Hn = h.waveH ?? 0; add(Hn < 0.3 ? 20 : Hn < 0.5 ? 12 : 0, Hn < 0.3 ? "ים שקט עכשיו" : Hn < 0.5 ? "גל קל" : "גלים – כניסה ויציאה קשות");
    add(W < 12 ? 15 : W < 18 ? 8 : 0, W < 12 ? "רוח חלשה" : W < 18 ? "רוח בינונית" : "רוח חזקה – פני מים מבולגנים");
    const s = h.sst; add(s == null ? 7 : s >= 24 ? 15 : s >= 21 ? 10 : s >= 18 ? 5 : 2, s == null ? "טמפ׳ מים לא זמינה" : `מים ${fmt(s,1)}°`);
    add(({reef:10, rocks:10, breakwater:9, mixed:7, pier:5, sand:2})[x.terrain] ?? 5, `עמדה: ${TERRAIN_HE[x.terrain]}`);
    add(h.hour >= 10 && h.hour < 15 ? 5 : 1, h.hour >= 10 && h.hour < 15 ? "שמש גבוהה – אור טוב מתחת למים" : "אור נמוך");
    if(x.rel.cls === "onshore" && W >= 15) al.push({lvl:"warn", text:"רוח מהים – מים עכורים יותר ליד החוף"});
    return {it, al};
  },
  beach(h, x, C){
    const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l}), W = h.windSpeed ?? 0;
    const cf = comfortPts(h, 30, C); add(cf.pts, cf.label);
    add(W <= 15 ? 20 : W <= 22 ? 12 : W <= 30 ? 4 : 0, W <= 15 ? "רוח נעימה" : W <= 22 ? "רוח – לעגן שמשייה" : W <= 30 ? "חול עף" : "רוח חזקה");
    add(x.wp.heff < 0.5 ? 20 : x.wp.heff < 0.8 ? 12 : 4, x.wp.heff < 0.5 ? "ים נוח לרחצה" : x.wp.heff < 0.8 ? "גלים בינוניים" : "גלים – ילדים רק ליד מציל");
    const s = h.sst; add(s == null ? 8 : s >= 25 ? 15 : s >= 22 ? 10 : s >= 19 ? 5 : 2, s == null ? "טמפ׳ מים לא זמינה" : `מים ${fmt(s,1)}°`);
    add((h.precip ?? 0) > 0.2 ? 0 : (h.cloud ?? 0) < 60 ? 15 : 10, (h.precip ?? 0) > 0.2 ? "גשם" : (h.cloud ?? 0) < 60 ? "שמיים בהירים" : "מעונן חלקית");
    if((h.uv ?? 0) >= 9) add(-5, `UV ${fmt(h.uv,0)} – צל בצהריים`);
    return {it, al};
  }
};
function windSport(h, x, c, P, kind){
  const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l});
  const kn = KN(h.windSpeed), gk = KN(h.gust ?? h.windSpeed) - kn, r = x.rel.cls;
  const wb = band(c.windKn, kn); add(wb.pts, `${wb.label} (${fmt(kn,0)} קשר)`);
  const DIR = {sideOn:[25,"צד-מהים – הכיוון הבטוח והטוב"], side:[22,"רוח צד – מצוין"], onshore:[10,"רוח ישר מהים – הזנקה ונחיתה מסובכות"], sideOff:[3,"צד-מהיבשה – נסחפים החוצה"], offshore:[0,"רוח מהיבשה – מסוכן"], none:[0,"כיוון לא ידוע"]};
  add(DIR[r][0], DIR[r][1]);
  if((r === "offshore" || r === "sideOff") && kn >= 8) al.push({lvl:"bad", text:"רוח מהיבשה: אם משהו נשבר – נסחפים לים. לא לצאת בלי סירת חילוץ"});
  if(r === "onshore" && kn >= 12) al.push({lvl:"warn", text:"רוח ישר מהים – להרחיק מסלעים וממכשולים על החוף"});
  add(gk <= c.gustKnGood ? 15 : gk <= c.gustKnBad ? 8 : 0, gk <= c.gustKnGood ? "רוח יציבה" : gk <= c.gustKnBad ? "משבים מתונים" : `משבים חזקים (+${fmt(gk,0)} קשר)`);
  if(gk > c.gustKnBad) al.push({lvl:"warn", text: kind === "kite" ? "משבים חזקים – סכנת הרמה (lofting). קייט קטן והרחק מהחוף" : "משבים חזקים – מפרש קטן"});
  const H = x.wp.heff; add(H < 1.2 ? 10 : 4, H < 1.2 ? "ים נוח" : "גלים – רק למנוסים");
  const s = h.sst; add(s == null ? 5 : s >= 20 ? 10 : 5, s == null ? "טמפ׳ מים לא זמינה" : s >= 20 ? `מים ${fmt(s,1)}°` : `מים ${fmt(s,1)}° – חליפה`);
  return {it, al};
}
function paddle(h, x, c, C, kind){
  const it = [], al = [], add = (p,l) => it.push({pts:Math.round(p), label:l}), W = h.windSpeed ?? 0, r = x.rel.cls;
  const wb = band(c.wave, x.wp.heff); add(wb.pts, `${wb.label} (אפקטיבי ${fmt(x.wp.heff,2)} מ׳)`);
  const wn = band(c.wind, W); add(wn.pts, `${wn.label} (${fmt(W,0)} קמ״ש)`);
  if((r === "offshore" || r === "sideOff") && W >= c.offshoreDangerKmh){ add(-20, "רוח מהיבשה – תידחף לים והחזרה קשה"); al.push({lvl:"bad", text:"רוח מהיבשה: להישאר קרוב לחוף, לחתור קודם נגד הרוח ולחזור איתה"}); }
  else if(r === "onshore" && W >= 12) add(-5, "רוח מהים – חזרה קלה, אבל גל רוח");
  add(x.phase === "goldenMorning" ? 10 : x.phase === "day" || x.phase === "midday" ? 5 : 2, x.phase === "goldenMorning" ? "בוקר – הים הכי שקט" : "שעת יום");
  const s = h.sst; add(s == null ? 5 : s >= 22 ? 10 : s >= 19 ? 6 : 2, s == null ? "טמפ׳ מים לא זמינה" : `מים ${fmt(s,1)}°`);
  const cf = comfortPts(h, 20, C); add(cf.pts, cf.label);
  return {it, al};
}
/* שערים משותפים: סופת רעמים, חושך, גשם, עומס חום */
function scoreActivity(act, h, x, C, P){
  if(act.id === "fishing"){ const m = methodOf(x, "auto"); return {score: scoreOf(x, "auto"), items: x.tech[m].items, alerts: x.safety.level === "bad" ? [{lvl:"bad", text:"בטיחות נמוכה בעמדה הנוכחית"}] : [], note: TECH[m].name}; }
  const r = ACT_SCORE[act.id](h, x, C, P);
  let score = clamp(r.it.reduce((s,i) => s + i.pts, 0), 0, 100); const items = r.it, alerts = r.al;
  const gate = (max, label) => { if(score > max){ items.push({pts: max - score, label}); score = max; } };
  if(isThunder(h.code)){ gate(0, "סופת רעמים"); alerts.unshift({lvl:"bad", text:"סופת רעמים – לצאת מהמים ומהחוף הפתוח"}); }
  if(act.daylight && !isDaylight(h)) gate(5, "חושך");
  if(act.land && (h.precip ?? 0) >= 1) gate(20, "גשם");
  if((h.feels ?? 0) >= C.comfort.heatAlert && act.land) alerts.push({lvl:"warn", text:`עומס חום (מרגיש ${fmt(h.feels,0)}°) – שתייה מרובה, הפסקות בצל`});
  return {score, items, alerts};
}

/* ---------- הגדרות פעילויות: מדדים, אזורי רוח, טיפים, ציוד ---------- */
const ACTIVITIES = [
  {id:"fishing", name:"דיג", icon:"🎣", desc:"דיג חופי – ז׳ירז׳ור, פתיונות, LRF, אגינג ועוד. כל המערכת המלאה.", zone:a => a >= 130 ? "good" : a >= 50 ? "ok" : "ok"},
  {id:"surf", minDirKmh:8, name:"גלישת גלים", icon:"🏄", daylight:true, water:true, desc:"סוול, period, כיוון הסוול והרוח ביחס לחוף. רוח מהיבשה = גלים נקיים.",
   metrics:["wave","swell","wind","rel","sst","sun"], zone:a => a >= 135 ? "good" : a >= 90 ? "ok" : "bad",
   ideal:["גל 0.7–1.8 מ׳ (לפי רמה)","Period מעל 8 שניות","רוח מהיבשה או בלי רוח","בוקר מוקדם – לרוב הכי נקי"]},
  {id:"kite", minDirKmh:0, name:"קייטסרפינג", icon:"🪁", daylight:true, water:true, knots:true, desc:"עוצמת רוח בקשרים, יציבות, וכיוון ביחס לחוף – צד/צד-מהים זה הבטוח.",
   metrics:["windKn","gust","rel","wave","sst","feels"], zone:a => a <= 30 ? "ok" : a <= 115 ? "good" : "bad",
   ideal:["14–25 קשר","רוח צד או צד-מהים","משבים עד +6 קשר","לעולם לא רוח מהיבשה"]},
  {id:"windsurf", minDirKmh:0, name:"גלישת רוח", icon:"⛵", daylight:true, water:true, knots:true, desc:"רוח בקשרים, יציבות וכיוון. גודל מפרש לפי משקל ורוח.",
   metrics:["windKn","gust","rel","wave","sst","feels"], zone:a => a <= 30 ? "ok" : a <= 115 ? "good" : "bad",
   ideal:["12–28 קשר","רוח צד או צד-מהים","ים שטוח לפריסטייל, גלים למנוסים"]},
  {id:"sup", minDirKmh:6, name:"סאפ", icon:"🛶", daylight:true, water:true, desc:"ים שקט ורוח חלשה. רוח מהיבשה היא הסכנה הגדולה – דוחפת לים.",
   metrics:["wave","wind","rel","sst","feels","uv"], zone:a => a >= 115 ? "bad" : a <= 30 ? "ok" : "good",
   ideal:["גל עד 0.3 מ׳","רוח עד 12 קמ״ש","בוקר מוקדם","לא ברוח מהיבשה"]},
  {id:"kayak", minDirKmh:8, name:"קיאק ים", icon:"🚣", daylight:true, water:true, desc:"כמו סאפ עם קצת יותר מרווח לגל ולרוח. תכנון יציאה נגד הרוח.",
   metrics:["wave","wind","rel","sst","feels","uv"], zone:a => a >= 115 ? "bad" : a <= 30 ? "ok" : "good",
   ideal:["גל עד 0.6 מ׳","רוח עד 18 קמ״ש","חתירה החוצה נגד הרוח, חזרה איתה"]},
  {id:"matkot", minDirKmh:10, name:"מטקות", icon:"🏓", daylight:true, land:true, desc:"רוח חלשה ואחידה. רוח לאורך החוף (ציר המשחק) או מהיבשה עם משבים – בעייתיות.",
   metrics:["wind","gust","rel","feels","uv","wave"], zone:a => (a > 65 && a <= 115) || a >= 135 ? "bad" : a <= 30 ? "good" : "ok",
   ideal:["רוח עד 10 קמ״ש","רוח מהים עדיפה על רוח לאורך החוף","בוקר או אחה״צ","חול רטוב רחב – ים נמוך"]},
  {id:"footvolley", minDirKmh:9, name:"פוציוולי", icon:"⚽", daylight:true, land:true, desc:"כדורעף חופים ברגליים, ראש, חזה וכתף – בלי ידיים. רגיש מאוד לרוח ולמשבים, כי הכדור עולה גבוה ונשלט ברגל.",
   metrics:["wind","gust","rel","feels","uv","sky"], zone:a => a >= 115 || (a > 65 && a <= 115) ? "bad" : a <= 30 ? "good" : "ok",
   ideal:["רוח עד 10 קמ״ש","בלי משבים","רוח מהים עדיפה; מהיבשה או לאורך החוף – בעייתיות","בוקר או 16:00 ואילך – חול לא לוהט"]},
  {id:"volleyball", minDirKmh:12, name:"כדורעף חופים", icon:"🏐", daylight:true, land:true, desc:"רוח, משבים, חום ו-UV. בחופים שפונים מערבה – סנוור לפני השקיעה.",
   metrics:["wind","gust","rel","feels","uv","sky"], zone:a => a >= 135 ? "ok" : "good",
   ideal:["רוח עד 12 קמ״ש","מרגיש 22–30°","לא בצהרי קיץ – חול לוהט"]},
  {id:"swim", minDirKmh:12, name:"שחייה בים", icon:"🏊", daylight:true, water:true, desc:"גלים, זרמים חוזרים, טמפרטורת מים. רק בחוף מוכרז עם מציל.",
   metrics:["wave","wind","rel","sst","feels","uv"], zone:a => a >= 135 ? "bad" : "good",
   ideal:["גל עד 0.4 מ׳","מים 23–28°","שעות הצלה","בלי רוח חזקה מהיבשה"]},
  {id:"snorkel", minDirKmh:12, name:"שנורקל וצלילה", icon:"🤿", daylight:true, water:true, desc:"ראות תלויה בכמה שקט היה הים ביממה האחרונה. ריף וסלעים = יותר לראות.",
   metrics:["calm24","wave","wind","rel","sst","sky"], zone:a => a <= 30 ? "bad" : a >= 115 ? "good" : "ok",
   ideal:["ים שקט 24–48 שעות","רוח חלשה","שמש גבוהה","ריף, סלעים, שובר גלים"]},
  {id:"beach", minDirKmh:15, name:"יום חוף", icon:"⛱️", daylight:true, land:true, desc:"נוחות: חום, רוח, UV, גלים לרחצה וטמפרטורת מים.",
   metrics:["feels","uv","wind","wave","sst","sky"], zone:a => a >= 135 ? "ok" : "good",
   ideal:["מרגיש 25–31°","רוח עד 15 קמ״ש","גל עד 0.5 מ׳ לילדים","צל בין 11:00 ל-15:00"]}
];
const ACT = Object.fromEntries(ACTIVITIES.map(a => [a.id, a]));

/* ---------- המלצות מומחה לפי תנאים ---------- */
function expertAdvice(id, a){
  const h = a.h, P = PREFS, W = h.windSpeed ?? 0, kn = KN(W), rel = a.rel.cls, rows = [], tips = [];
  const R = (k,v) => rows.push([k,v]);
  if(id === "surf"){
    const Hw = h.waveH ?? 0;
    R("גלשן", Hw < 0.8 ? "לונגבורד / סופט-טופ" : Hw < 1.5 ? "פאנבורד או מידלנגת׳ (7–8 רגל)" : "שורטבורד – למנוסים");
    R("חליפה", wetsuitFor(h.sst)); R("גובה פני הגל", `בערך ${fmt(Hw * ((h.wavePeriod ?? 6) >= 9 ? 1.4 : 1.1),1)} מ׳ בשבירה`);
    tips.push(rel === "offshore" || W < 6 ? "הים נקי – זה החלון. הגלים יחזיקו ויהיו חלולים יותר." : "רוח מהים – חפש חוף מוגן או מפרץ ליד שובר גלים.");
    tips.push((h.wavePeriod ?? 0) >= 9 ? "Period ארוך – הסטים מגיעים בגלים של 3–5, חכה לסט ואל תבזבז כוח על גלים בודדים." : "Period קצר – גלים רכים וקרובים, קח גלשן עם נפח.");
    tips.push("שב בצד של הפיק, לא מולו. זכות קדימה לגולש הקרוב לשבירה.");
  } else if(id === "kite" || id === "windsurf"){
    const kg = +P.riderKg || 75;
    if(id === "kite"){ R("גודל קייט", kn >= 10 ? `${clamp(Math.round(kg * CFG_ACT.kite.sizeFactor / kn), 5, 17)} מ״ר (תווין-טיפ, ${kg} ק״ג)` : "מתחת ל-10 קשר – רק פויל"); R("פויל", kn >= 8 && kn < 14 ? "יום טוב לפויל" : "—"); }
    else R("גודל מפרש", kn >= 8 ? `${r1(clamp(kg * CFG_ACT.windsurf.sailFactor / kn, 3, 10))} מ״ר (${kg} ק״ג)` : "רוח חלשה – מפרש גדול וגלשן נפח");
    R("רוח", `${fmt(kn,0)} קשר · משבים ${fmt(KN(h.gust),0)} קשר`); R("חליפה", wetsuitFor(h.sst));
    tips.push(rel === "sideOn" || rel === "side" ? "כיוון טוב – הזנקה בצד החוף עם מרווח של 30 מ׳ ממכשולים." : rel === "onshore" ? "רוח ישר מהים – הזנקה קשה, צא הרחק מאנשים וסלעים." : "רוח מהיבשה – לא לצאת. אם כבר – רק עם סירת חילוץ.");
    tips.push("בדוק רוח בפועל על החוף 15 דקות לפני – התחזית היא ממוצע של שעה.");
    if(KN(h.gust) - kn > 8) tips.push("פער גדול בין רוח למשבים – בחר גודל לפי המשבים, לא לפי הממוצע.");
  } else if(id === "sup" || id === "kayak"){
    R("חליפה / ביגוד", wetsuitFor(h.sst)); R("ציוד חובה", "רצועת קרסול (leash), אפוד ציפה, טלפון בכיס אטום");
    tips.push(rel === "offshore" || rel === "sideOff" ? "רוח מהיבשה – הישאר במרחק שחייה מהחוף." : "צא נגד הרוח, חזור איתה – כשתהיה עייף הרוח תעזור.");
    tips.push("בוקר מוקדם הוא הכי שקט; רוח הים מתחילה בדרך כלל לקראת הצהריים.");
  } else if(id === "footvolley"){
    R("שעה מומלצת", "בוקר מוקדם או 16:00 ואילך"); R("כדור", W >= 14 ? "כדור מנופח היטב (לחץ מלא) – פחות נסחף" : "לחץ רגיל"); R("מים", (h.feels ?? 25) >= 30 ? "לפחות 1 ליטר לאדם לשעה" : "חצי ליטר לאדם לשעה");
    tips.push(W >= 12 ? "ברוח – משחק נמוך: מסירות חזה וכתף במקום ראש גבוה, והגשה נמוכה וחזקה." : "רוח חלשה – זה הזמן להגשות גבוהות ולשכיבות.");
    tips.push("החליפו צדדים כל 6 נקודות – הרוח והשמש מתחלקות שווה.");
    tips.push((h.temp ?? 0) >= 29 ? "חול חם – הרטיבו את המגרש לפני משחק, וחממו קרסוליים." : "חממו קרסוליים וברכיים – חול רך מעמיס על המפרקים.");
  } else if(id === "matkot" || id === "volleyball"){
    R("שעה מומלצת", "בוקר מוקדם או 2 שעות לפני שקיעה"); R("מים", (h.feels ?? 25) >= 30 ? "לפחות 1 ליטר לאדם לשעה" : "חצי ליטר לאדם לשעה");
    if(id === "matkot"){
      tips.push(rel === "side" && W >= 10 ? "הרוח לאורך החוף: החליפו צדדים כל 10 דקות, ומי שנגד הרוח – מכה חזק ונמוך." : rel === "onshore" ? "רוח מהים – עמדו קרוב לקו המים, הכדור ייסחף לכיוון היבשה." : "עמדו על החול הרטוב והקשה – יציבות ותנועה טובות יותר.");
      tips.push(W >= 15 ? "ברוח – כדור כבד יותר (לא כדור 'מהיר' קל) ומרחק קצר יותר בין השחקנים." : "רוח חלשה – זה הזמן לראלי ארוך.");
    } else {
      tips.push(W >= 12 ? "ברוח – הגשות נמוכות וחזקות, מסירות קצרות ונמוכות." : "תנאים טובים לסט מלא.");
      tips.push("החליפו צדדים כל 7 נקודות – ככה הרוח והשמש מתחלקות.");
    }
  } else if(id === "swim"){
    R("חליפה", wetsuitFor(h.sst)); R("איפה", "חוף מוכרז בשעות הצלה, בין הדגלים");
    tips.push("דגל שחור – אסור להיכנס. דגל אדום – מסוכן. דגל לבן – רחצה מותרת.");
    tips.push("נסחפת לעומק? אל תשחה נגד הזרם – שחה במקביל לחוף עד שהוא נחלש, ואז חזור.");
  } else if(id === "snorkel"){
    R("ראות משוערת", (h.maxWave24 ?? 1) < 0.3 ? "טובה" : (h.maxWave24 ?? 1) < 0.5 ? "בינונית" : "חלשה"); R("חליפה", wetsuitFor(h.sst)); R("מקום", "ריף, סלעים, שובר גלים – בצד המוגן");
    tips.push("הראות תלויה בים של אתמול: אחרי יום-יומיים של ים שקט המים הכי צלולים.");
    tips.push("מצוף סימון בולט – סירות ואופנועי ים לא רואים שנורקלים.");
  } else if(id === "beach"){
    R("צל", (h.uv ?? 0) >= 6 ? "שמשייה/צילייה – חובה בין 11:00 ל-15:00" : "לא קריטי"); R("שמשייה", W >= 20 ? "לעגן היטב או לוותר – רוח חזקה" : "תקינה");
    tips.push((h.uv ?? 0) >= 8 ? `UV ${fmt(h.uv,0)}: קרם 50, לחדש כל שעתיים ואחרי כל רחצה.` : "UV נמוך-בינוני – קרם 30 מספיק.");
    tips.push(a.wp.heff >= 0.6 ? "גלים – ילדים רק ליד מציל ועם השגחה צמודה." : "ים נוח לילדים – עדיין רק בשעות הצלה.");
  }
  return {rows, tips};
}
function actPack(id, a, win){
  const h = a.h, items = [], add = (k, t, w) => items.push({k, txt:t, why:w});
  const base = {
    surf:["גלשן + leash","ווקס","חליפה / לייקרה"], kite:["קייט + בר + רתמה","קסדה ואפוד ציפה","משאבה"], windsurf:["גלשן, מפרש ותורן","רתמה","אפוד ציפה"],
    sup:["לוח + משוט","leash","אפוד ציפה","כיס אטום לטלפון"], kayak:["קיאק + משוט","אפוד ציפה","כיס אטום לטלפון","משרוקית"],
    footvolley:["כדור פוציוולי","משאבה + מד לחץ","סימון מגרש / רשת","מים קרים"], matkot:["2 מטקות + 2 כדורים","מגבת לידיים"], volleyball:["כדור","סימון מגרש/רשת","גרבי חול"], swim:["משקפת שחייה","מצוף שחייה בולט"],
    snorkel:["מסכה + שנורקל","סנפירים","מצוף סימון","נעלי מים לסלעים"], beach:["שמשייה/צילייה","מגבות","צידנית","צעצועי חול"]
  }[id] || [];
  base.forEach((b,i) => add("b"+i, b));
  if((h.uv ?? 0) >= 6) add("sun", "קרם הגנה 50, כובע ומשקפי שמש", `UV ${fmt(h.uv,0)}`);
  if((h.feels ?? 0) >= 28) add("water", "הרבה מים קרים ואלקטרוליטים", `מרגיש ${fmt(h.feels,0)}°`); else add("water", "מים");
  if(ACT[id].water && h.sst != null && h.sst < 22) add("suit", `חליפה: ${wetsuitFor(h.sst)}`, `מים ${fmt(h.sst,1)}°`);
  if((h.windSpeed ?? 0) >= 20 && ACT[id].land) add("wind", "שכבה נגד רוח", "");
  if((h.precip ?? 0) > 0.2) add("rain", "מעיל גשם ושקית לציוד", "");
  add("towel", "מגבת ובגדים יבשים");
  return items;
}

/* ---------- ניתוח שעה לכל הפעילויות ---------- */
function analyzeActs(x, spot){
  x.facing = spot.facing; x.rel = relWind(x.h.windDir, spot.facing); x.acts = {};
  for(const act of ACTIVITIES) x.acts[act.id] = scoreActivity(act, x.h, x, CFG_ACT, PREFS);
}
const actScore = (a, id) => a.acts[id].score;
function bestWindowFn(list, fn){
  if(!list.length) return null;
  const sc = list.map(fn); let bi = 0; sc.forEach((s,i) => { if(s > sc[bi]) bi = i; });
  const thr = sc[bi] - 7; let a = bi, b = bi;
  while(a > 0 && sc[a-1] >= thr && b - a < 3) a--;
  while(b < list.length - 1 && sc[b+1] >= thr && b - a < 3) b++;
  return { from:list[a].h.min, to:list[b].h.min + 60, best:list[bi], score:sc[bi], hours:list.slice(a, b+1) };
}
const verdictWord = s => s >= 80 ? "מצוין" : s >= 65 ? "טוב" : s >= 50 ? "סביר" : s >= 30 ? "חלש" : "לא מתאים";

/* ---------- שרטוט: הרוח ביחס לחוף ---------- */
function windDiagram(id, a){
  const act = ACT[id], c = 120, R = 92, r0 = 72;
  const pol = (r, deg) => { const t = deg * Math.PI / 180; return [c + r * Math.sin(t), c - r * Math.cos(t)]; };
  const col = {good:"var(--good)", ok:"var(--warn)", bad:"var(--bad)"};
  let s = `<svg viewBox="0 0 240 250" role="img" aria-label="כיוון הרוח ביחס לחוף">`;
  s += `<rect x="0" y="0" width="240" height="${c}" fill="color-mix(in srgb, var(--sea) 16%, transparent)"/><rect x="0" y="${c}" width="240" height="${250-c}" fill="color-mix(in srgb, #c9a86a 18%, transparent)"/>`;
  let d = `M0 ${c}`; for(let xx = 0; xx < 240; xx += 20) d += ` q5 -4 10 0 t10 0`; s += `<path d="${d}" fill="none" stroke="var(--sea)" stroke-width="1.5"/>`;
  for(let deg = -180; deg < 180; deg += 15){
    const z = act.zone(Math.abs(deg + 7.5)), [x1,y1] = pol(R, deg), [x2,y2] = pol(R, deg + 15), [x3,y3] = pol(r0, deg + 15), [x4,y4] = pol(r0, deg);
    s += `<path d="M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r0} ${r0} 0 0 0 ${x4} ${y4}Z" fill="${col[z]}" fill-opacity=".55" stroke="var(--bg)" stroke-width="1"/>`;
  }
  s += `<text x="${c}" y="22" text-anchor="middle" fill="var(--fg)" font-size="12" font-weight="600">ים</text><text x="${c}" y="${2*c-12}" text-anchor="middle" fill="var(--fg)" font-size="12" font-weight="600">יבשה</text>`;
  const nd = ((0 - a.facing + 540) % 360) - 180, [nx,ny] = pol(R + 13, nd);
  s += `<text x="${nx}" y="${ny+4}" text-anchor="middle" fill="var(--muted)" font-size="11" font-weight="600">צ</text>`;
  if(a.rel.signed != null){
    const W = a.h.windSpeed ?? 0, [ox,oy] = pol(r0 - 4, a.rel.signed), [ix,iy] = pol(16, a.rel.signed), t = a.rel.signed * Math.PI / 180;
    const ax = -Math.sin(t), ay = Math.cos(t), px = -ay, py = ax, hx = ix, hy = iy;
    s += `<line x1="${ox}" y1="${oy}" x2="${ix}" y2="${iy}" stroke="var(--fg)" stroke-width="${2 + Math.min(4, W/10)}" stroke-linecap="round"/><path d="M${hx+ax*6} ${hy+ay*6} L${hx-ax*6+px*7} ${hy-ay*6+py*7} L${hx-ax*6-px*7} ${hy-ay*6-py*7}Z" fill="var(--fg)"/>`;
    s += `<circle cx="${c}" cy="${c}" r="4" fill="var(--accent)"/>`;
  }
  s += `<g font-size="11"><circle cx="40" cy="238" r="5" fill="var(--good)"/><text x="50" y="242" fill="var(--muted)" direction="rtl" text-anchor="end">טוב</text><circle cx="100" cy="238" r="5" fill="var(--warn)"/><text x="110" y="242" fill="var(--muted)" direction="rtl" text-anchor="end">סביר</text><circle cx="165" cy="238" r="5" fill="var(--bad)"/><text x="175" y="242" fill="var(--muted)" direction="rtl" text-anchor="end">בעייתי</text></g>`;
  return s + `</svg>`;
}

/* ---------- מדדים לתצוגה ---------- */
function metricTile(key, a){
  const h = a.h, M = {
    wave:["גלים", `${fmt(h.waveH,1)} <small>מ׳</small>`, `אפקטיבי ${fmt(a.wp.heff,2)} · ${fmt(h.wavePeriod,1)} ש׳`],
    swell:["סוול", `${fmt(h.swellH,1)} <small>מ׳</small>`, `${fmt(h.swellPeriod,0)} ש׳ · כיוון ${windCalculator.compassHe(h.swellDir ?? h.waveDir)}`],
    wind:["רוח", `${fmt(h.windSpeed,0)} <small>קמ״ש</small>`, `משבים ${fmt(h.gust,0)} · ${fmt(KN(h.windSpeed),0)} קשר`],
    windKn:["רוח", `${fmt(KN(h.windSpeed),0)} <small>קשר</small>`, `${fmt(h.windSpeed,0)} קמ״ש`],
    gust:["משבים", `${fmt(KN(h.gust),0)} <small>קשר</small>`, `פער ${fmt(KN(h.gust) - KN(h.windSpeed),0)} קשר · ${fmt(h.gust,0)} קמ״ש`],
    rel:["כיוון ביחס לחוף", REL_HE[a.rel.cls], `${windCalculator.compassHe(h.windDir)} · ${fmt(h.windDir,0,"°")}`],
    sst:["מים", `${fmt(h.sst,1)}<small>°</small>`, wetsuitFor(h.sst)],
    feels:["מרגיש כמו", `${fmt(h.feels,0)}<small>°</small>`, `${fmt(h.temp,0)}° · לחות ${fmt(h.hum,0)}%`],
    uv:["UV", fmt(h.uv,0), uvLabel(h.uv)],
    sky:["שמיים", `${fmt(h.cloud,0)}<small>%</small>`, (h.precip ?? 0) > 0.1 ? `גשם ${fmt(h.precip,1)} מ״מ` : "בלי גשם"],
    calm24:["ים ב-24 ש׳ אחרונות", `עד ${fmt(h.maxWave24,1)} <small>מ׳</small>`, (h.maxWave24 ?? 1) < 0.3 ? "צפוי צלול" : (h.maxWave24 ?? 1) < 0.5 ? "ראות בינונית" : "צפוי עכור"],
    sun:["זריחה / שקיעה", `${h.sunriseStr} · ${h.sunsetStr}`, PHASE_HE[a.phase]]
  }[key];
  return M ? `<div class="stat"><div class="k">${M[0]}</div><div class="v">${M[1]}</div><div class="x">${M[2]}</div></div>` : "";
}
/* ============================ /services =============================== */
const API = { marine:"https://marine-api.open-meteo.com/v1/marine", weather:"https://api.open-meteo.com/v1/forecast" };
const MARINE_VARS = ["wind_wave_height","wave_height","wave_direction","wave_period","swell_wave_height","swell_wave_direction","swell_wave_period","sea_surface_temperature","ocean_current_velocity","ocean_current_direction","sea_level_height_msl"];
const MARINE_CORE = ["wave_height","wave_direction","wave_period","swell_wave_height","swell_wave_direction","swell_wave_period","sea_surface_temperature"];
const WEATHER_VARS = ["temperature_2m","apparent_temperature","relative_humidity_2m","uv_index","wind_speed_10m","wind_direction_10m","wind_gusts_10m","cloud_cover","precipitation","weather_code","pressure_msl","visibility"];
const qs = o => Object.entries(o).map(([k,v]) => k + "=" + encodeURIComponent(v)).join("&");
async function getJSON(url){ const ctl = new AbortController(), t = setTimeout(()=>ctl.abort(), 15000); try { const r = await fetch(url, {signal: ctl.signal}); if(!r.ok) throw new Error("HTTP " + r.status); return await r.json(); } finally { clearTimeout(t); } }
const rangeParams = r => r.start ? {start_date:r.start, end_date:r.end} : {forecast_days:r.days || 7, past_days:1};  // יום אחורה: מגמת לחץ וים של 24 שעות
const weatherService = {
  async fetch(lat, lon, range){
    const p = {latitude:lat, longitude:lon, hourly:WEATHER_VARS.join(","), daily:"sunrise,sunset", timezone:TZ, wind_speed_unit:"kmh", ...rangeParams(range)};
    try { return await getJSON(API.weather + "?" + qs(p)); }
    catch(e){ p.hourly = WEATHER_VARS.filter(v => v !== "visibility").join(","); return await getJSON(API.weather + "?" + qs(p)); }
  }
};
const marineService = {
  // מודל הים לא תמיד מחזיר ערך על קו החוף – נבדקות נקודות מעט לתוך הים, בכיוון שהחוף פונה אליו.
  seawardPoints(spot){ const f = spot.facing * Math.PI / 180, c = Math.cos(spot.lat * Math.PI / 180);
    return [0.025, 0.05, 0.09].map(d => ({ lat: +(spot.lat + d * Math.cos(f)).toFixed(4), lon: +(spot.lon + d * Math.sin(f) / c).toFixed(4) })); },
  async fetch(spot, range){
    let lastErr;
    for(const pt of this.seawardPoints(spot)){
      const p = {latitude:pt.lat, longitude:pt.lon, hourly:MARINE_VARS.join(","), timezone:TZ, ...rangeParams(range)}; let j;
      try { j = await getJSON(API.marine + "?" + qs(p)); }
      catch(e){ lastErr = e; p.hourly = MARINE_CORE.join(","); try { j = await getJSON(API.marine + "?" + qs(p)); } catch(e2){ lastErr = e2; continue; } }
      if(j?.hourly?.wave_height?.some(v => v != null)){ j._point = pt; return j; }
    }
    throw lastErr || new Error("אין נתוני ים לנקודה");
  }
};
function buildHours(w, m){
  const mi = new Map(m.hourly.time.map((t,i)=>[t,i]));
  const sun = {}; w.daily.time.forEach((d,i) => sun[d] = {rise:w.daily.sunrise[i], set:w.daily.sunset[i]});
  const wh = w.hourly, pr = wh.pressure_msl || [];
  return wh.time.map((t,i) => {
    const j = mi.get(t), g = k => (j == null || !m.hourly[k]) ? null : m.hourly[k][j];
    const date = t.slice(0,10), s = sun[date] || {};
    return { time:t, date, hour:+t.slice(11,13), min:toMin(t),
      waveH:g("wave_height"), waveDir:g("wave_direction"), wavePeriod:g("wave_period"), swellH:g("swell_wave_height"), swellDir:g("swell_wave_direction"), swellPeriod:g("swell_wave_period"),
      sst:g("sea_surface_temperature"), current:g("ocean_current_velocity"), currentDir:g("ocean_current_direction"), seaLevel:g("sea_level_height_msl"),
      windSpeed:wh.wind_speed_10m?.[i] ?? null, windDir:wh.wind_direction_10m?.[i] ?? null, gust:wh.wind_gusts_10m?.[i] ?? null,
      cloud:wh.cloud_cover?.[i] ?? null, precip:wh.precipitation?.[i] ?? null, code:wh.weather_code?.[i] ?? null, visibility:wh.visibility?.[i] ?? null,
      temp:wh.temperature_2m?.[i] ?? null, feels:wh.apparent_temperature?.[i] ?? null, hum:wh.relative_humidity_2m?.[i] ?? null, uv:wh.uv_index?.[i] ?? null, windWave:g("wind_wave_height"),
      pressure: pr[i] ?? null, pTrend: (i >= 3 && pr[i] != null && pr[i-3] != null) ? r1(pr[i] - pr[i-3]) : null,
      sunrise: s.rise ? toMin(s.rise) : 390, sunset: s.set ? toMin(s.set) : 1110, sunriseStr: s.rise ? s.rise.slice(11,16) : "—", sunsetStr: s.set ? s.set.slice(11,16) : "—" };
  }).filter(h => h.waveH != null).map((h, i, arr) => { let mx = 0; for(let k = Math.max(0, i - 24); k <= i; k++) mx = Math.max(mx, arr[k].waveH ?? 0); h.maxWave24 = r2(mx); return h; });
}
/* נתוני דוגמה – רק כשאין חיבור. מסומנים בבירור בממשק. */
const demoService = {
  build(){
    const start = localISODate(), times = [], dts = [], rise = [], set = [];
    const W = {temperature_2m:[],apparent_temperature:[],relative_humidity_2m:[],uv_index:[],wind_speed_10m:[],wind_direction_10m:[],wind_gusts_10m:[],cloud_cover:[],precipitation:[],weather_code:[],pressure_msl:[],visibility:[]};
    const M = {time:[], wind_wave_height:[], swell_wave_direction:[], wave_height:[], wave_direction:[], wave_period:[], swell_wave_height:[], swell_wave_period:[], sea_surface_temperature:[], ocean_current_velocity:[]};
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const dayWave = [0.55,0.8,0.4,0.18,0.3,0.95,1.35], dayP = [1013,1012,1014,1016,1015,1010,1007];
    for(let d = 0; d < 7; d++){
      const dt = new Date(start + "T12:00:00"); dt.setDate(dt.getDate() + d);
      const iso = dt.getFullYear() + "-" + String(dt.getMonth()+1).padStart(2,"0") + "-" + String(dt.getDate()).padStart(2,"0");
      dts.push(iso); rise.push(iso + "T" + hhmm(392 + d)); set.push(iso + "T" + hhmm(1104 - d));
      for(let hr = 0; hr < 24; hr++){
        const t = iso + "T" + String(hr).padStart(2,"0") + ":00"; times.push(t); M.time.push(t);
        const breeze = hr >= 10 && hr <= 18 ? Math.sin((hr - 10) / 8 * Math.PI) : 0, ws = 5 + breeze * (10 + d * 2) + rnd() * 3;
        W.wind_speed_10m.push(r1(ws)); W.wind_direction_10m.push(breeze > 0.2 ? 285 + rnd()*20 : 95 + rnd()*30);
        W.wind_gusts_10m.push(r1(ws * 1.5 + rnd()*4)); W.cloud_cover.push(Math.round(d === 5 ? 70 : rnd()*30));
        W.precipitation.push(0); W.weather_code.push(d === 5 ? 3 : 1); W.visibility.push(24000);
        const tt = 24 + 5 * Math.sin((hr - 9) / 24 * 2 * Math.PI) - d * 0.3; W.temperature_2m.push(r1(tt)); W.apparent_temperature.push(r1(tt + 2 - breeze * 2)); W.relative_humidity_2m.push(Math.round(65 - breeze * 10)); W.uv_index.push(r1(Math.max(0, 7.5 * Math.sin((hr - 6) / 12 * Math.PI)) * (d === 5 ? 0.5 : 1)));
        W.pressure_msl.push(r1(dayP[d] + ((dayP[d+1] ?? dayP[d]) - dayP[d]) * hr / 24));
        const wh = dayWave[d] * (0.85 + 0.3 * breeze) + rnd() * 0.05;
        M.wave_height.push(r2(wh)); M.wave_direction.push(290); M.wave_period.push(r1(5 + dayWave[d] * 3 + rnd()));
        M.swell_wave_height.push(r2(wh * 0.6)); M.swell_wave_period.push(r1(6 + dayWave[d] * 3));
        M.wind_wave_height.push(r2(0.1 + breeze * 0.3)); M.swell_wave_direction.push(285);
        M.sea_surface_temperature.push(r1(26.8 - d * 0.1)); M.ocean_current_velocity.push(r1(0.4 + rnd()*0.6));
      }
    }
    return { w:{ hourly:{time:times, ...W}, daily:{time:dts, sunrise:rise, sunset:set} }, m:{ hourly:M } };
  }
};

/* ============================ state ============================ */
let CFG = deepMerge(DEFAULT_CONFIG, store.get("config", {}));
let TECHS = store.get("techniques", null) || DEFAULT_TECHNIQUES;
let TECH = Object.fromEntries(TECHS.map(t => [t.id, t]));
let SPECIES = store.get("species", null); if(!Array.isArray(SPECIES) || !SPECIES.every(sp => Array.isArray(sp.techniques))) SPECIES = DEFAULT_SPECIES;  // גרסה קודמת שמרה פרופילים בלי שיטות
let REGS = store.get("regs", null) || DEFAULT_REGS;
let SPOTS = store.get("spots", null) || DEFAULT_SPOTS;
let LOG = store.get("log", []);
let PREFS = store.get("prefs", {});
let CHECKS = store.get("checks", {});
let CFG_ACT = deepMerge(DEFAULT_ACT_CFG, store.get("actcfg", {}));
const S = {
  spotId: SPOTS.some(s => s.id === PREFS.spotId) ? PREFS.spotId : (SPOTS.some(s => s.id === PREFS.home) ? PREFS.home : SPOTS[0].id),
  terrain: null, method: PREFS.method && (PREFS.method === "auto" || TECH[PREFS.method]) ? PREFS.method : "auto",
  activity: PREFS.activity && (PREFS.activity === "all" || ACT[PREFS.activity]) ? PREFS.activity : "all", view: null,
  dateIdx: 0, hourSel: "best", weekSort: "date", cfgKey: "config", gearTech: "spin", data: null, source: null, fetchedAt: null, analyzed: [], dates: []
};
const spot = () => SPOTS.find(s => s.id === S.spotId) || SPOTS[0];
const curTerrain = () => S.terrain || spot().terrain;
function savePrefs(){ PREFS.spotId = S.spotId; PREFS.method = S.method; PREFS.activity = S.activity; store.set("prefs", PREFS); }

async function loadForecast(){
  const sp = spot(); setStatus("loading", "מושך תחזית…");
  try {
    const [w, m] = await Promise.all([weatherService.fetch(sp.lat, sp.lon, {days:7}), marineService.fetch(sp, {days:7})]);
    S.data = {w, m}; S.source = "live"; S.fetchedAt = Date.now(); store.set("cache_" + sp.id, {w, m, at:S.fetchedAt});
  } catch(err){
    const c = store.get("cache_" + sp.id, null);
    if(c && Date.now() - c.at < 36 * 3600e3){ S.data = {w:c.w, m:c.m}; S.source = "cache"; S.fetchedAt = c.at; }
    else { S.data = demoService.build(); S.source = "demo"; S.fetchedAt = Date.now(); }
  }
  recompute();
}
function recompute(){
  const sp = spot(), terrain = curTerrain();
  S.analyzed = buildHours(S.data.w, S.data.m).map(h => analyzeHour(h, sp, terrain, CFG));
  const today = localISODate(), all = [...new Set(S.analyzed.map(a => a.h.date))];
  S.dates = all.some(d => d >= today) ? all.filter(d => d >= today) : all;
  S.analyzed = S.analyzed.filter(a => S.dates.includes(a.h.date));
  S.dateIdx = clamp(S.dateIdx, 0, Math.max(0, S.dates.length - 1));
  const t = new Date(S.fetchedAt).toLocaleTimeString("he-IL", {hour:"2-digit", minute:"2-digit", timeZone:TZ});
  if(S.source === "live") setStatus("live", `Open-Meteo · עודכן ${t}`);
  else if(S.source === "cache") setStatus("cache", `אין חיבור – נתונים שמורים מ-${t}`);
  else setStatus("demo", "נתוני דוגמה – אין חיבור ל-Open-Meteo");
  emit();
}
function setStatus(cls, text){ S.status = {cls, text}; emit(); }


/* ============================ UI-facing store API ============================ */
const listeners = new Set();
function emit(){ S.version = (S.version || 0) + 1; listeners.forEach(f => f()); }
function subscribe(f){ listeners.add(f); return () => listeners.delete(f); }
const dayList = () => S.analyzed.filter(a => a.h.date === S.dates[S.dateIdx]);
function update(patch){
  const reload = patch.spotId != null && patch.spotId !== S.spotId, recalc = "terrain" in patch && patch.terrain !== S.terrain;
  Object.assign(S, patch); savePrefs();
  if(reload) loadForecast(); else if(recalc) recompute(); else emit();
}
const api = {
  get S(){ return S; }, get CFG(){ return CFG; }, get TECHS(){ return TECHS; }, get TECH(){ return TECH; }, get SPECIES(){ return SPECIES; },
  get REGS(){ return REGS; }, get SPOTS(){ return SPOTS; }, get LOG(){ return LOG; }, get PREFS(){ return PREFS; }, get CHECKS(){ return CHECKS; }, get CFG_ACT(){ return CFG_ACT; },
  setPrefs(p){ PREFS = {...PREFS, ...p}; store.set("prefs", PREFS); recompute(); },
  setChecks(key, val){ CHECKS = {...CHECKS, [key]: val}; if(val == null) delete CHECKS[key]; store.set("checks", CHECKS); emit(); },
  setSpots(v){ SPOTS = v; store.set("spots", v); if(!v.some(s => s.id === S.spotId)){ S.spotId = v[0].id; loadForecast(); } else emit(); },
  addLog(e){ LOG = [...LOG, e]; let ok = store.set("log", LOG); if(!ok && e.photo){ e.photo = null; ok = store.set("log", LOG); } emit(); return ok; },
  removeLog(id){ LOG = LOG.filter(x => x.id !== id); store.set("log", LOG); emit(); },
  cfgGet(key){ return {config:CFG, techniques:TECHS, species:SPECIES, regs:REGS, activities:CFG_ACT}[key]; },
  cfgSet(key, j){
    if(key === "config"){ if(!isObj(j)) throw 0; store.set("config", j); CFG = deepMerge(DEFAULT_CONFIG, j); }
    if(key === "techniques"){ if(!Array.isArray(j) || !j.length || !j.every(t => t.id && t.name && t.gear && t.score && Array.isArray(t.rigs) && t.rigs.every(r => RIGS[r]))) throw 0; TECHS = j; TECH = Object.fromEntries(j.map(t => [t.id, t])); store.set("techniques", j); }
    if(key === "species"){ if(!Array.isArray(j) || !j.every(s => s.id && s.nameHebrew && Array.isArray(s.techniques))) throw 0; SPECIES = j; store.set("species", j); }
    if(key === "regs"){ if(!Array.isArray(j)) throw 0; REGS = j; store.set("regs", j); }
    if(key === "activities"){ if(!isObj(j)) throw 0; store.set("actcfg", j); CFG_ACT = deepMerge(DEFAULT_ACT_CFG, j); }
    recompute();
  },
  cfgReset(key){
    if(key === "config"){ store.del("config"); CFG = deepMerge(DEFAULT_CONFIG, {}); }
    if(key === "techniques"){ store.del("techniques"); TECHS = DEFAULT_TECHNIQUES; TECH = Object.fromEntries(TECHS.map(t => [t.id, t])); }
    if(key === "species"){ store.del("species"); SPECIES = DEFAULT_SPECIES; }
    if(key === "regs"){ store.del("regs"); REGS = DEFAULT_REGS; }
    if(key === "activities"){ store.del("actcfg"); CFG_ACT = deepMerge(DEFAULT_ACT_CFG, {}); }
    recompute();
  },
  exportData(){ return {log:LOG, spots:SPOTS, prefs:PREFS, config:store.get("config",{}), techniques:TECHS, species:SPECIES, regs:REGS, activities:store.get("actcfg",{}), exportedAt:new Date().toISOString()}; },
  importData(j){
    if(Array.isArray(j.log)){ const ids = new Set(LOG.map(x => x.id)); LOG = LOG.concat(j.log.filter(x => !ids.has(x.id))); store.set("log", LOG); }
    if(Array.isArray(j.spots)){ SPOTS = j.spots; store.set("spots", SPOTS); }
    if(isObj(j.prefs)){ PREFS = {...PREFS, ...j.prefs}; store.set("prefs", PREFS); }
    if(isObj(j.config)){ store.set("config", j.config); CFG = deepMerge(DEFAULT_CONFIG, j.config); }
    if(Array.isArray(j.techniques)){ TECHS = j.techniques; TECH = Object.fromEntries(TECHS.map(t => [t.id, t])); store.set("techniques", TECHS); }
    if(Array.isArray(j.species)){ SPECIES = j.species; store.set("species", SPECIES); }
    if(Array.isArray(j.regs)){ REGS = j.regs; store.set("regs", REGS); }
    if(isObj(j.activities)){ store.set("actcfg", j.activities); CFG_ACT = deepMerge(DEFAULT_ACT_CFG, j.activities); }
    recompute();
  }
};
export {
  api, subscribe, update, loadForecast, recompute, dayList,
  TERRAIN_HE, PHASE_HE, WIND_CLS_HE, REL_HE, LEVEL_HE, ACTIVITIES, ACT, COLORS, LURES, BAITS, SPECIES_BAITS, RIGS,
  clamp, r1, r2, esc, hhmm, fmt, toMin, localISODate, localHour, dayLabel, shortDate, isoRange,
  windCalculator, relWind, KN, moonInfo, isDaylight, isThunder, wetsuitFor, uvLabel,
  methodOf, scoreOf, rankTechs, speciesFor, bestHours, bestWindow, bestWindowFn, actScore, verdictWord,
  techAdvice, readTips, sessionPlan, checklist, learningInsights, rigSVG, lureSVG, baitSVG, pickLures, pickBaits, pickColors, lightOf, murkyOf, quickPick,
  expertAdvice, actPack, windDiagram, weatherService, marineService, buildHours, analyzeHour, overallFrom
};
