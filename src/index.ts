class AnalyticsInjector {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  element(element: Element) {
    const scriptTag = `<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${this.token}"}'></script>`;
    element.append(scriptTag, { html: true } as any);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    
    // Only modify HTML responses
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/html') && env.CF_BEACON_TOKEN) {
      // @ts-ignore
      return new HTMLRewriter()
        .on('body', new AnalyticsInjector(env.CF_BEACON_TOKEN))
        .transform(response);
    }
    
    return response;
  },
};

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  CF_BEACON_TOKEN: string;
}