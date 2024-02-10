const stripe = require('stripe')('sk_test_51OSk42SEDhmcKFKzIl8XK4DFReClgzysj0Sga4WavASxyUNhaHQde4yjA45bsP2xPiQAR4ED8AnIcVvWuKfAapLb007vFGdsnB');

(async () => {
  // Making a single Successfull Payment from Stripe API with Express Server has multiple steps
  // step 0 : Create a card payment method on the server
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2023,
      cvc: '123',
    },
  });

  // Step 1: Create a PaymentIntent on the server with parameters required.
  const paymentIntent = await stripe.paymentIntents.create({
    currency: 'usd',
    description: "Single Payment Test",
    payment_method: paymentMethod.id,
    amount: 100,
    shipping: {
      address: {
        line1: "SFfdg q",
        state: "CA",
        city: "San Francisco",
        postal_code: "98140",
        country: "US"
      },
      name: "Rohit Kumar"
    }
  });

  // Step 2: Confirm the payment intent with retrun_url as additional parameter
  const paymentIntentConfirm = await stripe.paymentIntents.confirm(
    paymentIntent.id,
    {return_url: 'http://localhost:3000/api/success'}
  );

  //Step 3: Make successful attempt to 3DS autehntication. (visit the redirect_to url in the browser)

  const url = paymentIntentConfirm.next_action.redirect_to_url.url;

  console.log({ url: url , client_secret: paymentIntent.client_secret });
})();