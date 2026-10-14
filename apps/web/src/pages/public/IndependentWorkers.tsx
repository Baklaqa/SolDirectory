import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHero from '../../components/topic/PageHero';
import { bannerFor } from '../../data/bannerImages';
import { applySeoTags, setJsonLd } from '../../lib/seo';
import { PublicFooter, PublicHeader } from './PublicLayout';
import './Home.css';
import './IndependentWorkers.css';
import RelatedArticles from '../../components/blog/RelatedArticles';
import WorkerExtras from '../../components/extras/WorkerExtras';
import AccordionRows from '../../components/ui/AccordionRows';
import {
  INDEPENDENT_WORKER_FAQS, hubCopy, WORKER_HERO_CHECKS, WORKER_HOW_IT_WORKS, WORKER_PAGE_DESCRIPTION, WORKER_PAGE_TITLE, WORKER_PAGE_UPDATED,
  WORKER_PROFILE_DETAILS, WORKER_SAFEGUARDS,
} from '@soldirectory/topic-content';

const PROFILE_DETAILS = WORKER_PROFILE_DETAILS as unknown as string[][];

const STEPS = WORKER_HOW_IT_WORKS as unknown as string[][];

const HERO_CHECKS = WORKER_HERO_CHECKS as unknown as string[];

const FAQS = INDEPENDENT_WORKER_FAQS as { question: string; answer: string }[];

// Same words the crawler HTML carries (packages/topic-content/hubContent.js).
const CONTACT = hubCopy('/independent-workers')?.sections.find((s) => s.heading === 'How contact works');

export default function IndependentWorkers() {
  const navigate = useNavigate();

  useEffect(() => {
    applySeoTags({
      title: WORKER_PAGE_TITLE,
      description: WORKER_PAGE_DESCRIPTION,
      canonicalUrl: `${window.location.origin}/independent-workers`,
    });
    setJsonLd('independent-workers-page', {
      '@type': 'WebPage',
      name: 'Create a professional profile for independent support work',
      description: WORKER_PAGE_DESCRIPTION,
      url: `${window.location.origin}/independent-workers`,
      inLanguage: 'en-AU',
      dateModified: WORKER_PAGE_UPDATED,
      isPartOf: { '@type': 'WebSite', name: 'SolDirectory', url: window.location.origin },
      publisher: { '@type': 'Organization', name: 'SolDirectory', url: `${window.location.origin}/` },
    });
    setJsonLd('independent-workers-faq', {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    });
    window.scrollTo(0, 0);
    return () => { setJsonLd('independent-workers-page', null); setJsonLd('independent-workers-faq', null); };
  }, []);

  return (
    <>
      <PublicHeader />
      <main>
        <PageHero
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Independent workers' }]}
          eyebrow="Independent workers"
          title="Create a professional profile for independent support work"
          description="Present your services, experience, location and availability in one profile. Eligible provider organisations can search the worker directory and contact you."
          image={bannerFor({ text: 'support worker personal care', section: 'services' })}
          imageAlt="An independent support worker with a person they support"
          panel={{
            title: 'Join the worker directory',
            checks: HERO_CHECKS,
            ctaLabel: 'Create a worker profile →',
            onCta: () => navigate('/signup?type=worker'),
            note: (
              <>
                Already registered? <Link to="/login">Worker login</Link> · <Link to="/independent-workers/find">Browse worker profiles</Link>
              </>
            ),
          }}
        />

        <div className="iw-wrap">
          <section className="iw-profile" aria-labelledby="iw-profile-heading">
            <div className="iw-profile-intro">
              <span className="eyebrow"><span className="eyebrow-rule" />Your profile</span>
              <h2 id="iw-profile-heading" className="iw-h2">Help organisations understand how you can contribute</h2>
              <p>
                Keep structured information about your work preferences and professional background. Organisations remain
                responsible for their own recruitment, screening and engagement decisions.
              </p>
            </div>
            <AccordionRows label="What your profile can include" items={PROFILE_DETAILS.map(([title, body]) => ({ title, body }))} />
          </section>

          <section className="iw-process" id="how-it-works" aria-labelledby="iw-process-heading">
            <div className="iw-process-head">
              <span className="eyebrow"><span className="eyebrow-rule" />How it works</span>
              <h2 id="iw-process-heading" className="iw-h2">From registration to professional contact</h2>
              <p>SolDirectory provides the profile and search tools. Any engagement is arranged directly between you and the organisation contacting you.</p>
            </div>
            <ol className="iw-steps">
              {STEPS.map(([title, body], index) => (
                <li key={title}>
                  <span className="iw-step-num">{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="iw-safeguards" aria-labelledby="iw-safeguards-heading">
          <div className="iw-safeguards-inner">
            <div>
              <span className="eyebrow eyebrow-light"><span className="eyebrow-rule" />Professional responsibilities</span>
              <h2 id="iw-safeguards-heading" className="iw-h2">Checks and arrangements remain important</h2>
            </div>
            <AccordionRows tone="dark" marker="check" label="Checks and arrangements" items={WORKER_SAFEGUARDS.map((s) => ({ title: s.title, body: s.text }))} />
          </div>
        </section>

        <WorkerExtras />

        {CONTACT && CONTACT.list && (
          <div className="iw-wrap">
            <section className="iw-profile iw-contact" aria-labelledby="iw-contact-heading">
              <div className="iw-profile-intro">
                <span className="eyebrow"><span className="eyebrow-rule" />Privacy and contact</span>
                <h2 id="iw-contact-heading" className="iw-h2">{CONTACT.heading}</h2>
                {CONTACT.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              </div>
              <AccordionRows
                label={CONTACT.heading}
                items={CONTACT.list.map((item) => ({
                  title: item.title ?? item.text,
                  body: <>{item.text}{item.to && <> <Link to={item.to}>{item.label ?? 'Read more'} →</Link></>}</>,
                }))}
              />
            </section>
          </div>
        )}

        <div className="iw-wrap">
          <section className="iw-faq" aria-labelledby="iw-faq-heading">
            <div className="iw-faq-head">
              <span className="eyebrow"><span className="eyebrow-rule" />Questions</span>
              <h2 id="iw-faq-heading" className="iw-h2">Frequently asked questions</h2>
              <p>Not sure whether a profile suits you? Start with the basics here.</p>
            </div>
            <AccordionRows marker="none" label="Independent worker questions" items={FAQS.map((f) => ({ title: f.question, body: f.answer }))} />
          </section>

          <section className="iw-cta">
            <div>
              <h2>Create your Independent Worker profile</h2>
              <p>Register your professional details and make your profile available in the worker directory.</p>
            </div>
            <button className="btn-gradient btn-lg" onClick={() => navigate('/signup?type=worker')}>Register as an Independent Worker</button>
          </section>
        </div>
        <RelatedArticles standalone themes={['workers', 'choosing']} />
      </main>
      <PublicFooter />
    </>
  );
}
