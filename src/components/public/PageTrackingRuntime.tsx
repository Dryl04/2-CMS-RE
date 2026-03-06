import { useEffect, useState } from 'react';
import { TrackingIntegration } from '@/lib/supabase';
import {
  canLoadIntegration,
  generateTrackingMarkup,
  readConsentPreferences,
  resolveTrackingIntegrations,
} from '@/lib/trackingIntegrations';

interface PageTrackingRuntimeProps {
  pageId?: string | null;
}

function mountManagedMarkup(target: HTMLElement, html: string, marker: string, insertAtStart = false): HTMLElement[] {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const nodes: HTMLElement[] = [];

  Array.from(template.content.childNodes).forEach((node, index) => {
    let nextNode: Node;
    if (node.nodeName.toLowerCase() === 'script') {
      const sourceScript = node as HTMLScriptElement;
      const script = document.createElement('script');
      Array.from(sourceScript.attributes).forEach((attribute) => script.setAttribute(attribute.name, attribute.value));
      script.text = sourceScript.text;
      script.dataset.seoTracking = marker;
      nextNode = script;
    } else {
      const element = node.cloneNode(true) as HTMLElement;
      if (element instanceof HTMLElement) {
        element.dataset.seoTracking = marker;
      }
      nextNode = element;
    }

    const domNode = nextNode as HTMLElement;
    if (insertAtStart && index === 0) {
      target.insertBefore(domNode, target.firstChild);
    } else {
      target.appendChild(domNode);
    }
    nodes.push(domNode);
  });

  return nodes;
}

function getTarget(placement: TrackingIntegration['placement']): { target: HTMLElement; insertAtStart: boolean } {
  if (placement === 'head') {
    return { target: document.head, insertAtStart: false };
  }
  if (placement === 'body_start') {
    return { target: document.body, insertAtStart: true };
  }
  return { target: document.body, insertAtStart: false };
}

export default function PageTrackingRuntime({ pageId }: PageTrackingRuntimeProps) {
  const [integrations, setIntegrations] = useState<TrackingIntegration[]>([]);

  useEffect(() => {
    let cancelled = false;
    resolveTrackingIntegrations(pageId)
      .then((items) => {
        if (!cancelled) setIntegrations(items);
      })
      .catch((error) => console.error('[PageTrackingRuntime] Error resolving integrations:', error));

    return () => {
      cancelled = true;
    };
  }, [pageId]);

  useEffect(() => {
    const rerender = () => {
      resolveTrackingIntegrations(pageId)
        .then((items) => setIntegrations(items))
        .catch((error) => console.error('[PageTrackingRuntime] Error refreshing integrations:', error));
    };

    window.addEventListener('seo-consent-changed', rerender);
    return () => window.removeEventListener('seo-consent-changed', rerender);
  }, [pageId]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const preferences = readConsentPreferences();
    const mountedNodes: HTMLElement[] = [];

    integrations
      .filter((integration) => canLoadIntegration(integration, preferences))
      .forEach((integration) => {
        const markup = generateTrackingMarkup(integration);
        if (!markup.trim()) return;
        const marker = integration.id;
        const { target, insertAtStart } = getTarget(integration.placement);
        mountedNodes.push(...mountManagedMarkup(target, markup, marker, insertAtStart));
      });

    return () => {
      mountedNodes.forEach((node) => node.remove());
    };
  }, [integrations]);

  return null;
}