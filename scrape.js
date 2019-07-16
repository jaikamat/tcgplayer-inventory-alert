const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * Grabs the inventory number from strings of the format:
 * `Viewing 1-10 of 334 results`
 * @param {string} str
 */
function getInventoryFromText(str) {
    const inventoryPhrase = str.match(/of \d+/)[0];
    return parseInt(inventoryPhrase.substring(3)) || null;
}

/**
 * Takes an array of cards and hits the TCGplayer api to find their inventory quantities.
 * Creates a concurrent promise pool of NUM_WORKERS to speed up the process.
 * @param {array} cards
 */
async function scrape(cards) {
    const NUM_WORKERS = 7;
    const workers = [];
    const result = [];

    const startDate = new Date().getTime();

    try {
        for (let numPromises = 0; numPromises < NUM_WORKERS; numPromises++) {
            workers.push(
                new Promise(async (resolve, reject) => {
                    while (cards.length > 0) {
                        const card = cards.shift();

                        try {
                            const res = await axios.get(
                                `https://shop.tcgplayer.com/productcatalog/product/getpricetable?productId=${
                                    card.tcgplayerProductId
                                }&gameName=magic`
                            );
                            const $ = cheerio.load(res.data);
                            const inventoryStr = $(
                                '#product-price-table span.sort-toolbar__total-item-count'
                            ).text();
                            const inventoryNum = getInventoryFromText(inventoryStr);

                            console.log(
                                `${card.name} | Inventory: ${inventoryNum} | ${card.setCode}`
                            );

                            result.push({
                                name: card.name,
                                setCode: card.setCode,
                                tcgplayerProductId: card.tcgplayerProductId,
                                uuid: card.uuid,
                                quantity: inventoryNum
                            });
                        } catch (error) {
                            console.log(
                                `----Error on ${card.name} | TCG: ${card.tcgplayerProductId}----`
                            );
                        }
                    }
                    resolve();
                })
            );
        }
        await Promise.all(workers);
        console.log(`Time elapsed: ${Math.round(new Date().getTime() - startDate) / 1000}s`);
        return result;
    } catch (err) {
        console.log(err);
    }
}

module.exports = scrape;
