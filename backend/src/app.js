import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import passport from "passport";
import cartRouter from "./routes/cart.routes.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {config} from "./config/config.js";
import productRouter from "./routes/product.routes.js";
import paymentRouter from "./routes/payment.routes.js";
const app = express();

// Behind Render/Vercel the app runs behind a TLS-terminating proxy — trust it so
// secure cookies and req.protocol/host are resolved from the forwarded headers.
app.set("trust proxy", 1);

app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL,
    proxy: true},
    (accessToken, refreshToken, profile, done) =>{
        return done(null, profile);
    }))

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});
app.use("/api/auth",authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment", paymentRouter);
export default app;