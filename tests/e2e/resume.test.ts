import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 375, 768, 1024, 1440]) {
	test(`English resume has no horizontal overflow at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/?lang=en');
		await expect(page.getByRole('heading', { name: /Kritthapath/ })).toBeVisible();
		const overflowing = await page.evaluate(() => {
			const docWidth = document.documentElement.clientWidth;
			const els = Array.from(document.querySelectorAll('*'));
			return els
				.filter((el) => el.getBoundingClientRect().right > docWidth + 1)
				.map((el) => ({ tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 30), right: el.getBoundingClientRect().right }));
		});
		if (overflowing.length > 0) {
			console.log(`[OVERFLOW ${width}px]`, JSON.stringify(overflowing));
		}
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
	});
}

test('Thai content, security headers, public address redaction, and click-to-hide', async ({ page }) => {
	const response = await page.goto('/?lang=th');
	expect(response?.headers()['cache-control']).toBe('private, no-store');
	expect(response?.headers()['referrer-policy']).toBe('no-referrer');
	expect(response?.headers()['content-security-policy']).toContain("default-src 'self'");
	await expect(page.locator('html')).toHaveAttribute('lang', 'th');
	await expect(page.getByText('Hack Club Thai Translation')).toHaveCount(0);

	// Public address should show only province and country
	await expect(page.getByText('นนทบุรี, ไทย')).toBeVisible();
	await expect(page.getByText('55/228')).toHaveCount(0);

	// Public certificate PDF link exists
	await expect(page.getByRole('link', { name: '[Detail]' }).first()).toHaveAttribute('href', /certificate\/pdf/);
	await expect(page.getByText('(Code: rkeV-u8N2)')).toBeVisible();

	// Click-to-hide toggle interaction
	const hideable = page.locator('.group.relative.transition-all').first();
	await expect(hideable).not.toHaveClass(/web-only/);
	await hideable.click();
	await expect(hideable).toHaveClass(/web-only/);
	await hideable.click();
	await expect(hideable).not.toHaveClass(/web-only/);

	// Accessibility scan (exclude contrast for deliberate styling)
	const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
	expect(results.violations).toEqual([]);
});

test('print media hides web-only header and links but keeps visible CV content', async ({ page }) => {
	await page.goto('/?lang=en');
	await page.emulateMedia({ media: 'print' });
	await expect(page.getByRole('button', { name: '[Print]' })).toBeHidden();
	await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
});
