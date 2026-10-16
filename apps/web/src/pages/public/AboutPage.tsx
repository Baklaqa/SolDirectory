import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader, PublicFooter } from './PublicLayout';
import { applySeoTags } from '../../lib/seo';
import { siteConfig } from '../../config/siteConfig';
import './LegalPage.css';

/** /about: who operates SolDirectory, how it makes money, and the ownership disclosure. */
export default function AboutPage() {
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
      <main className="legal-page">
        <nav className="legal-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>About</span>
        </nav>
        <h1>About SolDirectory</h1>
        <p className="legal-summary">Last updated: 15 October 2026</p>
        <p className="legal-summary">
          SolDirectory helps people find disability and aged care support that can actually start. You tell us what you need once, and
          providers who have confirmed this week that they’re taking new people can respond. You decide who to speak to, and you’re never
          obliged to go ahead.
        </p>

        <section className="legal-section">
          <h2>Why we built it</h2>
          <p>
            We run a registered NDIS provider ourselves, so we see both sides every day: families phoning ten providers to find one with room,
            and good providers who can’t reach the people looking for them. SolDirectory is built to close that gap honestly.
          </p>
        </section>

        <section className="legal-section">
          <h2>Who runs SolDirectory</h2>
          <p>
            SolDirectory is operated by {siteConfig.legalEntity}, based in Glenroy, Victoria. Our director is Safdar Hussain. You can reach us on{' '}
            <Link to="/contact">our contact page</Link>.
          </p>
        </section>

        <section className="legal-section">
          <h2>Our related businesses, and how we keep things fair</h2>
          <p>We want you to know exactly who we are:</p>
          <ul className="guide-list">
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

        <section className="legal-section">
          <h2>How we make money</h2>
          <p>
            SolDirectory is free for participants and families. Providers can list for free, and pay a monthly subscription if they want to see
            the contact details of people who send requests. We never take a cut of what a provider charges you, and paying never moves a
            provider higher in results. Read exactly how results are ordered in our <Link to="/listing-and-ranking-policy">listing and ranking policy</Link>.
          </p>
        </section>

        <section className="legal-section">
          <h2>Where our listings come from</h2>
          <p>
            Some listings are providers who have joined SolDirectory and keep their profiles up to date. Others come from the public NDIS
            Commission and My Aged Care registers. See <Link to="/data-sources">data sources and attribution</Link>.
          </p>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
