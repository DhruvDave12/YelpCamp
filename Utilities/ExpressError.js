class ExpressError extends Error {
    constructor(message, statusCode){
        // calls the parent class
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;