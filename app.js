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
  const frameName = "coauthor_submit_frame";
  let frame = document.querySelector('iframe[name="coauthor_submit_frame"]');
  if (!frame) {
    frame = document.createElement("iframe");
    frame.name = frameName;
    frame.style.display = "none";
    document.body.appendChild(frame);
  }

  // Prefer native form submit to Apps Script web app (more reliable than fetch+CORS).
  if (isAppsScriptEndpoint) {
    form.action = endpoint;
    form.method = "post";
    form.target = frameName;
  }

  form.addEventListener("submit", (event) => {
    showNote("", true);

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
      event.preventDefault();
      showNote(
        "Form endpoint is not connected yet. Add your Google Apps Script Web App URL in index.html.",
        false
      );
      return;
    }

    if (!isAppsScriptEndpoint) {
      event.preventDefault();
      showNote(
        "Endpoint must be a Google Apps Script Web App URL ending in /exec, not a Google Sheet link.",
        false
      );
      return;
    }

    // Add metadata fields for Apps Script.
    upsertHidden(form, "notify_email", notifyEmail);
    upsertHidden(form, "source_page", window.location.href);
    upsertHidden(form, "user_agent", navigator.userAgent);

    const projectSelect = form.querySelector("#project");
    const selectedOption = projectSelect && projectSelect.options[projectSelect.selectedIndex];
    upsertHidden(
      form,
      "project_title",
      selectedOption ? selectedOption.text : form.project.value
    );
    upsertHidden(form, "project_key", form.project.value);

    // Let native submit proceed to hidden iframe, then show thank-you popup.
    setTimeout(() => {
      window.alert("Thanks for your submission, I will get back to soon, Mohammad");
      form.reset();
    }, 300);
  });
}

function upsertHidden(form, name, value) {
  let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    form.appendChild(input);
  }
  input.value = value;
}
