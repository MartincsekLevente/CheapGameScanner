import cheerio = require("cheerio");
import puppeteer from 'puppeteer';

export class Scraper {
    public async main() {
        try {
            const gameName = "Horizon Forbidden West";
            const url = this.makeUrlFromName(gameName);
            const html = await this.fetchPageWithPuppeteer(url);
            if (!html) {
                return;
            }

            const price = this.scrapePrices(html);
            console.log(gameName+":" );
            console.log("Cheapest price:", price);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    private makeUrlFromName(gameName: string): string {
        const formattedGameName = gameName.toLowerCase().replace(/\s+/g, "-");
        return `https://www.allkeyshop.com/blog/buy-${formattedGameName}-cd-key-compare-prices/`;
    }

    async fetchPageWithPuppeteer(url: string) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#offers_table > div:nth-child(1) > div.offers-table-row-cell.buy-btn-cell > a.d-none.d-lg-block.buy-btn.x-offer-buy-btn.text-center > span');
        const html = await page.content();
        await browser.close();
        return html;
    }

    scrapePrices(html: string): string {
        const $ = cheerio.load(html);
        const price = $('#offers_table > div:nth-child(1) > div.offers-table-row-cell.buy-btn-cell > a.d-none.d-lg-block.buy-btn.x-offer-buy-btn.text-center > span').text().trim();
        return price;
    }
}

