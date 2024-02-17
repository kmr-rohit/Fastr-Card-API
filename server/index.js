const express = require('express');
const app = express();
var cors = require('cors')
var bodyParser = require('body-parser')
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
});
app.use(cors())
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
var upiPaymentResult = {};
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
        payment_method : "Card",
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
        payment_method : "Card",
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
    res.send('Redirecting Back ..... ');
});
app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);
// UPI Payment
app.get('/api/makeupipayment', async (req, res) => {
  const options = {
    amount: Number(6 * 100),
    currency: "INR",
  };
  const order = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});

app.get('/api/razorpayPayment', async (req, res) => {
  const orderId = req.query.order_id;
  const key = req.query.key;
  // Generate the Razorpay options based on the order ID
  // Initialize Razorpay payment here and set the callback URL to your /api/verifyupipayment endpoint
  res.send(`
    <html>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
        const options = {
          "key" : "${key}",
          "amount": "600",
          "currency": "INR",
          "name": "Ajeet",
          "description": "Payment",
          "image": "",
          "config" : {
              "display": {
            
                "hide": [
                  {
                    "method":"card",
                  },
                  {
                    "method":"wallet",
                  },
                  {
                    "method":"netbanking",
                  },
                  {
                    "method":"paylater",
                  }
                ],
            
                "sequence": ["block.code"], // The sequence in which blocks and methods should be shown
            
                "preferences": {
                  "show_default_blocks": "true" // Should Checkout show its default blocks?
                }
              }
            }, 
          "callback_url": "http://localhost:3000/api/verifyupipayment",
          "order_id": "${orderId}",
          "prefill": {
              "name": "Ajeet Verma",
              "email": "ajeet@gmail.com",
              "contact": "1234567890"
          },
          "notes": {
              "address": "IIIT Naya Raipur"
          },
          "theme": {
              "color": "#121212"
          }
      };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
        </script>
      </body>
    </html>
  `);
});


app.post('/api/verifyupipayment', async (req, res) => {
  console.log(req.body);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");
  
  const isAuthentic = expectedSignature === razorpay_signature;
  console.log(isAuthentic);

  if (isAuthentic) {

    upiPaymentResult = {
      success: true,
      reference: razorpay_payment_id,
    };
    res.json(
      {
        success: true,
        reference: razorpay_payment_id,
        message: "Payment Successful! , Close the window to return to the application",
      }
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
});

app.get('/api/upipaymentstatus', async (req, res) => {
  res.json(upiPaymentResult);
});


app.get('/' , (req, res) => {
    res.send('Hello World');
});

app.listen(3000, () => console.log('Node server listening on port 3000!'));


