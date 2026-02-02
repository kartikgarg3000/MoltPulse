
import puppeteer from 'puppeteer';

async function main() {
    console.log('Launching browser...');
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        console.log('Navigating to MoltBook...');
        await page.goto('https://www.moltbook.com/u', { waitUntil: 'networkidle2' });

        console.log('Page loaded. Saving HTML to debug.html...');
        const content = await page.content();
        const fs = await import('fs/promises');
        await fs.writeFile('debug.html', content);
        console.log('Saved debug.html');

        await browser.close();
    } catch (e) {
        console.error('Fatal error:', e);
    }
}

main();
