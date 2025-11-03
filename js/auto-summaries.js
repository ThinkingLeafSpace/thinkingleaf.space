/**
 * Auto-fill blog summaries (15-20 Chinese characters) on homepage and blogs page.
 * Strategy: for each anchor linking to blogs/, if its <p> is empty, fetch the page,
 * extract the first meaningful paragraph text, and inject a truncated summary.
 */
(function () {
    function truncateChinese(text, minLen, maxLen) {
        const clean = (text || '').replace(/\s+/g, '').replace(/\u200B/g, '');
        if (!clean) return '';
        if (clean.length <= maxLen) return clean;
        const cut = clean.slice(0, maxLen);
        // Try to end on common punctuation for better readability
        const punctIdx = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('！'), cut.lastIndexOf('？'), cut.lastIndexOf('，'));
        const preferred = punctIdx >= minLen - 1 ? cut.slice(0, punctIdx + 1) : cut;
        return preferred + (preferred.length < text.length ? '…' : '');
    }

    async function extractSummaryFromHTML(htmlText) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            // Priority 1: meta description
            const meta = doc.querySelector('meta[name="description"]');
            if (meta && meta.getAttribute('content')) {
                const m = meta.getAttribute('content');
                const t = truncateChinese(m, 15, 20);
                if (t) return t;
            }
            // Priority 2: first non-empty paragraph in main content
            const candidates = doc.querySelectorAll('main p, .post-content p, .blog-body p, article p, body p');
            for (const p of candidates) {
                const txt = (p.textContent || '').trim();
                const t = truncateChinese(txt, 15, 20);
                if (t && t.length >= 6) return t; // avoid extremely short
            }
            // Priority 3: use title
            const h1 = doc.querySelector('h1, .post-header h1, .blog-header h1');
            if (h1 && h1.textContent) {
                return truncateChinese(h1.textContent, 15, 20);
            }
        } catch (e) {
            // ignore
        }
        return '';
    }

    async function fillForAnchor(anchor, paragraph) {
        if (!anchor || !paragraph) return;
        const current = (paragraph.textContent || '').trim();
        if (current && current.length >= 6) return; // already has content
        const href = anchor.getAttribute('href');
        if (!href || !href.startsWith('blogs/')) return;
        try {
            const res = await fetch(href, { credentials: 'same-origin' });
            if (!res.ok) return;
            const html = await res.text();
            const summary = await extractSummaryFromHTML(html);
            if (summary) {
                paragraph.textContent = summary;
            }
        } catch (_) {
            // fail silently
        }
    }

    function init() {
        // Blogs page cards
        document.querySelectorAll('a.link-card[href^="blogs/"]').forEach(function (a) {
            const p = a.querySelector('.link-content p');
            if (p) fillForAnchor(a, p);
        });
        // Homepage latest blog cards
        document.querySelectorAll('.content-card a[href^="blogs/"]').forEach(function (a) {
            const p = a.querySelector('p');
            if (p) fillForAnchor(a, p);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


