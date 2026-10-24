// Hits the running dev server and reports status + a content marker per route.
const base = process.env.BASE ?? "http://localhost:3100";

const checks = [
  { path: "/", marker: "Apprenez la LSF." },
  { path: "/courses", marker: "sa petite découverte." },
  { path: "/courses/5-10", marker: "Les petits explorateurs" },
  { path: "/learn/lsf-bonjour", marker: "Voir sur YouTube" },
  { path: "/learn/003", expectRedirect: "/courses" },
  { path: "/learn/inconnu", expectStatus: 404 },
  { path: "/parents", marker: "Apprendre à ses côtés." },
  { path: "/resources", marker: "MAE Langue des Signes" },
  { path: "/about", marker: "Apprendre pour se rapprocher." },
  { path: "/packages", marker: "Un chemin à votre mesure." },
  { path: "/community", marker: "se vivent ensemble." },
  { path: "/dashboard", expectRedirect: "/login" },
  { path: "/quiz", marker: "On essaie, à deux ?" },
  { path: "/tutor", expectRedirect: "/login" },
  { path: "/report", expectRedirect: "/login" },
  {
    path: "/api/learning/events",
    method: "POST",
    body: { courseId: "lsf-bonjour", type: "end", progressPercentage: 100 },
    expectStatus: 401,
  },
  {
    path: "/api/tutor/chat",
    method: "POST",
    body: { message: "Bonjour", language: "fr" },
    expectStatus: 401,
  },
];

let ok = true;
for (const c of checks) {
  try {
    const res = await fetch(base + c.path, {
      method: c.method ?? "GET",
      redirect: "manual",
      ...(c.body
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(c.body),
          }
        : {}),
    });
    const status = res.status;
    let detail = "";
    if (c.expectStatus) {
      const good = status === c.expectStatus;
      ok = ok && good;
      detail = `${status} ${good ? "✓" : "✗ expected " + c.expectStatus}`;
    } else if (c.expectRedirect) {
      const loc = res.headers.get("location") ?? "";
      const good =
        (status === 307 || status === 302) && loc.includes(c.expectRedirect);
      ok = ok && good;
      detail = `${status} → ${loc || "(no redirect)"} ${good ? "✓" : "✗ expected " + c.expectRedirect}`;
    } else {
      const body = await res.text();
      const found = c.marker ? body.includes(c.marker) : true;
      ok = ok && status === 200 && found;
      detail = `${status} ${found ? `· "${c.marker}" ✓` : `· "${c.marker}" MISSING ✗`}`;
    }
    console.log(`  ${c.path.padEnd(12)} ${detail}`);
  } catch (e) {
    ok = false;
    console.log(`  ${c.path.padEnd(12)} ERROR ${e.message}`);
  }
}
console.log(ok ? "\nALL CHECKS PASSED ✓" : "\nSOME CHECKS FAILED ✗");
process.exit(ok ? 0 : 1);
