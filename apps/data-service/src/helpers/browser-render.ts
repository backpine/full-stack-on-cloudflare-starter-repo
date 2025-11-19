import puppeteer from '@cloudflare/puppeteer';

export async function collectDestinationInfo(env: Env, destinationUrl: string) {
	const browser = await puppeteer.launch(env.VIRTUAL_BROWSER);
	const page = await browser.newPage();
	const response = await page.goto(destinationUrl);
	await page.waitForNetworkIdle();

	const bodyText = (await page.$eval('body', (el) => el.innerText)) as string;
	const html = await page.content();
	const status = response ? response.status() : 0;
	const screenShot = await page.screenshot({ encoding: 'base64' }); // Capture screenshot as base64 string
	const screenShotDataUrl  = `data:image/png;base64,${screenShot}`; // Convert to data URL format

	await browser.close(); // Close the browser after use
	return {
		bodyText,
		html,
		screenShotDataUrl,
		status,
	};
} // End of collectDestinationInfo function

