/**
 * What is specific to the nine language and access topics that have no register data of their own: how the service or
 * format works, what the official pages say, and what to ask. Written from the official pages named in `sources`, in our
 * own words, and checked on 15 October 2026. This is what makes these pages worth indexing (languageShellEditorial in
 * index.js supplies the shared guidance underneath).
 *
 * Keep to what the sources say. When a source gives a number or a service area, say it as the source does, and say where
 * it stops (for example, the Northern Territory service covers Northern Territory languages only).
 */
const NDIS_INTERPRETING = {
  label: 'NDIS: how providers access interpreting services for participants',
  href: 'https://www.ndis.gov.au/providers/working-provider/provider-responsibilities/how-access-interpreting-services-participants',
};
const NDIS_LANGUAGES = { label: 'NDIS: information in other languages', href: 'https://www.ndis.gov.au/languages' };
const TIS = { label: 'TIS National (Translating and Interpreting Service)', href: 'https://www.tisnational.gov.au/' };
const NAATI = { label: 'NAATI: find a credentialed translator or interpreter', href: 'https://directory.naati.com.au/' };
const AIS = { label: 'Northern Territory Aboriginal Interpreter Service', href: 'https://nt.gov.au/community/interpreting-and-translating-services/aboriginal-interpreter-service' };

export const LANGUAGE_SPECIFICS = {
  'tis-national-bookings': {
    heading: 'How TIS National bookings work for NDIS supports',
    about: [
      'TIS National is the Translating and Interpreting Service, run by the Department of Home Affairs. It provides interpreters for people who do not speak English and for the agencies, businesses and providers that need to communicate with them.',
      'The NDIA has a partnership with TIS National so that registered NDIS providers can book funded interpreting for participants. TIS National has interpreters in more than 150 languages. An unregistered provider can use the service too, but pays for it itself.',
    ],
    stepsHeading: 'How a booking works',
    steps: [
      'The provider registers for a TIS National client code online. Under the NDIS arrangement it chooses the Commonwealth Government Agency category, the National Disability Insurance Agency subcategory and the section name NDIS, and waits for the welcome email before booking.',
      'For immediate phone interpreting, call 131 450 from within Australia. It runs 24 hours a day, 7 days a week.',
      'Pre-booked phone, on-site and video remote interpreting are booked online through TIS Online. Bookings can be accepted up to 90 days ahead, and TIS National suggests booking at least a week in advance.',
      'Have the details ready: the client code, the language, the participant’s NDIS number and postcode, and the relevant support category.',
      'A booking made for an NDIS participant automatically asks for an interpreter who holds an NDIS Worker Screening Check.',
      'To cancel, use TIS Online with at least 24 hours’ notice. Without that, cancellation charges can apply.',
      'A participant can ask for a specific interpreter. TIS National may agree where it keeps quality and continuity of care, benefits the participant, or the interpreter has worked with the participant before.',
    ],
    forFamilies: 'As a participant or family member you do not normally book TIS National yourself under this arrangement: the NDIS says it is the provider’s responsibility to offer interpreting. Ask the provider before you start whether it will book an interpreter for the first meeting and for going through the service agreement.',
    sources: [NDIS_INTERPRETING, TIS, NDIS_LANGUAGES],
  },

  'deafblind-interpreters': {
    heading: 'Interpreting for people who are deafblind',
    about: [
      'People who are deafblind communicate in different ways depending on how much they can see and hear. Organisations that provide deafblind interpreting describe two main methods: tactile interpreting, where the person feels the signs with their hands, and adapted visual signing for someone with some vision.',
      'Not every Auslan interpreter has experience working with people who are deafblind. Deafblind Information Australia notes that the person has the right to choose which qualified interpreter works with them.',
      'The NDIS says Auslan interpretation funding can be included in a participant’s plan. Ask the planner or support coordinator how interpreting for a person who is deafblind will be written into the plan.',
    ],
    stepsHeading: 'What to arrange',
    steps: [
      'Say early that the person is deafblind and how they communicate, so the right interpreter is booked.',
      'Ask for an interpreter with deafblind experience, not just Auslan qualifications, and ask whether the same interpreter can attend again for continuity.',
      'Allow extra time and ask whether breaks or a second interpreter are needed for longer appointments, because interpreting by touch is tiring.',
      'Do not rely on family or friends in place of a professional interpreter for important appointments.',
      'Confirm before the appointment who is paying for the interpreter: the plan, the provider or another service.',
    ],
    forFamilies: 'A deafblind organisation can give advice and referrals as well as information about services in your area.',
    sources: [
      { label: 'NDIS: how providers access interpreting services for participants (includes the Auslan funding note)', href: NDIS_INTERPRETING.href },
      { label: 'Deafblind Information Australia', href: 'https://www.deafblindinformation.org.au/' },
      NDIS_LANGUAGES,
    ],
  },

  'easy-read-materials': {
    heading: 'Easy Read information',
    about: [
      'Easy Read is a way of presenting information so more people can understand it. It uses short, plain sentences with pictures that support the words and a simple layout. It is often used for people with an intellectual disability or low literacy, and for people who read English as a second language.',
      'The NDIS publishes Easy Read versions of many of its factsheets alongside the standard versions, in PDF and Word formats, and some also come in Braille. Titles include How the NDIS can help, Community connections, Confirming your identity and Understanding consent.',
    ],
    stepsHeading: 'Getting and using Easy Read',
    steps: [
      'Look for the Easy Read version of a factsheet on the NDIS booklets and factsheets page, or ask for a printed copy by calling 1800 800 110 or at an NDIS office.',
      'Ask a provider for its service agreement, schedule and complaints information in Easy Read, or ask for it to be explained in person. Ask before you sign, not after.',
      'Treat Easy Read as a summary. For an important decision, ask for the full document to be explained as well.',
      'Check the date on the page: official information changes and an Easy Read copy can be older than the standard version.',
      'Ask someone you trust to read it with you if that helps.',
    ],
    forFamilies: 'Easy Read helps with reading, not with deciding. The person should still be given time and the chance to ask questions.',
    sources: [
      { label: 'NDIS: booklets and factsheets, with Easy Read and Braille versions', href: 'https://www.ndis.gov.au/publications/booklets-and-factsheets' },
      NDIS_LANGUAGES,
    ],
  },

  'translated-documents': {
    heading: 'Translated information and documents',
    about: [
      'The NDIS publishes information in a number of languages other than English, and in Auslan. When this page was checked, its Languages page listed Arabic, Assyrian, Burmese, Chinese (simplified and traditional), Dari, Dinka, Farsi, Hakha Chin, Hazaragi, Karen, Khmer, Korean, Nepali, Somali, Swahili and Vietnamese. It also says that anyone who needs help contacting the NDIS can call the Translating and Interpreting Service on 131 450.',
      'Translating a document is different from interpreting a conversation. TIS National runs a Free Translating Service for people settling permanently in Australia and for some temporary or provisional visa holders, who can have up to 10 personal documents translated if they are eligible.',
    ],
    stepsHeading: 'Choosing what you need',
    steps: [
      'Check the NDIS Languages page first: official information may already exist in the person’s language.',
      'For a meeting or phone call, ask for an interpreter rather than a translated document.',
      'For a personal document, such as a certificate, check whether the person is eligible for the TIS National Free Translating Service.',
      'When others will rely on a translation, ask whether the translator holds a NAATI credential, and use the NAATI directory to find one.',
      'Ask a provider for its service agreement in the person’s language, or to have it explained by an interpreter, before it is signed.',
    ],
    forFamilies: 'Do not sign a document you cannot read. Ask for it to be explained first.',
    sources: [NDIS_LANGUAGES, TIS, NAATI],
  },

  amharic: {
    heading: 'Finding support in Amharic',
    about: [
      'Amharic (አማርኛ) is the working language of Ethiopia and is written in the Ge’ez, or Ethiopic, script. Translated documents therefore need a translator who can produce the Ethiopic script, and the person may prefer to hear information rather than read it.',
      'When it was checked, the NDIS Languages page, which lists the languages the NDIS has translated information in, did not include Amharic. TIS National has interpreters in more than 150 languages, so ask for an Amharic interpreter when one is booked.',
    ],
    stepsHeading: 'What to confirm',
    steps: [
      'Confirm the person’s preferred language. Several languages are spoken in Ethiopia, and some people prefer one other than Amharic, such as Oromo or Tigrinya.',
      'Ask the provider to book an interpreter for the first meeting and for going through the service agreement, rather than relying on a worker or family member.',
      'Ask whether key documents can be explained by an interpreter, because translated versions may not exist.',
      'If a written translation is needed, ask whether the translator holds a NAATI credential.',
    ],
    forFamilies: 'A worker who speaks Amharic is helpful for everyday conversation. An interpreter is still the right choice for health, funding and consent discussions.',
    sources: [NDIS_LANGUAGES, TIS, NAATI],
  },

  'aboriginal-torres-strait-islander-services': {
    heading: 'Interpreting and cultural safety: First Nations',
    about: [
      'This page is about services and supports for Aboriginal and Torres Strait Islander people, not a single language. Aboriginal and Torres Strait Islander peoples speak many languages, and for some people English is not the first language.',
      'For Northern Territory Aboriginal languages, the NDIS names the Northern Territory Aboriginal Interpreter Service. Registered providers can use it for participants, and a participant does not have to live in the Northern Territory for it to be used. It covers Northern Territory languages only.',
      'Arrangements for languages in other states vary. Ask the NDIA, a support coordinator, or a local Aboriginal community-controlled organisation what is available where the person lives.',
    ],
    stepsHeading: 'What to ask',
    steps: [
      'Ask which language or variety the person speaks, and who in the community they would want involved.',
      'Ask the provider how it works with the person’s community, kinship and connection to Country, rather than assuming.',
      'Ask whether an Aboriginal community-controlled organisation or an Aboriginal health service can be involved in planning.',
      'Do not assume a family member should interpret. There may be cultural reasons, as well as privacy ones, to use an independent interpreter.',
    ],
    forFamilies: 'You can ask for an interpreter for any meeting about a plan, a service agreement or a decision, not only the first one.',
    sources: [NDIS_INTERPRETING, AIS],
  },

  kriol: {
    heading: 'Kriol and interpreting',
    about: [
      'Kriol is an Aboriginal language that grew out of contact between English and Aboriginal languages. AIATSIS describes three main varieties: one in the Kimberley in Western Australia, one in the Northern Territory around the Roper River, and one in Cape York in Queensland. Speakers may see the varieties as quite different.',
      'Kriol is a language in its own right. Many of its words look like English but differ in meaning and grammar, so a conversation in English can miss what the person means, even when it seems to be going well.',
      'In the Northern Territory, the NDIS names the Northern Territory Aboriginal Interpreter Service for Northern Territory Aboriginal languages. Ask it whether it can provide the variety the person speaks.',
    ],
    stepsHeading: 'What to confirm',
    steps: [
      'Ask which community the person is from and which variety they speak.',
      'Ask for an interpreter for meetings about plans, agreements and health, even when the person seems to follow English.',
      'Check that the provider will book the interpreter and how it will be paid for.',
      'Allow extra time and avoid yes or no questions where the person may agree just to be polite.',
    ],
    forFamilies: 'Outside the Northern Territory, ask the NDIA or a local Aboriginal community-controlled organisation what interpreting is available.',
    sources: [
      { label: 'AIATSIS: Kriol', href: 'https://collection.aiatsis.gov.au/node/1509780' },
      AIS,
      NDIS_INTERPRETING,
    ],
  },

  'yolngu-matha': {
    heading: 'Yolngu Matha and interpreting',
    about: [
      'Yolŋu Matha is a group of related languages spoken in north-east Arnhem Land in the Northern Territory. Varieties are tied to clans, and many Yolŋu people speak several of them, so it is worth asking which variety a person uses rather than treating it as one language.',
      'The NDIS names the Northern Territory Aboriginal Interpreter Service for Northern Territory Aboriginal languages. Registered providers can use it for participants, and a participant does not need to live in the Northern Territory.',
    ],
    stepsHeading: 'What to confirm',
    steps: [
      'Ask which Yolŋu Matha variety the person uses, and whether they speak more than one.',
      'Ask the interpreter service whether it can provide that variety, and book ahead where you can.',
      'Ask for an interpreter for meetings about plans, service agreements and health, even when the person speaks everyday English well.',
      'Check who is booking and paying for the interpreter before the meeting.',
    ],
    forFamilies: 'You can ask for an interpreter for any important conversation, not only the first one.',
    sources: [
      { label: 'AIATSIS AUSTLANG: Yolŋu Matha', href: 'https://collection.aiatsis.gov.au/austlang/language/n230' },
      AIS,
      NDIS_INTERPRETING,
    ],
  },

  pitjantjatjara: {
    heading: 'Pitjantjatjara and interpreting',
    about: [
      'Pitjantjatjara is spoken in north-west South Australia, including the APY Lands, as well as in the south-west of the Northern Territory and parts of Western Australia. The South Australian Government says almost 90% of the APY population speaks Pitjantjatjara or Yankunytjatjara.',
      'The NDIS names the Northern Territory Aboriginal Interpreter Service for Northern Territory Aboriginal languages. It covers Northern Territory languages only, so for a person in South Australia or Western Australia ask the NDIA, a support coordinator or a local Aboriginal community-controlled organisation which interpreting is available.',
    ],
    stepsHeading: 'What to confirm',
    steps: [
      'Confirm whether the person speaks Pitjantjatjara, Yankunytjatjara or both, and which communities they are connected with.',
      'Ask for an interpreter for meetings about plans, service agreements and health.',
      'Ask the provider how it will arrange the interpreter where the person lives, and who pays.',
      'Allow time for travel and for remote communication, such as phone or video, if the person is in a remote community.',
    ],
    forFamilies: 'Do not assume a family member should interpret for sensitive matters.',
    sources: [
      { label: 'South Australian Government: the APY community', href: 'https://www.landscape.sa.gov.au/aw/visiting/communities' },
      AIS,
      NDIS_INTERPRETING,
    ],
  },
};

export const hasLanguageSpecifics = (slug) => Object.prototype.hasOwnProperty.call(LANGUAGE_SPECIFICS, slug);
