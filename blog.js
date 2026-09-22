!function () {
  "use strict";
  function makeCoverImage(seedText, colorA, colorB, colorC) {
    var uid = "bg" + Math.random().toString(36).slice(2, 8);
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + colorA + '"/>' +
      '<stop offset="0.55" stop-color="' + colorB + '"/>' +
      '<stop offset="1" stop-color="' + colorC + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="900" height="540" fill="url(%23' + uid + ')"/>' +
      '<text x="450" y="340" font-size="220" text-anchor="middle" fill="white" opacity="0.20" font-family="serif">' + seedText + '</text>' +
      '</svg>';
    return "data:image/svg+xml," + svg.replace(/#/g, "%23").replace(/"/g, "'");
  }
  var BLOG_POSTS = [];
  var isBlogLoaded = false;
  async function fetchBlogPosts() {
    if (isBlogLoaded) return;
    try {
      const res = await fetch('api/get_blogs.php');
      const json = await res.json();
      if (json.status === 'success') {
        BLOG_POSTS = json.data.map(item => {
          let tmp = document.createElement("div");
          tmp.innerHTML = item.konten;
          let textContent = tmp.textContent || tmp.innerText || "";
          let excerpt = textContent.substring(0, 130) + "...";
          let wordCount = textContent.split(/\s+/).length;
          let readTime = Math.max(1, Math.ceil(wordCount / 200)) + " menit baca";
          let dateObj = new Date(item.tanggal_dibuat);
          let dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          return {
            slug: item.slug,
            title: item.judul,
            excerpt: excerpt,
            author: item.penulis || "Anggota Blunder Squad",
            date: dateStr,
            readTime: readTime,
            tag: item.kategori,
            cover: item.cover_image ? 'assets/blog_covers/' + item.cover_image : makeCoverImage(item.judul.charAt(0).toUpperCase(), "%2338BDF8", "%230369A1", "%230A0612"),
            contentRaw: item.konten 
          };
        });
      }
    } catch (e) {
      console.error("Gagal mengambil data blog:", e);
    }
    isBlogLoaded = true;
  }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c === null || c === undefined) return;
        if (typeof c === "string") node.appendChild(document.createTextNode(c));
        else node.appendChild(c);
      });
    }
    return node;
  }
  function findPost(slug) {
    for (var i = 0; i < BLOG_POSTS.length; i++) {
      if (BLOG_POSTS[i].slug === slug) return BLOG_POSTS[i];
    }
    return null;
  }
  var mainChildren = null;
  var blogRoot = null;
  function getAppRoot() { return document.getElementById("app-root") || document.body; }
  function hideMainSite() {
    var root = getAppRoot();
    var children = qsa(":scope > *", root).filter(function (n) { 
      return n !== blogRoot && n.id !== "toastStack" && !n.classList.contains("preloader") && n.id !== "chatWidgetRoot"; 
    });
    children.forEach(function (n) { if (n && n.parentNode) n.style.display = "none"; });
    mainChildren = children;
  }
  function showMainSite() {
    if (!mainChildren) return;
    mainChildren.forEach(function (n) { if (n) n.style.display = ""; });
  }
  function ensureBlogRoot() {
    if (blogRoot) return blogRoot;
    blogRoot = el("div", { id: "blogRoot", class: "blog-root" });
    getAppRoot().appendChild(blogRoot);
    return blogRoot;
  }
  function scrollTop() { window.scrollTo({ top: 0, behavior: "auto" }); }
  function renderBlogList() {
    var root = ensureBlogRoot();
    root.innerHTML = "";
    root.style.display = "";
    var wrap = el("section", { class: "section-pad blog-page", id: "blogList" });
    var container = el("div", { class: "container" });
    var backBtn = el("button", { class: "blog-back-btn", "aria-label": "Kembali ke beranda" },
      [el("span", { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>' }), "Kembali ke Beranda"]
    );
    backBtn.addEventListener("click", function () { navigateTo("main"); });
    var head = el("div", { class: "section-head reveal is-visible" }, [
      el("div", { class: "eyebrow" }, "Blog"),
      el("h2", { class: "section-title" }, [ "Cerita & Wawasan ", el("span", { class: "grad-text" }, "Seputar Catur") ]),
      el("p", { class: "section-sub" }, "Kumpulan artikel dari komunitas Blunder Squad — strategi, psikologi permainan, sampai kebiasaan latihan yang bisa langsung dicoba.")
    ]);
    var grid = el("div", { class: "blog-grid" });
    if (BLOG_POSTS.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-faint); grid-column: 1/-1; text-align: center;">Belum ada artikel yang dipublikasikan.</p>';
    } else {
      BLOG_POSTS.forEach(function (post) {
        var card = el("article", { class: "blog-card", tabindex: "0", role: "button", "aria-label": "Baca artikel: " + post.title }, [
          el("div", { class: "blog-card-media" }, [
            el("img", { src: post.cover, alt: post.title, loading: "lazy" }),
            el("span", { class: "blog-card-tag" }, post.tag)
          ]),
          el("div", { class: "blog-card-body" }, [
            el("div", { class: "blog-card-meta" }, post.date + " · " + post.readTime),
            el("h3", { class: "blog-card-title" }, post.title),
            el("p", { class: "blog-card-excerpt" }, post.excerpt),
            el("span", { class: "blog-card-readmore" }, ["Baca selengkapnya ", el("svg", { html: '<path d="M5 12h14M13 6l6 6-6 6"/>', viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round" })])
          ])
        ]);
        function openPost() { navigateTo("post", post.slug); }
        card.addEventListener("click", openPost);
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPost(); }
        });

        grid.appendChild(card);
      });
    }
    container.appendChild(backBtn);
    container.appendChild(head);
    container.appendChild(grid);
    wrap.appendChild(container);
    root.appendChild(wrap);
    scrollTop();
  }
  function renderBlogPost(slug) {
    var post = findPost(slug);
    var root = ensureBlogRoot();
    root.innerHTML = "";
    root.style.display = "";

    if (!post) {
      renderBlogList();
      return;
    }
    var wrap = el("section", { class: "section-pad blog-page", id: "blogPost" });
    var container = el("div", { class: "container blog-post-container" });
    var backBtn = el("button", { class: "blog-back-btn", "aria-label": "Kembali ke daftar blog" },
      [el("span", { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>' }), "Kembali ke Daftar Blog"]
    );
    backBtn.addEventListener("click", function () { navigateTo("blog"); });
    var hero = el("div", { class: "blog-post-hero" }, [
      el("img", { src: post.cover, alt: post.title }),
    ]);
    var meta = el("div", { class: "blog-post-meta" }, [
      el("span", { class: "chip chip-blue" }, post.tag),
      el("span", { class: "blog-post-meta-text" }, post.date + " · " + post.readTime + " · oleh " + post.author)
    ]);
    var title = el("h1", { class: "blog-post-title" }, post.title);
    var body = el("div", { class: "blog-post-body quill-render", html: post.contentRaw });
    container.appendChild(backBtn);
    container.appendChild(hero);
    container.appendChild(meta);
    container.appendChild(title);
    container.appendChild(body);
    var others = BLOG_POSTS.filter(function (p) { return p.slug !== post.slug; }).slice(0, 2);
    if (others.length) {
      var moreWrap = el("div", { class: "blog-post-more" });
      moreWrap.appendChild(el("h3", { class: "blog-post-more-title" }, "Artikel Lainnya"));
      var moreGrid = el("div", { class: "blog-grid blog-grid-small" });
      others.forEach(function (p) {
        var c = el("article", { class: "blog-card", tabindex: "0", role: "button" }, [
          el("div", { class: "blog-card-media" }, [
            el("img", { src: p.cover, alt: p.title, loading: "lazy" }),
            el("span", { class: "blog-card-tag" }, p.tag)
          ]),
          el("div", { class: "blog-card-body" }, [
            el("div", { class: "blog-card-meta" }, p.date + " · " + p.readTime),
            el("h3", { class: "blog-card-title" }, p.title)
          ])
        ]);
        c.addEventListener("click", function() { navigateTo("post", p.slug); });
        moreGrid.appendChild(c);
      });
      moreWrap.appendChild(moreGrid);
      container.appendChild(moreWrap);
    }
    wrap.appendChild(container);
    root.appendChild(wrap);
    scrollTop();
  }
  async function navigateTo(view, slug, opts) {
    opts = opts || {};
    var url;
    if (view === "blog") url = "#blog";
    else if (view === "post") url = "#blog/" + slug;
    else url = "#top";

    if (!opts.silent) {
      history.pushState({ blogView: view, blogSlug: slug || null }, "", url);
    }
    await render(view, slug);
  }
  async function render(view, slug) {
    if (view === "blog" || view === "post") {
      hideMainSite();
      var root = ensureBlogRoot();
      if (!isBlogLoaded) {
        root.innerHTML = '<div style="padding: 120px 20px; text-align: center; color: var(--text-faint);">Memuat artikel...</div>';
        root.style.display = "";
        await fetchBlogPosts(); 
      }
      if (view === "blog") renderBlogList();
      else renderBlogPost(slug);
    } else {
      if (blogRoot) blogRoot.style.display = "none";
      showMainSite();
    }
  }
  function parseHash() {
    var h = window.location.hash || "";
    if (h.indexOf("#blog/") === 0) return { view: "post", slug: h.slice(6) };
    if (h === "#blog") return { view: "blog", slug: null };
    return { view: "main", slug: null };
  }
  window.addEventListener("popstate", function () {
    var parsed = parseHash();
    render(parsed.view, parsed.slug);
  });
  function injectBlogNavLinks() {
    var navDesktop = document.getElementById("navDesktop");
    var navMobile = document.getElementById("navMobile");
    if (!navDesktop && !navMobile) return false;

    if (navDesktop && !navDesktop.querySelector('[data-blog-nav]')) {
      var linkDesktop = el("a", { href: "#blog", class: "nav-link", "data-blog-nav": "1" }, "Blog");
      linkDesktop.addEventListener("click", function (e) {
        e.preventDefault(); navigateTo("blog");
      });
      navDesktop.appendChild(linkDesktop);
    }
    if (navMobile && !navMobile.querySelector('[data-blog-nav-mobile]')) {
      var linkMobile = el("a", { href: "#blog", class: "nav-link", "data-blog-nav-mobile": "1" }, "Blog");
      linkMobile.addEventListener("click", function (e) {
        e.preventDefault(); navigateTo("blog");
      });
      var loginBtn = navMobile.querySelector(".btn-primary");
      if (loginBtn) navMobile.insertBefore(linkMobile, loginBtn);
      else navMobile.appendChild(linkMobile);
    }
    return true;
  }

  function injectHeroBlogButton() {
    var ctaRow = qs(".hero-cta-row");
    if (!ctaRow || ctaRow.querySelector('[data-blog-hero-btn]')) return false;

    var btn = el("a", { href: "#blog", class: "btn btn-ghost", "data-blog-hero-btn": "1" }, "Baca Blog Kami");
    btn.addEventListener("click", function (e) {
      e.preventDefault(); navigateTo("blog");
    });
    ctaRow.appendChild(btn);
    return true;
  }

  function bootstrap() {
    var attempts = 0;
    var iv = setInterval(function () {
      attempts++;
      var a = injectBlogNavLinks();
      var b = injectHeroBlogButton();
      
      if ((a && b) || attempts > 100) {
        clearInterval(iv);
        afterReady();
      }
    }, 100);
  }

  function afterReady() {
    var parsed = parseHash();
    if (parsed.view !== "main") {
      setTimeout(function() {
        render(parsed.view, parsed.slug);
      }, 50);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

}();