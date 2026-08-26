(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => document.body.classList.add("is-ready"));

  const revealItems = [...document.querySelectorAll(".reveal")];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const formatNumber = (value) => new Intl.NumberFormat("ru-RU").format(value);
  const counterGroup = document.querySelector("[data-counter-group]");

  const runCounters = () => {
    const counters = [...document.querySelectorAll("[data-count]")];
    counters.forEach((counter, index) => {
      const target = Number(counter.dataset.count);
      const metric = counter.closest(".metric");
      const delay = reduceMotion ? 0 : index * 90;

      window.setTimeout(() => {
        metric?.classList.add("counted");
        if (reduceMotion) {
          counter.textContent = formatNumber(target);
          return;
        }

        const start = performance.now();
        const duration = 900;
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          counter.textContent = formatNumber(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, delay);
    });
  };

  if (counterGroup && "IntersectionObserver" in window && !reduceMotion) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      runCounters();
      observer.disconnect();
    }, { threshold: 0.25 });
    counterObserver.observe(counterGroup);
  } else {
    runCounters();
  }

  const stickyCta = document.querySelector(".mobile-cta");
  const finalCta = document.querySelector(".diagnostic-card");
  const hero = document.querySelector(".hero");
  if (stickyCta && finalCta && hero && "IntersectionObserver" in window) {
    let heroVisible = true;
    let finalVisible = false;
    const updateStickyCta = () => stickyCta.classList.toggle("is-hidden", heroVisible || finalVisible);
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === finalCta) finalVisible = entry.isIntersecting;
      });
      updateStickyCta();
    }, { threshold: 0.25 });
    stickyObserver.observe(hero);
    stickyObserver.observe(finalCta);
  }

  const faqItems = [...document.querySelectorAll("[data-faq-item]")];
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    button?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("is-open");
        otherItem.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.querySelectorAll('a[href*="t.me/"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (typeof window.datafast === "function") {
        window.datafast("event", "clinic_telegram_click");
      }
    });
  });
})();
