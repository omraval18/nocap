import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { OpenAI } from "langchain/llms/openai";
import { calculateMaxTokens } from "langchain/base_language";
import {
    ScrapeFlipkartReviews,
    ScrapeAmazonReviews,
    scrapeFlipkartReviewNumber,
    scrapeAmazonReviewNumber,
} from ".";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/api", (req: Request, res: Response) => {
    console.log(req.body);
    res.json({ message: "hello" });
});

app.post("/api/reqflipkartsummary", async (req: Request, res: Response) => {
    let { url } = req.body;
    let page = 0;
    let review: string = "";
    let tokenSize = 0;

    if (url[url.length - 1] !== "&") {
        url += `&page=${page}`;
    }

    let { positiveRatings, negativeRatings, totalRatings }: any = await scrapeFlipkartReviewNumber(
        url
    );

    const prompt = `Evaluate the public reviews of a product from an online shopping site to determine whether it is worth purchasing, and compile a pros and cons list using bullet points. There are ${positiveRatings} positive reviews and ${negativeRatings} negative reviews with total ${totalRatings} rating out of 5 so take this in consideration when evaluating but also consider other aspects equally.
         Consider the following structure for your response:

    I. Introduction

    - Briefly explain the 3 highlighted points about this products in bullet points.

    II. Pros

    - Present the positive aspects of the product based on the reviews.

    - Use bullet points to clearly list each pro.You must provide atleast 5 Pros.

    - Best For : List of 3 best things about this product in 3 words only.

    III. Cons

    - Highlight the negative aspects of the product as mentioned in the reviews.

    - Again, use bullet points to clearly list each con. You must provide atleast 5 Cons.

    - Issues : List 3 potential issues with this product in 3 words only.

    IV. Conclusion

    - Summarize your findings and provide a final recommendation on whether to purchase the product, considering the overall sentiment of the reviews and the pros and cons you have listed.

    Note: Ensure that the overall evaluation is balanced, taking into account both positive and negative aspects, and present the information in a concise and organized manner. You Must Make every Points in bold and keep It Short to 5 bullets points for each Pros and Cons
    `;

    for (page = 0; page < 20; page++) {
        if (page === 1) {
            var negUrl: string = url + `&sortOrder=NEGATIVE_FIRST`;
            var posUrl: string = url + `&sortOrder=POSITIVE_FIRST`;
        } else {
            var negUrl: string = url + `&sortOrder=NEGATIVE_FIRST&page=${page}`;
            var posUrl: string = url + `&sortOrder=POSITIVE_FIRST&page=${page}`;
        }

        const res = await ScrapeFlipkartReviews(posUrl);
        res?.shift();
        res?.shift();
        review += res
            ?.join(" ")
            .replace(/is|the|was|were|\d+|\p{Emoji}/g, "")
            .replace(
                /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                ""
            );
        const maxTokens = await calculateMaxTokens({ prompt: review + prompt, modelName: "gpt2" });
        tokenSize = 4096 - maxTokens;
    }
    console.log(tokenSize);

    res.send({ prompt: `${prompt}:${review}` });
});
app.post("/api/reqamazonsummary", async (req: Request, res: Response) => {
    let { url } = req.body;
    let page: number = 0;
    let review: string = "";
    let tokenSize = 0;

    let ratings: any = await scrapeAmazonReviewNumber(url);

    const prompt = `Evaluate the public reviews of a product from an online shopping site to determine whether it is worth purchasing, and compile a pros and cons list using bullet points. There are ${ratings.positive}% positive reviews and ${ratings.negative}% negative reviews (1 star) with total ${ratings.ratings} rating out of 5 so take this in consideration when evaluating but also consider other aspects equally.
         Consider the following structure for your response:

    I. Introduction

    - Briefly explain the 3 highlighted points about this products in bullet points.

    II. Pros

    - Present the positive aspects of the product based on the reviews.

    - Use bullet points to clearly list each pro.You must provide atleast 5 Pros.

    - Best For : List of 3 best things about this product in 3 words only.

    III. Cons

    - Highlight the negative aspects of the product as mentioned in the reviews.

    - Again, use bullet points to clearly list each con. You must provide atleast 5 Cons.

    - Issues : List 3 potential issues with this product in 3 words only.

    IV. Conclusion

    - Summarize your findings and provide a final recommendation on whether to purchase the product, considering the overall sentiment of the reviews and the pros and cons you have listed.

    Note: Ensure that the overall evaluation is balanced, taking into account both positive and negative aspects, and present the information in a concise and organized manner. You Must Make every Points in bold and keep It Short to 5 bullets points for each Pros and Cons
    `;

    for (page = 0; review.length / 3 < 4096; page++) {
        if (page > 1) {
            url = url + `&pageNumber=${page}`;
        }

        const res = await ScrapeAmazonReviews(url);
        res?.shift();
        res?.shift();
        review += res
            ?.join(" ")
            .replace(/is|the|was|were|\d+|\p{Emoji}/g, "")
            .replace(
                /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                ""
            );
        const maxTokens = await calculateMaxTokens({ prompt: review + prompt, modelName: "gpt2" });
        tokenSize = 4096 - maxTokens;
    }
    console.log(tokenSize);
    console.log(review.length);
    console.log(ratings);

    res.send({ prompt: `${prompt}:${review}` });
});

const server = app.listen(3000, () => {
    console.log("Server Listening");
});

process.on("SIGINT", () => {
    console.log("Received SIGINT. Closing server...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});
