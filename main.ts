import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { scrapeAmazonReviewNumber } from ".";

async function ScrapeAmazonReviews(url: string) {
    const productReviews: string[] = [];
    try {
        const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: "domcontentloaded" });

        const buttonSelector = '[data-hook="see-all-reviews-link-foot"]';
        const button = await page.$(buttonSelector);
        await button?.click();
        // Wait for the new page to load
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });

        const content = await page.content();

        const $ = cheerio.load(content);
        const reviewContents = $(".review-text-content");

        reviewContents.each((index, element) => {
            const text = $(element).find("span").text().trim(); // Get the text content within the span element
            if (text !== "") {
                productReviews.push(text.replace("READ MORE", ""));
            }
        });

        await browser.close();
        console.log(productReviews);
        return productReviews;
    } catch (error) {
        console.error(error);
    }
}

export async function scrapeReviewNumber(productPageLink: string) {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(60000);

        await page.goto(productPageLink, { waitUntil: "domcontentloaded" });

        const content = await page.content();

        const $ = cheerio.load(content);
        const positiveRatings = $("._1uJVNT").first().text().replace(",", "");
        const negativeRatings = $("._1uJVNT").last().text().replace(",", "");
        const totalRatings = $("._2d4LTz").text();

        await browser.close();
        return { positiveRatings, negativeRatings, totalRatings };
    } catch (error) {
        console.error(error);
    }
}

// export async function scrapeAmazonReviewNumber(url: string) {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     await page.goto(url);
//     const buttonSelector = '[data-hook="see-all-reviews-link-foot"]';
//     const button = await page.$(buttonSelector);
//     await button?.click();
//     // Wait for the new page to load
//     await page.waitForNavigation({ waitUntil: "domcontentloaded" });

//     const elements = await page.$$('a[title*= "reviews have 5 stars"]');
//     const title = await elements[0].evaluate((el) => el.getAttribute("title"));
//     let positive = title.slice(0, title.indexOf("%"));

//     const negativeEls = await page.$$('a[title*= "reviews have 1 stars"]');
//     const negativeTxt = await negativeEls[0].evaluate((el) => el.getAttribute("title"));
//     let negative = negativeTxt.slice(0, negativeTxt.indexOf("%"));

//     const ratingSelector = '[data-hook="total-review-count"]';
//     const ratingEl = await page.$(ratingSelector);
//     const ratings: string = await page.evaluate((element) => {
//         const firstSpan = element.querySelector("span"); // Find the first span element within the element
//         return firstSpan ? firstSpan.textContent : ""; // Get the text content of the first span
//     }, ratingEl);

//     await browser.close();

//     return { positive, negative, ratings: ratings.replace("global ratings", "") };
// }

const ratings = await scrapeAmazonReviewNumber(
    "https://www.amazon.in/Apple-iPhone-13-128GB-Starlight/dp/B09G9D8KRQ/ref=sr_1_1_sspa?crid=T04CEFXQLSEZ&keywords=iphone+13&nsdOptOutParam=true&qid=1697445985&sprefix=iphone%2Caps%2C216&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
);

console.log(ratings);
