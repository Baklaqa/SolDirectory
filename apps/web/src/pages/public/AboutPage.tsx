import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader, PublicFooter } from './PublicLayout';
import { applySeoTags } from '../../lib/seo';
import { siteConfig } from '../../config/siteConfig';
import { useMatchModal } from '../../context/MatchModalContext';
import './AboutContact.css';

/** /about: who operates SolDirectory, how it makes money, and the ownership disclosure. */
export default function AboutPage() {
  const { openMatchModal } = useMatchModal();

  useEffect(() => {
    applySeoTags({
      title: 'About SolDirectory',
      description: 'Who operates SolDirectory, how it makes money, our related businesses and how we keep listings fair.',
      canonicalUrl: `${window.location.origin}/about`,
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PublicHeader />
      <main>
        <div className="ac-hero">
          <div className="ac-hero-inner">
            <nav className="ac-crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>About</span>
            </nav>
            <span className="ac-eyebrow">About SolDirectory</span>
            <h1>About SolDirectory</h1>
            <p className="ac-lead">
              SolDirectory helps people find disability and aged care support that can actually start. You tell us what you need once, and
              providers who have confirmed this week that they’re taking new people can respond. You decide who to speak to, and you’re never
              obliged to go ahead.
            </p>
            <p className="ac-updated">Last updated: 15 October 2026</p>
          </div>
        </div>

        <div className="ac-wrap">
          <div className="ac-facts">
            <p className="ac-fact"><strong>Free for families</strong><span>SolDirectory is free for participants and families.</span></p>
            <p className="ac-fact"><strong>No cut of your fees</strong><span>We never take a cut of what a provider charges you.</span></p>
            <p className="ac-fact"><strong>Paying doesn’t rank higher</strong><span>Paying never moves a provider higher in results.</span></p>
          </div>

          <div className="ac-grid">
            <section className="ac-card">
              <h2>Why we built it</h2>
              <p>
                We run a registered NDIS provider ourselves, so we see both sides every day: families phoning ten providers to find one with
                room, and good providers who can’t reach the people looking for them. SolDirectory is built to close that gap honestly.
              </p>
            </section>

            <section className="ac-card">
              <h2>Who runs SolDirectory</h2>
              <p>
                SolDirectory is operated by {siteConfig.legalEntity}, based in Glenroy, Victoria. Our director is Safdar Hussain. You can reach us on{' '}
                <Link to="/contact">our contact page</Link>.
              </p>
            </section>

            <section className="ac-card ac-card-wide">
              <h2>Our related businesses, and how we keep things fair</h2>
              <p>We want you to know exactly who we are:</p>
              <ul>
                <li>
                  Our director also owns WeCare Disability Services, a registered NDIS provider. WeCare is listed on SolDirectory under the same
                  rules as every other provider. It’s labelled “Related business”, it gets no priority in matching, and it’s never added to a
                  request by hand.
                </li>
                <li>
                  Sol Business Consultant also helps organisations become registered NDIS providers. We only mention those services on pages for
                  providers and workers, clearly labelled as our own. Our guides for participants and families never recommend Sol.
                </li>
              </ul>
            </section>

            <section className="ac-card">
              <h2>How we make money</h2>
              <p>
                SolDirectory is free for participants and families. Providers can list for free, and pay a monthly subscription if they want to see
                the contact details of people who send requests. We never take a cut of what a provider charges you, and paying never moves a
                provider higher in results. Read exactly how results are ordered in our <Link to="/listing-and-ranking-policy">listing and ranking policy</Link>.
              </p>
            </section>

            <section className="ac-card">
              <h2>Where our listings come from</h2>
              <p>
                Some listings are providers who have joined SolDirectory and keep their profiles up to date. Others come from the public NDIS
                Commission and My Aged Care registers. See <Link to="/data-sources">data sources and attribution</Link>.
              </p>
            </section>
          </div>

          <section className="ac-cta" aria-labelledby="ac-cta-heading">
            <div>
              <h2 id="ac-cta-heading">Looking for support, or a provider yourself?</h2>
              <p>Tell us what you need once. It’s free, and you’re never obliged to go ahead.</p>
            </div>
            <div className="ac-cta-actions">
              <button type="button" className="btn-gradient btn-lg" onClick={() => openMatchModal()}>Get matched free</button>
              <Link className="ac-cta-link" to="/providers">List your business</Link>
              <Link className="ac-cta-link" to="/contact">Contact us</Link>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
