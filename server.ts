import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { OpenAI } from "langchain/llms/openai";
import { calculateMaxTokens } from "langchain/base_language";
import { ScrapeReviews, scrapeReviewNumber } from ".";

const app = express();
app.use(bodyParser.json());

app.get("/ap", (req: Request, res: Response) => {
    res.send("hello");
});

app.post("/api/reqsummary", async (req: Request, res: Response) => {
    let url: string = req.body;
    let page = 0;
    let review: string = "";
    let tokenSize = 0;

    if (url[url.length - 1] !== "&") {
        url += `&page=${page}`;
    }

    let ratings: any = await scrapeReviewNumber(url);

    console.log(ratings);

    const prompt = `Evaluate the public reviews of a product from an online shopping site to determine whether it is worth purchasing, and compile a pros and cons list using bullet points. There are ${ratings.positiveRatings} positive reviews and ${ratings.negativeRatings} negative reviews with total ${ratings.totalRatings} rating out of 5 so take this in consideration when evaluating but also consider other aspects equally.
         Consider the following structure for your response:

    I. Introduction

    - Briefly explain the purpose of the evaluation and mention the total number of positive and negative reviews, along with the overall rating.

    II. Pros

    - Present the positive aspects of the product based on the reviews.

    - Use bullet points to clearly list each pro.

    - Provide specific examples or quotes from the reviews to support your points.

    III. Cons

    - Highlight the negative aspects of the product as mentioned in the reviews.

    - Again, use bullet points to clearly list each con.

    - Include specific examples or quotes from the reviews to back up your statements.

    IV. Conclusion

    - Summarize your findings and provide a final recommendation on whether to purchase the product, considering the overall sentiment of the reviews and the pros and cons you have listed.

    `;

    for (page = 0; page < 10; page++) {
        if (page === 1) {
            var negUrl: string = url + `&sortOrder=NEGATIVE_FIRST`;
            var posUrl: string = url + `&sortOrder=POSITIVE_FIRST`;
        } else {
            var negUrl: string = url + `&sortOrder=NEGATIVE_FIRST&page=${page}`;
            var posUrl: string = url + `&sortOrder=POSITIVE_FIRST&page=${page}`;
        }

        const res = await ScrapeReviews(posUrl);
        res?.shift();
        res?.shift();
        review += res
            ?.join(" ")
            .replace(/is|the|was|were|\d+|\p{Emoji}/g, "")
            .replace(
                /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                ""
            );
        const maxTokens = await calculateMaxTokens({ prompt: review, modelName: "gpt2" });
        tokenSize = 4096 - maxTokens;
    }

    const model = new OpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0.9,
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const result = await model.call(`${prompt} : ${review}`);
        console.log(result);
        res.send({ tokenSize, result, review });
    } catch (e) {
        console.error(e);
    }
});

app.listen(3000, () => {
    console.log("Server Listening");
});
