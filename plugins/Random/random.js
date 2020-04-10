exports.commands = [
    "date_fact",
    "year_fact",
    "joke",
    "math_fact"
]

exports.math_fact = {
    usage: "<random math>",
    description: "Gives a Random Math Fact",
    process: function (bot, msg, suffix) {
        require("request")("http://numbersapi.com/random/math?json",
            function (err, res, body) {
                var data = JSON.parse(body);
                if (data && data.text) {
                    msg.channel.send(data.text)
                }
            });
    }
},

    exports.year_fact = {
        description: "Gives a Random Year Fact",
        process: function (bot, msg, suffix) {
            require("request")("http://numbersapi.com/random/year?json",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.text) {
                        msg.channel.send(data.text)
                    }
                });
        }
    },

    exports.joke = {
        description: "Gives a Random Joke",
        process: function (bot, msg, suffix) {
            const axios = require('axios');
            axios.get('https://icanhazdadjoke.com',{
                headers: {
                    'Accept': 'application/json',
                }
            })
                .then(function (response) {
                    if (response && response.data.joke) {
                        msg.channel.send(response.data.joke)
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
    },

    exports.date_fact = {
        description: "Gives a Random Date Fact",
        process: function (bot, msg, suffix) {
            require("request")("http://numbersapi.com/random/date?json",
                function (err, res, body) {
                    var data = JSON.parse(body);
                    if (data && data.text) {
                        msg.channel.send(data.text)
                    }
                });
        }
    }
