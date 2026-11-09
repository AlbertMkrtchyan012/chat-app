# Socket.IO + PostgreSQL անձնական չաթ

## Պահանջներ
- Node.js 18+
- PostgreSQL
- npm

## Տեղադրում
1. Ստեղծեք PostgreSQL բազա, օրինակ՝ `socket_chat`։
2. Նախագծի պանակում աշխատեցրեք՝
   ```bash
   npm install
   ```
3. `.env.example` ֆայլը պատճենեք `.env` անունով և լրացրեք PostgreSQL գաղտնաբառը, `DATABASE_URL` ու երկար գաղտնի `JWT_SECRET`։
4. Ստեղծեք աղյուսակները և Prisma Client-ը՝
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Գործարկեք՝
   ```bash
   npm run dev
   ```
6. Health check՝ `GET http://localhost:5000/api/health`

## REST API
Բոլոր պատասխանները և սխալների հաղորդագրությունները հայերեն են։

- `POST /api/auth/register` — `{ "username": "Aram1", "email": "aram@example.com", "password": "password123" }`
- `POST /api/auth/login` — `{ "login": "Aram1", "password": "password123" }`
- `GET /api/friends/users` — բոլոր օգտատերերը բացի քեզնից
- `GET /api/friends/requests` — մուտքային սպասող հայտեր
- `POST /api/friends/requests` — `{ "receiverId": "USER_ID" }`
- `PATCH /api/friends/requests/REQUEST_ID` — `{ "decision": "ACCEPTED" }` կամ `{ "decision": "REJECTED" }`
- `GET /api/friends` — ընկերների ցուցակ
- `GET /api/chats/USER_ID/messages` — չաթի պատմություն

Պաշտպանված REST հարցումների վերնագիր՝
`Authorization: Bearer YOUR_JWT_TOKEN`

## Socket.IO client
Frontend-ում՝ `npm install socket.io-client`, ապա՝

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: YOUR_JWT_TOKEN }
});

socket.on("connect", () => console.log("Միացումը հաջողվեց"));
socket.on("connect_error", (err) => console.warn(err.message));

socket.on("online_users", (userIds) => {
  console.log("Առցանց օգտատերեր", userIds);
});

socket.on("friend_request", (data) => {
  console.log(data.message, data.request);
});

socket.on("friend_request_updated", (data) => {
  console.log(data.message);
});

socket.on("private_message", (message) => {
  console.log("Նոր հաղորդագրություն", message);
});

// Ուղարկել հաղորդագրություն
socket.emit("private_message", {
  receiverId: "FRIEND_USER_ID",
  content: "Բարև 123"
}, (result) => {
  if (!result.ok) alert(result.message);
});
```

## Անվտանգության նշումներ
- Գաղտնաբառերը պահպանվում են bcrypt hash-ով։
- REST API-ն և Socket.IO-ն ստուգում են JWT-ն։
- Սերվերը ստուգում է ընկերության առկայությունը մինչև հաղորդագրություն պահելը։
- Հաղորդագրության թույլատրելի նիշերը ստուգվում են սերվերի կողմից, ոչ միայն frontend-ում։
- Օգտատերերը, ընկերության հայտերը, ընկերությունները և հաղորդագրությունները պահվում են PostgreSQL-ում։
- Առցանց կարգավիճակը պահվում է հիշողության մեջ, քանի որ այն ժամանակավոր է. հաղորդագրությունների ու հաշիվների տվյալները պահպանվում են բազայում։
- Production-ում օգտագործեք HTTPS, փոխեք JWT_SECRET-ը, սահմանափակեք հարցումների հաճախականությունը և ավելացրեք logging/rate limiting։
