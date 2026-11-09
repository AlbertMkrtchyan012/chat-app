function notFound(req, res) {
  res.status(404).json({ message: "Այս հասցեն գոյություն չունի։" });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = status === 500
    ? "Սերվերում սխալ է տեղի ունեցել։"
    : err.message;
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
