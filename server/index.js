const express = require('express');
const app = express();
var cors = require('cors')
var bodyParser = require('body-parser')
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
app.use(cors())
app.use(bodyParser.json())

app.get('/api/makepayment', async (req, res) => {
    // Making a single Successfull Payment from Stripe API with Express Server has multiple steps

    // Step 1: Create a PaymentIntent on the server with parameters required.
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      description: "Single Payment Test",
      payment_method: req.query.payment_method,
      amount: 100,
      capture_method: 'manual',
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
  
    //Step 2: Confirm the payment intent with retrun_url as additional parameter
    const paymentIntentConfirm = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {return_url: 'http://localhost:3000/api/transactionstatus'}
    );

    //Step 3: Make successful attempt to 3DS autehntication. (visit the redirect_to url in the browser)

     const url = paymentIntentConfirm.next_action.redirect_to_url.url; 
    

    //const paymentIntentStatus = await stripe.paymentIntents.retrieve(paymentIntent.id);
    res.json({ url: url , client_secret: paymentIntent.client_secret  ,paymentIntentId : paymentIntent.id });
  });

app.post('/api/capturepayment', async (req, res) => {
    // Making a single Successful Payment from Stripe API with Express Server has multiple steps
    //console.log(req.body);

    const paymentIntentIds = req.body;
    const captureResponse = [];
    for (const key in paymentIntentIds) {
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentIds[key]);
      //console.log(paymentIntent);
      let response_object = {
        paymentIntentId : paymentIntent.id,
        status : paymentIntent.status
      }
      captureResponse.push(response_object);
    }
    res.json({ status: captureResponse });
  }); 
  app.post('/api/cancelpayment', async (req, res) => {
    // Making a single Successful Payment from Stripe API with Express Server has multiple steps
    //console.log(req.body);

    const paymentIntentIds = req.body;
    const captureResponse = [];
    for (const key in paymentIntentIds) {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentIds[key]);
      let response_object = {
        paymentIntentId : paymentIntent.id,
        status : paymentIntent.status
      }
      captureResponse.push(response_object);
    }
    res.json({ status: captureResponse });
  }); 

  app.post('/api/paymentstatus', async (req, res) => {
    // Making a single Successful Payment from Stripe API with Express Server has multiple steps
    //console.log(req.body);

    const paymentIntentIds = req.body;
    const status = [];
    for (const key in paymentIntentIds) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentIds[key]);
      //console.log(paymentIntent);
      status.push(paymentIntent.status);
    }
    res.json({ status: status });
  });

  app.get('/api/transactionstatus', async (req, res) => {
    // Making a single Successful Payment from Stripe API with Express Server has multiple steps
    //console.log(req.body);
    //console.log(req.query);
    const paymentIntent = await stripe.paymentIntents.retrieve(req.query.payment_intent);
    //console.log(paymentIntent);
    res.send('Redirecting Back ..... ');
});


app.get('/' , (req, res) => {
    res.send('Hello World');
});

app.listen(3000, () => console.log('Node server listening on port 3000!'));


