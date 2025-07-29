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
    // Check if ASSETS binding is available
    if (!env.ASSETS) {
      console.log('ASSETS binding not available');
      return new Response('ASSETS binding not configured', { status: 500 });
    }
    
    const response = await env.ASSETS.fetch(request);
    
    // Only modify HTML responses
    const contentType = response.headers.get('Content-Type');
    console.log(`Request: ${request.url}, Content-Type: ${contentType}, Has Token: ${!!env.CF_BEACON_TOKEN}`);
    
    if (contentType && contentType.includes('text/html') && env.CF_BEACON_TOKEN) {
      console.log('Injecting analytics beacon');
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