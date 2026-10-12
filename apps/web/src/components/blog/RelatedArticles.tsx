import { Link } from 'react-router-dom';
import { relatedArticles } from '@soldirectory/topic-content';
import './RelatedArticles.css';
import { blogThumb, fullImageFallback } from './blogThumb';

interface Props {
  /** A service name from the catalogue ("Personal care"), when the page is about one. */
  service?: string;
  /** What the page is about: choosing, registration, agreement, workers, funding, plan, housing, assistive, local, regional, moving, news. */
  themes?: string[];
  heading?: string;
  intro?: string;
  limit?: number;
  /** Set when the section is placed outside the page's own centred column and needs its own gutters. */
  standalone?: boolean;
}

/**
 * "Helpful reading" for any page: the blog articles that belong with it, picked by relatedArticles() (the same picker the
 * crawler-readable pages use), so every individual service, place, provider and topic page has articles under it.
 */
export default function RelatedArticles({ service, themes = ['choosing'], heading, intro, limit = 3, standalone = false }: Props) {
  const articles = relatedArticles({ service, themes, limit });
  if (articles.length === 0) return null;
  const title = heading ?? (service ? `Reading about ${service}` : 'Helpful reading');

  return (
    <section className={`ra${standalone ? ' ra-standalone' : ''}`} aria-labelledby="ra-heading">
      <div className="ra-head">
        <div>
          <span className="ra-eyebrow">From the SolDirectory blog</span>
          <h2 id="ra-heading">{title}</h2>
          {intro && <p>{intro}</p>}
        </div>
        <Link className="ra-all" to="/blog">All articles →</Link>
      </div>
      <ul className="ra-list">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link className="ra-card" to={`/blog/${a.slug}`}>
              <span className="ra-photo"><img src={blogThumb(a.coverImage)} onError={fullImageFallback(a.coverImage)} alt="" width={800} height={450} loading="lazy" decoding="async" /></span>
              <span className="ra-body">
                <span className="ra-cat">{a.category}</span>
                <strong>{a.title}</strong>
                <span>{a.summary}</span>
                <span className="ra-read">Read the article →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
