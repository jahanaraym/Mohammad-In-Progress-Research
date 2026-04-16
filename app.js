const form = document.querySelector("#coauthor-form");
const formNote = document.querySelector("#form-note");
const config = window.COAUTHOR_FORM_CONFIG || {};
const endpoint = (config.endpoint || "").trim();
const notifyEmail = (config.notifyEmail || "jahanaraym@vcu.edu").trim();
const isAppsScriptEndpoint =
  /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(endpoint);

function showNote(text, ok) {
  if (!formNote) return;
  if (!text) {
    formNote.textContent = "";
    formNote.style.display = "none";
    return;
  }
  formNote.style.display = "block";
  formNote.textContent = text;
  formNote.style.color = ok ? "#a7f3d0" : "#fca5a5";
}

if (form && formNote) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const picked = Array.from(
      form.querySelectorAll('input[name="contribution"]:checked')
    );

    if (picked.length === 0) {
      showNote(
        "Please select at least one contribution area: Introduction or Discussion.",
        false
      );
      return;
    }

    if (!endpoint || endpoint.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT")) {
      showNote(
        "Form endpoint is not connected yet. Add your Google Apps Script Web App URL in index.html.",
        false
      );
      return;
    }

    if (!isAppsScriptEndpoint) {
      showNote(
        "Endpoint must be a Google Apps Script Web App URL ending in /exec, not a Google Sheet link.",
        false
      );
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    const projectSelect = form.querySelector("#project");
    const selectedOption =
      projectSelect && projectSelect.options[projectSelect.selectedIndex];

    const payload = new URLSearchParams();
    payload.set("project_key", form.project.value);
    payload.set(
      "project_title",
      selectedOption ? selectedOption.text : form.project.value
    );
    payload.set("full_name", form.full_name.value.trim());
    payload.set("email", form.email.value.trim());
    payload.set(
      "contribution",
      picked.map((item) => item.value).join(", ")
    );
    payload.set("notify_email", notifyEmail);
    payload.set("source_page", window.location.href);
    payload.set("user_agent", navigator.userAgent);

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: payload.toString()
      });

      showNote("", true);
      form.reset();
    } catch (error) {
      showNote("", false);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
