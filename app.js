const express = require('express');
const hbs = require('express-handlebars');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 5000;

// serve static assets in /public directory as /static route
app.use('/static', express.static('public'));

// setup handlebars template engine
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: './views/layouts/',
    partialsDir: './views/includes/'
}));

app.set('view engine', 'hbs');


app.get('/', (req, res) => {
    res.render('helloworld');
});

// 404 route
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    res.status(err.status).send(
        `
        <h1>${err.status}</h1>
        <h2>Error: ${err.message}</h2>
        <p>Stack: ${err.stack}</p>
        `
    );
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});