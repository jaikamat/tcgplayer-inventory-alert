const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/tcg_scrape', { useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('MongoDB connecton open');
});

const cardSchema = new mongoose.Schema({
    _id: String,
    name: String,
    uuid: String,
    setCode: String,
    tcgplayerProductId: Number,
    inventoryHistory: [
        {
            date: Date,
            quantity: Number
        }
    ],
    percentChange: {
        recent: Number
    }
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
