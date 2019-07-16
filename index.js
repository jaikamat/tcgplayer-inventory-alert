const scrape = require('./scrape');
const writeCalculatedChange = require('./calc_inventory_change');
const fs = require('fs');
const CardModel = require('./db_connect');

const filenames = fs.readdirSync('./set_data');

async function collectCards() {
    try {
        const startDate = new Date();
        for (let filename of filenames) {
            const cards = JSON.parse(fs.readFileSync(`${__dirname}/set_data/${filename}`));
            const data = await scrape(cards);

            const bulkOps = data.map(card => {
                return {
                    updateOne: {
                        filter: { _id: card.uuid },
                        update: {
                            name: card.name,
                            setCode: card.setCode,
                            tcgplayerProductId: card.tcgplayerProductId,
                            $push: {
                                inventoryHistory: {
                                    quantity: card.quantity,
                                    date: startDate
                                }
                            }
                        },
                        upsert: true
                    }
                };
            });

            try {
                await CardModel.bulkWrite(bulkOps);
                console.log(`${filename} bulk write OK`);
            } catch (error) {
                console.log(`Could not bulkwrite set: ${filename}`);
            }
        }
        console.log(
            `Scrape Finished! Time elapsed: ${Math.round(
                new Date().getTime() - startDate.getTime()
            ) / 1000}s`
        );
    } catch (error) {
        console.log(`Scrape died :( Here's why:`);
        console.log(error);
    }
}

async function run() {
    try {
        let count = 10;
        while (count > 0) {
            await collectCards();
            await writeCalculatedChange(CardModel);
            count--;
        }
    } catch (error) {
        console.log(error);
    }
}

run();
