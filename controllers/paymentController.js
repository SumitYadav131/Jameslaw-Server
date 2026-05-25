import Stripe from "stripe";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
    try {
        const { name, email } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 17900, // $179
            currency: "usd",

            metadata: {
                userId: req.user.userId,
                name,
                email,

                plan: "lifetime",
                amount: "179",
                currency: "usd",

                platform: "web",
                module: "subscription",

                createdAt: new Date().toISOString(),
            },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating payment intent" });
    }
};


// Save payment
export const savePayment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { paymentIntentId, amount, email, name } = req.body;

        // 1. Save payment
        const payment = new Payment({
            userId,
            name,
            email,
            stripePaymentIntentId: paymentIntentId,
            amount,
            status: "success",
        });

        await payment.save();

        // 2. Upgrade user
        await User.findByIdAndUpdate(userId, {
            isPremium: true,
        });

        res.status(200).json({
            message: "Payment saved & user upgraded",
            payment,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error saving payment" });
    }
};

// create checkout session [Recent work]
// export const createCheckoutSession = async (req, res) => {
//     const { planType, plan } = req.body;
//     const userId = req.user.userId;
//     const priceMap = {
//         basic: 780,
//         premium: 999,
//         pro: 1900,
//     };
//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             mode: "payment",
//             line_items: [
//                 {
//                     price_data: {
//                         currency: "inr",
//                         product_data: {
//                             name: plan,
//                         },
//                         unit_amount: priceMap[plan]
//                     },
//                     quantity: 1
//                 }
//             ],
//             success_url: `${process.env.CLIENT_url}/success`,
//             cancel_url: `${process.env.CLIENT_url}`,

//             metadata: {
//                 userId,
//                 plan,
//                 planType,
//             }
//         });
//         res.json({ url: session.url });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send(`Stripe Error: ${error.message}`);
//     }

// }



export const createCheckoutSession = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment", // one-time payment

            line_items: [
                {
                    price: "price_1TaqjN2WKIRwWW8qMYAIbu6K", // price_id here
                    quantity: 1,
                },
            ],

            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel",
        });

        res.json({ url: session.url });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Payment error" });
    }
};


