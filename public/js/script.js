require('../css/styles.css');
const $ = require('jquery');
import 'bootstrap/dist/js/bootstrap.bundle';

console.log($);

const removeBook = async elem => {
    const id = elem.getAttribute('data-bookid');
    
    try {
        const result = await fetch(`/books/deletebook/${id}`, { method: 'DELETE' });
        const jsonResponse = await result.json();
        console.log(jsonResponse.msg);
        $('#removeBookModal').modal('hide');
    } catch (err) {
        console.error('Error: ', err);
    }
};

const setDataAttr = elem => {
    const id = elem.getAttribute('data-bookid');
    document.getElementById('removeBookConfirm').setAttribute('data-bookid', id);
};

$('#books-table').on('click', '.remove-book', e => {
    setDataAttr(e.currentTarget);
});

$('#book-cards-list').on('click', '.remove-book', e => {
    setDataAttr(e.currentTarget);
});

// triggered from "removeBookModal" button
$('#removeBookConfirm').on('click', e => {
    removeBook(e.currentTarget);
});