const client = window.kaabeSupabase;
const form = document.querySelector("#business-form");
const messageEl = document.querySelector("#auth-message");

function showMessage(text, type = "error") {
  messageEl.textContent = text;
  messageEl.className = "message show " + type;
}

function makeSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

let currentUser = null;

(async () => {
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) {
    location.href = "login.html";
    return;
  }
  currentUser = data.session.user;

  // If this user already owns a business, don't create duplicates.
  const { data: businesses, error: businessError } = await client
    .from("businesses")
    .select("id,name")
    .eq("owner_id", currentUser.id)
    .limit(1);

  if (businessError) {\n    showMessage("Could not check your workspace: " + businessError.message);\n    return;\n  }\n  if (businesses && businesses.length) {
    location.href = "dashboard.html";
  }
})();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;

  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  messageEl.className = "message";

  try {
    const name = form.business_name.value.trim();
    if (!name) throw new Error("Enter your business name.");

    // Prevent duplicate workspaces after a slow response or page refresh.\n    const { data: existing, error: existingError } = await client.from("businesses").select("id").eq("owner_id", currentUser.id).limit(1);\n    if (existingError) throw existingError;\n    if (existing?.length) { location.href = "dashboard.html"; return; }\n\n    const baseSlug = makeSlug(name) || "business";
    const slug = `${baseSlug}-${currentUser.id.slice(0, 8)}`;

    const { data: business, error } = await client
      .from("businesses")
      .insert({
        owner_id: currentUser.id,
        name,
        slug,
        language: form.language.value,
        timezone: form.timezone.value
      })
      .select("id,name")
      .single();

    if (error) throw error;

    // The business owner has direct RLS access through businesses.owner_id.\n    // Memberships must be provisioned by an authorized backend, not the browser.\n\n    showMessage("Workspace created successfully.", "success");
    setTimeout(() => location.href = "dashboard.html", 700);
  } catch (error) {
    showMessage(error.message || "Could not create your workspace.");
  } finally {
    submit.disabled = false;
  }
});
