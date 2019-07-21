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


router.get('/', async (req, res) => {
    const sql = `${retrieveBooksSql} LIMIT 30;`;
    
    let err;
    const books = await pool.query(sql).catch(e => err = e);
    if (err) {
        res.render('books', { books: [], errorMsg: 'There was an error retrieving your books, please reload this page.' });
    }
    res.render('books', { books });
});

// Search books by query parameter string
router.get('/searchbooks', (req, res) => {
    res.render('books');
});

// Get book info (Google Books API)
router.get('/getbookinfo', async (req, res) => {
    // API end point to get book info from Google Books API..
    res.send('In /getbookinfo route...');
});

// Insert book get and post
router.get('/addbook', (req, res) => {
    res.send('In /addbook route...');
});

router.post('/insertbook', (req, res) => {
    res.send('In /insertbook route...');
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