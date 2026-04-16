const form = document.querySelector("#coauthor-form");
const config = window.COAUTHOR_FORM_CONFIG || {};
const endpoint = (config.endpoint || "").trim();
const notifyEmail = (config.notifyEmail || "jahanaraym@vcu.edu").trim();

if (form) {
  const frameName = "coauthor_submit_frame";
  let frame = document.querySelector('iframe[name="coauthor_submit_frame"]');
  if (!frame) {
    frame = document.createElement("iframe");
    frame.name = frameName;
    frame.style.display = "none";
    document.body.appendChild(frame);
  }

  form.action = endpoint;
  form.method = "post";
  form.target = frameName;

  form.addEventListener("submit", (event) => {
    const picked = Array.from(
      form.querySelectorAll('input[name="contribution"]:checked')
    );

    if (picked.length === 0) {
      event.preventDefault();
      window.alert("Please select at least one contribution area: Introduction or Discussion.");
      return;
    }

    const projectSelect = form.querySelector("#project");
    const selectedOption =
      projectSelect && projectSelect.options[projectSelect.selectedIndex];

    upsertHidden(form, "project_key", form.project.value);
    upsertHidden(
      form,
      "project_title",
      selectedOption ? selectedOption.text : form.project.value
    );
    upsertHidden(form, "notify_email", notifyEmail);
    upsertHidden(form, "source_page", window.location.href);
    upsertHidden(form, "user_agent", navigator.userAgent);

    // Keep user flow clean; submit in hidden iframe and reset shortly after.
    setTimeout(() => form.reset(), 250);
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
