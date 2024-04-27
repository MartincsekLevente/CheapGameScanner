import cheerio = require("cheerio");
import puppeteer from 'puppeteer';

export class Scraper {
    private readonly CHEAPEST_PRICE_SELECTOR = '#offers_table > div:nth-child(1) > div.offers-table-row-cell.buy-btn-cell > a.d-none.d-lg-block.buy-btn.x-offer-buy-btn.text-center > span'
    private readonly URL_PREFIX = 'https://www.allkeyshop.com/blog/buy-'
    private readonly URL_SUFFIX = '-cd-key-compare-prices/'
    private readonly REQUEST_COOLDOWN_MS = 5000;

    public async main(gameNames: string[]) {
        try {
            for (const gameName of gameNames) {
                const url = this.makeUrlFromName(gameName);
                const html = await this.fetchPageWithHtml(url);
                if (!html) {
                    console.error('Error fetching page HTML for', gameName);
                    return;
                }
                const price = this.scrapePrices(html);
                console.log(gameName + ":\nCheapest price:", price+"\n");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    private makeUrlFromName(gameName: string): string {
        const formattedGameName = gameName.toLowerCase().replace(/\s+/g, "-");
        return this.URL_PREFIX+formattedGameName+this.URL_SUFFIX;
    }

    private async fetchPageWithHtml(url: string): Promise<string | null> {
        let html: string | null = null;
        let retries = 0;

        while (retries < 5) {
            try {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(url, { waitUntil: 'domcontentloaded' });
                await page.waitForSelector(this.CHEAPEST_PRICE_SELECTOR);
                html = await page.content();
                await browser.close();
                break;
            } catch (error) {
                retries++;
                //console.log(`Retrying (${retries} of 5)`);
                if (retries >= 5) {
                    console.error('Exceeded retry threshold. Unable to fetch page HTML.');
                } else {
                    await this.wait(this.REQUEST_COOLDOWN_MS);
                }
            }
        }

        return html;
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

    private wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

