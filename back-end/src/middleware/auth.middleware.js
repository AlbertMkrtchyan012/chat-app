
const jwt = require("jsonwebtoken");
const HttpError = require("../utils/httpError");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return next(
      new HttpError(401, "Խնդրում ենք մուտք գործել։")
    );
  }


  const token = header
    .slice(7)
    .trim()
    .replace(/^["']+|["']+$/g, "");

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    console.log("JWT error:", err.name, err.message);

    return next(
      new HttpError(
        401,
        "Մուտքի տվյալները սխալ են կամ ժամկետն ավարտվել է։ Կրկին մուտք գործեք։"
      )
    );
  }
}

module.exports = authMiddleware;
