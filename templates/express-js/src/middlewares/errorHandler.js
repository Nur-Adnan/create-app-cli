/**
 * @param {Error} err
 * @param {any} _req
 * @param {any} res
 * @param {any} _next
 */
function errorHandler(err, _req, res, _next) {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message ?? 'Internal Server Error' });
}

module.exports = { errorHandler };
