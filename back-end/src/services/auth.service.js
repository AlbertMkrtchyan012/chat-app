const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const HttpError = require("../utils/httpError");

async function register({ name, surname, username, password }) {
  if (!name?.trim() || !surname?.trim() || !username || !password) {
    throw new HttpError(400, "Լրացրեք բոլոր պարտադիր դաշտերը։");
  }

  name = name.trim();
  surname = surname.trim();
  username = username.trim();

  if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) {
    throw new HttpError(
      400,
      "Օգտանունը պետք է լինի 3-24 նիշ՝ լատինատառ, թվերով կամ _ նշանով։"
    );
  }

  if (password.length < 8 || password.length > 72) {
    throw new HttpError(
      400,
      "Գաղտնաբառը պետք է պարունակի 8-72 նիշ։"
    );
  }

  const existing = await prisma.user.findUnique({
    where: { username }
  });

  if (existing) {
    throw new HttpError(409, "Այս օգտանունն արդեն օգտագործվում է։");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      surname,
      username,
      password: hashedPassword
    },
    select: {
      id: true,
      name: true,
      surname: true,
      username: true,
      createdAt: true
    }
  });

  return {
    user,
    token: makeToken(user)
  };
}

async function login({ username, password }) {
  if (!username || !password) {
    throw new HttpError(
      400,
      "Մուտքագրեք օգտանունը և գաղտնաբառը։"
    );
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim() }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(
      401,
      "Օգտանունը կամ գաղտնաբառը սխալ է։"
    );
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    surname: user.surname,
    username: user.username
  };

  return {
    user: safeUser,
    token: makeToken(safeUser)
  };
}

function makeToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = {
  register,
  login
};