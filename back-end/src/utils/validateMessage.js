// Latin letters, Armenian letters, digits and whitespace only.
const MESSAGE_REGEX = /^[A-Za-z0-9\u0531-\u0556\u0560-\u0588\uFB13-\uFB17\s]+$/u;

function validateMessage(value) {
  return typeof value === "string"
    && value.trim().length > 0
    && value.length <= 2000
    && MESSAGE_REGEX.test(value);
}

module.exports = { validateMessage };
