module.exports = {
    isEqualHelper: (a, b, opts) => {
        return a == b ? opts.fn(this) : opts.inverse(this);
    }
};