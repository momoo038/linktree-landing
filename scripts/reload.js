document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  function initSmoothLinks() {
    document.querySelectorAll(".smooth-link").forEach(link => {
      link.onclick = async (e) => {
        const url = link.getAttribute("href");
        if (!url || url.startsWith("http") || url.startsWith("#")) return;

        e.preventDefault();

        try {
          app.style.opacity = 0;

          const res = await fetch(url);
          const html = await res.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const newApp = doc.getElementById("app");

          if (!newApp) {
            console.error(`No #app found in ${url}`);
            window.location.href = url;
            return;
          }

          // ✅ Update title
          const newTitle = doc.querySelector("title");
          if (newTitle) document.title = newTitle.innerText;

          // ✅ Update missing CSS links
          const newLinks = doc.querySelectorAll("link[rel='stylesheet']");
          newLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href && !document.querySelector(`link[href="${href}"]`)) {
              const newLink = document.createElement("link");
              newLink.rel = "stylesheet";
              newLink.href = href;
              document.head.appendChild(newLink);
            }
          });

          // ✅ Replace content after fade
          setTimeout(() => {
            app.innerHTML = newApp.innerHTML;
            window.history.pushState({}, "", url);
            app.style.opacity = 1;
            window.scrollTo(0, 0);
            initSmoothLinks(); // re-init new links
          }, 400);

        } catch (err) {
          console.error("Page load failed:", err);
          window.location.href = url;
        }
      };
    });
  }

  initSmoothLinks();
});
