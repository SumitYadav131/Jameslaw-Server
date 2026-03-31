

/////////////////////////////  Rollback Funnctions  /////////////////////////




// Route Here
app.post('/create-checkout-session', authMiddleware, createCheckoutSession);


// create checkout session function
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
