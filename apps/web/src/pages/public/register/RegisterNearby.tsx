import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProviderMap from '../../../components/ProviderMap';
import { searchRegister, type RegisterSearchResult } from '../../../api/registerApi';
import { KIND_BY_TYPE, REGISTER_KINDS, categoryForService, registerPath, stateByCode, type RegisterType } from '../../../lib/registerMeta';
import RegisterCard from './RegisterCard';
import { formatCount } from './RegisterParts';

interface Props {
  serviceName: string; suburbSlug: string; suburbName: string; stateAbbr: string;
  /** Called once the listings are known, with the listings across both registers — the page uses it to decide whether it is indexed. */
  onTotal?: (total: number) => void;
}

/**
 * Public-register listings for a service x suburb page. These are separate
 * from active SolDirectory member profiles and must retain their source label.
 * One section per register (NDIS, My Aged Care), each with its own count; a
 * register with no matching listings shows nothing.
 */
export default function RegisterNearby({ serviceName, suburbSlug, suburbName, stateAbbr, onTotal }: Props) {
  const state = stateByCode(stateAbbr);
  const category = categoryForService(serviceName);
  // A support with a register category is looked up in both registers. One without (an aged-care page) uses the register its name implies.
  const types: RegisterType[] = category ? ['ndis', 'aged_care'] : [/aged/i.test(serviceName) ? 'aged_care' : 'ndis'];
  const typesKey = types.join(',');
  const [results, setResults] = useState<{ type: RegisterType; data: RegisterSearchResult }[] | null>(null);

  useEffect(() => {
    if (!state) { onTotal?.(0); return; }
    let alive = true;
    setResults(null);
    Promise.all(
      typesKey.split(',').map((type) =>
        searchRegister({ type: type as RegisterType, state: state.code, suburb: suburbSlug, category, limit: 6 })
          .then((data) => ({ type: type as RegisterType, data }))
          .catch(() => null)
      )
    ).then((rows) => {
      if (!alive) return;
      const ok = rows.filter((r): r is { type: RegisterType; data: RegisterSearchResult } => r !== null);
      setResults(ok);
      onTotal?.(ok.reduce((n, r) => n + r.data.total, 0));
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesKey, state, suburbSlug, category]);

  if (!state || !results) return null;
  const shown = results.filter((r) => r.data.total > 0);
  if (shown.length === 0) return null;

  return (
    <>
      {shown.map(({ type, data }, index) => {
        const kind = KIND_BY_TYPE[type];
        const seeAll = `${registerPath(kind, state.slug, suburbSlug)}${category ? `?category=${encodeURIComponent(category)}` : ''}`;
        const headingId = `register-heading-${type}`;
        return (
          <section key={type} id={index === 0 ? 'register' : `register-${type}`} aria-labelledby={headingId}>
            <h2 className="svc-h2" id={headingId}>{kind.label} register listings for {serviceName.toLowerCase()} in {suburbName}</h2>
            <p className="svc-p">
              {formatCount(data.total)} {kind.plain} {data.total === 1 ? 'listing includes' : 'listings include'} {category?.toLowerCase() ?? serviceName.toLowerCase()} among the supports recorded on the {kind.register} for {suburbName}. These are public-register listings, shown separately from SolDirectory member profiles. Confirm current services and availability directly with each organisation.
            </p>
            <ProviderMap
              providers={data.items.map((item) => ({
                id: `${item.type}-${item.slug}`,
                name: item.name,
                location: item.location,
                category: item.supportCategories[0] ?? null,
                suburb: item.areas[0] ? `${item.areas[0].suburb}, ${item.areas[0].state}` : null,
                href: registerPath(kind, item.slug),
              }))}
            />
            <ul className="dir-grid">{data.items.map((i) => <RegisterCard key={`${i.type}-${i.slug}`} item={i} />)}</ul>
            <p className="svc-p"><Link to={seeAll}>See all {formatCount(data.total)} {kind.plain} providers listed in {suburbName} →</Link></p>
          </section>
        );
      })}
    </>
  );
}
// Keep REGISTER_KINDS referenced so the kind table is the single source for paths.
void REGISTER_KINDS;
