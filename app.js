// import dependencies
const axios = require('axios');
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const cheerio = require('cheerio');
const path = require('path');

// configure build path
// const buildPath = path.join(__dirname, '/react-client/build');

// configure dotenv
dotenv.config();

// create express app
const app = express();

// declare the port
const port = process.env.PORT || 3000;

// use build files
app.use(express.static(buildPath));

// use cors
app.use(cors({ origin: '*' }));

// use body parser
app.use(bodyParser.json());

// declare options for axios method
const options = {
    method: 'POST',
    url: process.env.API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Cross-Origin': '*',
        'X-RapidAPI-Key': process.env.X_RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.X_RAPIDAPI_HOST,
    },
    data: {
        male: {
            name: '',
            dob: ''
        },
        female: {
            name: '',
            dob: ''
        }
    }
};

// endpoint to scrape the data
async function scrapeData(keywords, maxCount) {
    // try catch block to handle exceptions
    try {
        // make the request
        const response = await axios.get(`${process.env.WEB_SCRAPPER_URL}${keywords}`);
        const $ = cheerio.load(response.data);
        console.log(response.data);

        // initialize the result
        const result = [];

        // loop through the search results
        let count = 0;
        $('h4').each((index, element) => {
            // check count number
            if (count < 10) {
                // initialize the title and url
                const title = $(element).text();
                const url = $(element).find('a').attr('href');

                // push the result in the array
                result.push({
                    title,
                    url
                });

                // increment the count
                count++;
            } else {
                // break the loop
                return false;
            }
        });

        // return the result
        return result;
    } catch (error) {
        // log the error
        console.error(error);

        // throw the error
        throw error;
    }
}

// get static files
// if (process.env.NODE_ENV === 'production') {
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, 'react-client', 'build', 'index.html'), (error) => {
//             if (error) {
//                 // error handling
//                 console.error(error);
//                 return res.status(500).json({
//                     success: 0,
//                     error: 'An error occured!'
//                 });
//             }
//         });
//     });
// }

// endpoint to accept the data
app.post('/', async (req, res) => {
    try {
        // get the body from the request
        const { male, female } = req.body;

        // update the data in the options
        options.data.male.name = male.name;
        options.data.male.dob = male.dob;
        options.data.female.name = female.name;
        options.data.female.dob = female.dob;

        // make the request
        const response = await axios.request(options);

        // send the response
        console.log(response.data);
        return res.status(200).json({
            success: 1,
            data: response.data
        });
    } catch (error) {
        // error handling
        console.error(error);
        return res.status(500).json({
            success: 0,
            error: 'An error occured!'
        });
    }
});

// endpoint to accept the keywords
app.get('/search', async (req, res) => {
    // try catch block
    try {
        // get the keywords from the query
        const keywords = req.query.keywords;

        // define max count
        const maxCount = 10;

        // call the scrapeData function
        const result = await scrapeData(keywords, maxCount);
        console.log(result);

        // send the response
        return res.status(200).json({
            success: 1, 
            data: result
        });
    } catch (error) {
        // error handling
        console.error(error);
        return res.status(500).json({
            success: 0,
            error: 'An error occured!'
        });
    }
});

// listen to the port
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});