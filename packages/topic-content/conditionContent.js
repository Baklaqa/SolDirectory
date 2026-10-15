/**
 * General-information content for the conditions and support needs under /condition/:slug, one entry each, in the
 * groups the page shows. It is general educational information, not medical advice or a diagnostic description, and
 * it never claims a provider count or a statistic. `relatedCategories` are real register support categories.
 *
 * Moved here from apps/web/src/data/conditionContent.ts so the crawler HTML (api registerShell.controller.ts) and the
 * page read the same words. Edit the text here.
 */
export const CONDITION_CONTENT_GROUPS = [
  {
    "title": "Developmental",
    "items": [
      {
        "slug": "autism",
        "name": "Autism",
        "categoryGroup": "Developmental",
        "summary": "Autism is a lifelong developmental difference. It affects how a person communicates, interacts socially and experiences the world, including sensory input. It is not an illness to be cured. Autistic people vary widely in strengths, communication style and support needs. Some communicate verbally and others use alternative methods. Some need significant daily support and others live largely independently. In Australia, autism is one of the most common primary disability types on NDIS plans. Support often focuses on communication and daily living skills, managing sensory sensitivities and, for children, early intervention. Many autistic people and their families also value peer and community connections, not just clinical services.",
        "relatedCategories": [
          "Therapy services",
          "Behaviour support",
          "Life skills",
          "Community access"
        ]
      },
      {
        "slug": "adhd",
        "name": "ADHD",
        "categoryGroup": "Developmental",
        "summary": "ADHD (attention-deficit/hyperactivity disorder) affects attention, impulse control and activity levels. It looks different from person to person. Some people are more inattentive, some more hyperactive-impulsive, and many are a mix of both. It is a recognised neurodevelopmental condition, not a matter of effort or discipline, and it commonly continues from childhood into adulthood. Some people manage well with routine, coaching and environmental adjustments. Others need more structured behavioural or therapeutic support, particularly where ADHD occurs with another condition. Under the NDIS, ADHD alone does not automatically qualify for support. Eligibility depends on the functional impact and is assessed case by case. People often look for help with executive functioning skills, routines and, where relevant, working with schools or workplaces.",
        "relatedCategories": [
          "Life skills",
          "Behaviour support",
          "Support coordination"
        ]
      },
      {
        "slug": "intellectual-disability",
        "name": "Intellectual Disability",
        "categoryGroup": "Developmental",
        "summary": "Intellectual disability means significant limitations in intellectual functioning, such as learning, reasoning and problem-solving. It also means limitations in adaptive behaviour: everyday conceptual, social and practical skills. It is typically identified before adulthood. It ranges widely in level and presentation, and support needs can change over a person’s life. It is one of the more common primary disabilities supported through the NDIS. Support often centres on daily living and life skills, communication and community participation. Depending on the person, it can also include personal care, employment pathways or supported living. Family and carer involvement is often central to planning, particularly for younger participants. A good provider takes time to understand a person’s actual abilities and goals, rather than assuming from a diagnosis.",
        "relatedCategories": [
          "Life skills",
          "Personal care",
          "Community access",
          "Employment & education support"
        ]
      },
      {
        "slug": "global-developmental-delay",
        "name": "Global Developmental Delay",
        "categoryGroup": "Developmental",
        "summary": "Global developmental delay (GDD) describes a child who is significantly behind expected milestones in two or more areas. These can be motor skills, speech and language, cognition, or social and daily living skills. It is usually diagnosed in early childhood. It is sometimes an early sign of a condition that becomes clearer as the child grows, though for some children the cause is never fully identified. Because GDD is diagnosed young, early intervention is a major focus. The NDIS Early Childhood approach is built around getting support in place quickly. Families often coordinate several therapies at once, such as speech and occupational therapy, alongside family-centred support. As school age approaches, transition planning becomes part of it. GDD describes a pattern of delay, not a single diagnosis, so what helps varies a lot from child to child.",
        "relatedCategories": [
          "Therapy services",
          "Life skills"
        ]
      },
      {
        "slug": "down-syndrome",
        "name": "Down Syndrome",
        "categoryGroup": "Developmental",
        "summary": "Down syndrome is a genetic condition caused by an extra copy of chromosome 21. It is typically associated with some degree of intellectual disability and characteristic physical features. It also brings a higher likelihood of certain health conditions, including heart and hearing considerations, so regular health monitoring is often part of care. People with Down syndrome have a very wide range of abilities. With the right support, many live full, independent or semi-independent lives, complete school and further education, and work. Common areas of support include early intervention therapies in childhood, and speech and communication support. Through school and beyond, support includes life skills and employment pathways. Many families also connect with Down syndrome associations for peer support. A person’s actual support needs are specific to them and are not fully predicted by the diagnosis.",
        "relatedCategories": [
          "Therapy services",
          "Life skills",
          "Nursing",
          "Employment & education support"
        ]
      },
      {
        "slug": "fragile-x-syndrome",
        "name": "Fragile X Syndrome",
        "categoryGroup": "Developmental",
        "summary": "Fragile X syndrome is a genetic condition and the most common inherited cause of intellectual disability. It is caused by a change in the FMR1 gene. It affects boys more severely on average than girls. It commonly involves some degree of intellectual disability and delayed speech and language development. In a meaningful proportion of cases it also involves features that overlap with autism, including sensory sensitivities and social anxiety. Because it is inherited, a diagnosis can also prompt genetic counselling conversations for the wider family. Support commonly draws on early intervention therapies, speech and language support, and strategies for sensory regulation and anxiety. It is a less commonly known condition than autism or Down syndrome. Families sometimes find it worth asking a provider directly whether they have supported Fragile X before.",
        "relatedCategories": [
          "Therapy services",
          "Life skills",
          "Behaviour support"
        ]
      },
      {
        "slug": "cerebral-palsy",
        "name": "Cerebral Palsy",
        "categoryGroup": "Developmental",
        "summary": "Cerebral palsy (CP) is a group of permanent conditions affecting movement and posture. It is caused by disruption to the developing brain, usually before or shortly after birth. It is the most common physical disability in childhood. CP varies enormously in severity. Some people walk independently with minimal support. Others use mobility aids or wheelchairs and need support with most daily activities. It can also come with communication differences, epilepsy or intellectual disability, though many people with CP have typical cognitive ability. Support is often lifelong and multidisciplinary. It can include physiotherapy and occupational therapy to manage movement and prevent secondary complications, equipment and home modifications, and, depending on the person, personal care and community access support. Because presentation varies so much, it is worth asking a provider what type and level of CP they have supported.",
        "relatedCategories": [
          "Therapy services",
          "Personal care",
          "Assistive technology & equipment",
          "Home modifications"
        ]
      },
      {
        "slug": "speech-language-delay",
        "name": "Speech & Language Delay",
        "categoryGroup": "Developmental",
        "summary": "Speech and language delay describes a child developing spoken communication more slowly than expected for their age. It can affect how clearly they speak (speech), how they understand and use language (language), or both. It can occur on its own or alongside another developmental condition. Early identification matters because the years before school are a particularly effective window for speech pathology. Support is generally led by a speech pathologist. They often work directly with the child and coach parents and carers on strategies to use at home. Support can include alternative and augmentative communication (AAC) for children who need help beyond spoken words. Many delays resolve substantially with early support. For some children a language difference continues, and support needs change as they move through school. A speech pathology assessment is the right way to understand what a particular child needs.",
        "relatedCategories": [
          "Therapy services"
        ]
      }
    ]
  },
  {
    "title": "Mobility & Physical",
    "items": [
      {
        "slug": "spinal-cord-injury",
        "name": "Spinal Cord Injury",
        "categoryGroup": "Mobility & Physical",
        "summary": "A spinal cord injury (SCI) damages the spinal cord, usually through trauma such as a vehicle accident or fall. It disrupts the signals between the brain and the body below the injury site. The effects depend on where the injury is and how complete it is. They range from some loss of movement or sensation in the legs (paraplegia) to effects across arms, legs and torso (tetraplegia or quadriplegia). Many people also manage bladder and bowel function, pressure care and pain. Because an SCI is often sudden, support usually starts with an intensive rehabilitation phase and then settles into an ongoing plan. That plan commonly includes personal care, home modifications, equipment such as a wheelchair suited to the person, and clinical or nursing support. Needs and independence vary enormously, even with a similarly described injury level.",
        "relatedCategories": [
          "Personal care",
          "Nursing",
          "Assistive technology & equipment",
          "Home modifications"
        ]
      },
      {
        "slug": "amputation-limb-loss",
        "name": "Amputation & Limb Loss",
        "categoryGroup": "Mobility & Physical",
        "summary": "Limb loss can result from injury or illness, such as vascular disease or cancer, or be present from birth. It affects people very differently depending on which limb, how much of it, and the person’s overall health. For many people the practical focus is rehabilitation, prosthetic fitting and training, and adapting daily tasks and mobility. There can be ongoing equipment needs as a prosthetic wears or circumstances change. Phantom limb sensations and pain are a common experience. They are worth discussing with a clinician rather than pushing through. Adjusting to limb loss can also have a real emotional impact. Some people benefit from psychological support alongside physiotherapy and occupational therapy. A person’s own goals, such as returning to work, sport or specific daily activities, should shape their plan more than the amputation itself.",
        "relatedCategories": [
          "Therapy services",
          "Assistive technology & equipment",
          "Personal care"
        ]
      },
      {
        "slug": "muscular-dystrophy",
        "name": "Muscular Dystrophy",
        "categoryGroup": "Mobility & Physical",
        "summary": "Muscular dystrophy (MD) is a group of genetic conditions that cause progressive muscle weakness over time. There are several distinct types. They differ in which muscles are affected, how quickly they progress and at what age symptoms start. Some appear in early childhood and others in adulthood. Because it is progressive, support needs generally change over time. A person might start with support for specific activities and gradually need more. Depending on the type, that can include mobility equipment, home modifications, and respiratory or cardiac monitoring. Physiotherapy and occupational therapy play an ongoing role in maintaining function and comfort for as long as possible. Equipment needs are usually reviewed regularly, not set once. Because the types vary so much, it is reasonable to ask a provider about the type diagnosed, not muscular dystrophy in general.",
        "relatedCategories": [
          "Therapy services",
          "Assistive technology & equipment",
          "Nursing",
          "Home modifications"
        ]
      },
      {
        "slug": "multiple-sclerosis",
        "name": "Multiple Sclerosis",
        "categoryGroup": "Mobility & Physical",
        "summary": "Multiple sclerosis (MS) is a condition of the central nervous system. The immune system affects the protective coating around nerve fibres, which disrupts communication between the brain and body. It is unpredictable by nature. Symptoms and their severity vary widely between people and can fluctuate over time for the same person. They include fatigue, mobility changes, vision changes and cognitive effects. Many people manage MS as a relapsing condition with periods of stability. For others it is more steadily progressive. Because of that variability, support is usually built around the person’s current functional needs. This can include fatigue management strategies, physiotherapy, mobility aids as needed, and psychosocial support, adjusted as things change. If MS is part of someone’s NDIS or aged care plan, it is worth revisiting support needs from time to time.",
        "relatedCategories": [
          "Therapy services",
          "Personal care",
          "Nursing",
          "Assistive technology & equipment"
        ]
      },
      {
        "slug": "arthritis",
        "name": "Arthritis",
        "categoryGroup": "Mobility & Physical",
        "summary": "Arthritis covers a range of conditions causing joint inflammation, pain and, over time, reduced movement. The two most common forms are osteoarthritis and rheumatoid arthritis. Osteoarthritis is wear-related and more common with age. Rheumatoid arthritis is an autoimmune condition that can affect younger people and often needs specialist medical management. Arthritis is extremely common, particularly in older adults. It is a frequent factor behind reduced mobility and difficulty with everyday tasks. These are addressed through My Aged Care and, for younger people with more severe or complex arthritis, occasionally the NDIS. Support commonly includes pain and symptom management in partnership with medical care, and exercise and physiotherapy to maintain mobility. It can also include home modifications or aids for tasks that have become difficult, and practical household support. Severity ranges from mild to significantly disabling, so support should be matched to how the condition affects someone day to day.",
        "relatedCategories": [
          "Domestic assistance",
          "Therapy services",
          "Home modifications",
          "Personal care"
        ]
      },
      {
        "slug": "spina-bifida",
        "name": "Spina Bifida",
        "categoryGroup": "Mobility & Physical",
        "summary": "Spina bifida is a condition present from birth where the spine and spinal cord do not form completely. It ranges from a very mild form with few or no effects to more significant impacts on mobility and on bladder and bowel function. This depends on where along the spine it occurs and how severe it is. Many people with spina bifida also have hydrocephalus, which is a build-up of fluid around the brain. It is monitored and managed separately. Because it is present from birth, support typically starts early and changes through childhood and into adulthood. It commonly includes mobility support and equipment, continence management, and ongoing input from a multidisciplinary medical and allied health team. Severity varies enormously, so support should be based on a person’s actual functional needs and medical guidance, not the diagnosis name alone.",
        "relatedCategories": [
          "Nursing",
          "Personal care",
          "Assistive technology & equipment",
          "Therapy services"
        ]
      },
      {
        "slug": "chronic-pain",
        "name": "Chronic Pain",
        "categoryGroup": "Mobility & Physical",
        "summary": "Chronic pain is pain that persists beyond normal healing time, generally more than three months. It can occur on its own or alongside another diagnosed condition. It is a genuine, complex health issue in its own right, not simply a symptom to push through. It can affect a person’s mobility, energy, mood and ability to manage everyday tasks. Good management is usually multidisciplinary rather than a single fix. It can combine medical pain management, physiotherapy or exercise-based approaches, psychological support (pain and mood are closely linked), and practical changes to daily routines and the home. Chronic pain is not always visible to others. People managing it sometimes find that being taken seriously matters as much as the specific services offered. So does support that adapts on a bad day versus a better one. Access to support depends on the underlying cause and its documented functional impact.",
        "relatedCategories": [
          "Therapy services",
          "Personal care",
          "Domestic assistance"
        ]
      }
    ]
  },
  {
    "title": "Hearing, Vision & Sensory",
    "items": [
      {
        "slug": "deafness-hearing-loss",
        "name": "Deafness & Hearing Loss",
        "categoryGroup": "Hearing, Vision & Sensory",
        "summary": "Hearing loss ranges from mild to profound. It can be present from birth or acquired later through illness, injury, noise exposure or ageing. It is one of the most common reasons older Australians use aged care support, and a distinct area of NDIS support for people affected earlier in life. Deaf people and communities vary in how they identify and communicate. Some mainly use spoken language with hearing devices. Some use Auslan (Australian Sign Language) as a first language and identify with Deaf culture. Many use a mix of both. Support commonly includes hearing devices and their maintenance, audiology services, and Auslan interpreting or language support. For children it also includes early intervention to support language development, whichever communication method is chosen. Respecting a person’s or family’s preferred communication approach, rather than assuming one is better, is a basic starting point.",
        "relatedCategories": [
          "Therapy services",
          "Assistive technology & equipment"
        ]
      },
      {
        "slug": "blindness-low-vision",
        "name": "Blindness & Low Vision",
        "categoryGroup": "Hearing, Vision & Sensory",
        "summary": "Vision impairment ranges from low vision to total blindness. Low vision means some usable sight, which can often be supported with aids and strategies. It can be present from birth or develop later through eye conditions, injury or age-related change. It affects daily tasks differently depending on the type and severity of vision loss. Many people who are blind or have low vision live fully independent lives with the right skills, technology and, sometimes, an assistance animal. Support commonly includes orientation and mobility training, which is learning to navigate safely and confidently. It also includes assistive technology such as screen readers and magnification, and adaptive daily-living skills. As with hearing loss, check a provider’s specific experience. Supporting an adult newly experiencing vision loss is a different skill set to supporting a child who has been blind from birth.",
        "relatedCategories": [
          "Therapy services",
          "Assistive technology & equipment",
          "Life skills"
        ]
      },
      {
        "slug": "deafblindness",
        "name": "Deafblindness",
        "categoryGroup": "Hearing, Vision & Sensory",
        "summary": "Deafblindness is the combination of hearing loss and vision loss, in any degree. It is not simply deaf plus blind. It is its own distinct disability, because the two senses often compensate for each other. Having both affected changes how a person accesses information, communicates and moves through the world. It can be present from birth, sometimes linked to a specific syndrome, or acquired later in life, including through age-related change to both senses. Communication needs are very individual, ranging from tactile Auslan to specific combinations of assistive technology. Support is generally built around the specific person, not a standard approach. It often draws on specialist deafblind services alongside general disability or aged care support. Because this area is so specialised, it is reasonable to ask a provider about direct deafblind experience.",
        "relatedCategories": [
          "Therapy services",
          "Assistive technology & equipment",
          "Community access"
        ]
      },
      {
        "slug": "auslan-support",
        "name": "Auslan Support",
        "categoryGroup": "Hearing, Vision & Sensory",
        "summary": "Auslan (Australian Sign Language) is the primary sign language of the Australian Deaf community. It is a full, independent language with its own grammar, not a signed version of English. Auslan support generally means professional interpreting for appointments, education, workplaces or events. It can also mean Auslan tuition and language development support. This is most often for Deaf children, their families, or hearing people who work with or care for Deaf people. Booking a NAATI-certified Auslan interpreter, rather than relying on an untrained family member, is standard good practice for anything medical, legal, educational or otherwise significant. It is better for accuracy and avoids putting a family member in an inappropriate position. Demand for Auslan interpreters in regional and rural Australia can outstrip supply, so booking ahead where possible makes a real difference.",
        "relatedCategories": [
          "Therapy services",
          "Community access"
        ]
      },
      {
        "slug": "sensory-processing",
        "name": "Sensory Processing",
        "categoryGroup": "Hearing, Vision & Sensory",
        "summary": "Sensory processing differences describe how a person’s nervous system registers and responds to everyday sensory input. This includes sound, touch, light, movement and taste. Some people are more sensitive than typical, so input such as certain sounds or textures feels overwhelming. Others are less responsive and seek out more intense input. Many people experience a mix, depending on the sense. It is commonly discussed alongside autism and ADHD, though it can occur on its own. Occupational therapists are usually the lead professional for formal sensory assessment and strategies. These might include environmental adjustments such as lighting, noise and seating, sensory tools, or a personalised sensory diet of activities. Sensory needs are individual. What regulates one person can overwhelm another, so a good provider works from a specific assessment, not a generic sensory program.",
        "relatedCategories": [
          "Therapy services",
          "Behaviour support"
        ]
      }
    ]
  },
  {
    "title": "Psychosocial & Mental Health",
    "note": "If you or someone you know is in crisis, Lifeline (13 11 14) is available 24/7 in Australia.",
    "items": [
      {
        "slug": "schizophrenia",
        "name": "Schizophrenia",
        "categoryGroup": "Psychosocial & Mental Health",
        "summary": "Schizophrenia is a serious mental health condition. It can affect thinking, perception (including hallucinations or delusions), motivation and social functioning. It typically first appears in late adolescence or early adulthood. With appropriate ongoing treatment, usually medical and psychiatric care alongside psychosocial support, many people live meaningful, stable lives. The course varies significantly between individuals, and periods of acute illness can recur. In the NDIS, schizophrenia can be the basis for psychosocial disability support when its impact is significant and likely to be permanent. That support focuses on functional recovery, such as daily routines, social connection, and work or study. Clinical treatment stays with the person’s mental health care team. Stigma remains a documented barrier to getting appropriate support, so respectful, recovery-oriented language and practice matters when choosing a provider.",
        "relatedCategories": [
          "Life skills",
          "Community access",
          "Support coordination",
          "Employment & education support"
        ]
      },
      {
        "slug": "bipolar-disorder",
        "name": "Bipolar Disorder",
        "categoryGroup": "Psychosocial & Mental Health",
        "summary": "Bipolar disorder involves significant shifts in mood, energy and activity levels. A person cycles between depressive episodes and periods of elevated mood (mania, or the milder hypomania), with more stable periods in between for many people. It is a long-term condition. It is generally managed with medical and psychiatric treatment, often including medication, and psychosocial support to build routine, stability and coping strategies around triggers. Support through the NDIS psychosocial pathway is about the functional impact on daily life, such as work, relationships and independent living, not the diagnosis label. Because episodes can be unpredictable, support that is flexible and responsive tends to work better for many people than rigid scheduling. A clear plan for what to do if things start to shift also helps. Mood changes that concern you or someone you know are worth raising with a GP or mental health professional.",
        "relatedCategories": [
          "Life skills",
          "Community access",
          "Support coordination"
        ]
      },
      {
        "slug": "ptsd",
        "name": "PTSD",
        "categoryGroup": "Psychosocial & Mental Health",
        "summary": "Post-traumatic stress disorder (PTSD) can develop after experiencing or witnessing a traumatic event. Symptoms include intrusive memories, avoidance, negative changes in mood or thinking, and heightened alertness that persist well beyond the event. It affects veterans, first responders, and survivors of violence or accidents, among many others. Trauma exposure is not limited to any one group. Effective treatment is generally trauma-focused psychological therapy, sometimes alongside medication, and it can help many people recover significantly. Broader support, including some NDIS psychosocial support or DVA-funded support for veterans, focuses on day-to-day impact such as sleep, relationships, work and community participation. It works alongside clinical trauma treatment, not instead of it. If PTSD relates to service, DVA-specific pathways may also apply. If you are in crisis, Lifeline (13 11 14) is available 24/7 in Australia.",
        "relatedCategories": [
          "Life skills",
          "Community access",
          "Support coordination"
        ]
      },
      {
        "slug": "anxiety-disorders",
        "name": "Anxiety Disorders",
        "categoryGroup": "Psychosocial & Mental Health",
        "summary": "Anxiety disorders go beyond everyday worry or nervousness. They involve persistent, often disproportionate fear or anxiety that interferes with daily life. They take several distinct forms: generalised anxiety, social anxiety, panic disorder, specific phobias and others. Each has a somewhat different pattern. Anxiety disorders are among the most common mental health conditions in Australia and among the most treatable. Treatment is usually psychological therapy, and cognitive behavioural therapy is well evidenced. Medication is sometimes added for more severe presentations. Not everyone with an anxiety disorder needs or qualifies for NDIS support. It generally applies when the functional impact is significant and ongoing. Many people benefit from broader mental health support regardless, including Medicare-subsidised psychology sessions through a GP mental health plan. If anxiety is significantly affecting daily life, a GP is a reasonable, low-barrier first step.",
        "relatedCategories": [
          "Life skills",
          "Community access"
        ]
      },
      {
        "slug": "depression",
        "name": "Depression",
        "categoryGroup": "Psychosocial & Mental Health",
        "summary": "Depression is more than temporary sadness. It is a persistent low mood, loss of interest or pleasure, and often changes in sleep, energy, appetite and concentration. It lasts weeks or longer and affects daily functioning. It is common and treatable, and affects people of all ages and backgrounds. It can occur alongside a physical health condition or as part of a broader life transition. In older age it is sometimes under-recognised. Treatment usually combines psychological therapy and, where appropriate, medication, coordinated through a GP or psychiatrist. Where depression has a significant, ongoing functional impact, psychosocial disability support, including through the NDIS, can help with rebuilding routine, social connection and independence. It works alongside clinical treatment rather than replacing it. Support through My Aged Care may also address mental health and wellbeing for older Australians. If you or someone you know is in crisis, Lifeline (13 11 14) is available 24/7 in Australia.",
        "relatedCategories": [
          "Life skills",
          "Community access",
          "Support coordination"
        ]
      },
      {
        "slug": "eating-disorders",
        "name": "Eating Disorders",
        "categoryGroup": "Psychosocial & Mental Health",
        "summary": "Eating disorders include anorexia nervosa, bulimia nervosa, binge eating disorder and others. They are serious mental health conditions involving a disturbed relationship with food, eating and body image. They carry real physical health risks alongside the psychological ones. They affect people of any gender, age or body size. They are not a lifestyle choice or something a person can simply decide to stop. Treatment is usually multidisciplinary: medical monitoring, psychological therapy and dietetic support together. Earlier intervention is generally associated with better outcomes, so acting on early concerns matters. Broader disability or psychosocial support can help with day-to-day functional impact once someone is engaged in clinical treatment. It is not a substitute for that treatment. The Butterfly Foundation National Helpline (1800 33 4673) is an Australian, eating-disorder-focused support line worth knowing about alongside general mental health services.",
        "relatedCategories": [
          "Life skills",
          "Nursing",
          "Support coordination"
        ]
      },
      {
        "slug": "borderline-personality-disorder",
        "name": "Borderline Personality Disorder",
        "categoryGroup": "Psychosocial & Mental Health",
        "summary": "Borderline personality disorder (BPD) involves patterns of intense and fluctuating emotions, difficulty with self-image and challenges in relationships. It often comes with impulsivity and a strong fear of abandonment. These patterns typically become established by early adulthood. It is frequently misunderstood and still carries real stigma, including in some parts of the health system. It is a genuine, well-recognised and treatable condition. Dialectical behaviour therapy (DBT) is one of the best-evidenced treatments. It focuses on building emotional regulation and interpersonal skills. As with other psychosocial conditions, broader disability support generally focuses on functional impact, such as daily living, relationships, work or study. It works alongside clinical treatment, not instead of it. People with BPD often describe non-judgemental, consistent support as especially valuable, given how often they have met the opposite. If you are in crisis, Lifeline (13 11 14) is available 24/7 in Australia.",
        "relatedCategories": [
          "Life skills",
          "Support coordination",
          "Community access"
        ]
      },
      {
        "slug": "dual-diagnosis",
        "name": "Dual Diagnosis",
        "categoryGroup": "Psychosocial & Mental Health",
        "summary": "Dual diagnosis means a person has both a mental health condition and a substance use issue at the same time. It is a common and well-recognised combination, because each can contribute to or worsen the other. Historically, mental health services and alcohol and drug services sometimes operated separately. That made it harder for people with dual diagnosis to get coordinated care. Integrated treatment that addresses both together is now considered better practice. Support needs are individual and depend on the specific mental health condition and substance involved. They generally benefit from services, or a support coordinator, able to work across both areas rather than treating them in isolation. This is a complex area. A GP, psychiatrist or dedicated dual diagnosis service is the best starting point, with broader disability support added once appropriate clinical care is in place.",
        "relatedCategories": [
          "Support coordination",
          "Life skills"
        ]
      }
    ]
  },
  {
    "title": "Chronic & Complex Medical",
    "items": [
      {
        "slug": "epilepsy",
        "name": "Epilepsy",
        "categoryGroup": "Chronic & Complex Medical",
        "summary": "Epilepsy is a neurological condition involving a tendency to have recurring seizures. They are caused by bursts of unusual electrical activity in the brain. It varies enormously. Seizure types range from brief lapses in awareness to convulsive seizures. Many people manage it well with medication and have long seizure-free periods. Others live with more frequent or harder-to-control seizures. Support commonly includes seizure management planning, and knowing a person’s specific seizure first-aid needs matters more than generic epilepsy awareness. It also includes medication support. Epilepsy occurs at a higher rate alongside conditions like intellectual disability or autism, and then support is coordinated across both. Anyone supporting a person with epilepsy should have a clear, person-specific seizure management plan. It is ideally documented with the person’s neurologist or GP, not based on generic assumptions.",
        "relatedCategories": [
          "Nursing",
          "Support coordination"
        ]
      },
      {
        "slug": "diabetes",
        "name": "Diabetes",
        "categoryGroup": "Chronic & Complex Medical",
        "summary": "Diabetes affects how the body regulates blood glucose. The two main types are type 1 and type 2. Type 1 is an autoimmune condition, usually starting in childhood or young adulthood, and always requires insulin. Type 2 is more common and often develops in adulthood. It is managed through lifestyle factors and medication, sometimes including insulin. There is also gestational diabetes in pregnancy. Well-managed diabetes allows most people to live full lives. Poorly managed diabetes over time carries real risks to eyesight, kidney function and circulation, which is why consistent monitoring matters. Support needs vary by type, age and how established the condition is. They range from help with daily blood glucose monitoring and medication routines to broader support where complications affect mobility or independence, particularly in aged care. Diabetes-specific dietetic and nursing input is often part of good ongoing support.",
        "relatedCategories": [
          "Nursing",
          "Domestic assistance"
        ]
      },
      {
        "slug": "cystic-fibrosis",
        "name": "Cystic Fibrosis",
        "categoryGroup": "Chronic & Complex Medical",
        "summary": "Cystic fibrosis (CF) is a genetic condition that causes the body to produce unusually thick mucus. It mainly affects the lungs and digestive system. It requires ongoing, often daily, management. A routine commonly includes airway clearance techniques, medications and enzyme replacement for digestion. Newer treatments have meaningfully changed outcomes for many people in recent years. Life expectancy and quality of life have improved considerably. CF remains a serious, lifelong condition that needs specialist medical management, usually through a dedicated CF clinic. Cross-infection between people with CF is a genuine clinical consideration, and precautions are standard CF care. Support arrangements sometimes need to account for that in ways that differ from other conditions. Support beyond direct medical care can include help maintaining daily treatment routines and, for some people, broader disability or nursing support as the condition progresses.",
        "relatedCategories": [
          "Nursing",
          "Therapy services"
        ]
      },
      {
        "slug": "renal-failure",
        "name": "Renal Failure",
        "categoryGroup": "Chronic & Complex Medical",
        "summary": "Renal (kidney) failure means the kidneys can no longer adequately filter waste and fluid from the blood. It can be acute, which is sudden and sometimes reversible, or chronic, which is a long-term progressive decline often described in stages. People with significant chronic kidney disease may eventually need dialysis, a time-intensive regular treatment, or where possible a kidney transplant. Dialysis is demanding on time, energy and routine. Support needs often centre on practical help around treatment schedules, such as transport to appointments, fatigue management and dietary support. Kidney-friendly eating is quite specific. This sits alongside direct medical care from a nephrology team. Chronic kidney disease is common in older Australians and often managed through aged care alongside other health conditions. Younger people with kidney disease may access NDIS support if the functional impact meets the criteria. A renal dietitian and the treating nephrology team are central to getting the medical side right.",
        "relatedCategories": [
          "Nursing",
          "Transport",
          "Domestic assistance"
        ]
      },
      {
        "slug": "cancer-care",
        "name": "Cancer Care",
        "categoryGroup": "Chronic & Complex Medical",
        "summary": "Cancer covers a very wide range of conditions, treatments and outlooks. What someone needs during active treatment (chemotherapy, radiation, surgery) is different from what they need in recovery. Long-term or palliative support is different again. Needs change over the course of a person’s experience with cancer. Fatigue is one of the most common and underestimated effects of cancer and its treatment. Practical everyday support, such as help around the house, transport to treatment and meal preparation, can matter as much as clinical care. Support may come through the health system directly, through oncology social work and cancer-specific nursing. It may come through aged care for older Australians. Occasionally it comes through the NDIS, where cancer has caused a permanent, significant functional impairment. Cancer Council Australia (13 11 20) is a good general starting point for practical and emotional support information specific to a person’s situation and cancer type.",
        "relatedCategories": [
          "Nursing",
          "Domestic assistance",
          "Transport",
          "Respite care"
        ]
      },
      {
        "slug": "motor-neurone-disease",
        "name": "Motor Neurone Disease",
        "categoryGroup": "Chronic & Complex Medical",
        "summary": "Motor neurone disease (MND) is a progressive condition affecting the nerve cells that control voluntary muscle movement. It gradually affects a person’s ability to move, speak, swallow and eventually breathe. Cognition is often, though not always, unaffected. It typically progresses over months to a few years, though the pace varies between individuals. That makes forward planning for equipment, communication support and care needs an important part of good MND support. It is done proactively, not only in response to change. A multidisciplinary team, including neurology, respiratory, speech pathology and occupational therapy, working together is considered best practice. Needs change relatively quickly compared with many other conditions, so equipment and support plans generally need to be reviewed often. MND Australia and state MND associations provide condition-specific information and support alongside NDIS or aged care services.",
        "relatedCategories": [
          "Nursing",
          "Therapy services",
          "Assistive technology & equipment",
          "Respite care"
        ]
      },
      {
        "slug": "parkinson-s-disease",
        "name": "Parkinson's Disease",
        "categoryGroup": "Chronic & Complex Medical",
        "summary": "Parkinson’s disease is a progressive neurological condition that mainly affects movement. It causes tremor, stiffness and slowness of movement. It can also involve non-movement effects such as changes to sleep, mood and, for some people over time, cognition. It usually develops gradually. It is managed long-term with medication, and the timing of doses matters a great deal day to day. Physiotherapy, occupational therapy and speech pathology are added as needed. Parkinson’s most often affects older adults and is commonly supported through My Aged Care. Younger-onset Parkinson’s occurs too and may involve NDIS support instead. Symptoms can fluctuate through the day as medication wears on and off. Support that is flexible around a person’s actual functional state, rather than assuming a fixed level of ability, tends to work better. Parkinson’s Australia and state-based Parkinson’s organisations offer condition-specific information alongside general aged care or disability services.",
        "relatedCategories": [
          "Therapy services",
          "Personal care",
          "Nursing"
        ]
      }
    ]
  },
  {
    "title": "ABI, Stroke & Neuro Rehab",
    "items": [
      {
        "slug": "acquired-brain-injury",
        "name": "Acquired Brain Injury",
        "categoryGroup": "ABI, Stroke & Neuro Rehab",
        "summary": "Acquired brain injury (ABI) is any injury to the brain that occurs after birth. The cause can be traumatic, such as an accident, or non-traumatic, such as stroke, lack of oxygen, infection or a brain tumour. Effects vary enormously depending on which part of the brain is affected and how severely. They can include changes to physical function, thinking and memory, communication, and personality or behaviour. Sometimes the less visible cognitive and behavioural effects are the most life-changing, even when a person looks physically unaffected. Support is usually intensive early on, as rehabilitation. It then shifts to longer-term, often lifelong support tailored to the specific effects a person is left with. Because ABI can significantly change how a person thinks, communicates or regulates emotion, it makes a real difference to have support from people experienced with brain injury, not just disability support broadly. It is worth asking about directly.",
        "relatedCategories": [
          "Therapy services",
          "Behaviour support",
          "Support coordination",
          "Life skills"
        ]
      },
      {
        "slug": "stroke-recovery",
        "name": "Stroke Recovery",
        "categoryGroup": "ABI, Stroke & Neuro Rehab",
        "summary": "A stroke happens when blood supply to part of the brain is interrupted, by a clot or a bleed. It damages brain tissue and can affect movement, speech, swallowing, vision or cognition, depending on which part of the brain was affected. Recovery is often most rapid in the weeks and months after a stroke. That is why prompt, intensive rehabilitation matters, including physiotherapy, occupational therapy and speech pathology as relevant. Meaningful gains can continue well beyond that early window for many people. Stroke mostly affects older adults and is commonly supported through My Aged Care. It can also affect younger people, sometimes involving the NDIS. Support commonly includes therapy to rebuild function, and home modifications and equipment. Mood changes after stroke are common and sometimes overlooked, so attention to emotional wellbeing sits alongside physical recovery. The Stroke Foundation (StrokeLine, 1800 787 653) is a good Australian, stroke-specific information resource.",
        "relatedCategories": [
          "Therapy services",
          "Personal care",
          "Home modifications"
        ]
      },
      {
        "slug": "traumatic-brain-injury",
        "name": "Traumatic Brain Injury",
        "categoryGroup": "ABI, Stroke & Neuro Rehab",
        "summary": "Traumatic brain injury (TBI) is brain injury caused by an external force, such as a fall, vehicle accident, sports injury or assault. It is a specific type of acquired brain injury. Severity ranges from mild to moderate or severe. Mild injuries include concussion, which usually resolves but should still be taken seriously, particularly with repeated impacts. More severe injuries can have lasting effects on movement, thinking, communication and behaviour. TBI disproportionately affects younger people, particularly young men, often through vehicle accidents or sport. That shapes what recovery and support look like. A return to work, study or an active life is frequently an explicit goal, not just daily living support. As with ABI generally, the cognitive and behavioural effects of TBI can be significant even when physical recovery looks complete. Support from providers experienced in brain injury rehabilitation is worth seeking out directly.",
        "relatedCategories": [
          "Therapy services",
          "Behaviour support",
          "Employment & education support"
        ]
      },
      {
        "slug": "huntington-s-disease",
        "name": "Huntington's Disease",
        "categoryGroup": "ABI, Stroke & Neuro Rehab",
        "summary": "Huntington’s disease is an inherited, progressive neurological condition. It affects movement, including involuntary movements, and cognition. For many people it also affects mood and behaviour over time. It is caused by a specific gene fault. Each child of a person with Huntington’s has a 50% chance of inheriting the gene, so a diagnosis can prompt genetic counselling conversations for other family members. Symptoms typically first appear in mid-adulthood, though there is a rare earlier-onset form. The condition progresses over many years. That makes forward planning for changing support needs, as with MND, an important part of good care. Because Huntington’s affects movement, thinking and behaviour together, support benefits from a coordinated team across neurology, allied health and psychosocial support, rather than a single service working in isolation. Huntington’s Australia-affiliated state associations provide condition-specific information and support alongside NDIS services.",
        "relatedCategories": [
          "Therapy services",
          "Behaviour support",
          "Nursing",
          "Support coordination"
        ]
      },
      {
        "slug": "neuro-physiotherapy",
        "name": "Neuro Physiotherapy",
        "categoryGroup": "ABI, Stroke & Neuro Rehab",
        "summary": "Neurological physiotherapy is physiotherapy specialised for conditions affecting the brain, spinal cord or nervous system. Examples are stroke, brain injury, spinal cord injury, MS, Parkinson’s and cerebral palsy. It is different from general musculoskeletal physiotherapy. It focuses on movement, balance, coordination and function in the context of how a neurological condition affects them. It often uses targeted, condition-specific techniques. For some conditions it works toward the capacity of the brain and nervous system to adapt over time, known as neuroplasticity. The right approach differs a lot by underlying condition. What helps someone recovering from stroke is different from what helps someone with progressive MS. It is worth confirming a physiotherapist’s specific neurological experience, and ideally experience with the particular condition involved, rather than assuming general physiotherapy training covers it.",
        "relatedCategories": [
          "Therapy services"
        ]
      }
    ]
  }
];
