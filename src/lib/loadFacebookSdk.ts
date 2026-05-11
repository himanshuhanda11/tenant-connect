// Lazy-load the Facebook JS SDK only when a page actually needs it
// (Meta Embedded Signup / Meta Ads connect flows). Avoids loading
// ~200KB of FB SDK on every page (homepage, marketing pages, etc.).

const FB_APP_ID = '1584691426114330';
const FB_VERSION = 'v21.0';

let loaderPromise: Promise<typeof window.FB> | null = null;

export function loadFacebookSdk(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if ((window as any).FB) return Promise.resolve((window as any).FB);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    (window as any).fbAsyncInit = function () {
      try {
        (window as any).FB.init({
          appId: FB_APP_ID,
          cookie: true,
          xfbml: true,
          version: FB_VERSION,
        });
        resolve((window as any).FB);
      } catch (e) {
        reject(e);
      }
    };

    const id = 'facebook-jssdk';
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=${FB_VERSION}&appId=${FB_APP_ID}`;
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.body.appendChild(script);
  });

  return loaderPromise;
}
