/* Independent enhancements; all course content remains readable without JavaScript. */
(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lessons = [
    "introduction",
    "basics",
    "control-flow",
    "functions",
    "data-structures",
  ];
  const storageKey = "pylearn-progress-v1";
  let completed = [];
  let canSave = true;
  function parseProgress(value) {
    try {
      const saved = JSON.parse(value || "[]");
      return Array.isArray(saved)
        ? [...new Set(saved.filter((item) => lessons.includes(item)))]
        : [];
    } catch {
      return [];
    }
  }
  try {
    completed = parseProgress(localStorage.getItem(storageKey));
    localStorage.setItem(storageKey, JSON.stringify(completed));
  } catch {
    canSave = false;
  }
  document.documentElement.classList.add("js");

  let toastTimer;
  function notify(message) {
    const toast = $(".toast");
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3000);
  }

  // Keep navigation accessible without JavaScript. Escape closes and restores focus.
  const menu = $(".menu-toggle");
  const nav = $("#main-navigation");
  if (menu && nav) {
    const setMenu = (open) => {
      menu.setAttribute("aria-expanded", String(open));
      $(".menu-label", menu).textContent = open ? "Close" : "Menu";
      nav.classList.toggle("is-open", open);
    };
    menu.addEventListener("click", () =>
      setMenu(menu.getAttribute("aria-expanded") !== "true"),
    );
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menu.getAttribute("aria-expanded") === "true"
      ) {
        setMenu(false);
        menu.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".navbar")) setMenu(false);
    });
    window
      .matchMedia("(min-width: 901px)")
      .addEventListener("change", (event) => {
        if (event.matches) setMenu(false);
      });
  }

  // Reveal once, keeping controls and paragraphs free of repeated animations.
  const revealItems = $$(
    ".topic-card, .section .info-card, .study-step, .section-heading, .home-cta, .content-section",
  );
  if ("IntersectionObserver" in window && !motion.matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -24px 0px" },
    );
    revealItems.forEach((item, index) => {
      item.classList.add("reveal");
      if (item.matches(".topic-card, .info-card, .study-step"))
        item.style.setProperty("--reveal-delay", `${(index % 3) * 65}ms`);
      observer.observe(item);
    });
    motion.addEventListener("change", () => {
      if (motion.matches) {
        observer.disconnect();
        revealItems.forEach((item) => item.classList.add("is-visible"));
      }
    });
  }

  // One passive listener drives reading progress, the contents list, and the top link.
  const readingBar = $(".reading-track span");
  const topLink = $(".back-to-top");
  const headings = $$(".content-section[id]");
  const tocLinks = $$(".toc-links a");
  let scrollScheduled = false;
  function updateScroll() {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    if (readingBar)
      readingBar.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
    if (topLink) topLink.classList.toggle("is-visible", window.scrollY > 600);
    if (headings.length) {
      let current = headings[0].id;
      const offset = $(".site-header").offsetHeight + 60;
      headings.forEach((section) => {
        if (section.getBoundingClientRect().top <= offset) current = section.id;
      });
      tocLinks.forEach((link) => {
        const active = link.hash === `#${current}`;
        link.classList.toggle("is-current", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
    scrollScheduled = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(updateScroll);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", updateScroll);
  window.addEventListener("load", updateScroll, { once: true });
  updateScroll();

  // Copy actual code, preserving line breaks and indentation.
  $$(".code-card").forEach((card) => {
    const code = $("pre code", card);
    const header = $(".code-card-header", card);
    if (!code || !header) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-button";
    const filename = $("span", header)?.textContent || "example";
    button.setAttribute("aria-label", `Copy code from ${filename}`);
    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg><span>Copy</span>';
    header.append(button);
    button.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(code.textContent);
        } else {
          const field = document.createElement("textarea");
          field.value = code.textContent;
          field.style.cssText = "position:fixed;left:-9999px;top:0";
          document.body.append(field);
          field.select();
          const copied = document.execCommand("copy");
          field.remove();
          button.focus({ preventScroll: true });
          if (!copied) throw new Error("Copy unavailable");
        }
        $("span", button).textContent = "Copied!";
        notify(`${filename} copied to clipboard.`);
        setTimeout(() => {
          $("span", button).textContent = "Copy";
        }, 2200);
      } catch {
        notify("Select the code and use your browser’s Copy command.");
      }
    });
  });

  // Completion is explicit; scrolling never marks a lesson finished.
  function renderProgress() {
    $$("[data-course-count]").forEach((item) => {
      item.textContent = `${completed.length} of 5 lessons complete`;
    });
    $$("[data-course-bar]").forEach((item) => {
      item.style.width = `${completed.length * 20}%`;
    });
    $$("[data-lesson-card]").forEach((card) => {
      const state = $(".topic-state", card);
      const done = completed.includes(card.dataset.lessonCard);
      state.textContent = done ? "Completed ✓" : "Lesson";
      state.classList.toggle("is-complete", done);
    });
    const button = $(".complete-button");
    if (button) {
      const done = completed.includes(document.body.dataset.lesson);
      button.setAttribute("aria-pressed", String(done));
      button.textContent = done ? "Completed ✓ · Undo" : "Mark lesson complete";
    }
    const homeProgress = $(".course-progress-home");
    if (homeProgress) homeProgress.hidden = completed.length === 0;
    const next = lessons.find((lesson) => !completed.includes(lesson));
    const resume = $("[data-resume-link]");
    if (resume) {
      resume.href = next ? `${next}.html` : "quiz.html";
      resume.textContent = next ? "Continue learning →" : "Take the quiz →";
    }
    $$(".save-note").forEach((note) => {
      note.textContent = canSave
        ? "Progress is saved in this browser."
        : "Progress is available for this visit. Browser storage is unavailable.";
    });
  }
  const completion = $(".complete-button");
  if (completion) {
    $(".lesson-complete").hidden = false;
    completion.addEventListener("click", () => {
      const current = document.body.dataset.lesson;
      if (!lessons.includes(current)) return;
      const done = completed.includes(current);
      completed = done
        ? completed.filter((lesson) => lesson !== current)
        : [...completed, current];
      try {
        localStorage.setItem(storageKey, JSON.stringify(completed));
        canSave = true;
      } catch {
        canSave = false;
      }
      renderProgress();
      notify(
        done
          ? "Lesson marked as incomplete."
          : canSave
            ? "Lesson complete. Your progress is saved."
            : "Lesson complete for this visit.",
      );
    });
  }
  renderProgress();
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    try {
      completed = parseProgress(event.newValue);
      renderProgress();
    } catch {
      /* Ignore malformed data from another tab. */
    }
  });

  // Replay the fixed output of the displayed Python example.
  const run = $(".run-demo");
  if (run)
    run.addEventListener("click", async () => {
      const output = $(".demo-output");
      const lines = [
        "Hello, future developer!",
        "Your Python journey starts here.",
      ];
      run.disabled = true;
      run.setAttribute("aria-busy", "true");
      output.textContent = "";
      for (let i = 0; i < lines.length; i++) {
        if (!motion.matches)
          await new Promise((resolve) => setTimeout(resolve, 300));
        output.append(document.createTextNode(lines[i]));
        if (i < lines.length - 1) output.append(document.createElement("br"));
      }
      run.disabled = false;
      run.removeAttribute("aria-busy");
      notify("Demo complete. Try writing your first program in Lesson 1.");
    });

  // HTML/CSS feedback and answer explanations still work without JavaScript.
  const quiz = $(".quiz-form");
  if (quiz) {
    const questions = $$("fieldset.quiz-card", quiz);
    const result = $(".quiz-result");
    const status = $("#quiz-status");
    const dashboard = $(".quiz-dashboard");
    dashboard.hidden = false;
    $(".score-button", quiz).hidden = false;
    function calculate() {
      let answered = 0;
      let correct = 0;
      questions.forEach((question) => {
        const selected = $("input:checked", question);
        const right = !!selected?.closest(".correct");
        if (selected) answered++;
        if (right) correct++;
        const map = $(`[href="#${question.id}"]`, dashboard);
        map.classList.toggle("is-answered", !!selected);
        map.classList.toggle("is-correct", right);
        map.classList.toggle("is-wrong", !!selected && !right);
        map.setAttribute(
          "aria-label",
          `Question ${question.dataset.question}: ${selected ? (right ? "correct" : "review needed") : "unanswered"}`,
        );
      });
      status.textContent = `${answered} of ${questions.length} answered`;
      $("#quiz-progress").style.width =
        `${(answered / questions.length) * 100}%`;
      return { answered, correct };
    }
    quiz.addEventListener("change", (event) => {
      if (!event.target.matches('input[type="radio"]')) return;
      const right = !!event.target.closest(".correct");
      const { answered } = calculate();
      result.hidden = true;
      $("#quiz-feedback").textContent =
        `${right ? "Correct." : "Try again, or open the explanation."} ${answered} of ${questions.length} answered.`;
    });
    quiz.addEventListener("submit", (event) => {
      event.preventDefault();
      const { answered, correct } = calculate();
      result.hidden = false;
      $("#quiz-result-title").textContent =
        `${correct} / ${questions.length} correct · ${Math.round((correct / questions.length) * 100)}%`;
      const remaining = questions.length - answered;
      $("#quiz-result-message").textContent = remaining
        ? `${remaining} question${remaining === 1 ? " is" : "s are"} unanswered. Answer the rest or use the explanations to review.`
        : correct === questions.length
          ? "Excellent work! You answered every question correctly. Keep practising with the lesson exercises."
          : "Good practice. Review the explanations for the questions you missed, then try again.";
      const review = $("#review-question");
      const target = questions.find(
        (question) =>
          !$("input:checked", question) ||
          !$("input:checked", question).closest(".correct"),
      );
      review.hidden = !target;
      if (target) {
        review.href = `#${target.id}`;
        review.textContent = $("input:checked", target)
          ? "Review first missed question →"
          : "Go to first unanswered question →";
      }
      result.focus({ preventScroll: true });
      result.scrollIntoView({
        behavior: motion.matches ? "instant" : "smooth",
        block: "center",
      });
    });
    quiz.addEventListener("reset", () => {
      result.hidden = true;
      $$("details", quiz).forEach((detail) => {
        detail.open = false;
      });
      // Reset fires before the browser clears the controls.
      setTimeout(() => {
        calculate();
        $("#quiz-feedback").textContent =
          "Quiz reset. All answers and explanations have been cleared.";
        notify("Quiz reset. Ready for another try.");
        $("input", questions[0]).focus({ preventScroll: true });
        questions[0].scrollIntoView({
          behavior: motion.matches ? "instant" : "smooth",
          block: "start",
        });
      }, 0);
    });
    calculate();
  }
})();
