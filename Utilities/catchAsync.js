// This is a function for handling errors of async.
module.exports = function (fn) {
    return function(req,res,next) {
        fn(req,res,next).catch(next);
    }
}