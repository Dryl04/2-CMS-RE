import { normalizeInternalPath } from "@/lib/linkRegistry";
import { Site, SiteDomain, supabase } from "@/lib/supabase";

export async function loadSites() {
  const { data, error } = await supabase.from("sites").select("*");
  if (error) {
    throw error;
  }

  const sites = ((data || []) as Site[]).slice();
  sites.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return sites;
}

export function getActiveSiteDomains(site?: Site | null) {
  return ((site?.domains || []) as SiteDomain[]).filter(
    (domain) => domain.is_active,
  );
}

export function getCanonicalSiteDomain(
  site?: Site | null,
  preferredDomainId?: string | null,
) {
  const domains = getActiveSiteDomains(site);
  if (!domains.length) {
    return null;
  }

  if (preferredDomainId) {
    const preferred = domains.find((domain) => domain.id === preferredDomainId);
    if (preferred) {
      return preferred;
    }
  }

  return (
    domains.find((domain) => domain.is_canonical) ||
    domains.find((domain) => domain.is_primary) ||
    domains[0]
  );
}

export function getSiteLabel(site?: Site | null) {
  if (!site) {
    return "Aucun groupe";
  }

  return `${site.name} · ${site.code}`;
}

export function getDomainLabel(domain?: SiteDomain | null) {
  if (!domain) {
    return "Aucun domaine";
  }

  return `${domain.scheme}://${domain.host}`;
}

export function buildSitePageUrl(
  site: Site | null | undefined,
  pageKey: string,
  preferredDomainId?: string | null,
) {
  const domain = getCanonicalSiteDomain(site, preferredDomainId);
  if (!domain) {
    return null;
  }

  const normalizedPath = normalizeInternalPath(pageKey);
  return normalizedPath
    ? `${domain.scheme}://${domain.host}/${normalizedPath}`
    : `${domain.scheme}://${domain.host}`;
}

export function extractDomainIdFromCanonicalUrl(
  site: Site | null | undefined,
  canonicalUrl?: string | null,
) {
  if (!site || !canonicalUrl) {
    return null;
  }

  try {
    const url = new URL(canonicalUrl);
    const domain = (site.domains || []).find(
      (item) => item.host === url.host || item.host === url.hostname,
    );
    return domain?.id ?? null;
  } catch {
    return null;
  }
}
