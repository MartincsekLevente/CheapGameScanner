import cheerio = require("cheerio");
import puppeteer from 'puppeteer';

export class Scraper {
    private readonly CHEAPEST_PRICE_SELECTOR = '#offers_table > div:nth-child(1) > div.offers-table-row-cell.buy-btn-cell > a.d-none.d-lg-block.buy-btn.x-offer-buy-btn.text-center > span'

    public async main() {
        try {
            const gameName = "Horizon Forbidden West";
            const url = this.makeUrlFromName(gameName);
            const html = await this.fetchPageWithHtml(url);
            if (!html) {
                return;
            }

            const price = this.scrapePrices(html);
            console.log(gameName + ":");
            console.log("Cheapest price:", price);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    private makeUrlFromName(gameName: string): string {
        const formattedGameName = gameName.toLowerCase().replace(/\s+/g, "-");
        return `https://www.allkeyshop.com/blog/buy-${formattedGameName}-cd-key-compare-prices/`;
    }

    private async fetchPageWithHtml(url: string): Promise<string | null> {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url, {waitUntil: 'domcontentloaded'});
            await page.waitForSelector(this.CHEAPEST_PRICE_SELECTOR);
            const html = await page.content();
            await browser.close();
            return html;
        } catch (error) {
            console.error('Error while fetching page HTML:', error);
            return null;
        }
    }

    private scrapePrices(html: string): string {
        try {
            const $ = cheerio.load(html);
            return $(this.CHEAPEST_PRICE_SELECTOR).text().trim();
        } catch (error) {
            console.error('Error while scraping price from HTML:', error);
            return '';
        }
    }
}

