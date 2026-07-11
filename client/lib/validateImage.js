// Client-side image URL validation — used both at save time (dashboard forms)
// and can be reused anywhere we need to confirm a URL actually loads as an image.
export function validateImageUrl(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!url || !url.trim()) { resolve(false); return; }

    const img = new Image();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(result);
    };

    const timer = setTimeout(() => finish(false), timeoutMs);

    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;
  });
}
