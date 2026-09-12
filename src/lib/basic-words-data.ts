/**
 * Multilingual Basic Words & Phrases Curriculum
 * Covers 17 categories, 3 levels (Beginner, Elementary, Intermediate),
 * with aligned translations and Roman phonetic pronunciations across all 6 languages:
 * English (en), Hindi (hi), Arabic (ar), French (fr), Spanish (es), German (de).
 */

export type BasicWordLevel = "Beginner" | "Elementary" | "Intermediate";
export type BasicWordType = "word" | "phrase";

export interface LocalizedText {
  text: string;
  romanized: string;
}

export interface BasicWordItem {
  id: string;
  category: string;
  level: BasicWordLevel;
  type: BasicWordType;
  translations: Record<string, LocalizedText>; // key: "en" | "hi" | "ar" | "fr" | "es" | "de"
  example: Record<string, LocalizedText>; // key: "en" | "hi" | "ar" | "fr" | "es" | "de"
}

export interface CategoryMeta {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const BASIC_WORDS_CATEGORIES: CategoryMeta[] = [
  { id: "Greetings", name: "Greetings", icon: "👋", description: "Hello, good morning, goodbyes, and pleasantries." },
  { id: "Common Words", name: "Common Words", icon: "💬", description: "Everyday essentials: yes, no, please, thanks." },
  { id: "Numbers", name: "Numbers", icon: "🔢", description: "Counting numbers and quantities." },
  { id: "Colors", name: "Colors", icon: "🎨", description: "Basic colors and shades." },
  { id: "Family", name: "Family", icon: "👨‍👩‍👧‍👦", description: "Family members and relationships." },
  { id: "Food & Drinks", name: "Food & Drinks", icon: "☕", description: "Meals, drinks, ordering, and ingredients." },
  { id: "Home", name: "Home", icon: "🏠", description: "Rooms, furniture, and household objects." },
  { id: "Travel", name: "Travel", icon: "✈️", description: "Airports, hotels, tickets, and directions." },
  { id: "Shopping", name: "Shopping", icon: "🛍️", description: "Prices, sizes, payments, and stores." },
  { id: "Work", name: "Work", icon: "💼", description: "Office, colleagues, meetings, and careers." },
  { id: "School", name: "School", icon: "📚", description: "Studies, teachers, books, and exams." },
  { id: "Time & Dates", name: "Time & Dates", icon: "⏰", description: "Days, hours, yesterday, today, and tomorrow." },
  { id: "Body Parts", name: "Body Parts", icon: "🖐️", description: "Anatomy, head, hands, and body health." },
  { id: "Feelings", name: "Feelings", icon: "😊", description: "Emotions, happiness, tiredness, and moods." },
  { id: "Daily Activities", name: "Daily Activities", icon: "🏃", description: "Waking up, eating, walking, and sleeping." },
  { id: "Emergency", name: "Emergency", icon: "🚨", description: "Help, doctor, police, and urgent needs." },
  { id: "Useful Questions", name: "Useful Questions", icon: "❓", description: "Where, what, how, and asking for help." },
];

export const BASIC_WORDS_CURRICULUM: BasicWordItem[] = [
  // ==========================================
  // 1. GREETINGS
  // ==========================================
  {
    id: "greet-1",
    category: "Greetings",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Hello", romanized: "Hel-loh" },
      hi: { text: "नमस्ते", romanized: "Namaste" },
      ar: { text: "مرحباً", romanized: "Marhaban" },
      fr: { text: "Bonjour", romanized: "Bohn-zhoor" },
      es: { text: "Hola", romanized: "Oh-lah" },
      de: { text: "Hallo", romanized: "Hah-loh" },
    },
    example: {
      en: { text: "Hello, my friend!", romanized: "Hel-loh, my frend!" },
      hi: { text: "नमस्ते, मेरे दोस्त!", romanized: "Namaste, mere dost!" },
      ar: { text: "مرحباً يا صديقي!", romanized: "Marhaban ya sadeeqi!" },
      fr: { text: "Bonjour mon ami !", romanized: "Bohn-zhoor mohn ah-mee !" },
      es: { text: "¡Hola mi amigo!", romanized: "¡Oh-lah mee ah-mee-goh!" },
      de: { text: "Hallo mein Freund!", romanized: "Hah-loh mine Froynd!" },
    },
  },
  {
    id: "greet-2",
    category: "Greetings",
    level: "Beginner",
    type: "phrase",
    translations: {
      en: { text: "Good morning", romanized: "Good mor-ning" },
      hi: { text: "सुप्रभात", romanized: "Shubh prabhat" },
      ar: { text: "صباح الخير", romanized: "Sabah al-khair" },
      fr: { text: "Bonjour", romanized: "Bohn-zhoor" },
      es: { text: "Buenos días", romanized: "Bweh-nohs dee-ahs" },
      de: { text: "Guten Morgen", romanized: "Goo-ten Mor-gen" },
    },
    example: {
      en: { text: "Good morning, everyone.", romanized: "Good mor-ning, ev-ree-wun." },
      hi: { text: "सुप्रभात, आप सभी को।", romanized: "Shubh prabhat, aap sabhi ko." },
      ar: { text: "صباح الخير للجميع.", romanized: "Sabah al-khair lil-jamee'." },
      fr: { text: "Bonjour à tous.", romanized: "Bohn-zhoor ah toos." },
      es: { text: "Buenos días a todos.", romanized: "Bweh-nohs dee-ahs ah toh-dohs." },
      de: { text: "Guten Morgen an alle.", romanized: "Goo-ten Mor-gen ahn ahl-luh." },
    },
  },
  {
    id: "greet-3",
    category: "Greetings",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "How are you today?", romanized: "How ahr yoo tuh-day?" },
      hi: { text: "आज आप कैसे हैं?", romanized: "Aaj aap kaise hain?" },
      ar: { text: "كيف حالك اليوم؟", romanized: "Kaifa haluka al-yawm?" },
      fr: { text: "Comment allez-vous aujourd'hui ?", romanized: "Koh-mahn ah-lay voo oh-zhoor-dwee ?" },
      es: { text: "¿Cómo está usted hoy?", romanized: "¿Koh-moh es-tah oos-ted oy?" },
      de: { text: "Wie geht es Ihnen heute?", romanized: "Vee gayt es Ee-nen hoy-tuh?" },
    },
    example: {
      en: { text: "I am fine, how are you today?", romanized: "Eye am fine, how ahr yoo tuh-day?" },
      hi: { text: "मैं ठीक हूँ, आज आप कैसे हैं?", romanized: "Main theek hoon, aaj aap kaise hain?" },
      ar: { text: "أنا بخير، كيف حالك اليوم؟", romanized: "Ana bi-khair, kaifa haluka al-yawm?" },
      fr: { text: "Je vais bien, comment allez-vous aujourd'hui ?", romanized: "Zhuh vay byan, koh-mahn ah-lay voo oh-zhoor-dwee ?" },
      es: { text: "Estoy bien, ¿cómo está usted hoy?", romanized: "Es-toy byan, ¿koh-moh es-tah oos-ted oy?" },
      de: { text: "Mir geht es gut, wie geht es Ihnen heute?", romanized: "Meer gayt es goot, vee gayt es Ee-nen hoy-tuh?" },
    },
  },
  {
    id: "greet-4",
    category: "Greetings",
    level: "Intermediate",
    type: "phrase",
    translations: {
      en: { text: "It is a pleasure to meet you.", romanized: "It iz uh plezh-er too meet yoo." },
      hi: { text: "आपसे मिलकर बहुत खुशी हुई।", romanized: "Aapse milkar bahut khushi hui." },
      ar: { text: "يسعدني جداً لقاؤك.", romanized: "Yas'uduni jiddan liqa'uka." },
      fr: { text: "C'est un plaisir de vous rencontrer.", romanized: "Set uhn pleh-zeer duh voo rahn-kohn-tray." },
      es: { text: "Es un placer conocerle.", romanized: "Es oon plah-sair koh-noh-sair-leh." },
      de: { text: "Es ist mir ein Vergnügen, Sie kennenzulernen.", romanized: "Es ist meer ine Fehr-gnyoo-gen, Zee ken-nen-tsoo-lehr-nen." },
    },
    example: {
      en: { text: "Welcome to our city, it is a pleasure to meet you.", romanized: "Wel-kum too ow-er si-tee, it iz uh plezh-er too meet yoo." },
      hi: { text: "हमारे शहर में स्वागत है, आपसे मिलकर खुशी हुई।", romanized: "Hamare shahar mein swaagat hai, aapse milkar khushi hui." },
      ar: { text: "مرحباً بك في مدينتنا، يسعدني لقاؤك.", romanized: "Marhaban bika fi madeenatina, yas'uduni liqa'uka." },
      fr: { text: "Bienvenue dans notre ville, c'est un plaisir de vous rencontrer.", romanized: "Byan-vuh-noo dahn noh-truh veel, set uhn pleh-zeer duh voo rahn-kohn-tray." },
      es: { text: "Bienvenido a nuestra ciudad, es un placer conocerle.", romanized: "Byen-veh-nee-doh ah nwes-trah syoo-dad, es oon plah-sair koh-noh-sair-leh." },
      de: { text: "Willkommen in unserer Stadt, es ist mir ein Vergnügen.", romanized: "Vil-kom-men in oon-zeh-rer Shtaht, es ist meer ine Fehr-gnyoo-gen." },
    },
  },

  // ==========================================
  // 2. COMMON WORDS
  // ==========================================
  {
    id: "comm-1",
    category: "Common Words",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Please", romanized: "Pleez" },
      hi: { text: "कृपया", romanized: "Kripya" },
      ar: { text: "من فضلك", romanized: "Min fadlik" },
      fr: { text: "S'il vous plaît", romanized: "Seel voo play" },
      es: { text: "Por favor", romanized: "Por fah-vor" },
      de: { text: "Bitte", romanized: "Bit-tuh" },
    },
    example: {
      en: { text: "Help me, please.", romanized: "Help mee, pleez." },
      hi: { text: "कृपया मेरी मदद करें।", romanized: "Kripya meri madad karein." },
      ar: { text: "ساعدني من فضلك.", romanized: "Saa'idnee min fadlik." },
      fr: { text: "Aidez-moi, s'il vous plaît.", romanized: "Ay-day mwah, seel voo play." },
      es: { text: "Ayúdeme, por favor.", romanized: "Ah-yoo-deh-meh, por fah-vor." },
      de: { text: "Helfen Sie mir bitte.", romanized: "Hel-fen Zee meer bit-tuh." },
    },
  },
  {
    id: "comm-2",
    category: "Common Words",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Thank you", romanized: "Thank yoo" },
      hi: { text: "धन्यवाद", romanized: "Dhanyavaad" },
      ar: { text: "شكراً لك", romanized: "Shukran lak" },
      fr: { text: "Merci", romanized: "Mehr-see" },
      es: { text: "Gracias", romanized: "Grah-syahs" },
      de: { text: "Danke", romanized: "Dahn-kuh" },
    },
    example: {
      en: { text: "Thank you for your help.", romanized: "Thank yoo for yoor help." },
      hi: { text: "आपकी मदद के लिए धन्यवाद।", romanized: "Aapki madad ke liye dhanyavaad." },
      ar: { text: "شكراً لك على مساعدتك.", romanized: "Shukran lak 'ala musa'adatika." },
      fr: { text: "Merci pour votre aide.", romanized: "Mehr-see poor voh-truh eyd." },
      es: { text: "Gracias por su ayuda.", romanized: "Grah-syahs por soo ah-yoo-dah." },
      de: { text: "Danke für Ihre Hilfe.", romanized: "Dahn-kuh fyoor Ee-reh Hil-fuh." },
    },
  },
  {
    id: "comm-3",
    category: "Common Words",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "You are welcome", romanized: "Yoo ahr wel-kum" },
      hi: { text: "आपका स्वागत है", romanized: "Aapka swaagat hai" },
      ar: { text: "عفواً", romanized: "Afwan" },
      fr: { text: "De rien", romanized: "Duh ryang" },
      es: { text: "De nada", romanized: "Deh nah-dah" },
      de: { text: "Bitte sehr", romanized: "Bit-tuh zayr" },
    },
    example: {
      en: { text: "You are welcome anytime.", romanized: "Yoo ahr wel-kum en-ee-time." },
      hi: { text: "आपका कभी भी स्वागत है।", romanized: "Aapka kabhi bhi swaagat hai." },
      ar: { text: "عفواً في أي وقت.", romanized: "Afwan fi ayyi waqt." },
      fr: { text: "De rien, c'est naturel.", romanized: "Duh ryang, set nah-too-rel." },
      es: { text: "De nada, siempre a la orden.", romanized: "Deh nah-dah, syem-preh ah lah or-den." },
      de: { text: "Bitte sehr, gern geschehen.", romanized: "Bit-tuh zayr, gehrn geh-shay-en." },
    },
  },

  // ==========================================
  // 3. NUMBERS
  // ==========================================
  {
    id: "num-1",
    category: "Numbers",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "One, Two, Three", romanized: "Wun, Too, Three" },
      hi: { text: "एक, दो, तीन", romanized: "Ek, Do, Teen" },
      ar: { text: "واحد، اثنان، ثلاثة", romanized: "Wahid, Ithnan, Thalatha" },
      fr: { text: "Un, Deux, Trois", romanized: "Uhn, Duh, Trwah" },
      es: { text: "Uno, Dos, Tres", romanized: "Oo-noh, Dohs, Trehs" },
      de: { text: "Eins, Zwei, Drei", romanized: "Eints, Tsvye, Drye" },
    },
    example: {
      en: { text: "I have three books.", romanized: "Eye hav three books." },
      hi: { text: "मेरे पास तीन किताबें हैं।", romanized: "Mere paas teen kitabein hain." },
      ar: { text: "لدي ثلاثة كتب.", romanized: "Ladayya thalathatu kutub." },
      fr: { text: "J'ai trois livres.", romanized: "Zhay trwah leev-ruh." },
      es: { text: "Tengo tres libros.", romanized: "Ten-goh trehs leeb-rohs." },
      de: { text: "Ich habe drei Bücher.", romanized: "Ikh hah-buh drye Byoo-kher." },
    },
  },
  {
    id: "num-2",
    category: "Numbers",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "Ten dollars", romanized: "Ten dol-lerz" },
      hi: { text: "दस डॉलर", romanized: "Das dollar" },
      ar: { text: "عشرة دولارات", romanized: "Ashratu doolarat" },
      fr: { text: "Dix dollars", romanized: "Dee doh-lahr" },
      es: { text: "Diez dólares", romanized: "Dyehs doh-lah-res" },
      de: { text: "Zehn Dollar", romanized: "Tsayn Dol-lahr" },
    },
    example: {
      en: { text: "This coffee costs ten dollars.", romanized: "Dhis kaw-fee kawsts ten dol-lerz." },
      hi: { text: "यह कॉफ़ी दस डॉलर की है।", romanized: "Yeh coffee das dollar ki hai." },
      ar: { text: "هذه القهوة تكلف عشرة دولارات.", romanized: "Hadhihi al-qahwah tukallifu 'ashrata doolarat." },
      fr: { text: "Ce café coûte dix dollars.", romanized: "Suh kah-fay koot dee doh-lahr." },
      es: { text: "Este café cuesta diez dólares.", romanized: "Es-teh kah-fay kwes-tah dyehs doh-lah-res." },
      de: { text: "Dieser Kaffee kostet zehn Dollar.", romanized: "Dee-zer Kahf-fay kos-tet tsayn Dol-lahr." },
    },
  },

  // ==========================================
  // 4. COLORS
  // ==========================================
  {
    id: "col-1",
    category: "Colors",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Blue and Red", romanized: "Bloo and Red" },
      hi: { text: "नीला और लाल", romanized: "Neela aur Laal" },
      ar: { text: "أزرق وأحمر", romanized: "Azraq wa Ahmar" },
      fr: { text: "Bleu et Rouge", romanized: "Bluh ay Roozh" },
      es: { text: "Azul y Rojo", romanized: "Ah-zool ee Roh-hoh" },
      de: { text: "Blau und Rot", romanized: "Blow oont Roht" },
    },
    example: {
      en: { text: "I like the blue shirt.", romanized: "Eye like the bloo shirt." },
      hi: { text: "मुझे नीली कमीज पसंद है।", romanized: "Mujhe neeli kameez pasand hai." },
      ar: { text: "أحب القميص الأزرق.", romanized: "Uhibbu al-qamees al-azraq." },
      fr: { text: "J'aime la chemise bleue.", romanized: "Zhem lah shuh-meez bluh." },
      es: { text: "Me gusta la camisa azul.", romanized: "Meh goos-tah lah kah-mee-sah ah-zool." },
      de: { text: "Ich mag das blaue Hemd.", romanized: "Ikh mahk dahs blow-uh Hemt." },
    },
  },
  {
    id: "col-2",
    category: "Colors",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "White and Black", romanized: "White and Blak" },
      hi: { text: "सफेद और काला", romanized: "Safed aur Kaala" },
      ar: { text: "أبيض وأسود", romanized: "Abyad wa Aswad" },
      fr: { text: "Blanc et Noir", romanized: "Blahn ay Nwahr" },
      es: { text: "Blanco y Negro", romanized: "Blahn-koh ee Neh-groh" },
      de: { text: "Weiß und Schwarz", romanized: "Vice oont Shvahrts" },
    },
    example: {
      en: { text: "The car is white and black.", romanized: "Dhe kar iz white and blak." },
      hi: { text: "गाड़ी सफेद और काली है।", romanized: "Gaadi safed aur kaali hai." },
      ar: { text: "السيارة بيضاء وسوداء.", romanized: "As-sayyara bayda' wa sawda'." },
      fr: { text: "La voiture est blanche et noire.", romanized: "Lah vwah-tyoor ay blahnsh ay nwahr." },
      es: { text: "El coche es blanco y negro.", romanized: "El koh-cheh es blahn-koh ee neh-groh." },
      de: { text: "Das Auto ist weiß und schwarz.", romanized: "Dahs Ow-toh ist vice oont shvahrts." },
    },
  },

  // ==========================================
  // 5. FAMILY
  // ==========================================
  {
    id: "fam-1",
    category: "Family",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Father and Mother", romanized: "Fah-dher and Muh-dher" },
      hi: { text: "पिता और माता", romanized: "Pita aur Mata" },
      ar: { text: "الأب والأم", romanized: "Al-ab wal-umm" },
      fr: { text: "Père et Mère", romanized: "Pair ay Mair" },
      es: { text: "Padre y Madre", romanized: "Pah-dreh ee Mah-dreh" },
      de: { text: "Vater und Mutter", romanized: "Fah-ter oont Moot-ter" },
    },
    example: {
      en: { text: "My parents are very kind.", romanized: "My pair-ents ahr veh-ree kynd." },
      hi: { text: "मेरे माता-पिता बहुत दयालु हैं।", romanized: "Mere mata-pita bahut dayalu hain." },
      ar: { text: "والداي طيبان جداً.", romanized: "Walidayya tayyibani jiddan." },
      fr: { text: "Mes parents sont très gentils.", romanized: "May pah-rahn sohn tray zhahn-tee." },
      es: { text: "Mis padres son muy amables.", romanized: "Mees pah-dres sohn mwee ah-mah-bles." },
      de: { text: "Meine Eltern sind sehr nett.", romanized: "Mye-nuh El-tern zint zayr net." },
    },
  },
  {
    id: "fam-2",
    category: "Family",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "Brother and Sister", romanized: "Bruh-dher and Sis-ter" },
      hi: { text: "भाई और बहन", romanized: "Bhai aur Behen" },
      ar: { text: "الأخ والأخت", romanized: "Al-akh wal-ukht" },
      fr: { text: "Frère et Sœur", romanized: "Frair ay Suhr" },
      es: { text: "Hermano y Hermana", romanized: "Ehr-mah-noh ee Ehr-mah-nah" },
      de: { text: "Bruder und Schwester", romanized: "Broo-der oont Shves-ter" },
    },
    example: {
      en: { text: "I have one brother and one sister.", romanized: "Eye hav wun bruh-dher and wun sis-ter." },
      hi: { text: "मेरा एक भाई और एक बहन है।", romanized: "Mera ek bhai aur ek behen hai." },
      ar: { text: "لدي أخ واحد وأخت واحدة.", romanized: "Ladayya akhun wahid wa ukhtun wahida." },
      fr: { text: "J'ai un frère et une sœur.", romanized: "Zhay uhn frair ay oon suhr." },
      es: { text: "Tengo un hermano y una hermana.", romanized: "Ten-goh oon ehr-mah-noh ee oo-nah ehr-mah-nah." },
      de: { text: "Ich habe einen Bruder und eine Schwester.", romanized: "Ikh hah-buh eye-nen Broo-der oont eye-nuh Shves-ter." },
    },
  },

  // ==========================================
  // 6. FOOD & DRINKS
  // ==========================================
  {
    id: "food-1",
    category: "Food & Drinks",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Water and Bread", romanized: "Wah-ter and Bred" },
      hi: { text: "पानी और रोटी", romanized: "Paani aur Roti" },
      ar: { text: "ماء وخبز", romanized: "Ma' wa Khubz" },
      fr: { text: "Eau et Pain", romanized: "Oh ay Pan" },
      es: { text: "Agua y Pan", romanized: "Ah-gwah ee Pahn" },
      de: { text: "Wasser und Brot", romanized: "Vahs-ser oont Broht" },
    },
    example: {
      en: { text: "Can I have some water, please?", romanized: "Kan eye hav sum wah-ter, pleez?" },
      hi: { text: "क्या मुझे थोड़ा पानी मिल सकता है?", romanized: "Kya mujhe thoda paani mil sakta hai?" },
      ar: { text: "هل يمكنني الحصول على بعض الماء؟", romanized: "Hal yumkinuni al-husool 'ala ba'di al-ma'?" },
      fr: { text: "Puis-je avoir de l'eau, s'il vous plaît ?", romanized: "Pweezh ah-vwahr duh loh, seel voo play ?" },
      es: { text: "¿Puedo tomar un poco de agua?", romanized: "¿Pweh-doh toh-mar oon poh-koh deh ah-gwah?" },
      de: { text: "Kann ich bitte etwas Wasser haben?", romanized: "Kahn ikh bit-tuh et-vahs Vahs-ser hah-ben?" },
    },
  },
  {
    id: "food-2",
    category: "Food & Drinks",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "A cup of coffee, please", romanized: "Uh kup uv kaw-fee, pleez" },
      hi: { text: "एक कप कॉफ़ी, कृपया", romanized: "Ek cup coffee, kripya" },
      ar: { text: "فنجان قهوة، من فضلك", romanized: "Finjanu qahwah, min fadlik" },
      fr: { text: "Une tasse de café, s'il vous plaît", romanized: "Oon tahs duh kah-fay, seel voo play" },
      es: { text: "Una taza de café, por favor", romanized: "Oo-nah tah-zah deh kah-fay, por fah-vor" },
      de: { text: "Eine Tasse Kaffee, bitte", romanized: "Eye-nuh Tahs-suh Kahf-fay, bit-tuh" },
    },
    example: {
      en: { text: "I would like a cup of coffee, please.", romanized: "Eye wood like uh kup uv kaw-fee, pleez." },
      hi: { text: "मुझे एक कप कॉफ़ी चाहिए, कृपया।", romanized: "Mujhe ek cup coffee chahiye, kripya." },
      ar: { text: "أود فنجان قهوة، من فضلك.", romanized: "Awaddu finjana qahwah, min fadlik." },
      fr: { text: "Je voudrais une tasse de café, s'il vous plaît.", romanized: "Zhuh voo-dray oon tahs duh kah-fay, seel voo play." },
      es: { text: "Quisiera una taza de café, por favor.", romanized: "Kee-syeh-rah oo-nah tah-zah deh kah-fay, por fah-vor." },
      de: { text: "Ich möchte eine Tasse Kaffee, bitte.", romanized: "Ikh merkh-tuh eye-nuh Tahs-suh Kahf-fay, bit-tuh." },
    },
  },

  // ==========================================
  // 7. HOME
  // ==========================================
  {
    id: "home-1",
    category: "Home",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Door and Window", romanized: "Dor and Win-doh" },
      hi: { text: "दरवाजा और खिड़की", romanized: "Darwaaza aur Khidki" },
      ar: { text: "باب ونافذة", romanized: "Bab wa Nafidhah" },
      fr: { text: "Porte et Fenêtre", romanized: "Pohrt ay Fuh-net-ruh" },
      es: { text: "Puerta y Ventana", romanized: "Pwer-tah ee Ven-tah-nah" },
      de: { text: "Tür und Fenster", romanized: "Tyoor oont Fen-ster" },
    },
    example: {
      en: { text: "Please close the door.", romanized: "Pleez klohz the dor." },
      hi: { text: "कृपया दरवाजा बंद कर दीजिए।", romanized: "Kripya darwaaza band kar deejiye." },
      ar: { text: "أغلق الباب من فضلك.", romanized: "Aghliq al-bab min fadlik." },
      fr: { text: "Fermez la porte, s'il vous plaît.", romanized: "Fair-may lah pohrt, seel voo play." },
      es: { text: "Cierre la puerta, por favor.", romanized: "Syeh-rreh lah pwer-tah, por fah-vor." },
      de: { text: "Bitte schließen Sie die Tür.", romanized: "Bit-tuh shlee-sen Zee dee Tyoor." },
    },
  },
  {
    id: "home-2",
    category: "Home",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "In the kitchen", romanized: "In the kitch-en" },
      hi: { text: "रसोई घर में", romanized: "Rasoi ghar mein" },
      ar: { text: "في المطبخ", romanized: "Fi al-matbakh" },
      fr: { text: "Dans la cuisine", romanized: "Dahn lah kwee-zeen" },
      es: { text: "En la cocina", romanized: "En lah koh-see-nah" },
      de: { text: "In der Küche", romanized: "In dair Kyoo-khuh" },
    },
    example: {
      en: { text: "Dinner is cooking in the kitchen.", romanized: "Din-ner iz kook-ing in the kitch-en." },
      hi: { text: "रसोई में खाना पक रहा है।", romanized: "Rasoi mein khaana pak raha hai." },
      ar: { text: "العشاء يطبخ في المطبخ.", romanized: "Al-'asha'u yutbakhu fi al-matbakh." },
      fr: { text: "Le dîner cuit dans la cuisine.", romanized: "Luh dee-nay kwee dahn lah kwee-zeen." },
      es: { text: "La cena se cocina en la cocina.", romanized: "Lah seh-nah seh koh-see-nah en lah koh-see-nah." },
      de: { text: "Das Abendessen kocht in der Küche.", romanized: "Dahs Ah-bent-es-sen kokht in dair Kyoo-khuh." },
    },
  },

  // ==========================================
  // 8. TRAVEL
  // ==========================================
  {
    id: "trav-1",
    category: "Travel",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Airport and Hotel", romanized: "Air-port and Hoh-tel" },
      hi: { text: "हवाई अड्डा और होटल", romanized: "Hawai adda aur Hotel" },
      ar: { text: "مطار وفندق", romanized: "Matar wa Funduq" },
      fr: { text: "Aéroport et Hôtel", romanized: "Ah-ay-roh-pohr ay Oh-tel" },
      es: { text: "Aeropuerto y Hotel", romanized: "Ah-eh-roh-pwer-toh ee Oh-tel" },
      de: { text: "Flughafen und Hotel", romanized: "Floog-hah-fen oont Hoh-tel" },
    },
    example: {
      en: { text: "I am going to the airport.", romanized: "Eye am goh-ing too the air-port." },
      hi: { text: "मैं हवाई अड्डे जा रहा हूँ।", romanized: "Main hawai adde ja raha hoon." },
      ar: { text: "أنا ذاهب إلى المطار.", romanized: "Ana dhahibun ila al-matar." },
      fr: { text: "Je vais à l'aéroport.", romanized: "Zhuh vay ah lah-ay-roh-pohr." },
      es: { text: "Voy al aeropuerto.", romanized: "Voy ahl ah-eh-roh-pwer-toh." },
      de: { text: "Ich fahre zum Flughafen.", romanized: "Ikh fah-ruh tsoom Floog-hah-fen." },
    },
  },
  {
    id: "trav-2",
    category: "Travel",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "Where is the train station?", romanized: "Wair iz the trayn stay-shun?" },
      hi: { text: "रेलवे स्टेशन कहाँ है?", romanized: "Railway station kahan hai?" },
      ar: { text: "أين محطة القطار؟", romanized: "Ayna mahattatu al-qitar?" },
      fr: { text: "Où est la gare ?", romanized: "Oo ay lah gahr ?" },
      es: { text: "¿Dónde está la estación de tren?", romanized: "¿Dohn-deh es-tah lah es-tah-syohn deh tren?" },
      de: { text: "Wo ist der Bahnhof?", romanized: "Voh ist dair Bahn-hohf?" },
    },
    example: {
      en: { text: "Excuse me, where is the train station?", romanized: "Eks-kyooz mee, wair iz the trayn stay-shun?" },
      hi: { text: "माफ़ कीजिए, रेलवे स्टेशन कहाँ है?", romanized: "Maaf kijiye, railway station kahan hai?" },
      ar: { text: "معذرة، أين محطة القطار؟", romanized: "Ma'dhiratan, ayna mahattatu al-qitar?" },
      fr: { text: "Excusez-moi, où est la gare ?", romanized: "Eks-kyoo-zay mwah, oo ay lah gahr ?" },
      es: { text: "Disculpe, ¿dónde está la estación?", romanized: "Dees-kool-peh, ¿dohn-deh es-tah lah es-tah-syohn?" },
      de: { text: "Entschuldigung, wo ist der Bahnhof?", romanized: "Ent-shool-dee-goong, voh ist dair Bahn-hohf?" },
    },
  },

  // ==========================================
  // 9. SHOPPING
  // ==========================================
  {
    id: "shop-1",
    category: "Shopping",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Price and Cash", romanized: "Pryce and Kash" },
      hi: { text: "कीमत और नकद", romanized: "Keemat aur Nakad" },
      ar: { text: "سعر ونقد", romanized: "Si'r wa Naqd" },
      fr: { text: "Prix et Espèces", romanized: "Pree ay Es-pes" },
      es: { text: "Precio y Efectivo", romanized: "Preh-syoh ee Eh-fek-tee-voh" },
      de: { text: "Preis und Bargeld", romanized: "Price oont Bahr-gelt" },
    },
    example: {
      en: { text: "Can I pay in cash?", romanized: "Kan eye pay in kash?" },
      hi: { text: "क्या मैं नकद भुगतान कर सकता हूँ?", romanized: "Kya main nakad bhugtaan kar sakta hoon?" },
      ar: { text: "هل يمكنني الدفع نقداً؟", romanized: "Hal yumkinuni ad-daf'u naqdan?" },
      fr: { text: "Puis-je payer en espèces ?", romanized: "Pweezh pay-yay ahn es-pes ?" },
      es: { text: "¿Puedo pagar en efectivo?", romanized: "¿Pweh-doh pah-gar en eh-fek-tee-voh?" },
      de: { text: "Kann ich bar bezahlen?", romanized: "Kahn ikh bahr buh-tsah-len?" },
    },
  },
  {
    id: "shop-2",
    category: "Shopping",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "How much does this cost?", romanized: "How much duz dhis kawst?" },
      hi: { text: "इसकी कीमत क्या है?", romanized: "Iski keemat kya hai?" },
      ar: { text: "كم سعر هذا؟", romanized: "Kam si'ru hadha?" },
      fr: { text: "Combien cela coûte-t-il ?", romanized: "Kohm-byan suh-lah koot-teel ?" },
      es: { text: "¿Cuánto cuesta esto?", romanized: "¿Kwahn-toh kwes-tah es-toh?" },
      de: { text: "Wie viel kostet das?", romanized: "Vee feel kos-tet dahs?" },
    },
    example: {
      en: { text: "I like this jacket. How much does this cost?", romanized: "Eye like dhis jak-it. How much duz dhis kawst?" },
      hi: { text: "मुझे यह जैकेट पसंद है। इसकी कीमत क्या है?", romanized: "Mujhe yeh jacket pasand hai. Iski keemat kya hai?" },
      ar: { text: "أعجبني هذا المعطف. كم سعر هذا؟", romanized: "A'jabani hadha al-mi'taf. Kam si'ru hadha?" },
      fr: { text: "J'aime cette veste. Combien cela coûte-t-il ?", romanized: "Zhem set vest. Kohm-byan suh-lah koot-teel ?" },
      es: { text: "Me gusta esta chaqueta. ¿Cuánto cuesta?", romanized: "Meh goos-tah es-tah chah-keh-tah. ¿Kwahn-toh kwes-tah?" },
      de: { text: "Ich mag diese Jacke. Wie viel kostet das?", romanized: "Ikh mahk dee-zuh Yah-kuh. Vee feel kos-tet dahs?" },
    },
  },

  // ==========================================
  // 10. WORK
  // ==========================================
  {
    id: "work-1",
    category: "Work",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Office and Meeting", romanized: "Off-iss and Meet-ing" },
      hi: { text: "कार्यालय और बैठक", romanized: "Karyalay aur Baithak" },
      ar: { text: "مكتب واجتماع", romanized: "Maktab wa Ijtima'" },
      fr: { text: "Bureau et Réunion", romanized: "Byoo-roh ay Ray-oo-nyohn" },
      es: { text: "Oficina y Reunión", romanized: "Oh-fee-see-nah ee Reh-oo-nyohn" },
      de: { text: "Büro und Besprechung", romanized: "Byoo-roh oont Buh-shprekh-oong" },
    },
    example: {
      en: { text: "We have an important meeting today.", romanized: "Wee hav an im-por-tant meet-ing tuh-day." },
      hi: { text: "आज हमारी एक महत्वपूर्ण बैठक है।", romanized: "Aaj hamaari ek mahatvapurna baithak hai." },
      ar: { text: "لدينا اجتماع مهم اليوم.", romanized: "Ladayna ijtima'un muhimmun al-yawm." },
      fr: { text: "Nous avons une réunion importante aujourd'hui.", romanized: "Nooz ah-vohn oon ray-oo-nyohn am-por-tahnt oh-zhoor-dwee." },
      es: { text: "Tenemos una reunión importante hoy.", romanized: "Teh-neh-mohs oo-nah reh-oo-nyohn eem-por-tahn-teh oy." },
      de: { text: "Wir haben heute eine wichtige Besprechung.", romanized: "Veer hah-ben hoy-tuh eye-nuh vikh-tee-guh Buh-shprekh-oong." },
    },
  },
  {
    id: "work-2",
    category: "Work",
    level: "Intermediate",
    type: "phrase",
    translations: {
      en: { text: "I work in project management", romanized: "Eye werk in proj-ekt man-ij-ment" },
      hi: { text: "मैं प्रोजेक्ट प्रबंधन में काम करता हूँ", romanized: "Main project prabandhan mein kaam karta hoon" },
      ar: { text: "أعمل في إدارة المشاريع", romanized: "A'malu fi idarati al-mashari'" },
      fr: { text: "Je travaille dans la gestion de projet", romanized: "Zhuh trah-vye dahn lah zhes-tyohn duh proh-zhay" },
      es: { text: "Trabajo en gestión de proyectos", romanized: "Trah-bah-hoh en hehs-tyohn deh proh-yek-tohs" },
      de: { text: "Ich arbeite im Projektmanagement", romanized: "Ikh ahr-bye-tuh im Proh-yekt-man-adzh-ment" },
    },
    example: {
      en: { text: "I have worked in project management for three years.", romanized: "Eye hav werkt in proj-ekt man-ij-ment for three yeerz." },
      hi: { text: "मैं तीन साल से प्रोजेक्ट प्रबंधन में काम कर रहा हूँ।", romanized: "Main teen saal se project prabandhan mein kaam kar raha hoon." },
      ar: { text: "أعمل في إدارة المشاريع منذ ثلاث سنوات.", romanized: "A'malu fi idarati al-mashari' mundhu thalathi sanawat." },
      fr: { text: "Je travaille dans la gestion de projet depuis trois ans.", romanized: "Zhuh trah-vye dahn lah zhes-tyohn duh proh-zhay duh-pwee trwah zahn." },
      es: { text: "Trabajo en gestión de proyectos desde hace tres años.", romanized: "Trah-bah-hoh en hehs-tyohn deh proh-yek-tohs des-deh ah-seh trehs ah-nyohs." },
      de: { text: "Ich arbeite seit drei Jahren im Projektmanagement.", romanized: "Ikh ahr-bye-tuh zyte drye Yah-ren im Proh-yekt-man-adzh-ment." },
    },
  },

  // ==========================================
  // 11. SCHOOL
  // ==========================================
  {
    id: "school-1",
    category: "School",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Teacher and Student", romanized: "Tee-cher and Styoo-dent" },
      hi: { text: "शिक्षक और छात्र", romanized: "Shikshak aur Chhaatra" },
      ar: { text: "المعلم والطالب", romanized: "Al-mu'allim wat-talib" },
      fr: { text: "Professeur et Étudiant", romanized: "Proh-feh-suhr ay Ay-too-dyahn" },
      es: { text: "Profesor y Estudiante", romanized: "Proh-feh-sor ee Es-too-dyahn-teh" },
      de: { text: "Lehrer und Schüler", romanized: "Lay-rer oont Shyoo-ler" },
    },
    example: {
      en: { text: "The teacher explained the lesson.", romanized: "The tee-cher eks-playnd the les-sun." },
      hi: { text: "शिक्षक ने पाठ समझाया।", romanized: "Shikshak ne paath samjhaaya." },
      ar: { text: "شرح المعلم الدرس.", romanized: "Sharaha al-mu'allimu ad-dars." },
      fr: { text: "Le professeur a expliqué la leçon.", romanized: "Luh proh-feh-suhr ah eks-plee-kay lah luh-sohn." },
      es: { text: "El profesor explicó la lección.", romanized: "El proh-feh-sor eks-plee-koh lah lek-syohn." },
      de: { text: "Der Lehrer erklärte die Lektion.", romanized: "Dair Lay-rer ehr-klehr-tuh dee Lek-tsyohn." },
    },
  },
  {
    id: "school-2",
    category: "School",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "I study English every day", romanized: "Eye stud-ee Ing-glish ev-ree day" },
      hi: { text: "मैं हर दिन अंग्रेज़ी पढ़ता हूँ", romanized: "Main har din Angrezi padhta hoon" },
      ar: { text: "أدرس الإنجليزية كل يوم", romanized: "Adrusu al-injleeziyyata kulla yawm" },
      fr: { text: "J'étudie l'anglais tous les jours", romanized: "Zhay-too-dee lahn-glay too lay zhoor" },
      es: { text: "Estudio inglés todos los días", romanized: "Es-too-dyoh een-gles toh-dohs lohs dee-ahs" },
      de: { text: "Ich lerne jeden Tag Englisch", romanized: "Ikh lehr-nuh yay-den Tahk Eng-lish" },
    },
    example: {
      en: { text: "To improve speaking, I study English every day.", romanized: "Too im-proov speek-ing, eye stud-ee Ing-glish ev-ree day." },
      hi: { text: "बोलने में सुधार के लिए, मैं हर दिन अंग्रेज़ी पढ़ता हूँ।", romanized: "Bolne mein sudhaar ke liye, main har din Angrezi padhta hoon." },
      ar: { text: "لتحسين التحدث، أدرس الإنجليزية كل يوم.", romanized: "Li-tahseen at-tahadduth, adrusu al-injleeziyyata kulla yawm." },
      fr: { text: "Pour m'améliorer, j'étudie l'anglais tous les jours.", romanized: "Poor mah-may-lyoh-ray, zhay-too-dee lahn-glay too lay zhoor." },
      es: { text: "Para mejorar, estudio inglés todos los días.", romanized: "Pah-rah meh-hoh-rar, es-too-dyoh een-gles toh-dohs lohs dee-ahs." },
      de: { text: "Um mich zu verbessern, lerne ich jeden Tag Englisch.", romanized: "Oom mikh tsoo fehr-bes-sern, lehr-nuh ikh yay-den Tahk Eng-lish." },
    },
  },

  // ==========================================
  // 12. TIME & DATES
  // ==========================================
  {
    id: "time-1",
    category: "Time & Dates",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Today and Tomorrow", romanized: "Tuh-day and Tuh-mor-roh" },
      hi: { text: "आज और कल", romanized: "Aaj aur Kal" },
      ar: { text: "اليوم وغداً", romanized: "Al-yawm wa Ghadan" },
      fr: { text: "Aujourd'hui et Demain", romanized: "Oh-zhoor-dwee ay Duh-man" },
      es: { text: "Hoy y Mañana", romanized: "Oy ee Mah-nyah-nah" },
      de: { text: "Heute und Morgen", romanized: "Hoy-tuh oont Mor-gen" },
    },
    example: {
      en: { text: "We start today, not tomorrow.", romanized: "Wee start tuh-day, not tuh-mor-roh." },
      hi: { text: "हम आज शुरू करेंगे, कल नहीं।", romanized: "Hum aaj shuru karenge, kal nahin." },
      ar: { text: "سنبدأ اليوم، وليس غداً.", romanized: "Sanabda'u al-yawm, wa laysa ghadan." },
      fr: { text: "Nous commençons aujourd'hui, pas demain.", romanized: "Noo koh-mahn-sohn oh-zhoor-dwee, pah duh-man." },
      es: { text: "Empezamos hoy, no mañana.", romanized: "Em-peh-zah-mohs oy, noh mah-nyah-nah." },
      de: { text: "Wir beginnen heute, nicht morgen.", romanized: "Veer buh-gin-nen hoy-tuh, nikht mor-gen." },
    },
  },
  {
    id: "time-2",
    category: "Time & Dates",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "What time is it?", romanized: "Wut time iz it?" },
      hi: { text: "कितने बजे हैं?", romanized: "Kitne baje hain?" },
      ar: { text: "كم الساعة الآن؟", romanized: "Kam as-sa'atu al-an?" },
      fr: { text: "Quelle heure est-il ?", romanized: "Kell uhr ay-teel ?" },
      es: { text: "¿Qué hora es?", romanized: "¿Keh oh-rah es?" },
      de: { text: "Wie spät ist es?", romanized: "Vee shpayt ist es?" },
    },
    example: {
      en: { text: "Excuse me, what time is it now?", romanized: "Eks-kyooz mee, wut time iz it now?" },
      hi: { text: "माफ़ कीजिए, अभी कितने बजे हैं?", romanized: "Maaf kijiye, abhi kitne baje hain?" },
      ar: { text: "معذرة، كم الساعة الآن؟", romanized: "Ma'dhiratan, kam as-sa'atu al-an?" },
      fr: { text: "Pardon, quelle heure est-il maintenant ?", romanized: "Par-dohn, kell uhr ay-teel man-tuh-nahn ?" },
      es: { text: "Disculpe, ¿qué hora es ahora?", romanized: "Dees-kool-peh, ¿keh oh-rah es ah-oh-rah?" },
      de: { text: "Entschuldigung, wie spät ist es jetzt?", romanized: "Ent-shool-dee-goong, vee shpayt ist es yetst?" },
    },
  },

  // ==========================================
  // 13. BODY PARTS
  // ==========================================
  {
    id: "body-1",
    category: "Body Parts",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Head, Eyes, and Hands", romanized: "Hed, Eyez, and Handz" },
      hi: { text: "सिर, आँखें और हाथ", romanized: "Sir, Aankhein aur Haath" },
      ar: { text: "الرأس والعينان واليدان", romanized: "Ar-ra's wal-'aynani wal-yadan" },
      fr: { text: "Tête, Yeux et Mains", romanized: "Tet, Yuh ay Man" },
      es: { text: "Cabeza, Ojos y Manos", romanized: "Kah-beh-zah, Oh-hohs ee Mah-nohs" },
      de: { text: "Kopf, Augen und Hände", romanized: "Kopf, Ow-gen oont Hen-duh" },
    },
    example: {
      en: { text: "Wash your hands before eating.", romanized: "Wahsh yoor handz bee-for eet-ing." },
      hi: { text: "खाने से पहले हाथ धो लें।", romanized: "Khaane se pehle haath dho lein." },
      ar: { text: "اغسل يديك قبل تناول الطعام.", romanized: "Ighsil yadayka qabla tanawuli at-ta'am." },
      fr: { text: "Lavez-vous les mains avant de manger.", romanized: "Lah-vay voo lay man ah-vahn duh mahn-zhay." },
      es: { text: "Lávese las manos antes de comer.", romanized: "Lah-veh-seh lahs mah-nohs ahn-tes deh koh-mer." },
      de: { text: "Waschen Sie sich vor dem Essen die Hände.", romanized: "Vah-shen Zee zikh fohr daym Es-sen dee Hen-duh." },
    },
  },
  {
    id: "body-2",
    category: "Body Parts",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "I have a headache", romanized: "Eye hav uh hed-ayk" },
      hi: { text: "मेरे सिर में दर्द है", romanized: "Mere sir mein dard hai" },
      ar: { text: "عندي صداع", romanized: "'Indee suda'" },
      fr: { text: "J'ai mal à la tête", romanized: "Zhay mahl ah lah tet" },
      es: { text: "Tengo dolor de cabeza", romanized: "Ten-goh doh-lor deh kah-beh-zah" },
      de: { text: "Ich habe Kopfschmerzen", romanized: "Ikh hah-buh Kopf-shmair-tsen" },
    },
    example: {
      en: { text: "I need to rest because I have a headache.", romanized: "Eye need too rest bee-kuz eye hav uh hed-ayk." },
      hi: { text: "मुझे आराम चाहिए क्योंकि मेरे सिर में दर्द है।", romanized: "Mujhe aaram chahiye kyonki mere sir mein dard hai." },
      ar: { text: "أحتاج إلى الراحة لأن لدي صداعاً.", romanized: "Ahtaju ila ar-rahati li'anna ladayya suda'an." },
      fr: { text: "Je dois me reposer car j'ai mal à la tête.", romanized: "Zhuh dwah muh ruh-poh-zay kar zhay mahl ah lah tet." },
      es: { text: "Necesito descansar porque me duele la cabeza.", romanized: "Neh-seh-see-toh des-kahn-sar por-keh meh dweh-leh lah kah-beh-zah." },
      de: { text: "Ich muss mich ausruhen, da ich Kopfschmerzen habe.", romanized: "Ikh moos mikh ows-roo-hen, dah ikh Kopf-shmair-tsen hah-buh." },
    },
  },

  // ==========================================
  // 14. FEELINGS
  // ==========================================
  {
    id: "feel-1",
    category: "Feelings",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Happy and Tired", romanized: "Hap-pee and Tyre-d" },
      hi: { text: "खुश और थका हुआ", romanized: "Khush aur Thaka hua" },
      ar: { text: "سعيد ومتعب", romanized: "Sa'eed wa Mut'ab" },
      fr: { text: "Heureux et Fatigué", romanized: "Uh-ruh ay Fah-tee-gay" },
      es: { text: "Feliz y Cansado", romanized: "Feh-lees ee Kahn-sah-doh" },
      de: { text: "Glücklich und Müde", romanized: "Glyook-likh oont Myoo-duh" },
    },
    example: {
      en: { text: "I feel very happy today.", romanized: "Eye feel veh-ree hap-pee tuh-day." },
      hi: { text: "आज मैं बहुत खुश महसूस कर रहा हूँ।", romanized: "Aaj main bahut khush mehsoos kar raha hoon." },
      ar: { text: "أشعر بسعادة غامرة اليوم.", romanized: "Ash'uru bi-sa'adatin ghamiratin al-yawm." },
      fr: { text: "Je me sens très heureux aujourd'hui.", romanized: "Zhuh muh sahn trayz uh-ruh oh-zhoor-dwee." },
      es: { text: "Me siento muy feliz hoy.", romanized: "Meh syen-toh mwee feh-lees oy." },
      de: { text: "Ich fühle mich heute sehr glücklich.", romanized: "Ikh fyoo-luh mikh hoy-tuh zayr glyook-likh." },
    },
  },
  {
    id: "feel-2",
    category: "Feelings",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "I am feeling confident", romanized: "Eye am feel-ing kon-fi-dent" },
      hi: { text: "मैं आत्मविश्वासी महसूस कर रहा हूँ", romanized: "Main aatmavishwaasi mehsoos kar raha hoon" },
      ar: { text: "أشعر بالثقة", romanized: "Ash'uru bith-thiqah" },
      fr: { text: "Je me sens confiant", romanized: "Zhuh muh sahn kohn-fyahn" },
      es: { text: "Me siento seguro", romanized: "Meh syen-toh seh-goo-roh" },
      de: { text: "Ich fühle mich zuversichtlich", romanized: "Ikh fyoo-luh mikh tsoo-fehr-zikh-tlikh" },
    },
    example: {
      en: { text: "With practice, I am feeling confident in English.", romanized: "With prak-tis, eye am feel-ing kon-fi-dent in Ing-glish." },
      hi: { text: "अभ्यास से, मैं अंग्रेज़ी में आत्मविश्वासी महसूस कर रहा हूँ।", romanized: "Abhyaas se, main Angrezi mein aatmavishwaasi mehsoos kar raha hoon." },
      ar: { text: "مع التدريب، أشعر بالثقة في الإنجليزية.", romanized: "Ma'a at-tadrīb, ash'uru bith-thiqati fil-injleeziyyah." },
      fr: { text: "Avec la pratique, je me sens confiant en anglais.", romanized: "Ah-vek lah prah-teek, zhuh muh sahn kohn-fyahn ahn ahn-glay." },
      es: { text: "Con la práctica, me siento seguro hablando inglés.", romanized: "Kohn lah prahk-tee-kah, meh syen-toh seh-goo-roh ah-blahn-doh een-gles." },
      de: { text: "Mit Übung fühle ich mich zuversichtlich auf Englisch.", romanized: "Mit Oo-boong fyoo-luh ikh mikh tsoo-fehr-zikh-tlikh owf Eng-lish." },
    },
  },

  // ==========================================
  // 15. DAILY ACTIVITIES
  // ==========================================
  {
    id: "act-1",
    category: "Daily Activities",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Eat, Drink, and Sleep", romanized: "Eet, Drink, and Sleep" },
      hi: { text: "खाना, पीना और सोना", romanized: "Khaana, Peena aur Sona" },
      ar: { text: "أكل وشرب ونوم", romanized: "Akl wa Shurb wa Nawm" },
      fr: { text: "Manger, Boire et Dormir", romanized: "Mahn-zhay, Bwahr ay Dor-meer" },
      es: { text: "Comer, Beber y Dormir", romanized: "Koh-mer, Beh-ber ee Dor-meer" },
      de: { text: "Essen, Trinken und Schlafen", romanized: "Es-sen, Tring-ken oont Shlah-fen" },
    },
    example: {
      en: { text: "I sleep eight hours every night.", romanized: "Eye sleep ayt ow-erz ev-ree night." },
      hi: { text: "मैं हर रात आठ घंटे सोता हूँ।", romanized: "Main har raat aath ghante sota hoon." },
      ar: { text: "أنام ثماني ساعات كل ليلة.", romanized: "Anamu thamaniya sa'atin kulla laylah." },
      fr: { text: "Je dors huit heures chaque nuit.", romanized: "Zhuh dor weet uhr shahk nwee." },
      es: { text: "Duermo ocho horas cada noche.", romanized: "Dwer-moh oh-choh oh-rahs kah-dah noh-cheh." },
      de: { text: "Ich schlafe jede Nacht acht Stunden.", romanized: "Ikh shlah-fuh yay-duh Nahkht ahkht Shtoon-den." },
    },
  },
  {
    id: "act-2",
    category: "Daily Activities",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "I wake up at seven o'clock", romanized: "Eye wayk up at sev-en oh-klok" },
      hi: { text: "मैं सात बजे उठता हूँ", romanized: "Main saat baje uthta hoon" },
      ar: { text: "أستيقظ في الساعة السابعة", romanized: "Astaiqidhu fi as-sa'ati as-sabi'ah" },
      fr: { text: "Je me réveille à sept heures", romanized: "Zhuh muh ray-vay ah set uhr" },
      es: { text: "Me despierto a las siete", romanized: "Meh des-pyer-toh ah lahs syeh-teh" },
      de: { text: "Ich wache um sieben Uhr auf", romanized: "Ikh vah-khuh oom zee-ben Oor owf" },
    },
    example: {
      en: { text: "Every morning, I wake up at seven o'clock.", romanized: "Ev-ree mor-ning, eye wayk up at sev-en oh-klok." },
      hi: { text: "हर सुबह, मैं सात बजे उठता हूँ।", romanized: "Har subah, main saat baje uthta hoon." },
      ar: { text: "كل صباح، أستيقظ في الساعة السابعة.", romanized: "Kulla sabahin, astaiqidhu fi as-sa'ati as-sabi'ah." },
      fr: { text: "Chaque matin, je me réveille à sept heures.", romanized: "Shahk mah-tan, zhuh muh ray-vay ah set uhr." },
      es: { text: "Cada mañana, me despierto a las siete.", romanized: "Kah-dah mah-nyah-nah, meh des-pyer-toh ah lahs syeh-teh." },
      de: { text: "Jeden Morgen wache ich um sieben Uhr auf.", romanized: "Yay-den Mor-gen vah-khuh ikh oom zee-ben Oor owf." },
    },
  },

  // ==========================================
  // 16. EMERGENCY
  // ==========================================
  {
    id: "emerg-1",
    category: "Emergency",
    level: "Beginner",
    type: "word",
    translations: {
      en: { text: "Help! Emergency!", romanized: "Help! Ee-mer-jen-see!" },
      hi: { text: "मदद! आपातकाल!", romanized: "Madad! Aapaatkaal!" },
      ar: { text: "النجدة! طوارئ!", romanized: "An-najdah! Tawari'!" },
      fr: { text: "Au secours ! Urgence !", romanized: "Oh suh-koor ! Oor-zhahnss !" },
      es: { text: "¡Ayuda! ¡Emergencia!", romanized: "¡Ah-yoo-dah! ¡Eh-mehr-hen-syah!" },
      de: { text: "Hilfe! Notfall!", romanized: "Hil-fuh! Noht-fahl!" },
    },
    example: {
      en: { text: "Please help! It is an emergency.", romanized: "Pleez help! It iz an ee-mer-jen-see." },
      hi: { text: "कृपया मदद करें! यह आपातकालीन स्थिति है।", romanized: "Kripya madad karein! Yeh aapaatkaaleen sthiti hai." },
      ar: { text: "الرجاء المساعدة! إنها حالة طوارئ.", romanized: "Ar-raja'u al-musa'adah! Innaha halatu tawari'." },
      fr: { text: "Aidez-moi ! C'est une urgence.", romanized: "Ay-day mwah ! Set oon oor-zhahnss." },
      es: { text: "¡Por favor ayuden! Es una emergencia.", romanized: "¡Por fah-vor ah-yoo-den! Es oo-nah eh-mehr-hen-syah." },
      de: { text: "Bitte helfen Sie! Das ist ein Notfall.", romanized: "Bit-tuh hel-fen Zee! Dahs ist ine Noht-fahl." },
    },
  },
  {
    id: "emerg-2",
    category: "Emergency",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "I need a doctor immediately", romanized: "Eye need uh dok-ter im-mee-dee-it-lee" },
      hi: { text: "मुझे तुरंत डॉक्टर की ज़रूरत है", romanized: "Mujhe turant doctor ki zaroorat hai" },
      ar: { text: "أحتاج إلى طبيب فوراً", romanized: "Ahtaju ila tabeebin fawran" },
      fr: { text: "J'ai besoin d'un médecin immédiatement", romanized: "Zhay buh-zwan duhn mayd-san ee-may-dyat-mahn" },
      es: { text: "Necesito un médico inmediatamente", romanized: "Neh-seh-see-toh oon meh-dee-koh een-meh-dyah-tah-men-teh" },
      de: { text: "Ich brauche sofort einen Arzt", romanized: "Ikh brow-khuh zoh-fort eye-nen Ahrts-t" },
    },
    example: {
      en: { text: "Call an ambulance, I need a doctor immediately.", romanized: "Kawl an am-byoo-luns, eye need uh dok-ter im-mee-dee-it-lee." },
      hi: { text: "एंबुलेंस बुलाइए, मुझे तुरंत डॉक्टर की ज़रूरत है।", romanized: "Ambulance bulaiye, mujhe turant doctor ki zaroorat hai." },
      ar: { text: "اتصل بالإسعاف، أحتاج إلى طبيب فوراً.", romanized: "Ittasil bil-is'af, ahtaju ila tabeebin fawran." },
      fr: { text: "Appelez une ambulance, j'ai besoin d'un médecin immédiatement.", romanized: "Ah-play oon ahm-byoo-lahnss, zhay buh-zwan duhn mayd-san." },
      es: { text: "Llame una ambulancia, necesito un médico.", romanized: "Yah-meh oo-nah ahm-boo-lahn-syah, neh-seh-see-toh oon meh-dee-koh." },
      de: { text: "Rufen Sie einen Krankenwagen, ich brauche sofort einen Arzt.", romanized: "Roo-fen Zee eye-nen Krahng-ken-vah-gen, ikh brow-khuh zoh-fort eye-nen Ahrts-t." },
    },
  },

  // ==========================================
  // 17. USEFUL QUESTIONS
  // ==========================================
  {
    id: "quest-1",
    category: "Useful Questions",
    level: "Beginner",
    type: "phrase",
    translations: {
      en: { text: "What is this?", romanized: "Wut iz dhis?" },
      hi: { text: "यह क्या है?", romanized: "Yeh kya hai?" },
      ar: { text: "ما هذا؟", romanized: "Ma hadha?" },
      fr: { text: "Qu'est-ce que c'est ?", romanized: "Kess kuh say ?" },
      es: { text: "¿Qué es esto?", romanized: "¿Keh es es-toh?" },
      de: { text: "Was ist das?", romanized: "Vahs ist dahs?" },
    },
    example: {
      en: { text: "Can you tell me what is this?", romanized: "Kan yoo tell mee wut iz dhis?" },
      hi: { text: "क्या आप मुझे बता सकते हैं कि यह क्या है?", romanized: "Kya aap mujhe bata sakte hain ki yeh kya hai?" },
      ar: { text: "هل يمكنك إخباري ما هذا؟", romanized: "Hal yumkinuka ikhbari ma hadha?" },
      fr: { text: "Pouvez-vous me dire qu'est-ce que c'est ?", romanized: "Poo-vay voo muh deer kess kuh say ?" },
      es: { text: "¿Puede decirme qué es esto?", romanized: "¿Pweh-deh deh-seer-meh keh es es-toh?" },
      de: { text: "Können Sie mir sagen, was das ist?", romanized: "Ker-nen Zee meer zah-gen, vahs dahs ist?" },
    },
  },
  {
    id: "quest-2",
    category: "Useful Questions",
    level: "Elementary",
    type: "phrase",
    translations: {
      en: { text: "Could you repeat that, please?", romanized: "Kood yoo ree-peet dhat, pleez?" },
      hi: { text: "क्या आप कृपया दोहरा सकते हैं?", romanized: "Kya aap kripya dohra sakte hain?" },
      ar: { text: "هل يمكنك تكرار ذلك من فضلك؟", romanized: "Hal yumkinuka tikraru dhalika min fadlik?" },
      fr: { text: "Pourriez-vous répéter, s'il vous plaît ?", romanized: "Poo-ryay voo ray-pay-tay, seel voo play ?" },
      es: { text: "¿Podría repetir eso, por favor?", romanized: "¿Poh-dree-ah reh-peh-teer eh-soh, por fah-vor?" },
      de: { text: "Könnten Sie das bitte wiederholen?", romanized: "Kern-ten Zee dahs bit-tuh vee-der-hoh-len?" },
    },
    example: {
      en: { text: "I did not hear clearly. Could you repeat that, please?", romanized: "Eye did not heer kleer-lee. Kood yoo ree-peet dhat, pleez?" },
      hi: { text: "मैंने साफ नहीं सुना। क्या आप कृपया दोहरा सकते हैं?", romanized: "Maine saaf nahin suna. Kya aap kripya dohra sakte hain?" },
      ar: { text: "لم أسمع بوضوح. هل يمكنك تكرار ذلك من فضلك؟", romanized: "Lam asma' bi-wudooh. Hal yumkinuka tikraru dhalika min fadlik?" },
      fr: { text: "Je n'ai pas bien entendu. Pourriez-vous répéter, s'il vous plaît ?", romanized: "Zhuh nay pah byan ahn-tahn-doo. Poo-ryay voo ray-pay-tay ?" },
      es: { text: "No escuché bien. ¿Podría repetir eso, por favor?", romanized: "Noh es-koo-cheh byan. ¿Poh-dree-ah reh-peh-teer eh-soh ?" },
      de: { text: "Ich habe nicht gut gehört. Könnten Sie das bitte wiederholen?", romanized: "Ikh hah-buh nikht goot ge-hert. Kern-ten Zee dahs bit-tuh vee-der-hoh-len?" },
    },
  },
  {
    id: "quest-3",
    category: "Useful Questions",
    level: "Intermediate",
    type: "phrase",
    translations: {
      en: { text: "How do you pronounce this word?", romanized: "How doo yoo proh-nowns dhis werd?" },
      hi: { text: "इस शब्द का उच्चारण कैसे करते हैं?", romanized: "Is shabd ka uccharan kaise karte hain?" },
      ar: { text: "كيف تنطق هذه الكلمة؟", romanized: "Kaifa tantiqu hadhihi al-kalimah?" },
      fr: { text: "Comment prononcez-vous ce mot ?", romanized: "Koh-mahn proh-nohn-say voo suh moh ?" },
      es: { text: "¿Cómo se pronuncia esta palabra?", romanized: "¿Koh-moh seh proh-noon-syah es-tah pah-lah-brah?" },
      de: { text: "Wie spricht man dieses Wort aus?", romanized: "Vee shprikht mahn dee-zes Vort ows?" },
    },
    example: {
      en: { text: "Can you help me? How do you pronounce this word?", romanized: "Kan yoo help mee? How doo yoo proh-nowns dhis werd?" },
      hi: { text: "क्या आप मेरी मदद कर सकते हैं? इस शब्द का उच्चारण कैसे करते हैं?", romanized: "Kya aap meri madad kar sakte hain? Is shabd ka uccharan kaise karte hain?" },
      ar: { text: "هل يمكنك مساعدتي؟ كيف تنطق هذه الكلمة؟", romanized: "Hal yumkinuka musa'adatee? Kaifa tantiqu hadhihi al-kalimah?" },
      fr: { text: "Pouvez-vous m'aider ? Comment prononcez-vous ce mot ?", romanized: "Poo-vay voo may-day ? Koh-mahn proh-nohn-say voo suh moh ?" },
      es: { text: "¿Puede ayudarme? ¿Cómo se pronuncia esta palabra?", romanized: "¿Pweh-deh ah-yoo-dar-meh? ¿Koh-moh seh proh-noon-syah es-tah pah-lah-brah?" },
      de: { text: "Können Sie mir helfen? Wie spricht man dieses Wort aus?", romanized: "Ker-nen Zee meer hel-fen? Vee shprikht mahn dee-zes Vort ows?" },
    },
  },
];

/**
 * Filter and query helper for Basic Words Curriculum
 */
export function filterBasicWords(
  items: BasicWordItem[],
  params: {
    category?: string;
    level?: string;
    type?: string;
    query?: string;
    targetLangCode?: string;
    sourceLangCode?: string;
  }
): BasicWordItem[] {
  const { category, level, type, query, targetLangCode = "en", sourceLangCode = "hi" } = params;

  return items.filter((item) => {
    // 1. Category Filter
    if (category && category !== "All" && item.category !== category) {
      return false;
    }

    // 2. Level Filter
    if (level && level !== "All" && item.level !== level) {
      return false;
    }

    // 3. Type Filter (word vs phrase)
    if (type && type !== "All" && item.type !== type) {
      return false;
    }

    // 4. Text Search
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      const targetText = item.translations[targetLangCode]?.text?.toLowerCase() || "";
      const targetRoman = item.translations[targetLangCode]?.romanized?.toLowerCase() || "";
      const sourceText = item.translations[sourceLangCode]?.text?.toLowerCase() || "";
      const sourceRoman = item.translations[sourceLangCode]?.romanized?.toLowerCase() || "";
      const englishText = item.translations.en?.text?.toLowerCase() || "";

      const match =
        targetText.includes(q) ||
        targetRoman.includes(q) ||
        sourceText.includes(q) ||
        sourceRoman.includes(q) ||
        englishText.includes(q);

      if (!match) return false;
    }

    return true;
  });
}
