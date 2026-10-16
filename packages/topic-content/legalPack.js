/**
 * The SolDirectory legal and policy pack: twelve pages, in the order the owner's document gives them.
 * Source of truth: "SolDirectory Legal and Policy Pages" (15 October 2026), generated from that document and kept
 * as data so the web pages and, once reviewed, the crawler HTML read the same words.
 *
 * Block shapes: { t: 'p', text } | { t: 'ul', items: (string | { text, only?, unless? })[] } |
 * { t: 'table', head, rows } | { t: 'note', text }. A block or list item with `only: 'flag'` is shown when that flag
 * in LEGAL_PRACTICES is true, `unless: 'flag'` when it is false. Text uses **bold** for lead-ins.
 *
 * `meets` names the laws each page is written to meet, for whoever reviews it.
 */

/**
 * Statements in the pack that depend on how the service is actually run, which code cannot establish. Each is false
 * until the owner has confirmed it; the pack's wording applies when true and a more cautious wording when false.
 *  - australiaOnly: personal information is stored and processed only in Australia and sent nowhere overseas.
 *    The code calls Mapbox (address search) and Twilio (SMS), so this is false unless those are replaced or confirmed.
 *  - adminTwoFactor: administrators must use two-factor sign-in. Built (authenticator app, /security). It is only
 *    required of administrators once ADMIN_REQUIRE_2FA=true is set on the server; set this true after that.
 */
export const LEGAL_PRACTICES = {
  australiaOnly: false,
  adminTwoFactor: false,
};

export const LEGAL_PACK = [
  {
    "slug": "collection-notice",
    "n": 1,
    "title": "Collection notice",
    "meets": "Australian Privacy Principle 5 (notification of collection), APP 3.3 (consent for sensitive information), APP 8 (cross-border disclosure: none). Shown on the Get matched form immediately before the contact details step, with a link to the full privacy policy.",
    "updated": "16 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**How we use your details**"
          },
          {
            "t": "p",
            "text": "**Who we are.**  SolDirectory is run by Sol Business Consultant Pty Ltd (ABN 20 662 022 522), 97 John St, Glenroy VIC 3046. Contact us on 0460 003 494 or directory@solbusinessconsultant.com.au."
          },
          {
            "t": "p",
            "text": "**What we’re collecting and why.**  We collect the details in this form to match your request with providers who may be able to help you, to let them contact you, and to let you track and close your request. The support you need, and anything you add, may be sensitive information about disability or health. We only collect it with your consent."
          },
          {
            "t": "p",
            "text": "**If someone else is filling this in.**  If you’re sending this request for another person, we’re collecting their information from you. Please only do this with their permission, or as their nominee, guardian or authorised representative, and let them know about this notice."
          },
          {
            "t": "p",
            "text": "**Who we share it with.**"
          },
          {
            "t": "ul",
            "items": [
              "Up to 10 matched providers see a summary of your request: the support, suburb, funding type and timing. They don’t see your name or contact details.",
              "Up to 3 of those providers can choose to see your name, email, phone and any extra details you add, so they can contact you about this request only.",
              "Companies that help us run the service (hosting, email, SMS and address search) see information only as needed to do that work."
            ]
          },
          {
            "t": "p",
            "text": "**Kept in Australia.**  We store and process your information in Australia. We don’t send it overseas.",
            "only": "australiaOnly"
          },
          {
            "t": "p",
            "text": "**Where it’s handled.**  Some of the companies that help us run the service, such as for address search and text messages, may handle information outside Australia. Our privacy policy has the details.",
            "unless": "australiaOnly"
          },
          {
            "t": "p",
            "text": "**If you don’t give us these details.**  We can’t match your request or let providers contact you. You can still search the directory without giving us any details."
          },
          {
            "t": "p",
            "text": "**Your choices.**  You can see which providers viewed your details, close your request, or ask us to delete your details at any time using the link in your confirmation email. Our privacy policy explains how to access or correct your information and how to complain, including to the Office of the Australian Information Commissioner."
          },
          {
            "t": "p",
            "text": "**Consent checkboxes (unticked by default)**"
          },
          {
            "t": "ul",
            "items": [
              "☐ **Required:**  I agree to SolDirectory collecting the information in this form, including sensitive information, and sharing a summary of it with up to 10 matched providers, and my name and contact details with up to 3 of them, so they can contact me about this request.",
              "☐ **Required if sending for someone else:**  I have the permission of the person this request is for, or I’m their nominee, guardian or authorised representative.",
              "☐ **Optional:**  Send me occasional updates and guides from SolDirectory by email. I can unsubscribe at any time."
            ]
          }
        ]
      }
    ]
  },
  {
    "slug": "privacy",
    "n": 2,
    "title": "Privacy policy",
    "meets": "Privacy Act 1988 (Cth) and all 13 Australian Privacy Principles, including APP 1.4 (policy content), APP 1.7 to 1.9 (automated decisions, in force from 10 December 2026), the Notifiable Data Breaches scheme, and the Spam Act 2003 (Cth) for electronic marketing.",
    "updated": "16 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**SolDirectory privacy policy**"
          }
        ]
      },
      {
        "heading": "2.1 About this policy",
        "blocks": [
          {
            "t": "p",
            "text": "SolDirectory is an online directory and referral service that helps people find disability and aged care providers. It is operated by Sol Business Consultant Pty Ltd (ABN 20 662 022 522) of 97 John St, Glenroy VIC 3046 (“we”, “us”, “our”)."
          },
          {
            "t": "p",
            "text": "This policy explains how we handle personal information under the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). It applies to everyone whose information we handle through SolDirectory: participants, families, carers, nominees and guardians; support coordinators and plan managers; providers and independent workers; and visitors to our website."
          },
          {
            "t": "p",
            "text": "Because we collect sensitive information and provide access to personal information as part of our service, we comply with the APPs regardless of our turnover."
          }
        ]
      },
      {
        "heading": "2.2 The kinds of personal information we collect and hold",
        "blocks": [
          {
            "t": "p",
            "text": "**When you send a request (Get matched):**"
          },
          {
            "t": "ul",
            "items": [
              "your name, email address and, if you choose, phone number",
              "the suburb or postcode where support is needed",
              "who the support is for (yourself, a family member or friend, or a client)",
              "the support you need, your funding type (for example NDIS, aged care, DVA or private) and how an NDIS plan is managed",
              "when you’d like support to start and approximately how many hours a week",
              "preferences you choose to share, such as language, worker gender or cultural needs",
              "anything you add in the free-text field"
            ]
          },
          {
            "t": "p",
            "text": "Some of this is **sensitive information**  under the Privacy Act, because it can reveal information about a person’s health or disability."
          },
          {
            "t": "p",
            "text": "**If you’re a support coordinator or plan manager:**  your name, organisation, role, email and phone number, and the requests you send on behalf of participants."
          },
          {
            "t": "p",
            "text": "**If you’re a provider:**  the names, roles, email addresses and phone numbers of your staff who use SolDirectory; your business details including ABN and registration details; service areas and capacity; billing contact details; and any documents you upload."
          },
          {
            "t": "p",
            "text": "**If you’re an independent worker:**  your name, contact details, suburb, the supports you offer, availability, languages, indicative rate, experience, ABN (if you have one), and the checks you declare, such as an NDIS Worker Screening Check, Working with Children Check, first aid certificate or insurance, including expiry dates and the evidence you upload."
          },
          {
            "t": "p",
            "text": "**When you contact us:**  your name, contact details and what you tell us."
          },
          {
            "t": "p",
            "text": "**When you pay:**  billing name and address. Card details are collected and stored by our payment processor, Stripe, not by us."
          },
          {
            "t": "p",
            "text": "**When you use our website:**  your IP address, device and browser type, pages visited, and the date and time of your visit, collected through cookies and similar technologies (see our cookie notice)."
          },
          {
            "t": "p",
            "text": "**From public registers:**  business names, registration details, registration groups and locations published on the NDIS Quality and Safeguards Commission’s NDIS Provider Register and on My Aged Care. Where a sole trader is registered under their own name, that name appears in our listings."
          },
          {
            "t": "p",
            "text": "We don’t collect government identifiers such as Medicare or NDIS numbers, and we don’t adopt any government identifier as our own identifier for you."
          }
        ]
      },
      {
        "heading": "2.3 How we collect personal information",
        "blocks": [
          {
            "t": "p",
            "text": "We collect personal information:"
          },
          {
            "t": "ul",
            "items": [
              "directly from you, through our forms, accounts, emails and phone calls",
              "from someone acting for you, such as a family member, nominee, guardian or support coordinator who confirms they have your permission or authority",
              "from public registers (the NDIS Provider Register and My Aged Care)",
              "automatically, when you use our website"
            ]
          },
          {
            "t": "p",
            "text": "If we receive personal information we didn’t ask for and couldn’t have collected under this policy, we’ll destroy or de-identify it as soon as practicable, where lawful and reasonable to do so."
          }
        ]
      },
      {
        "heading": "2.4 Anonymity and pseudonymity",
        "blocks": [
          {
            "t": "p",
            "text": "You can search the directory and read our guides without telling us who you are. To send a request, we need a name and a way for providers to contact you; you can use a first name only if you prefer."
          }
        ]
      },
      {
        "heading": "2.5 Why we collect, hold, use and disclose personal information",
        "blocks": [
          {
            "t": "p",
            "text": "We use personal information to:"
          },
          {
            "t": "ul",
            "items": [
              "match your request with suitable providers and let up to 3 of them contact you",
              "let you track, close or delete your request, and ask whether you found support",
              "create and manage accounts for coordinators, providers and workers",
              "verify providers and workers, including checking ABNs and register information",
              "keep listings accurate, including importing public register updates",
              "process subscriptions and payments, and issue tax invoices",
              "answer enquiries, handle complaints and respond to privacy requests",
              "send you service messages about your request or account",
              "send you updates and guides, if you’ve asked us to",
              "keep our service secure, prevent misuse and investigate breaches of our terms",
              "improve our service, using de-identified information where possible",
              "meet our legal obligations"
            ]
          },
          {
            "t": "p",
            "text": "We collect sensitive information only with your consent, or where the law otherwise allows it. We use and disclose personal information only for the purpose we collected it, a related purpose you’d reasonably expect (or, for sensitive information, a directly related purpose), with your consent, or where the law requires or permits it."
          }
        ]
      },
      {
        "heading": "2.6 Who we disclose personal information to",
        "blocks": [
          {
            "t": "p",
            "text": "**Providers.**  When you send a request:"
          },
          {
            "t": "ul",
            "items": [
              "up to 10 matched providers receive a summary: the support, suburb, funding type, timing and hours. It doesn’t include your name or contact details.",
              "up to 3 of those providers can choose to see your name, email, phone and free-text details, so they can contact you about your request."
            ]
          },
          {
            "t": "p",
            "text": "Every provider agrees in our provider agreement to use these details only to respond to your request, not to use them for marketing, not to pass them to anyone else, and to handle them in line with the Privacy Act. You can see which providers viewed your details in your request tracker."
          },
          {
            "t": "p",
            "text": "**Organisations contacting workers.**  An independent worker’s contact details are shared with an organisation only after the worker accepts that organisation’s contact request."
          },
          {
            "t": "p",
            "text": "**Service providers.**  We use other businesses to run SolDirectory: cloud hosting and database storage, email delivery, SMS delivery, address search and mapping, website analytics, and payment processing (Stripe). They handle personal information only to provide their services to us and must protect it."
          },
          {
            "t": "p",
            "text": "**Others.**  We may disclose personal information where you consent, to a person you’ve authorised to act for you, to our professional advisers (such as lawyers and accountants) under a duty of confidentiality, where required or authorised by law (for example, to a court, regulator or law enforcement agency), or where we reasonably believe it’s necessary to lessen or prevent a serious threat to someone’s life, health or safety."
          },
          {
            "t": "p",
            "text": "**We don’t sell personal information.**  Providers pay us a subscription that includes access to requests matching their services, within the limits above. They can’t buy personal information outside that process, and we never sell or rent lists of participants, families, coordinators or workers."
          }
        ]
      },
      {
        "heading": "2.7 Disclosure overseas",
        "blocks": [
          {
            "t": "p",
            "text": "We store and process personal information in Australia only. Our database, file storage, email, SMS, address search and analytics services are hosted in Australia, and only staff located in Australia can access personal information. We don’t disclose personal information to anyone overseas.",
            "only": "australiaOnly"
          },
          {
            "t": "p",
            "text": "We use some service providers that may handle personal information outside Australia. They include the services we use for address search and mapping and for text messages. We take reasonable steps to make sure they handle personal information consistently with the Australian Privacy Principles. Our current list of service providers and where they operate is available on request.",
            "unless": "australiaOnly"
          },
          {
            "t": "p",
            "text": "Card payments are collected directly by our payment processor, Stripe, under Stripe’s own privacy policy. We don’t store card details."
          },
          {
            "t": "p",
            "text": "If this ever changes, we’ll update this policy before any personal information leaves Australia, name the countries involved, and take reasonable steps to make sure the recipient handles it consistently with the APPs. Our current list of service providers and their locations is available on request.",
            "only": "australiaOnly"
          }
        ]
      },
      {
        "heading": "2.8 Automated matching",
        "blocks": [
          {
            "t": "p",
            "text": "We use a computer program to decide which providers receive a summary of your request. The program uses these kinds of personal information: the support you need, your suburb, your funding type and plan management type, and your timing. It compares them with providers’ supports, service areas, accepted funding, registration status and whether they’ve confirmed capacity this week."
          },
          {
            "t": "p",
            "text": "The program decides, without a person being involved, which providers are notified of your request. It doesn’t decide whether you receive support, or which provider you choose; you make that decision. We don’t use your personal information to rank providers. You can ask us for a person to review how your request was matched by contacting our privacy officer."
          }
        ]
      },
      {
        "heading": "2.9 Direct marketing",
        "blocks": [
          {
            "t": "p",
            "text": "We send marketing emails, such as updates and guides, only if you’ve opted in, or where the Spam Act 2003 (Cth) otherwise allows it (for example, to a business email address that has been conspicuously published, about matters relevant to that business). Every marketing email identifies us and includes a working unsubscribe link, and we act on unsubscribe requests within 5 business days. Opting out of marketing doesn’t stop service messages about your request or account. We never use the details in a participant’s request to market to them, and we never disclose personal information to others for their direct marketing."
          }
        ]
      },
      {
        "heading": "2.10 How we hold and protect personal information",
        "blocks": [
          {
            "t": "p",
            "text": "We hold personal information electronically in secure cloud systems. We protect it by:"
          },
          {
            "t": "ul",
            "items": [
              "encrypting it in transit and at rest",
              "limiting staff access according to their role, and logging who views contact details",
              {
                "text": "requiring two-factor sign-in for our administrators",
                "only": "adminTwoFactor"
              },
              "keeping software up to date and monitoring for unusual activity",
              "requiring our service providers to protect it",
              "training staff on privacy and confidentiality"
            ]
          },
          {
            "t": "p",
            "text": "When we no longer need personal information for any purpose permitted by law, we take reasonable steps to destroy or de-identify it."
          }
        ]
      },
      {
        "heading": "2.11 How long we keep it",
        "blocks": [
          {
            "t": "table",
            "head": [
              "**Information**",
              "**How long we keep it**"
            ],
            "rows": [
              [
                "Unfinished requests (not submitted)",
                "Deleted automatically after 30 days"
              ],
              [
                "Submitted requests",
                "Kept while open; de-identified 12 months after they close"
              ],
              [
                "Consent records and logs of who viewed contact details",
                "7 years, so we can show how information was handled"
              ],
              [
                "Coordinator, provider and worker accounts",
                "While the account is open, then 2 years after it closes"
              ],
              [
                "Billing and tax records",
                "5 years, as required by tax law"
              ],
              [
                "Complaint records",
                "7 years after the complaint is closed"
              ],
              [
                "Worker check evidence",
                "While the profile is active; deleted when a check is replaced or the account closes"
              ]
            ]
          },
          {
            "t": "p",
            "text": "You can ask us to delete your information sooner (see section 2.12)."
          }
        ]
      },
      {
        "heading": "2.12 Accessing and correcting your information",
        "blocks": [
          {
            "t": "p",
            "text": "You can ask to see the personal information we hold about you, and ask us to correct it if it’s inaccurate, out of date, incomplete, irrelevant or misleading. You can also ask us to delete it."
          },
          {
            "t": "p",
            "text": "**How to ask.**  Email directory@solbusinessconsultant.com.au with “Privacy request” in the subject line and say whether you want access, a correction or deletion. Or phone 0460 003 494, or write to our Privacy Officer at 97 John St, Glenroy VIC 3046. We may need to confirm your identity first."
          },
          {
            "t": "p",
            "text": "**Who to contact.**  Our Privacy Officer, Safdar Hussain. Full contact details are in section 2.15."
          },
          {
            "t": "p",
            "text": "**When we’ll reply.**  We’ll respond within 30 days. We don’t charge for a request. If we refuse access or correction, we’ll tell you why in writing (unless that would be unreasonable) and how to complain. If we refuse a correction, you can ask us to attach a statement to your information saying you believe it’s incorrect."
          },
          {
            "t": "p",
            "text": "You can also close a request and see who viewed your details at any time from your request tracker."
          }
        ]
      },
      {
        "heading": "2.13 Keeping information accurate",
        "blocks": [
          {
            "t": "p",
            "text": "We take reasonable steps to keep personal information accurate, up to date and complete. Providers confirm their capacity weekly, register data is refreshed regularly, and you can update your own details at any time."
          }
        ]
      },
      {
        "heading": "2.14 Data breaches",
        "blocks": [
          {
            "t": "p",
            "text": "If we have reasonable grounds to believe an eligible data breach has happened (one likely to cause serious harm), we’ll notify the people affected and the Office of the Australian Information Commissioner as required by the Notifiable Data Breaches scheme, and tell you what steps to take."
          }
        ]
      },
      {
        "heading": "2.15 Questions and complaints",
        "blocks": [
          {
            "t": "p",
            "text": "Contact our privacy officer:"
          },
          {
            "t": "ul",
            "items": [
              "Safdar Hussain, Privacy Officer, SolDirectory",
              "Email: directory@solbusinessconsultant.com.au",
              "Phone: 0460 003 494",
              "Post: 97 John St, Glenroy VIC 3046"
            ]
          },
          {
            "t": "p",
            "text": "We’ll acknowledge a complaint within 2 business days and aim to resolve it within 30 days. If you’re not satisfied with our response, you can complain to the Office of the Australian Information Commissioner (OAIC):"
          },
          {
            "t": "ul",
            "items": [
              "Website: oaic.gov.au",
              "Phone: 1300 363 992"
            ]
          }
        ]
      },
      {
        "heading": "2.16 Children and people who need support to decide",
        "blocks": [
          {
            "t": "p",
            "text": "If the person needing support is under 18, or needs support to make decisions, a parent, guardian, nominee or other authorised representative should send the request and manage their information on their behalf."
          }
        ]
      },
      {
        "heading": "2.17 Changes to this policy",
        "blocks": [
          {
            "t": "p",
            "text": "We’ll update this policy when our practices change, and post the new version here with its date. If a change significantly affects how we handle your information, we’ll tell account holders by email."
          }
        ]
      }
    ]
  },
  {
    "slug": "cookies",
    "n": 3,
    "title": "Cookie notice",
    "meets": "APP 3, APP 5 and APP 6 as they apply to information collected through cookies and similar technologies.",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**Cookies and similar technologies**"
          },
          {
            "t": "p",
            "text": "Cookies are small files stored on your device. We use them, and similar technologies, as follows."
          },
          {
            "t": "table",
            "head": [
              "**Type**",
              "**What it does**",
              "**Can you turn it off?**"
            ],
            "rows": [
              [
                "Essential",
                "Keeps you signed in, remembers your progress in the Get matched form, protects against spam and misuse",
                "No, the site won’t work properly without them"
              ],
              [
                "Preferences",
                "Remembers choices such as your suburb or filters",
                "Yes, through your browser settings"
              ],
              [
                "Analytics",
                "Tells us how many people use each page so we can improve the site. We use privacy-friendly analytics settings that don’t identify you",
                "Yes, through the cookie banner or your browser"
              ]
            ]
          },
          {
            "t": "p",
            "text": "We don’t use advertising or tracking cookies on the Get matched form or request tracker, and we don’t share information about the support you’ve searched for with advertising networks."
          },
          {
            "t": "p",
            "text": "You can block or delete cookies in your browser settings. If you block essential cookies, some features, such as signing in or sending a request, may not work. For more about how we handle personal information, see our privacy policy."
          }
        ]
      }
    ]
  },
  {
    "slug": "terms",
    "n": 4,
    "title": "Terms of use",
    "meets": "Australian Consumer Law (Competition and Consumer Act 2010 (Cth), Schedule 2), including consumer guarantees, the ban on misleading conduct and the unfair contract terms regime; Electronic Transactions Act 1999 (Cth); Victorian law.",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**SolDirectory terms of use**"
          }
        ]
      },
      {
        "heading": "4.1 About these terms",
        "blocks": [
          {
            "t": "p",
            "text": "These terms apply to everyone who uses SolDirectory (the “service”), which is operated by Sol Business Consultant Pty Ltd (ABN 20 662 022 522), 97 John St, Glenroy VIC 3046 (“we”, “us”, “our”). By using the service, you agree to these terms. If you’re a provider or independent worker, the provider agreement or worker terms also apply to you."
          }
        ]
      },
      {
        "heading": "4.2 What SolDirectory is, and isn’t",
        "blocks": [
          {
            "t": "p",
            "text": "SolDirectory is a directory and referral service. It lets people search for disability and aged care providers, send a request to providers who may be able to help, and lets providers receive those requests."
          },
          {
            "t": "p",
            "text": "SolDirectory:"
          },
          {
            "t": "ul",
            "items": [
              "doesn’t provide care or support, employ or supervise workers, or act as anyone’s agent",
              "doesn’t recommend, endorse or guarantee any provider or worker",
              "isn’t part of, or endorsed by, the National Disability Insurance Agency, the NDIS Quality and Safeguards Commission, My Aged Care, the Department of Veterans’ Affairs or any government agency",
              "doesn’t make decisions about anyone’s plan, funding or eligibility",
              "isn’t an emergency or crisis service. If someone is in immediate danger, call 000"
            ]
          },
          {
            "t": "p",
            "text": "Any arrangement for support is made directly between you and the provider or worker, usually under a written service agreement."
          }
        ]
      },
      {
        "heading": "4.3 Your rights under the Australian Consumer Law",
        "blocks": [
          {
            "t": "p",
            "text": "Our services come with guarantees that can’t be excluded under the Australian Consumer Law. Nothing in these terms excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law or any other law that can’t lawfully be excluded."
          }
        ]
      },
      {
        "heading": "4.4 Listings and information on the service",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "**Member profiles**  are written and kept up to date by providers. Providers agree to keep them accurate, but we don’t check every statement.",
              "**Register listings**  reproduce information from the NDIS Provider Register and My Aged Care as at the import date shown on the page. They may not reflect recent changes.",
              "**Capacity:**  “Taking new people” means a member provider told us this week that it has capacity in that area. It isn’t a guarantee that it can start, or meet your needs.",
              "**Guides and articles**  are general information, not advice about your circumstances."
            ]
          },
          {
            "t": "p",
            "text": "Before you agree to receive support, check the provider’s registration (where required), worker screening, insurance, availability and full pricing directly with the provider, and read the service agreement."
          }
        ]
      },
      {
        "heading": "4.5 Using the service",
        "blocks": [
          {
            "t": "p",
            "text": "You agree to:"
          },
          {
            "t": "ul",
            "items": [
              "give accurate information, and only send a request for another person with their permission or authority",
              "keep your account login secure and tell us promptly if you think someone else has used it",
              "use the service lawfully and respectfully"
            ]
          },
          {
            "t": "p",
            "text": "You must not:"
          },
          {
            "t": "ul",
            "items": [
              "copy, scrape, harvest or download listings, requests or contact details in bulk, by automated means or otherwise",
              "use information from the service for any purpose other than the one it was shared for",
              "send false, misleading or spam requests, or impersonate anyone",
              "upload anything unlawful, harmful or that infringes someone else’s rights",
              "interfere with, overload or try to gain unauthorised access to the service"
            ]
          }
        ]
      },
      {
        "heading": "4.6 Accounts",
        "blocks": [
          {
            "t": "p",
            "text": "You may need an account to use some features. We may refuse, suspend or close an account under section 4.10. You can close your account at any time by contacting us."
          }
        ]
      },
      {
        "heading": "4.7 Fees",
        "blocks": [
          {
            "t": "p",
            "text": "Searching the directory and sending requests is free for participants, families, carers and support coordinators. Providers who choose a paid plan agree to the fees in the provider agreement."
          }
        ]
      },
      {
        "heading": "4.8 Intellectual property",
        "blocks": [
          {
            "t": "p",
            "text": "We own, or are licensed to use, the content, design, software and trade marks on the service, other than content supplied by providers, workers and public registers. You may view and print pages for your personal or internal business use. You must not reproduce or distribute our content for commercial purposes without our written permission. Register data is used under the licences described on our data sources page."
          }
        ]
      },
      {
        "heading": "4.9 Links to other websites",
        "blocks": [
          {
            "t": "p",
            "text": "The service links to websites we don’t control, such as provider websites and government registers. We aren’t responsible for their content or privacy practices."
          }
        ]
      },
      {
        "heading": "4.10 Suspension and removal",
        "blocks": [
          {
            "t": "p",
            "text": "We may suspend or remove an account, request or listing if we reasonably believe it breaches these terms, is misleading, is unlawful, or puts someone at risk. Where practicable and safe to do so, we’ll tell you why and give you a chance to respond first."
          }
        ]
      },
      {
        "heading": "4.11 Our liability",
        "blocks": [
          {
            "t": "p",
            "text": "Subject to section 4.3:"
          },
          {
            "t": "ul",
            "items": [
              "we aren’t liable for the acts, omissions, services or prices of any provider or worker, as we aren’t a party to your arrangement with them",
              "we take reasonable care to keep the service available and accurate, but we don’t guarantee it will be uninterrupted or error-free",
              "where our services aren’t of a kind ordinarily acquired for personal, domestic or household use, our liability for a failure to comply with a consumer guarantee is limited to supplying the services again or paying the cost of having them supplied again"
            ]
          }
        ]
      },
      {
        "heading": "4.12 Privacy",
        "blocks": [
          {
            "t": "p",
            "text": "Our privacy policy explains how we handle personal information and forms part of these terms."
          }
        ]
      },
      {
        "heading": "4.13 Complaints and disputes",
        "blocks": [
          {
            "t": "p",
            "text": "If you have a complaint, please contact us first. Our complaints policy explains how we handle it and the external bodies you can contact if you’re not satisfied."
          }
        ]
      },
      {
        "heading": "4.14 Changes to these terms",
        "blocks": [
          {
            "t": "p",
            "text": "We may change these terms to reflect changes in the law or our service. We’ll post the updated terms here with the new date. If a change significantly affects account holders, we’ll email them at least 14 days before it takes effect. If you don’t agree with a change, you can stop using the service and close your account."
          }
        ]
      },
      {
        "heading": "4.15 General",
        "blocks": [
          {
            "t": "p",
            "text": "If any part of these terms is invalid or unenforceable, it’s severed and the rest continues to apply. A failure to enforce a term isn’t a waiver. These terms are governed by the laws of Victoria, Australia, and you and we submit to the non-exclusive jurisdiction of the courts of Victoria."
          }
        ]
      },
      {
        "heading": "4.16 Contact",
        "blocks": [
          {
            "t": "p",
            "text": "directory@solbusinessconsultant.com.au · 0460 003 494 · 97 John St, Glenroy VIC 3046"
          }
        ]
      }
    ]
  },
  {
    "slug": "provider-agreement",
    "n": 5,
    "title": "Provider agreement",
    "meets": "Australian Consumer Law including the unfair contract terms regime for standard form small business contracts (penalties apply from 9 November 2023); Privacy Act 1988 (Cth); Spam Act 2003 (Cth); A New Tax System (Goods and Services Tax) Act 1999 (Cth); NDIS Act 2013 (Cth) and NDIS Code of Conduct as they apply to the provider.",
    "updated": "16 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**SolDirectory provider agreement**"
          }
        ]
      },
      {
        "heading": "5.1 Parties and acceptance",
        "blocks": [
          {
            "t": "p",
            "text": "This agreement is between Sol Business Consultant Pty Ltd (ABN 20 662 022 522), trading as SolDirectory (“we”, “us”), and the organisation or sole trader that claims or creates a provider profile (“you”). The person accepting it confirms they’re authorised to bind you. It applies together with our terms of use and privacy policy. If there’s any inconsistency, this agreement applies."
          }
        ]
      },
      {
        "heading": "5.2 Definitions",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "**Request:**  an enquiry for support sent through SolDirectory by a participant, family member, carer or support coordinator.",
              "**Brief:**  the summary of a request we send to matched providers, without the requester’s name or contact details.",
              "**Unlock:**  viewing the requester’s name, contact details and free-text details for a request.",
              "**Requester information:**  all personal information in a request, including information you see on unlocking.",
              "**Listed plan:**  our free plan. **Connect plan:**  our paid plan."
            ]
          }
        ]
      },
      {
        "heading": "5.3 Eligibility and verification",
        "blocks": [
          {
            "t": "p",
            "text": "You must be a genuine business that delivers, or is preparing to deliver, disability, aged care or related supports in Australia, with a valid ABN. We’ll verify your profile by checking your ABN against the Australian Business Register and at least one other proof, such as an email address on your business domain or a document. We can decline a profile we can’t verify."
          }
        ]
      },
      {
        "heading": "5.4 Your profile",
        "blocks": [
          {
            "t": "p",
            "text": "You agree to:"
          },
          {
            "t": "ul",
            "items": [
              "list only supports you actually deliver, service areas you genuinely cover and funding types you accept",
              "show your registration status accurately. Registration details come from the NDIS Provider Register and you can’t change them on SolDirectory",
              "not describe yourself as registered, approved or endorsed for anything you aren’t",
              "keep your intake email and phone monitored and your details current",
              "own or have permission to use any logos, photos and text you upload, and grant us a non-exclusive, royalty-free licence to display them on SolDirectory and in our marketing of SolDirectory while your profile is active"
            ]
          }
        ]
      },
      {
        "heading": "5.5 Weekly capacity check",
        "blocks": [
          {
            "t": "p",
            "text": "Each week we’ll ask whether you’re taking new people in each of your service areas. You’ll answer “yes” only if you could realistically start a new person in that area. If you don’t answer within the weekly cycle, you won’t receive briefs until you do. Your profile stays live."
          }
        ]
      },
      {
        "heading": "5.6 Requests and unlocks",
        "blocks": [
          {
            "t": "p",
            "text": "A request is an enquiry. It isn’t a booking, a confirmed client or an exclusive referral, and we don’t guarantee any number of requests, responses or new clients. Up to 3 providers can unlock each request. When you unlock a request, you agree to:"
          },
          {
            "t": "ul",
            "items": [
              "use the requester information only to respond to that request and, if the requester agrees, to arrange and deliver their supports",
              "contact the requester within one business day, including to tell them if you can’t help",
              "not add the requester to any marketing list, send them marketing, or contact them again after they decline or close the request, unless they ask you to",
              "not sell, share or disclose requester information to anyone else, except your staff who need it to respond, or as required by law",
              "not copy requester information out of SolDirectory in bulk"
            ]
          }
        ]
      },
      {
        "heading": "5.7 Privacy and data security",
        "blocks": [
          {
            "t": "p",
            "text": "You agree to:"
          },
          {
            "t": "ul",
            "items": [
              "comply with the Privacy Act 1988 (Cth) and the Australian Privacy Principles when handling requester information, whether or not the Act would otherwise apply to your business",
              "comply with your obligations under the NDIS Act 2013 (Cth), the NDIS Code of Conduct and, if you’re a registered provider, the NDIS Practice Standards",
              "keep requester information secure and limit access to staff who need it",
              "tell us within 72 hours if you become aware of any unauthorised access to, disclosure of or loss of requester information, and cooperate with us in responding",
              "destroy or de-identify requester information you no longer need, unless you’re required to keep it (for example, as a provider’s record of a service you deliver)"
            ]
          }
        ]
      },
      {
        "heading": "5.8 Plans, fees and GST",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "**Listed plan:**  free. Includes a verified profile, the weekly capacity check, email notification of matching briefs (summary only), and worker directory search.",
              "**Connect plan:**  $249 plus GST ($273.90 including GST) a month. Includes everything in Listed plus 15 unlocks a month, SMS alerts, 3 team seats and response-time reporting.",
              "**Founding member price:**  if you join as one of our first 100 founding members, your Connect plan is $149 plus GST ($163.90 including GST) a month for the first 12 months of your subscription, then our standard price.",
              "Fees are charged monthly in advance to your nominated card by our payment processor, Stripe, and your subscription renews automatically each month until cancelled.",
              "We’ll issue a tax invoice for each payment showing our ABN and the GST included.",
              "Unused unlocks don’t carry over to the next month.",
              "**Unlock credit:**  if a requester’s contact details are invalid, or the request duplicates one you’ve already unlocked, tell us within 14 days and we’ll restore the unlock.",
              "If a payment fails, we’ll retry it and email you. If it isn’t paid within 14 days, your plan moves to Listed and your profile stays live.",
              "We never charge a commission or a share of fees you agree with a participant."
            ]
          }
        ]
      },
      {
        "heading": "5.9 Price and plan changes",
        "blocks": [
          {
            "t": "p",
            "text": "We may change our prices or plan inclusions by giving you at least 30 days’ written notice by email. The change applies from your next billing period after the notice period ends. If you don’t agree with the change, you can cancel before it takes effect without any fee or penalty."
          }
        ]
      },
      {
        "heading": "5.10 Cancellation and refunds",
        "blocks": [
          {
            "t": "p",
            "text": "You can cancel your Connect plan at any time from your dashboard. Cancellation takes effect at the end of the current paid month, and you keep access until then. We don’t refund part months, except where required by the Australian Consumer Law or where our service wasn’t provided as described. You can close your profile entirely by contacting us."
          }
        ]
      },
      {
        "heading": "5.11 Ranking and matching",
        "blocks": [
          {
            "t": "p",
            "text": "Briefs are sent and results are ordered according to our published listing and ranking policy. Your plan determines whether you can unlock requests. It never changes whether you’re matched or where you appear."
          }
        ]
      },
      {
        "heading": "5.12 Suspension and removal",
        "blocks": [
          {
            "t": "p",
            "text": "We may suspend or remove your profile, or restrict your access to briefs, if:"
          },
          {
            "t": "ul",
            "items": [
              "information in your profile is materially false or misleading",
              "your NDIS registration lapses, is suspended or revoked, or the NDIS Commission or another regulator takes enforcement action against you, including a banning order",
              "you breach section 5.6 or 5.7",
              "we receive complaints indicating a risk to participants’ safety or wellbeing"
            ]
          },
          {
            "t": "p",
            "text": "Where it’s safe and practicable, we’ll tell you the reason and give you 7 days to respond or fix the issue before acting. Where there’s a serious risk to someone’s safety or privacy, we may act immediately and will tell you why. If we remove your profile because of your serious breach, we don’t refund fees already paid. If we suspend your access for any other reason, we’ll refund fees for the period you couldn’t use the service."
          }
        ]
      },
      {
        "heading": "5.13 Ending this agreement",
        "blocks": [
          {
            "t": "p",
            "text": "You can end this agreement at any time by cancelling your plan and asking us to close your profile. We can end this agreement by giving you 30 days’ written notice, in which case we’ll refund any fees paid for the period after it ends. Sections 5.6, 5.7, 5.14 and 5.15 continue after the agreement ends."
          }
        ]
      },
      {
        "heading": "5.14 Liability",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "Nothing in this agreement excludes rights you have under the Australian Consumer Law that can’t be excluded.",
              "You’re responsible for the supports you provide, your workers, your pricing, your compliance with the law and your own insurance. We aren’t a party to any arrangement between you and a participant.",
              "Each party is responsible for loss it causes to the other through its breach of this agreement or its negligence, reduced to the extent the other party contributed to the loss.",
              "Neither party is liable for indirect or consequential loss, such as loss of profit, except in the case of a breach of section 5.6 or 5.7 or fraud.",
              "Except for a breach of section 5.6 or 5.7 or fraud, our total liability to you under this agreement is limited to the fees you paid us in the 3 months before the claim arose."
            ]
          }
        ]
      },
      {
        "heading": "5.15 Confidentiality",
        "blocks": [
          {
            "t": "p",
            "text": "Each party will keep confidential any non-public information about the other’s business it receives through SolDirectory, except where disclosure is required by law."
          }
        ]
      },
      {
        "heading": "5.16 Disputes",
        "blocks": [
          {
            "t": "p",
            "text": "If a dispute arises, either party can give the other written notice of it, and both will try in good faith to resolve it within 21 days. If it isn’t resolved, either party may refer it to the Victorian Small Business Commission for mediation before starting court proceedings, except where urgent relief is needed."
          }
        ]
      },
      {
        "heading": "5.17 Changes to this agreement",
        "blocks": [
          {
            "t": "p",
            "text": "We may change this agreement by giving you at least 30 days’ written notice by email. If you don’t agree, you can end this agreement before the change takes effect without any fee or penalty, and we’ll refund any fees paid for the period after it ends. We won’t make a change that is unfair to you."
          }
        ]
      },
      {
        "heading": "5.18 Notices",
        "blocks": [
          {
            "t": "p",
            "text": "We’ll send notices to the account email address on your profile. You can send notices to directory@solbusinessconsultant.com.au or 97 John St, Glenroy VIC 3046."
          }
        ]
      },
      {
        "heading": "5.19 General",
        "blocks": [
          {
            "t": "p",
            "text": "This agreement, our terms of use and privacy policy are the entire agreement between us about SolDirectory. If any part is invalid or unenforceable, it’s severed and the rest continues. You may not transfer this agreement without our consent. We may transfer it to a business that takes over SolDirectory, after notifying you. This agreement is governed by the laws of Victoria, Australia."
          }
        ]
      }
    ]
  },
  {
    "slug": "worker-terms",
    "n": 6,
    "title": "Worker terms",
    "meets": "Fair Work Act 2009 (Cth) (no employment relationship, no sham contracting), Independent Contractors Act 2006 (Cth), Australian Consumer Law, Privacy Act 1988 (Cth), NDIS worker screening requirements.",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**SolDirectory worker terms**"
          }
        ]
      },
      {
        "heading": "6.1 Who these terms apply to",
        "blocks": [
          {
            "t": "p",
            "text": "These terms apply to independent support workers, nurses, allied health assistants and other individuals who create a worker profile on SolDirectory, operated by Sol Business Consultant Pty Ltd (ABN 20 662 022 522) (“we”, “us”). They apply together with our terms of use and privacy policy."
          }
        ]
      },
      {
        "heading": "6.2 What SolDirectory does for workers",
        "blocks": [
          {
            "t": "p",
            "text": "SolDirectory lets eligible provider organisations find your profile and ask to contact you. It’s free for workers."
          },
          {
            "t": "p",
            "text": "We don’t:"
          },
          {
            "t": "ul",
            "items": [
              "employ you, engage you as a contractor, or act as your agent or labour hire provider",
              "find you work, guarantee any contact or engagement, or set your rates or conditions",
              "supervise, direct or assess your work"
            ]
          },
          {
            "t": "p",
            "text": "Any engagement, whether as an employee or contractor, is arranged directly between you and the organisation, on terms you agree with them. Whether you’re an employee or a contractor depends on the real arrangement, not what it’s called. If you’re unsure, check the Fair Work Ombudsman’s guidance or get independent advice before you agree."
          }
        ]
      },
      {
        "heading": "6.3 Your profile and checks",
        "blocks": [
          {
            "t": "p",
            "text": "You’re responsible for:"
          },
          {
            "t": "ul",
            "items": [
              "keeping your profile accurate and current, including your availability, experience and the supports you offer",
              "holding the checks, qualifications, registrations, ABN and insurance required for the work you accept, such as an NDIS Worker Screening Check and a Working with Children Check where required",
              "uploading current evidence for any check you declare"
            ]
          },
          {
            "t": "p",
            "text": "When our staff have seen your evidence, your profile shows “Checks sighted on” and the date. This means we’ve seen a document. It isn’t verification with the issuing body, an endorsement, or a guarantee of your suitability. Organisations must do their own checks, including verifying worker screening clearances through the NDIS Worker Screening Database where they’re required to."
          },
          {
            "t": "p",
            "text": "If a declared check expires, the badge is removed and your profile is hidden until you upload current evidence."
          }
        ]
      },
      {
        "heading": "6.4 Contact requests",
        "blocks": [
          {
            "t": "p",
            "text": "Organisations can see your profile but not your contact details. When an organisation sends a contact request, you choose whether to accept. Your phone number and email are shared only with organisations whose requests you accept."
          }
        ]
      },
      {
        "heading": "6.5 Your privacy",
        "blocks": [
          {
            "t": "p",
            "text": "Evidence you upload is seen only by our verification staff and is handled under our privacy policy. You can ask us to delete your profile and documents at any time."
          }
        ]
      },
      {
        "heading": "6.6 Conduct",
        "blocks": [
          {
            "t": "p",
            "text": "You agree to use SolDirectory honestly and lawfully, and to treat organisations and the people you support with respect. If you deliver NDIS supports, the NDIS Code of Conduct applies to you."
          }
        ]
      },
      {
        "heading": "6.7 Removing a profile",
        "blocks": [
          {
            "t": "p",
            "text": "We may hide or remove your profile if it’s inaccurate, if a check has expired or been revoked, or if we receive information suggesting a risk to anyone’s safety. Where safe and practicable, we’ll tell you why and give you a chance to respond first. You can close your profile at any time."
          }
        ]
      },
      {
        "heading": "6.8 Liability",
        "blocks": [
          {
            "t": "p",
            "text": "Nothing in these terms excludes rights you have under the Australian Consumer Law that can’t be excluded. We aren’t responsible for any arrangement between you and an organisation."
          }
        ]
      },
      {
        "heading": "6.9 General",
        "blocks": [
          {
            "t": "p",
            "text": "We may update these terms by posting the new version here and emailing you at least 14 days before a significant change takes effect. These terms are governed by the laws of Victoria, Australia."
          }
        ]
      }
    ]
  },
  {
    "slug": "complaints",
    "n": 7,
    "title": "Complaints policy",
    "meets": "APP 1.4(e) (privacy complaints), Australian Consumer Law, and the complaint pathways of the NDIS Quality and Safeguards Commission and the Aged Care Quality and Safety Commission. Aligned with AS 10002:2022 (Guidelines for complaint management in organisations).",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**SolDirectory complaints policy**"
          }
        ]
      },
      {
        "heading": "7.1 Our commitment",
        "blocks": [
          {
            "t": "p",
            "text": "We welcome complaints and feedback. They help us fix problems and improve SolDirectory. Making a complaint will never affect how we treat you, your requests or your account."
          }
        ]
      },
      {
        "heading": "7.2 What you can complain about",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "SolDirectory itself: a request, the matching process, our website, our staff, a listing, billing, or how we handled your personal information",
              "how a listed provider or worker used information they received through SolDirectory, or a misleading profile"
            ]
          },
          {
            "t": "p",
            "text": "Complaints about the quality or safety of supports a provider delivers should also go to the relevant regulator (see section 7.6). We’ll help you find the right place."
          }
        ]
      },
      {
        "heading": "7.3 How to make a complaint",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "**Email:**  directory@solbusinessconsultant.com.au",
              "**Phone:**  0460 003 494, Monday to Friday, 8am to 5.30pm",
              "**Post:**  Complaints, SolDirectory, 97 John St, Glenroy VIC 3046",
              "**Online:**  the “Report” link on any listing or in your request tracker"
            ]
          },
          {
            "t": "p",
            "text": "You can complain in any way that suits you, including verbally. Someone else, such as a family member, carer, friend or advocate, can complain for you. If you need an interpreter, call the Translating and Interpreting Service on 131 450 and ask them to call us. If you’re deaf or have a hearing or speech impairment, contact us through the National Relay Service on 133 677. You can make an anonymous complaint, though that may limit what we can do."
          }
        ]
      },
      {
        "heading": "7.4 What we’ll do",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "**Acknowledge**  your complaint within 2 business days.",
              "**Assess**  it, ask any questions we need, and tell you who’s handling it.",
              "**Investigate**  fairly, giving anyone affected a chance to respond.",
              "**Respond**  in writing with what we found and what we’ll do, aiming to finish within 30 days. If it’ll take longer, we’ll tell you why and keep you updated.",
              "**Act** , for example by correcting a listing, pausing or removing a provider’s profile, deleting information, or refunding a fee."
            ]
          },
          {
            "t": "p",
            "text": "We keep complaint records confidential and secure, and use what we learn to improve our service."
          }
        ]
      },
      {
        "heading": "7.5 If you’re not satisfied with our response",
        "blocks": [
          {
            "t": "p",
            "text": "You can ask for a review by our director. If you’re still not satisfied, you can contact an external body."
          }
        ]
      },
      {
        "heading": "7.6 External complaint and support services",
        "blocks": [
          {
            "t": "table",
            "head": [
              "**About**",
              "**Contact**"
            ],
            "rows": [
              [
                "An NDIS provider’s or worker’s supports or conduct",
                "NDIS Quality and Safeguards Commission, 1800 035 544, ndiscommission.gov.au"
              ],
              [
                "An aged care provider",
                "Aged Care Quality and Safety Commission, 1800 951 822, agedcarequality.gov.au"
              ],
              [
                "How your personal information was handled",
                "Office of the Australian Information Commissioner, 1300 363 992, oaic.gov.au"
              ],
              [
                "Consumer issues in Victoria",
                "Consumer Affairs Victoria, 1300 55 81 81, consumer.vic.gov.au"
              ],
              [
                "Misleading conduct or consumer rights nationally",
                "Australian Competition and Consumer Commission, accc.gov.au"
              ],
              [
                "Disability discrimination, including website access",
                "Australian Human Rights Commission, 1300 656 419, humanrights.gov.au"
              ],
              [
                "Free help from an aged care advocate",
                "Older Persons Advocacy Network, 1800 700 600, opan.org.au"
              ],
              [
                "Finding disability advocacy and services",
                "Disability Gateway, 1800 643 787, disabilitygateway.gov.au"
              ]
            ]
          },
          {
            "t": "p",
            "text": "If someone is in immediate danger, call 000."
          }
        ]
      }
    ]
  },
  {
    "slug": "statement-of-rights",
    "n": 8,
    "title": "Statement of rights",
    "meets": "participant choice and control under the NDIS Act 2013 (Cth), the Statement of Rights under the Aged Care Act 2024 (Cth), the Australian Privacy Principles and the Australian Consumer Law, as they apply to using SolDirectory.",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**Your rights when you use SolDirectory**"
          },
          {
            "t": "p",
            "text": "When you use SolDirectory, you have the right to:"
          },
          {
            "t": "ul",
            "items": [
              "**Choose.**  Decide which providers or workers you speak to, if any. You’re never obliged to use anyone who contacts you.",
              "**Control your information.**  Decide what you share. Only share what a provider needs to know to see if they can help.",
              "**Know who has your details.**  See which providers viewed your contact details, in your request tracker.",
              "**Change your mind.**  Close your request at any time. Providers who haven’t viewed your details won’t be able to.",
              "**Be forgotten.**  Ask us to delete your information.",
              "**Be treated with dignity and respect**  by us and by providers you meet through SolDirectory, free from pressure, discrimination or abuse.",
              "**Get honest information.**  Know how matching works, how we make money, and who owns SolDirectory.",
              "**Have someone support you.**  Ask a family member, carer, advocate or nominee to act for you or with you.",
              "**Ask for a person.**  Ask us for a person to review how your request was matched.",
              "**Complain safely.**  Make a complaint to us or an external body without it affecting how you’re treated.",
              "**Communicate your way.**  Use an interpreter (TIS National, 131 450), the National Relay Service (133 677), or ask us for information in another format."
            ]
          },
          {
            "t": "p",
            "text": "Your rights under the NDIS, aged care law and consumer law aren’t affected by using SolDirectory."
          }
        ]
      }
    ]
  },
  {
    "slug": "listing-and-ranking-policy",
    "n": 9,
    "title": "Listing and ranking policy",
    "meets": "Australian Consumer Law ss 18 and 29 (misleading conduct and representations), including ACCC guidance on disclosing paid placement and ranking factors on digital platforms.",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**How results are ordered and requests are matched**"
          }
        ]
      },
      {
        "heading": "9.1 Two kinds of listing",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "**Member profiles:**  providers who have joined SolDirectory, verified their business, and keep their profile up to date. Members confirm weekly whether they’re taking new people.",
              "**Register listings:**  organisations shown as they appear on the public NDIS Provider Register or My Aged Care. They haven’t joined SolDirectory, and we can’t tell you whether they have capacity."
            ]
          }
        ]
      },
      {
        "heading": "9.2 How search results are ordered",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "Only listings that match your search (support, location and any filters you choose) are shown.",
              "Member profiles that confirmed capacity in your area this week appear first, labelled “Taking new people”, ordered by distance from your suburb.",
              "Other member profiles come next, ordered by distance.",
              "Register listings are shown in a separate section, ordered by distance, and never carry a capacity label."
            ]
          }
        ]
      },
      {
        "heading": "9.3 How requests are matched",
        "blocks": [
          {
            "t": "p",
            "text": "A provider receives a brief of your request only if all of these are true:"
          },
          {
            "t": "ul",
            "items": [
              "it delivers the support you need",
              "your suburb is in its service area",
              "it accepts your funding type",
              "it has confirmed this week that it’s taking new people in your area",
              "its profile isn’t paused",
              "if your NDIS plan is NDIA-managed, it’s registered for that support"
            ]
          },
          {
            "t": "p",
            "text": "From all providers who qualify, up to 10 are notified, chosen by distance and then rotated fairly so the same providers aren’t always first. Up to 3 can then view your contact details."
          }
        ]
      },
      {
        "heading": "9.4 What paying does and doesn’t change",
        "blocks": [
          {
            "t": "p",
            "text": "Providers on our paid Connect plan can view the contact details of requesters. Paying **never**  changes whether a provider is matched, the order of search results, or any label shown. We don’t sell sponsored positions, featured listings or paid reviews."
          }
        ]
      },
      {
        "heading": "9.5 Related businesses",
        "blocks": [
          {
            "t": "p",
            "text": "Our director also owns WeCare Disability Services, a registered NDIS provider. WeCare’s listing is labelled “Related business”. It follows exactly the same rules as every other provider, is never given priority, and is never added to a request by hand."
          }
        ]
      },
      {
        "heading": "9.6 What labels mean",
        "blocks": [
          {
            "t": "table",
            "head": [
              "**Label**",
              "**Meaning**"
            ],
            "rows": [
              [
                "Business verified",
                "We’ve matched the ABN with the Australian Business Register and one more proof of the business"
              ],
              [
                "Registered NDIS provider",
                "Shown on the NDIS Provider Register for the listed registration groups at our last import"
              ],
              [
                "Taking new people",
                "The provider confirmed capacity in this area this week"
              ],
              [
                "Checks sighted",
                "Our staff have seen evidence of the worker’s declared checks on the date shown"
              ],
              [
                "Related business",
                "Owned by a related party of SolDirectory"
              ]
            ]
          },
          {
            "t": "p",
            "text": "None of these labels is an endorsement or a rating of quality."
          }
        ]
      }
    ]
  },
  {
    "slug": "editorial-policy",
    "n": 10,
    "title": "Editorial policy",
    "meets": "Australian Consumer Law ss 18 and 29; copyright licence terms for NDIA (CC BY-NC 3.0) and NDIS Commission (CC BY 4.0) material; transparency expectations for health and disability information.",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**How we write and check our guides**"
          }
        ]
      },
      {
        "heading": "10.1 Why this matters",
        "blocks": [
          {
            "t": "p",
            "text": "People use our guides to make decisions about support, money and safety. They should know who wrote each guide, where its information comes from, and when it was last checked."
          }
        ]
      },
      {
        "heading": "10.2 Who writes and reviews our guides",
        "blocks": [
          {
            "t": "p",
            "text": "Every guide names its author and its reviewer, with a short biography of each."
          },
          {
            "t": "ul",
            "items": [
              "**Authors**  are SolDirectory team members with experience in NDIS and aged care services.",
              "**Reviewers**  check each guide for accuracy before it’s published. Guides about health conditions, therapy or clinical supports are reviewed by a qualified health or allied health professional, whose name and qualification are shown. Guides about registration, compliance and provider operations are reviewed by someone with direct experience running a registered NDIS provider."
            ]
          }
        ]
      },
      {
        "heading": "10.3 Where our information comes from",
        "blocks": [
          {
            "t": "p",
            "text": "Each guide is based on official sources, such as the NDIA, the NDIS Quality and Safeguards Commission, My Aged Care, the Department of Health, Disability and Ageing, the Fair Work Ombudsman and the Australian Taxation Office. Each guide names the official pages it relies on and the date they were last checked. We restate official information in our own words and link to the original. We don’t copy text, images or logos from other websites."
          }
        ]
      },
      {
        "heading": "10.4 Use of AI tools",
        "blocks": [
          {
            "t": "p",
            "text": "We use artificial intelligence tools to help draft and edit some guides and to monitor official websites for changes. A named person reviews every guide before publication, checks every fact against its official source, and is responsible for the final content. AI tools never publish anything automatically."
          }
        ]
      },
      {
        "heading": "10.5 Keeping guides current",
        "blocks": [
          {
            "t": "p",
            "text": "Prices, thresholds and rules change. Where possible, we explain how something works and link to the official page for the current figure. We review guides when official sources change, and every guide shows when its sources were last checked. Time-sensitive notices are marked when they expire."
          }
        ]
      },
      {
        "heading": "10.6 Independence",
        "blocks": [
          {
            "t": "p",
            "text": "Guides explain how things work and how to compare options. They never recommend a particular provider, and no provider can pay to be mentioned. Guides for participants and families never promote Sol Business Consultant or WeCare Disability Services. Guides for providers may mention Sol Business Consultant’s registration services, clearly labelled as our related business."
          }
        ]
      },
      {
        "heading": "10.7 General information only",
        "blocks": [
          {
            "t": "p",
            "text": "Our guides are general information, not legal, financial, medical or NDIS planning advice. Check what applies to you with your plan manager, support coordinator, the NDIA, My Aged Care or a qualified professional."
          }
        ]
      },
      {
        "heading": "10.8 Corrections",
        "blocks": [
          {
            "t": "p",
            "text": "If you think something is wrong, unclear or out of date, email directory@solbusinessconsultant.com.au with the page and what you noticed. We’ll check it against the official source and correct the guide if needed, noting significant corrections at the end of the guide."
          }
        ]
      }
    ]
  },
  {
    "slug": "accessibility",
    "n": 11,
    "title": "Accessibility statement",
    "meets": "Disability Discrimination Act 1992 (Cth) and the Australian Human Rights Commission’s guidance on accessible websites, using the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**Accessibility**"
          }
        ]
      },
      {
        "heading": "11.1 Our commitment",
        "blocks": [
          {
            "t": "p",
            "text": "We want everyone to be able to use SolDirectory, including people with disability, older people and people using assistive technology. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA."
          }
        ]
      },
      {
        "heading": "11.2 What we do",
        "blocks": [
          {
            "t": "ul",
            "items": [
              "design and test pages to work with screen readers, keyboard-only navigation, screen magnification and voice control",
              "use sufficient colour contrast, resizable text and clear focus indicators",
              "write in plain English, with short sentences and clear headings",
              "give images meaningful text alternatives",
              "make the Get matched form usable one question at a time, with clear error messages and no time limits",
              "avoid CAPTCHA puzzles that block people with disability",
              "check accessibility before releasing new features, and audit the site at least once a year"
            ]
          }
        ]
      },
      {
        "heading": "11.3 Known limitations",
        "blocks": [
          {
            "t": "p",
            "text": "Some register listings come from external data that may not include complete descriptions, and some documents uploaded by providers may not be fully accessible. We’re working to improve them."
          }
        ]
      },
      {
        "heading": "11.4 Other ways to use our service",
        "blocks": [
          {
            "t": "p",
            "text": "If any part of the site doesn’t work for you, call us on 0460 003 494 and we’ll take your request over the phone, or email directory@solbusinessconsultant.com.au. You can also contact us through:"
          },
          {
            "t": "ul",
            "items": [
              "the National Relay Service on 133 677, or relayservice.gov.au",
              "the Translating and Interpreting Service on 131 450 (ask them to call us)"
            ]
          },
          {
            "t": "p",
            "text": "We can provide our policies in other formats on request."
          }
        ]
      },
      {
        "heading": "11.5 Feedback and complaints",
        "blocks": [
          {
            "t": "p",
            "text": "Tell us about any accessibility barrier by email or phone, and we’ll aim to respond within 2 business days. If you’re not satisfied with our response, you can contact the Australian Human Rights Commission on 1300 656 419 or at humanrights.gov.au."
          }
        ]
      }
    ]
  },
  {
    "slug": "data-sources",
    "n": 12,
    "title": "Data sources and attribution",
    "meets": "Creative Commons Attribution 4.0 International licence conditions (attribution, licence link, indication of changes), Copyright Act 1968 (Cth), APP 10 (quality of personal information) and APP 13 (correction).",
    "updated": "15 October 2026",
    "sections": [
      {
        "heading": "",
        "blocks": [
          {
            "t": "p",
            "text": "**Where our listings come from**"
          }
        ]
      },
      {
        "heading": "12.1 NDIS Provider Register",
        "blocks": [
          {
            "t": "p",
            "text": "NDIS provider listings are based on the NDIS Provider Register published by the NDIS Quality and Safeguards Commission."
          },
          {
            "t": "note",
            "text": "Source: NDIS Quality and Safeguards Commission, NDIS Provider Register. © Commonwealth of Australia (NDIS Quality and Safeguards Commission). Licensed under the Creative Commons Attribution 4.0 International licence (creativecommons.org/licenses/by/4.0). Changes made: we have reformatted the data, grouped registration groups into support categories, and matched locations to suburbs. The NDIS Quality and Safeguards Commission does not endorse SolDirectory."
          }
        ]
      },
      {
        "heading": "12.2 My Aged Care",
        "blocks": [
          {
            "t": "p",
            "text": "Aged care provider listings are based on provider information published by the Australian Government Department of Health, Disability and Ageing through My Aged Care."
          },
          {
            "t": "note",
            "text": "Source: Australian Government Department of Health, Disability and Ageing, My Aged Care provider information. © Commonwealth of Australia. Used under the licence terms published with that data. Changes made: we have reformatted the data and matched locations to suburbs. The Department does not endorse SolDirectory."
          }
        ]
      },
      {
        "heading": "12.3 How current the data is",
        "blocks": [
          {
            "t": "p",
            "text": "Register data was last imported on the date shown on each register page. We refresh it regularly, but it can lag behind the live registers. Always confirm a provider’s current registration on the official NDIS Provider Register (ndiscommission.gov.au) or My Aged Care (myagedcare.gov.au) before relying on it."
          }
        ]
      },
      {
        "heading": "12.4 What register listings don’t tell you",
        "blocks": [
          {
            "t": "p",
            "text": "A register listing shows what the register published. It doesn’t tell you whether a provider has capacity, what it charges, or whether it suits your needs, and it isn’t an endorsement."
          }
        ]
      },
      {
        "heading": "12.5 Corrections and removal",
        "blocks": [
          {
            "t": "p",
            "text": "If a listing is wrong, or you’re a sole trader who’d like your listing shown under your business name only or removed, use the “Report an error” link on the listing or email directory@solbusinessconsultant.com.au. We’ll respond within 5 business days. Registration details that come from the register can only be changed at the source, but we’ll fix any error we’ve introduced and can suppress a listing on request where the law allows."
          }
        ]
      },
      {
        "heading": "12.6 Member profiles",
        "blocks": [
          {
            "t": "p",
            "text": "Member profiles are written and kept up to date by the providers themselves. Registration details on member profiles always come from the register and can’t be edited by the provider."
          }
        ]
      }
    ]
  }
];

/** A doc with its conditional blocks resolved against `practices` (defaults to LEGAL_PRACTICES). */
export function resolveLegalDoc(doc, practices = LEGAL_PRACTICES) {
  const keep = (x) => (!x.only || practices[x.only] === true) && (!x.unless || practices[x.unless] !== true);
  return {
    ...doc,
    sections: doc.sections.map((section) => ({
      ...section,
      blocks: section.blocks.filter(keep).map((block) => (block.t === 'ul'
        ? { ...block, items: block.items.filter((item) => (typeof item === 'string' ? true : keep(item))).map((item) => (typeof item === 'string' ? item : item.text)) }
        : block)),
    })),
  };
}

export function legalDocBySlug(slug, practices = LEGAL_PRACTICES) {
  const doc = LEGAL_PACK.find((entry) => entry.slug === slug);
  return doc ? resolveLegalDoc(doc, practices) : undefined;
}
