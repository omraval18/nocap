const str = `5Best in the market! Sound Clarity is good; perfect for music lovers but not good for driving bike 5Fabulous! Fantastic product. Easily fits in my ear.. Have a great design.. Very compact.. Main why I bought this. Total satisfaction. 5Terrific Amazing product 5Super! Good ..i am happy with the performance and battery back up 5Perfect product! Mic can be improved for better calling experience. 5Best in the market! Since am a music lover ..i would prefer others to buy..its actually perfect ..sound is crystal clear ..the bass is kinda  okay in the sense it is so balanced ..so its actually a good product..its my cup of tea..anyways 5Brilliant Good Quality with bass 👌 and comfortable to use in our ears. 5Super! Good 👍 5Must buy! Nice 5Not recommended at all Jbl very bad5Excellent Amazing tws from JBL... 5Wonderful Best and sound is also 👌 super..😁😁 5Don't waste your money The product is not durable 5Excellent Satisfied 5Just wow! Good product highly recommended 5Brilliant Best quality 5Terrific Good 5Awesome awesome 5Wonderful Good 5Great product Nice5Best in the market! Sweet sounds 5Classy product Good One 5Great product Its amazing product and i really love that soecially toche  and its totaly value of money ❣️❣️✨✨ 5Worth every penny Superb quality 5Mind-blowing purchase Best Bluetooth JBL300TWS  faster delivery 5Must buy! Nice product 5Fabulous! Its amazing. Sound quality is extraordinary. I didnt expect this much sound quality. Battery back up is great. Worth every penny.... 5Wonderful Overall a good experience 5Great product Good 😊 5Perfect product! Awesome product....👌🏻Sound quality👌🏻👌🏻👌🏻👌🏻`;

console.log(
    str
        .replace(/is|the|was|were|\d+|\p{Emoji}/g, "")
        .replace(
            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
            ""
        )
);
