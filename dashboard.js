const client = window.kaabeSupabase;

const emailEl = document.querySelector("#user-email");
const statusEl = document.querySelector("#dashboard-status");
const businessInfo = document.querySelector("#business-info");
const businessName = document.querySelector("#business-name");
const businessMeta = document.querySelector("#business-meta");
const primaryAction = document.querySelector("#primary-action");
const messageEl = document.querySelector("#auth-message");

function showMessage(text, type = "error") {
  messageEl.textContent = text;
  messageEl.className = "message show " + type;
}

(async () => {
  const { data: sessionData, error: sessionError } = await client.auth.getSession();

  if (sessionError || !sessionData.session) {
    location.href = "login.html";
    return;
  }

  const user = sessionData.session.user;
  emailEl.textContent = user.email || "";

  const { data: businesses, error } = await client
    .from("businesses")
    .select("id,name,slug,language,timezone")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    statusEl.textContent = "We couldn't load your business workspace.";
    primaryAction.textContent = "Try again";
    primaryAction.disabled = false;
    primaryAction.onclick = () => location.reload();
    showMessage(error.message);
    return;
  }

  if (businesses && businesses.length > 0) {
    const business = businesses[0];

    statusEl.textContent = "Your business workspace is ready.";
    businessInfo.style.display = "block";
    businessName.textContent = business.name;
    businessMeta.textContent =
      `${business.language || "en"} • ${business.timezone || "Europe/Berlin"}`;

    primaryAction.textContent = "Open Workspace";
    primaryAction.disabled = false;
    primaryAction.onclick = () => {
      sessionStorage.setItem("kaabe_business_id", business.id);
      location.href = "workspace.html";
    };
  } else {
    statusEl.textContent = "Create your business workspace to continue.";
    primaryAction.textContent = "Set up my business";
    primaryAction.disabled = false;
    primaryAction.onclick = () => location.href = "onboarding.html";
  }
})();

document.querySelector("#logout").addEventListener("click", async () => {
  await client.auth.signOut();
  sessionStorage.removeItem("kaabe_business_id");
  location.href = "index.html";
});