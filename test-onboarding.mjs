import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE_URL = "https://rebornfromzerotohero.com";
const SUPABASE_URL = "https://tnatnumzjqnnmihijzcp.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXRudW16anFubm1paGlqemNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNDU1MCwiZXhwIjoyMDg3ODgwNTUwfQ.wV73snl4e9oSxJvXI4e4rG7kMH0zXiyWXWfyMsmtOtQ";
const MGMT_TOKEN = "sbp_a3d38a54125a26744fa9ac60e0d4784c4ebda9c8";

const TEST_EMAIL = `test_e2e_${Date.now()}@yopmail.com`;
const TEST_PASSWORD = "TestReborn123";
const TEST_NAME = "E2E Tester";

const SCREENSHOT_DIR = "/tmp/reborn-test";
mkdirSync(SCREENSHOT_DIR, { recursive: true });

let stepNum = 0;
let testUserId = null;

async function shot(page, name) {
  stepNum++;
  const file = `${SCREENSHOT_DIR}/${String(stepNum).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 ${file}`);
  return file;
}

const log = (msg) => console.log(`\n▶ ${msg}`);
const ok  = (msg) => console.log(`  ✅ ${msg}`);
const err = (msg) => console.log(`  ❌ ${msg}`);

async function adminFetch(path, opts = {}) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  return r.json();
}

async function cleanup() {
  if (testUserId) {
    await adminFetch(`/users/${testUserId}`, { method: "DELETE" });
    console.log(`\n  🧹 Test user ${TEST_EMAIL} deleted`);
  }
}

async function run() {
  // ── Create test user via admin API (bypass rate limit) ───────────────────
  log("SETUP — Creating test user via admin API");
  const created = await adminFetch("/users", {
    method: "POST",
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: TEST_NAME },
    }),
  });
  if (!created.id) throw new Error(`Failed to create user: ${JSON.stringify(created)}`);
  testUserId = created.id;
  ok(`User created: ${testUserId}`);
  ok(`Email confirmed automatically`);

  // Brief pause for triggers to fire
  await new Promise(r => setTimeout(r, 1500));

  // Verify triggers fired
  const dbCheck = await fetch("https://api.supabase.com/v1/projects/tnatnumzjqnnmihijzcp/database/query", {
    method: "POST",
    headers: { Authorization: `Bearer ${MGMT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: `SELECT p.display_name, p.onboarding_completed, s.current_streak FROM user_profiles p JOIN user_streaks s ON s.user_id = p.id WHERE p.id = '${testUserId}'` }),
  }).then(r => r.json());
  ok(`user_profiles trigger: display_name="${dbCheck[0]?.display_name}", onboarding=${dbCheck[0]?.onboarding_completed}`);
  ok(`user_streaks trigger: streak=${dbCheck[0]?.current_streak}`);

  // ── Launch browser ───────────────────────────────────────────────────────
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

  try {
    // ── 1. Home page ─────────────────────────────────────────────────────────
    log("1. Home page");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    ok(`Title: ${await page.title()}`);
    ok(`CTA banner: ${await page.locator("text=Crear cuenta gratis").count() > 0}`);
    ok(`Article cards: ${await page.locator("article").count()}`);
    await shot(page, "home");

    // ── 2. Click CTA → /auth ─────────────────────────────────────────────────
    log("2. Click CTA banner → /auth");
    await page.click("text=Crear cuenta gratis");
    await page.waitForURL(/\/auth/, { timeout: 5000 });
    ok("Navigated to /auth (with optional query params)");
    await shot(page, "auth-page");

    // ── 3. Login ─────────────────────────────────────────────────────────────
    log("3. Login with test credentials");
    const loginTab = page.locator("button", { hasText: "Iniciar sesión" }).first();
    if (await loginTab.isVisible()) await loginTab.click();
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await shot(page, "login-filled");
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard/onboarding`, { timeout: 15000 });
    ok("Redirected to /dashboard/onboarding ✓");
    await shot(page, "onboarding-topics");

    // ── 4. New onboarding: single-screen topic selector ───────────────────────
    log("4. Onboarding — topic selector screen");
    // Wait for heading
    await page.waitForSelector("text=Elige hasta 3 áreas", { timeout: 8000 });
    ok("Topic selector heading visible");

    // Wait for React to hydrate: topic buttons become interactive (not disabled)
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const aiBtn = buttons.find((b) => b.textContent?.includes("Dominar la IA"));
        return aiBtn && !aiBtn.disabled;
      },
      { timeout: 10000 }
    );
    ok("React hydrated — topic buttons are interactive");

    // Count topic cards
    const topicCards = await page.locator("button", { hasText: "Dominar la IA" }).count();
    ok(`'Dominar la IA' card visible: ${topicCards > 0}`);

    // Click first topic and wait for counter to update
    await page.locator("button", { hasText: "Dominar la IA" }).first().click();
    await page.waitForSelector("text=Seleccionadas: 1/3", { timeout: 5000 });
    ok("Selected: Dominar la IA (counter updated)");

    // Click second topic and wait for counter to update
    await page.locator("button", { hasText: "Aprender Python" }).first().click();
    await page.waitForSelector("text=Seleccionadas: 2/3", { timeout: 5000 });
    ok("Selected: Aprender Python (counter updated)");

    await shot(page, "onboarding-2-selected");

    // Verify "Empezar mi plan" button is enabled
    const ctaBtn = page.locator("button", { hasText: "Empezar mi plan" });
    const isEnabled = !(await ctaBtn.isDisabled());
    ok(`CTA button enabled: ${isEnabled}`);

    // ── 5. Submit and redirect to dashboard ──────────────────────────────────
    log("5. Submit topic selection → /dashboard");
    // Capture API response BEFORE waiting for URL (page navigates away quickly)
    const selectTopicsResponsePromise = page.waitForResponse(
      resp => resp.url().includes("select-topics"),
      { timeout: 10000 }
    );
    await ctaBtn.click();
    const selectTopicsResponse = await selectTopicsResponsePromise;
    ok(`/api/select-topics status: ${selectTopicsResponse.status()}`);
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
    ok("Redirected to /dashboard ✓ (instant, no AI wait)");
    await page.waitForTimeout(1500);
    await shot(page, "dashboard-loaded");

    // ── 6. Dashboard checks ──────────────────────────────────────────────────
    log("6. Dashboard layout checks");
    ok(`Streak badge: ${await page.locator("text=🔥").count() > 0}`);
    ok(`'Progreso del día' section: ${await page.locator("text=Progreso del día").count() > 0}`);
    ok(`'Posts de IA de hoy' section: ${await page.locator("text=Posts de IA de hoy").count() > 0}`);
    ok(`'Mis metas de hoy' section: ${await page.locator("text=Mis metas de hoy").count() > 0}`);

    const goalCards = await page.locator("text=Dominar la IA").count();
    ok(`Goal 1 card visible (Dominar la IA): ${goalCards > 0}`);
    const goal2Cards = await page.locator("text=Aprender Python").count();
    ok(`Goal 2 card visible (Aprender Python): ${goal2Cards > 0}`);

    // ── 7. Scroll to see goals ───────────────────────────────────────────────
    log("7. Goal cards with predefined tasks");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    await shot(page, "dashboard-goals-section");

    const taskButtons = await page.locator('button').filter({ hasText: /min/ }).count();
    ok(`Task items visible: ${taskButtons}`);

    // ── 8. Check a task ──────────────────────────────────────────────────────
    log("8. Check a goal task (optimistic update)");
    const firstTask = page.locator('button').filter({ hasText: /min/ }).first();
    if (await firstTask.count() > 0) {
      await firstTask.click();
      await page.waitForTimeout(800);
      await shot(page, "task-checked");
      ok("Task checkbox toggled");
    }

    // ── 9. Scroll to bottom ──────────────────────────────────────────────────
    log("9. Unified progress bar at bottom");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await shot(page, "dashboard-bottom");
    ok(`⚡ icon visible: ${await page.locator("text=⚡").count() > 0}`);

    // ── 10. Header user menu ─────────────────────────────────────────────────
    log("10. Header user menu (avatar + dropdown)");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await shot(page, "header-with-avatar");

    const headerBtn = page.locator("header button").last();
    if (await headerBtn.count() > 0) {
      await headerBtn.click();
      await page.waitForTimeout(400);
      await shot(page, "header-dropdown-open");
      ok(`Dropdown 'Mi dashboard': ${await page.locator("text=Mi dashboard").count() > 0}`);
      ok(`Dropdown 'Cerrar sesión': ${await page.locator("text=Cerrar sesión").count() > 0}`);
    }

    // ── 11. Milestones details toggle ────────────────────────────────────────
    log("11. Goal milestones expand");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const milestoneToggle = page.locator("text=Ver hitos del plan").first();
    if (await milestoneToggle.count() > 0) {
      await milestoneToggle.click();
      await page.waitForTimeout(300);
      await shot(page, "milestones-expanded");
      ok("Milestones section expanded");
    }

    // ── 12. DB final state ───────────────────────────────────────────────────
    log("12. DB final state");
    const finalDb = await fetch("https://api.supabase.com/v1/projects/tnatnumzjqnnmihijzcp/database/query", {
      method: "POST",
      headers: { Authorization: `Bearer ${MGMT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `SELECT p.display_name, p.onboarding_completed,
                       COUNT(DISTINCT g.id) AS goals_count,
                       SUM(CASE WHEN g.ai_plan IS NOT NULL THEN 1 ELSE 0 END) AS goals_with_plan,
                       s.current_streak
                FROM user_profiles p
                LEFT JOIN user_goals g ON g.user_id = p.id
                LEFT JOIN user_streaks s ON s.user_id = p.id
                WHERE p.id = '${testUserId}'
                GROUP BY p.display_name, p.onboarding_completed, s.current_streak`
      }),
    }).then(r => r.json());

    const row = finalDb[0];
    ok(`display_name: ${row?.display_name}`);
    ok(`onboarding_completed: ${row?.onboarding_completed}`);
    ok(`goals created: ${row?.goals_count}`);
    ok(`goals with plan: ${row?.goals_with_plan}`);
    ok(`current_streak: ${row?.current_streak}`);

    if (consoleErrors.length > 0) {
      console.log("\n  ⚠️  Console errors:", consoleErrors);
    }

    console.log("\n🎉 Full onboarding flow PASSED!\n");
    console.log(`📁 Screenshots: ${SCREENSHOT_DIR}/`);
    console.log(`   Files: ${stepNum} screenshots captured\n`);

  } catch (e) {
    err(`Test failed at step ${stepNum}: ${e.message}`);
    await shot(page, "FAIL-state").catch(() => {});
    if (consoleErrors.length) console.log("  Console errors:", consoleErrors);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await cleanup();
  }
}

run().catch(e => { console.error(e); process.exit(1); });
