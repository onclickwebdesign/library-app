const express = require('express');
const router = express.Router();
const pool = require('../db');

const retrieveBooksSql = 
    `
    SELECT 
        book.id,
        book.author,
        book.title,
        book_type.type,
        book_sub_type.sub_type,
        book_location.location,
        book_language.language
    FROM book
    INNER JOIN book_type ON book.book_type_id = book_type.id
    INNER JOIN book_sub_type ON book.book_sub_type_id = book_sub_type.id
    INNER JOIN book_location ON book.book_location_id = book_location.id
    INNER JOIN book_language ON book.book_language_id = book_language.id
    `;

const getJson = (sqlResult) => {
    const jsonArr = [];

    const checkType = (item) => {
        if (item.constructor.name.toLowerCase() === 'array') {
            item.forEach(obj => {
                checkType(obj);
            });
        } else if (item.constructor.name.toLowerCase() === 'rowdatapacket') {
            jsonArr.push(item);
        }
    };
    
    checkType(sqlResult);
    return jsonArr;
};

router.get('/', async (req, res) => {
    const sql = `${retrieveBooksSql} LIMIT 30;`;
    
    let err;
    const books = await pool.query(sql).catch(e => err = e);
    if (err) {
        console.error('Sql error: ', err);
        res.render('books', { books: [], errorMsg: 'There was an error retrieving your books, please reload this page.' });
    } else {
        res.render('books', { books });
    }
});

// Search books by query parameter string
router.get('/searchbooks', async (req, res) => {
    const s = req.query.booksearch; // explain why .trim() is needed here
    
    const sql = 
        `${retrieveBooksSql}
        WHERE
            book.author LIKE '%${s}%' OR book.title LIKE '%${s}%' OR book_type.type LIKE '%${s}%' OR book_sub_type.sub_type LIKE '%${s}%' OR book_language.language LIKE '%${s}%' OR book_location.location LIKE '%${s}%' ORDER BY book_type.type, book_sub_type.sub_type, book.author; -- SQL query for searchbooks`;

    let err;
    let booksResult = await pool.query(sql).catch(e => err = e);
    console.log(booksResult);
    let books = getJson(booksResult);
    
    if (err) {
        console.error('Sql error: ', err);
        res.render('books', { books: [], errorMsg: 'There was an error with that search, please try again.' });
    } else {
        res.render('books', { books });
    }
});

// Get book info (Google Books API)
router.get('/getbookinfo', async (req, res) => {
    // API end point to get book info from Google Books API..
    res.send('In /getbookinfo route...');
});

// Insert book get and post
router.get('/addbook', async (req, res) => {
    const sql = 
        `
        SELECT * FROM book_type;
        SELECT * FROM book_sub_type;
        SELECT * FROM book_language;
        SELECT * FROM book_location;
        `;

        let err;
        const results = await pool.query(sql).catch(e => err = e);
        
        if (err) {
            console.error('Sql error: ', err);
            res.render('books', { books: [], errorMsg: 'There was an error, please try that action again.' });
        } else {
            const templateData = {
                types: results[0],
                sub_types: results[1],
                languages: results[2],
                locations: results[3]
            };
            res.render('addbook', templateData);
        }
});

router.post('/insertbook', async (req, res) => {
    // const bookTypeId = +req.body.type;
    // const bookSubTypeId = +req.body.sub_type;
    // const bookLanguageId = +req.body.language;
    // const bookLocationId = +req.body.location;
    
    const book = { 
        author: req.body.author, 
        title: req.body.title, 
        book_type_id: req.body.type, 
        book_sub_type_id: req.body.sub_type, 
        book_language_id: req.body.language,
        book_location_id: req.body.location 
    };

    let err;
    const sql = 'INSERT INTO book SET ?';

    const result = await pool.query(sql, book).catch(e => err = e);
    if (err) {
        console.log('SQL Error: ', err);
        res.redirect('/books/addbook?s=0');
    } else {
        res.redirect('/books/addbook?s=1');
    }
});

// Update book GET and PUT (by id)
router.get('/updatebook', (req, res) => {
    res.send('in /updatebook route...');
});

router.post('/updatebookbyid/:id', (req, res) => {
    res.send('in /updatebookbyid route...');
});

// Delete book by id
router.delete('/deletebook/:id', (req, res) => {
    res.send('in /deletebook route...');
});

module.exports = router;