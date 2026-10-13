import { Link } from 'react-router-dom';
import { EDITORIAL_BLOG_POSTS } from '@soldirectory/topic-content';
import { blogThumb, fullImageFallback } from './blogThumb';
import '../directory/DirectoryExtras.css';

/**
 * A hand-picked set of blog articles shown as cards, newest settings first as listed. Used where a page wants to point
 * at specific reading (the Independent workers and For providers pages) rather than at "whatever matches a theme".
 * Slugs that do not exist, or articles that have expired, are skipped.
 */
export default function ArticleCards({
  slugs,
  eyebrow,
  heading,
  lede,
  headingId,
}: {
  slugs: string[];
  eyebrow: string;
  heading: string;
  lede?: string;
  headingId: string;
}) {
  const now = Date.now();
  const posts = slugs
    .map((slug) => EDITORIAL_BLOG_POSTS.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && (!p!.expiresAt || new Date(p!.expiresAt).getTime() > now));
  if (!posts.length) return null;

  return (
    <section className="dx-section" aria-labelledby={headingId}>
      <div className="dx-head-row">
        <div>
          <span className="eyebrow"><span className="eyebrow-rule" />{eyebrow}</span>
          <h2 id={headingId} className="dx-h2">{heading}</h2>
          {lede && <p className="dx-lede">{lede}</p>}
        </div>
        <Link className="dx-all" to="/blog">All articles →</Link>
      </div>
      <ul className="dx-guides">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={`/blog/${post.slug}`} className="dx-guide">
              <span className="dx-guide-photo">
                <img src={blogThumb(post.coverImage)} onError={fullImageFallback(post.coverImage)} alt="" width={800} height={450} loading="lazy" decoding="async" />
              </span>
              <span className="dx-guide-body">
                <span className="dx-guide-cat">{post.category}</span>
                <strong>{post.title}</strong>
                <span>{post.summary}</span>
                <span className="dx-guide-read">Read the guide →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
