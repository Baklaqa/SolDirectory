import { Fragment } from 'react';
import { Link } from 'react-router-dom';

const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

/**
 * Text with links written as [label](/path), as the shared page copy in @soldirectory/topic-content writes them. The server
 * turns the same markup into plain <a> tags for crawlers, so the words and the links match on both sides.
 */
export default function InlineLinks({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  LINK.lastIndex = 0;
  while ((match = LINK.exec(text))) {
    if (match.index > last) out.push(<Fragment key={`t${last}`}>{text.slice(last, match.index)}</Fragment>);
    out.push(<Link key={`l${match.index}`} to={match[2]}>{match[1]}</Link>);
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}
