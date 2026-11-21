// スライド枠。Markdown のデッキか、別のページ（iframe）を、16:9 の枠に入れて再生する
//
// <div class="deck" data-src="hints/foo.md"></div>        Markdown のデッキ
// <div class="deck" data-page="timer.html"></div>         ページをそのまま枠に入れる
// data-title で枠の上の見出しを変えられる
//
// Markdown は、`---` の行があればそこで区切る。なければ `# ` の見出しごとに1枚にする
// 扱う記法: # 見出し、## 小見出し、- 箇条書き、段落、[リンク](URL)、**太字**、`コード`、![画像](URL)
(() => {
  const CSS = `
    .deck { margin: 0 0 32px; }
    .deck-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin: 0 0 6px; }
    .deck-title { font-weight: bold; font-size: 16px; }
    .deck-tools { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #777; white-space: nowrap; }
    .deck-tools button { font: inherit; padding: 2px 10px; border: 1px solid #999; border-radius: 999px; background: #fff; cursor: pointer; color: #222; }
    .deck-tools a { color: #777; }
    .deck-frame { position: relative; aspect-ratio: 16 / 9; border: 2px solid #222; border-radius: 8px; background: #fffdf5; overflow: hidden; container-type: inline-size; }
    .deck-frame:fullscreen { border: 0; border-radius: 0; aspect-ratio: auto; }
    .deck-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #fffdf5; }
    .deck-slide { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 5cqw 7cqw; font-size: 3.6cqw; line-height: 1.5; overflow: auto; cursor: pointer; user-select: none; color: #222; }
    .deck-slide.title { align-items: center; text-align: center; }
    .deck-slide h1, .deck-slide h2 { display: block; border: 0; padding: 0; font-weight: bold; }
    .deck-slide h1 { font-size: 1.6em; margin: 0 0 0.3em; line-height: 1.3; }
    .deck-slide h2 { font-size: 1.25em; margin: 0 0 0.5em; line-height: 1.3; }
    .deck-slide ul { margin: 0 0 0.5em; padding-left: 1.2em; }
    .deck-slide p { margin: 0 0 0.5em; }
    .deck-slide a { color: #0a58ca; font-size: 0.7em; }
    .deck-slide h1 a, .deck-slide h2 a { font-size: inherit; }
    .deck-slide code { font-size: 0.9em; background: #f0ece0; padding: 0 0.2em; border-radius: 3px; }
    .deck-slide img { max-width: 100%; max-height: 60cqw; object-fit: contain; }
    .deck-frame:fullscreen .deck-slide { font-size: min(3.6vw, 6.4vh); padding: 5vh 8vw; }
    .deck-progress { position: absolute; left: 0; bottom: 0; height: 4px; background: #f0b400; transition: width 0.2s; }
  `;

  const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\(((?:https?:\/\/|\/|\.)[^)\s]*)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const renderPage = (md) => {
    const html = [];
    let list = null;
    const close = () => { if (list) { html.push(`<ul>${list.join('')}</ul>`); list = null; } };
    for (const line of md.trim().split('\n')) {
      if (/^\s*[-*] /.test(line)) { (list ||= []).push(`<li>${inline(line.replace(/^\s*[-*] /, ''))}</li>`); continue; }
      close();
      if (line.startsWith('# ')) html.push(`<h1>${inline(line.slice(2))}</h1>`);
      else if (line.startsWith('## ')) html.push(`<h2>${inline(line.slice(3))}</h2>`);
      else if (line.startsWith('### ')) html.push(`<h2>${inline(line.slice(4))}</h2>`);
      else if (line.trim()) html.push(`<p>${inline(line)}</p>`);
    }
    close();
    return html.join('');
  };

  const split = (md) => {
    const pages = /^---\s*$/m.test(md) ? md.split(/^---\s*$/m) : md.split(/^(?=# )/m);
    return pages.map((p) => p.trim()).filter(Boolean);
  };
  // 見出しだけ（と短い行が1つ）のページは、表紙として真ん中に置く
  const isTitle = (p) => /^# /.test(p) && p.split('\n').filter((l) => l.trim()).length <= 2 && !/^\s*- /m.test(p);

  let active = null;
  const decks = [];

  const mount = async (el) => {
    const title = el.dataset.title || '';
    el.innerHTML = `<div class="deck-head"><span class="deck-title">${esc(title)}</span><span class="deck-tools"></span></div><div class="deck-frame"></div>`;
    const frame = el.querySelector('.deck-frame');
    const tools = el.querySelector('.deck-tools');
    const full = () => (document.fullscreenElement ? document.exitFullscreen() : frame.requestFullscreen?.());

    if (el.dataset.page) {
      frame.innerHTML = `<iframe src="${esc(el.dataset.page)}" loading="lazy" title="${esc(title)}"></iframe>`;
      tools.innerHTML = `<button data-full>全画面</button><a href="${esc(el.dataset.page)}" target="_blank" rel="noopener">別のタブで開く</a>`;
      tools.querySelector('[data-full]').onclick = full;
      return;
    }

    const md = await (await fetch(el.dataset.src)).text();
    const pages = split(md);
    if (!title) el.querySelector('.deck-title').textContent = (pages[0].match(/^# (.+)$/m) || [, ''])[1].replace(/\[(.+?)\]\(.+?\)/g, '$1');
    let n = 0;
    tools.innerHTML = `<button data-d="-1">←</button><span class="deck-page"></span><button data-d="1">→</button><button data-full>全画面</button><a href="deck.html?src=${encodeURIComponent(el.dataset.src)}" target="_blank" rel="noopener">別のタブで開く</a>`;
    frame.innerHTML = '<div class="deck-slide"></div><div class="deck-progress"></div>';
    const slide = frame.querySelector('.deck-slide');
    const show = () => {
      slide.innerHTML = renderPage(pages[n]);
      slide.classList.toggle('title', n === 0 || isTitle(pages[n]));
      slide.scrollTop = 0;
      tools.querySelector('.deck-page').textContent = `${n + 1} / ${pages.length}`;
      frame.querySelector('.deck-progress').style.width = `${((n + 1) / pages.length) * 100}%`;
    };
    const move = (d) => { n = Math.min(Math.max(n + d, 0), pages.length - 1); show(); };
    tools.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => { active = move; move(Number(b.dataset.d)); }));
    tools.querySelector('[data-full]').onclick = () => { active = move; full(); };
    // 枠の左3分の1で戻る、それ以外で進む。リンクのクリックは除く
    slide.addEventListener('click', (e) => {
      active = move;
      if (e.target.closest('a')) return;
      const r = slide.getBoundingClientRect();
      move(e.clientX - r.left < r.width / 3 ? -1 : 1);
    });
    decks.push(move);
    if (!active) active = move;
    show();
  };

  // 最後に触った枠を、キーで動かす
  addEventListener('keydown', (e) => {
    if (!active || /input|textarea|select/i.test(document.activeElement?.tagName || '')) return;
    if (['ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && document.fullscreenElement)) { e.preventDefault(); active(1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); active(-1); }
  });

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  window.mountDecks = (root = document) => Promise.all([...root.querySelectorAll('.deck:not([data-mounted])')].map((el) => { el.dataset.mounted = ''; return mount(el); }));
  window.addEventListener('DOMContentLoaded', () => window.mountDecks());
})();
