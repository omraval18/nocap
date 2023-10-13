import puppeteer from "puppeteer";
import cheerio from "cheerio";
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

export async function ScrapeReviews(url: string) {
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

// let url =
//     "https://www.flipkart.com/apple-iphone-13-blue-128-gb/product-reviews/itm6c601e0a58b3c?pid=MOBG6VF5SMXPNQHG&lid=LSTMOBG6VF5SMXPNQHGMMXJDB&marketplace=FLIPKART";

// (async () => {

// })();
