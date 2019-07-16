// calculate %change over a certain timeline?
// Might be too arbitrary. Changes could happen suddenly or gradually. Want to see when inventories drop pase certain thresholds?

// percent change from last value
// second
// third
// fourth

// assuming scraping takes hours in-between datapoints

const _ = require('lodash');

/**
 * Calculates the &change of the last ten inventory datapoints
 * @param {array} dateTimeQty
 */
function calculateChange(dateTimeQty) {
    const sorted = _.sortBy(dateTimeQty, 'date');
    if (sorted.length > 10) {
        const lastTen = sorted.slice(sorted.length - 10);
        const past = lastTen[0].quantity;
        const recent = lastTen[lastTen.length - 1].quantity;
        const percentChange = (((recent - past) / past) * 100).toFixed(2);

        return percentChange;
    } else {
        return null;
    }
}

async function writeCalculatedChange(CardModel) {
    try {
        const CHUNK_SIZE = 500;
        const numCards = await CardModel.find({}).count();
        let count = 0;

        while (count < numCards) {
            const docs = await CardModel.find({})
                .skip(count)
                .limit(CHUNK_SIZE)
                .lean();

            const bulkOps = docs.map(doc => {
                return {
                    updateOne: {
                        filter: { _id: doc._id },
                        update: {
                            percentChange: { recent: calculateChange(doc.inventoryHistory) }
                        }
                    }
                };
            });

            await CardModel.bulkWrite(bulkOps);

            console.log(`Updated %change for cards ${count + 1}-${count + docs.length}`);

            count += CHUNK_SIZE;
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = writeCalculatedChange;
