# fudurich.org

Static one-page website for Kim Fudurich, voice over artist. No build step — plain HTML, CSS, and JS.

## Files

- `index.html` — page structure and content
- `styles.css` — all styling
- `script.js` — nav toggle, shared audio player, form submission
- `assets/` — images, audio demos, video files

## Local preview

Open `index.html` in a browser, or from this folder run:

```
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Contact form

The form submits to [Formspree](https://formspree.io). The `action` attribute in `index.html` must be replaced with your Formspree endpoint URL before deployment.

## Deployment

Hosted on Cloudflare Pages, pulling from this repository. DNS for `fudurich.org` points at Cloudflare.
