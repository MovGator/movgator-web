import { test, expect } from "@playwright/test";

// Marketing site: multi-page, no PWA install prompts, working internal links.
test("marketing site navigates across pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /stop scrolling/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: /marketing/i })).toBeVisible();
  // No PWA install affordances on marketing pages
  await expect(page.getByRole("region", { name: /install movgator/i })).toHaveCount(0);
  await page.getByRole("link", { name: /explore features/i }).click();
  await expect(page).toHaveURL(/\/features/);
  await expect(page.getByRole("heading", { name: /pick the night/i }).first()).toBeVisible();
  await page.goto("/faq");
  await expect(page.getByText(/really random/i).first()).toBeVisible();
  await page.goto("/get-started");
  await expect(page.getByRole("heading", { name: /five minutes/i })).toBeVisible();
});

// App: iOS-style tab bar, app shell, guest journeys.
test("app has native tab bar; guest can browse and roll dice", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // phone: tab bar, not sidebar
  await page.goto("/home");
  const tabbar = page.locator("nav.app-tabbar");
  await expect(tabbar).toBeVisible();
  await expect(tabbar.getByRole("link", { name: "Roll the Dice" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /discover your next favourite/i })).toBeVisible();

  await page.goto("/discover?anime=only");
  await expect(page.getByRole("status").first()).toBeVisible();

  await page.goto("/dice");
  await page.getByRole("button", { name: /^roll the dice$/i }).click();
  await expect(page.getByText(/matching title|tap the dice|no titles match/i).first()).toBeVisible();
});

test("home tabs switch content; watchlist guards guests", async ({ page }) => {
  await page.goto("/home");
  const tablist = page.getByRole("tablist", { name: /discovery categories/i });
  await expect(tablist).toBeVisible();
  const gems = tablist.getByRole("tab", { name: "Hidden Gems" });
  await gems.click();
  await expect(gems).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#home-tabpanel")).toContainText(/Glass Orchard|Small Mercies|Beekeeper|Detour|Mercies|Pines|Ramen|Sonata|Theatre/i);
  await tablist.getByRole("tab", { name: "Trending" }).click();
  await expect(page.locator("#home-tabpanel")).toContainText(/Midnight Cartographer|Copper Sky/i);

  await page.goto("/watchlist");
  await expect(page.getByRole("heading", { name: /my watchlist/i })).toBeVisible();
  await expect(page.getByText(/sign in to keep a list/i)).toBeVisible();
});

test("theme toggle persists without flash", async ({ page }) => {
  await page.goto("/");
  const btn = page.getByRole("banner").getByRole("button", { name: /color theme/i });
  await expect(btn).toBeVisible();
  await btn.click();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("mr-theme"))).not.toBeNull();
});

test("dark mode uses the mandatory near-black background", async ({ page }) => {
  await page.goto("/home");
  await page.evaluate(() => {
    localStorage.setItem("mr-theme", "dark");
    document.documentElement.dataset.theme = "dark";
  });
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(7, 2, 9)");
});

test("desktop sidebar collapses and always expands again", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/home");
  const sidebar = page.locator("nav.app-sidebar");
  await expect(sidebar).toBeVisible();
  const contentPad = () =>
    page.evaluate(() => getComputedStyle(document.querySelector(".app-content")!).paddingLeft);
  expect(await contentPad()).toBe("248px");
  const toggle = sidebar.getByRole("button", { name: /sidebar/i });
  await toggle.click(); // collapse
  await expect(sidebar).toHaveAttribute("data-collapsed", "true");
  expect(await contentPad()).toBe("84px");
  // The toggle must remain visible and operable while collapsed
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAccessibleName(/expand sidebar/i);
  await page.reload();
  await expect(page.locator("nav.app-sidebar")).toHaveAttribute("data-collapsed", "true");
  const toggle2 = page.locator("nav.app-sidebar").getByRole("button", { name: /sidebar/i });
  await expect(toggle2).toBeVisible();
  await toggle2.click(); // expand again
  await expect(page.locator("nav.app-sidebar")).toHaveAttribute("data-collapsed", "false");
  expect(await contentPad()).toBe("248px");
  await page.reload();
  await expect(page.locator("nav.app-sidebar")).toHaveAttribute("data-collapsed", "false");
});
