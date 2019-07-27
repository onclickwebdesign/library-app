const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
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
        let message = 'There was an error retrieving your books, please reload this page.';
        let messageType = 'danger';
        console.error('Sql error: ', err);
        res.render('books', { message, messageType });
    } else {
        res.render('books', { books });
    }
});

// Search books by query parameter string
router.get('/searchbooks', async (req, res) => {
    const s = pool.escape(`%${req.query.booksearch.trim()}%`);
    let message = 'Please enter a search term first.';
    let messageType = 'danger';
    
    if (!req.query.booksearch) {
        res.render('books', { message, messageType });
    } else {
        const sql = 
            `${retrieveBooksSql}
            WHERE
                book.author LIKE ${s} OR book.title LIKE ${s} OR book_type.type LIKE ${s} OR book_sub_type.sub_type LIKE ${s} OR book_language.language LIKE ${s} OR book_location.location LIKE ${s} ORDER BY book_type.type, book_sub_type.sub_type, book.author`;

        let err;
        let booksResult = await pool.query(sql).catch(e => err = e);
        let books = getJson(booksResult);
        
        if (err) {
            message = 'There was an error with that search, please try again.';
            console.error('Sql error: ', err);
            res.render('books', { message, messageType });
        } else {
            res.render('books', { books });
        }
    }
});

// Get book info (Google Books API)
router.get('/getbookinfo', async (req, res) => {
    // REST end point to get book info from Google Books API..
    const bookquery = req.query.bookquery;
    const query = `${bookquery}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

    let err;
    const bookPromise = await fetch(`https://www.googleapis.com/books/v1/volumes?${query}`).catch(e => err = e);

    if (err) {
        res.status(err.status || 500).json({ err });
    } else {
        const bookJson = await bookPromise.json();
        const book = bookJson.totalItems > 0 ? bookJson.items[0] : null;
        res.status(200).json(book);
    }
});

// Insert book get and post
router.get('/addbook', async (req, res) => {
    let messageType = 
        req.query.success === '1' ? 'success' : 
        req.query.success === '0' ? 'danger' : false;

    let message;

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
            messageType = 'danger';
            message = 'There was an error, please try that action again.';
            console.error('SQL Error: ', err);
            res.render('books', { messageType, message });
        } else {
            message = messageType === 'danger' ? 
                'There was an error trying to add this book, please try again.' : 
                'This book has been added to your library.';

            const templateData = {
                message,
                messageType,
                types: results[0],
                sub_types: results[1],
                languages: results[2],
                locations: results[3]
            };
            res.render('addbook', templateData);
        }
});

router.post('/insertbook', async (req, res) => {
    const book = { 
        author: req.body.author.trim(), 
        title: req.body.title.trim(), 
        book_type_id: req.body.type, 
        book_sub_type_id: req.body.sub_type, 
        book_language_id: req.body.language,
        book_location_id: req.body.location 
    };

    let err;
    const sql = 'INSERT INTO book SET ?';

    const result = await pool.query(sql, book).catch(e => err = e);
    if (err) {
        console.error('SQL Error: ', err);
        res.redirect('/books/addbook?success=0');
    } else {
        res.redirect('/books/addbook?success=1');
    }
});

// Update book GET and POST (by id)
router.get('/updatebook', async (req, res) => {
    let messageType = 
        req.query.success === '1' ? 'success' : 
        req.query.success === '0' ? 'danger' : false;

    let message;
     
    const id = pool.escape(req.query.id);
    const sql =
        `
        SELECT * FROM book WHERE id = ${id};
        SELECT * FROM book_type;
        SELECT * FROM book_sub_type;
        SELECT * FROM book_language;
        SELECT * FROM book_location;
        `;

    let err;
    const results = await pool.query(sql).catch(e => err = e);
    
    if (err) {
        messageType = 'danger';
        message = 'There was an error, please try that action again.';
        console.error('SQL Error: ', err);
        res.render('books', { messageType, message });
    } else {
        message = messageType === 'danger' ? 
            'There was an error trying to update this book, please try again.' : 
            `${results[0][0].title} has been updated.`;

        const templateData = {
            messageType,
            message,
            book: results[0][0],
            types: results[1],
            sub_types: results[2],
            languages: results[3],
            locations: results[4]
        }
        res.render('updatebook', templateData);
    }
});

router.post('/updatebookbyid/:id', async (req, res) => {
    const id = req.params.id;
    const book = {
        id,
        author: req.body.author.trim(), 
        title: req.body.title.trim(), 
        book_type_id: req.body.type, 
        book_sub_type_id: req.body.sub_type, 
        book_language_id: req.body.language,
        book_location_id: req.body.location 
    };

    let err;
    const sql = `UPDATE book SET ? WHERE id = ${pool.escape(id)};`;

    const result = await pool.query(sql, book).catch(e => err = e);
    if (err) {
        console.error('SQL Error: ', err);
        res.redirect(`/books/updatebook?id=${id}&success=0`);
    } else {
        res.redirect(`/books/updatebook?id=${id}&success=1`);
    }
});

// Delete book by id
router.delete('/deletebook/:id', async (req, res) => {
    const id = pool.escape(req.params.id);
    const sql = 
        `
        SELECT title FROM book WHERE id = ${id};
        DELETE FROM book WHERE id = ${id};
        `;

    let err;
    const deleteResult = await pool.query(sql).catch(e => err = e);
    const result = getJson(deleteResult);
    
    if(err) {
        console.error('SQL Error: ', err);
        res.status(500).json({ fail: true, msg: 'There was a problem attempting to delete this book, please try again.' });
    } else {
        res.status(200).json({ fail: false, msg: `${result[0].title} has been removed.` });
    }
});

module.exports = router;