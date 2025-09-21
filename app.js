import express from 'express';
import 'dotenv/config';
import './src/db/connectDB.js';
import router from './src/routers/authRouter.js';
import passport from "passport";
import './src/config/passport.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 
import swaggerDocs from './src/config/swagger.js';
import vacancyrouter from './src/routers/vacancyRouter.js';

const app = express();
const PORT = process.env.PORT || 5000;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000"];

// app.use(cors({
//   origin: CLIENT_URL, // Yalnız bu URL-dən gələn sorğulara icazə ver
//   credentials: true, // Sorğularla birlikdə çerezlərin (cookies) göndərilməsinə icazə ver
// }));
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));


const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:3001',
      process.env.CLIENT_URL
    ].filter(Boolean); // undefined olanları çıxar

    // Development-də origin yoxlamaqı atla (Postman, mobile app üçün)
    if (process.env.NODE_ENV !== 'production' && !origin) {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Cookie göndərmək üçün
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200 // IE11 dəstəyi üçün
};

app.set("trust proxy", 1); // production üçün

app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', router);
app.use('/api/vacancy',vacancyrouter)
swaggerDocs(app);



app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
});
