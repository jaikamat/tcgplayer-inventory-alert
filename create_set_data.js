const fs = require('fs');
const rawSets = require('./raw_data/AllSets.json');
const setCodes = Object.keys(rawSets);
const _ = require('lodash');

for (setCode of setCodes) {
    const cards = rawSets[setCode].cards;

    // Remove commons and uncommons and create simple objects
    const alteredCards = cards
        .filter(card => {
            return card.rarity !== 'uncommon' && card.rarity !== 'common';
        })
        .map(card => {
            return {
                name: card.name,
                rarity: card.rarity,
                purchaseUrl: card.tcgplayerPurchaseUrl,
                tcgplayerProductId: card.tcgplayerProductId,
                setCode: setCode,
                uuid: card.uuid
            };
        });

    const uniqCards = _.uniqBy(alteredCards, 'tcgplayerProductId');

    fs.writeFileSync(`${__dirname}/set_data/${setCode}`, JSON.stringify(uniqCards));
}
