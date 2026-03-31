import Stripe from "stripe";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Craete Payment Intent
export const createPaymentIntent = async (req, res) => {
    const { planType, plan } = req.body;
    const userId = req.user.userId;

    const priceMap = {
        basic: 78000,   // ₹780
        premium: 99900,
        pro: 190000,
    };

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: priceMap[plan],
            currency: "inr",
            metadata: {
                userId,
                plan,
                planType,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            
        });

    } catch (error) {
        console.log(error);
        res.status(500).send(`Stripe Error: ${error.message}`);
    }
};



// create checkout session
export const createCheckoutSession = async (req, res) => {
    const { planType, plan } = req.body;
    const userId = req.user.userId;
    const priceMap = {
        basic: 780,
        premium: 999,
        pro: 1900,
    };
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: plan,
                        },
                        unit_amount: priceMap[plan]
                    },
                    quantity: 1
                }
            ],
            success_url: `${process.env.CLIENT_url}/success`,
            cancel_url: `${process.env.CLIENT_url}`,

            metadata: {
                userId,
                plan,
                planType,
            }
        });
        res.json({ url: session.url });
    } catch (error) {
        console.log(error);
        res.status(500).send(`Stripe Error: ${error.message}`);
    }

}


// webhook to handle stripe events
// export const stripeWebhook = async (req, res) => {
//     const sig = req.headersp["stripe-signature"];
//     let event;
//     try {
//         event: stripe.webhooks.constructEvent(
//             req.body,
//             sig,
//             process.env.STRIPE_WEBHOOK_SECRET
//         );

//     } catch (error) {
//         return res.status(400).send(`Webhook Error: ${error.message}`)
//     }

//     if (event.type === "checkout.session.completed") {
//         const session = event.data.object;
//         const userId = session.metadata.userId;
//         const plan = session.metadata.plan;
//         const planType = session.metadata.planType;
//         const amount = session.amount_total;
//         const currency = session.currency;
//         const paymentId = session.payment_intent;

//         try {
//             // Save Payment
//             await Payment.create({
//                 userId,
//                 transactionId: session.id,
//                 amount: session.amount_total / 100,
//                 currency: session.currency,
//                 status: session.payment_status,
//                 paymentDate: new Date(session.created * 1000),
//             });

//             // save subscription
//             await Subscription.create({
//                 userId,
//                 planName: plan,
//                 price: session.amount_total / 100,
//                 status: "active",
//                 startDate: new Date(),
//                 endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//             });

//             res.json({ received: true });

//         } catch (error) {
//             console.log(error);
//         }
//     }

// }