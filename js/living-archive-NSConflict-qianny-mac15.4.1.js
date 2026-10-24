/**
 * 流动档案馆 · 列表随机与故事页渲染
 */
(function () {
  function getStoryById(id) {
    if (!window.LIVING_ARCHIVE) return null;
    return LIVING_ARCHIVE.stories.find(function (s) {
      return s.id === id;
    });
  }

  function archiveBasePath() {
    var path = window.location.pathname || "";
    if (path.indexOf("/events/") !== -1) {
      return "../living-archive/";
    }
    if (path.indexOf("/living-archive/") !== -1) {
      return "";
    }
    return "living-archive/";
  }

  function storyUrl(story) {
    return archiveBasePath() + "story.html?id=" + encodeURIComponent(story.id);
  }

  function randomStoryUrl() {
    var stories = window.LIVING_ARCHIVE && LIVING_ARCHIVE.stories;
    if (!stories || !stories.length) {
      return archiveBasePath() + "index.html";
    }
    var pick = stories[Math.floor(Math.random() * stories.length)];
    return storyUrl(pick);
  }

  function getLabelEl(btn) {
    return btn.querySelector(".la-random-btn__label") || btn;
  }

  function runRandomDraw(btn) {
    if (btn.classList.contains("la-random-btn--busy")) return;

    var stories = window.LIVING_ARCHIVE && LIVING_ARCHIVE.stories;
    if (!stories || !stories.length) {
      window.location.href = randomStoryUrl();
      return;
    }

    btn.classList.add("la-random-btn--busy");
    btn.setAttribute("aria-busy", "true");

    var labelEl = getLabelEl(btn);
    var idleText = labelEl.getAttribute("data-idle-label") || labelEl.textContent;
    labelEl.setAttribute("data-idle-label", idleText);

    var ticks = 0;
    var maxTicks = 10;
    var finalPick = stories[Math.floor(Math.random() * stories.length)];

    var timer = window.setInterval(function () {
      var flash = stories[Math.floor(Math.random() * stories.length)];
      labelEl.textContent = flash.no + " · " + flash.workTitle;
      ticks += 1;

      if (ticks >= maxTicks) {
        window.clearInterval(timer);
        labelEl.textContent = finalPick.no + " · " + finalPick.workTitle;
        btn.classList.remove("la-random-btn--busy");
        btn.classList.add("la-random-btn--reveal");

        window.setTimeout(function () {
          window.location.href = storyUrl(finalPick);
        }, 420);
      }
    }, 85);
  }

  function initRandomButtons() {
    document.querySelectorAll("[data-la-random]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        runRandomDraw(btn);
      });
    });
  }

  function renderHub() {
    var grid = document.getElementById("la-story-grid");
    if (!grid || !window.LIVING_ARCHIVE) return;

    LIVING_ARCHIVE.stories.forEach(function (story) {
      var card = document.createElement("article");
      card.className = "la-story-card";
      card.setAttribute("data-story-id", story.id);

      card.innerHTML =
        '<div class="la-story-card__head">' +
        '<span class="la-story-card__no">' +
        story.no +
        "</span>" +
        '<span class="la-pending-badge" title="影像二期补档">影像 · 静待更新</span>' +
        "</div>" +
        '<h3 class="la-story-card__title">《' +
        story.workTitle +
        "》</h3>" +
        '<p class="la-story-card__creator">共同创作者 · ' +
        story.creator +
        "</p>" +
        '<blockquote class="la-story-card__quote">' +
        story.quote +
        "</blockquote>" +
        '<p class="la-story-card__lead">' +
        story.lead +
        "</p>" +
        "<details>" +
        '<summary>展开 · 故事短文字版</summary>' +
        '<div class="la-story-card__body">' +
        story.shortBody +
        "</div>" +
        "</details>" +
        '<div class="la-story-card__foot">' +
        '<a href="' +
        storyUrl(story) +
        '">进入完整故事册 →</a>' +
        "</div>";

      grid.appendChild(card);
    });
  }

  function renderStoryPage() {
    var root = document.getElementById("la-story-full");
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var story = getStoryById(id);

    if (!story) {
      root.innerHTML =
        '<p>未找到该故事册。请从 <a href="' +
        archiveBasePath() +
        'index.html">流动档案馆</a> 重新选择。</p>';
      document.title = "故事未找到 · 流动档案馆";
      return;
    }

    document.title = story.no + " · " + story.workTitle + " · 流动档案馆";

    var meta = document.getElementById("la-story-meta");
    if (meta) {
      meta.textContent =
        LIVING_ARCHIVE.event.archiveCode +
        " · " +
        story.no +
        " · " +
        LIVING_ARCHIVE.event.dateLabel;
    }

    var titleEl = document.getElementById("la-story-title");
    if (titleEl) {
      titleEl.textContent = "《" + story.workTitle + "》";
    }

    var creatorEl = document.getElementById("la-story-creator");
    if (creatorEl) {
      creatorEl.textContent = "共同创作者 · " + story.creator;
    }

    var quoteEl = document.getElementById("la-story-quote");
    if (quoteEl) {
      quoteEl.textContent = story.quote;
    }

    var html = "";
    (story.sections || []).forEach(function (sec) {
      html += "<h3>" + sec.h + "</h3>";
      (sec.p || []).forEach(function (para) {
        html += "<p>" + para + "</p>";
      });
    });

    html +=
      '<p class="la-pending-badge" style="display:inline-block;margin-top:1.5rem;">作品影像 · 二期补档 · 静待更新</p>';

    root.innerHTML = html;
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRandomButtons();
    renderHub();
    renderStoryPage();
  });
})();
