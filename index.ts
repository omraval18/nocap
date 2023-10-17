import puppeteer from "puppeteer";
import cheerio from "cheerio";
export async function scrapeFlipkartReviewNumber(productPageLink: string) {
    try {
        const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
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

export async function scrapeAmazonReviewNumber(url: string) {
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    await page.goto(url, { waitUntil: "domcontentloaded" });
    const buttonSelector = '[data-hook="see-all-reviews-link-foot"]';
    const button = await page.$(buttonSelector);
    await button?.click();
    // Wait for the new page to load
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    const elements = await page.$$('a[title*= "reviews have 5 stars"]');
    const title = await elements[0].evaluate((el) => el.getAttribute("title"));
    let positive = title.slice(0, title.indexOf("%"));

    const negativeEls = await page.$$('a[title*= "reviews have 1 stars"]');
    const negativeTxt = await negativeEls[0].evaluate((el) => el.getAttribute("title"));
    let negative = negativeTxt.slice(0, negativeTxt.indexOf("%"));

    const ratingSelector = '[data-hook="total-review-count"]';
    const ratingEl = await page.$(ratingSelector);
    const ratings: string = await page.evaluate((element) => {
        const firstSpan = element.querySelector("span"); // Find the first span element within the element
        return firstSpan ? firstSpan.textContent : ""; // Get the text content of the first span
    }, ratingEl);

    await browser.close();
    return { positive, negative, ratings: ratings.replace("global ratings", "") };
}

export async function ScrapeFlipkartReviews(url: string) {
    const productReviews: string[] = [];
    try {
        const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: "domcontentloaded" });

        const content = await page.content();

        const $ = cheerio.load(content);
        const reviews = $("._1AtVbE");

        reviews.each((index, element) => {
            const children = $(element).find(".row");

            children.slice(0, 2).each((childIndex, childElement) => {
                const text = $(childElement).text(); // Get the text content of the child element
                if (text.trim() !== "") {
                    productReviews.push(text.replace("READ MORE", ""));
                }
            });
        });

        await browser.close();
        return productReviews;
    } catch (error) {
        console.error(error);
    }
}

export async function ScrapeAmazonReviews(url: string) {
    const productReviews: string[] = [];
    try {
        const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
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

        return productReviews;
    } catch (error) {
        console.error(error);
    }
}

// let url =
//     "https://www.flipkart.com/apple-iphone-13-blue-128-gb/product-reviews/itm6c601e0a58b3c?pid=MOBG6VF5SMXPNQHG&lid=LSTMOBG6VF5SMXPNQHGMMXJDB&marketplace=FLIPKART";

// (async () => {

// })();
