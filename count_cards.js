const fs = require('fs');

const setNames = fs.readdirSync('./set_data');

const nums = setNames.map(name => {
    return JSON.parse(fs.readFileSync(`./set_data/${name}`)).length;
});

console.log(nums.reduce((a, b) => a + b));
