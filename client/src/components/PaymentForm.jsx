import React ,{useState} from 'react'
import axios from "axios";
const baseApiUrl = 'http://localhost:3000/api';
function cardForm() {
  // create a card form to accept card details with tailwind css 
  return (
    <div className='m-[50px]'>
      <form className='flex flex-col space-y-4'>
        <label className='text-gray-700 dark:text-gray-300'>Card Number</label>
        <input type='text' className='border-2 border-gray-300 rounded-lg p-2 dark:border-gray-600' placeholder='Enter Card Number'/>
        <label className='text-gray-700 dark:text-gray-300'>Expiry Date</label>
        <input type='text' className='border-2 border-gray-300 rounded-lg p-2 dark:border-gray-600' placeholder='Enter Expiry Date'/>
        <label className='text-gray-700 dark:text-gray-300'>CVV</label>
        <input type='text' className='border-2 border-gray-300 rounded-lg p-2 dark:border-gray-600' placeholder='Enter CVV'/>
        <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Pay Now</button>
      </form>
    </div>
  )
}

 function PaymentForm() {
  const [openModal, setOpenModal] = useState(false);
  const [transactionStatusArray, setTransactionStatusArray] = useState(null);


  // function handellers
async function makeSamePayment() {
  // parrallel 2 api calls for single payment
  const arr = [baseApiUrl + '/makepayment' + '?payment_method=pm_card_visa', baseApiUrl + '/makepayment'+ '?payment_method=pm_card_mastercard'];
  
  const responses = await Promise.all(
    arr.map(async url => {
      const payment = await fetch(url);
      const response = await payment.json();
      var newWindow = window.open(response.url, '_blank');
      // Set a timeout to close the window after 7 seconds to proceed with the 3DS authentication
      await new Promise(resolve => {
        setTimeout(function() {
          newWindow.close();
          resolve(); // Resolve the Promise after closing the window
        }, 7000);
      });
      return response;
    })
    
  );
  //console.log(responses);
  // set the transaction status in the state
  setOpenModal(true);
  const transactionStatus = await checkStatusandTakeAction(responses);
  setTransactionStatusArray(transactionStatus.status);
}

async function makeDiffPayment() {
  // parrallel 2 api calls for single payment
  const arr = [baseApiUrl + '/makepayment' + '?payment_method=pm_card_visa', baseApiUrl + '/makepayment'+ '?payment_method=pm_card_visa_chargeDeclined'];
  
  const responses = await Promise.all(
    arr.map(async url => {
      const payment = await fetch(url);
      const response = await payment.json();
      var newWindow = window.open(response.url, '_blank');
      // Set a timeout to close the window after 7 seconds to proceed with the 3DS authentication
      await new Promise(resolve => {
        setTimeout(function() {
          newWindow.close();
          resolve(); // Resolve the Promise after closing the window
        }, 7000);
      });
      return response;
    })
    
  );
  //console.log(responses);
  // set the transaction status in the state
  setOpenModal(true);
  const transactionStatus = await checkStatusandTakeAction(responses);
  setTransactionStatusArray(transactionStatus.status);
}

async function makeUPIpayment() {
  try {
    const { data: { key } } = await axios.get("http://www.localhost:3000/api/getkey");
    const URL = baseApiUrl + '/makeupipayment';
    const {data:{order}} = await axios.get(URL)
    console.log(order);
    const options = {
      key,
      amount: order.amount,
      currency: "INR",
      name: "Ajeet",
      description: "Payment",
      image: "",
      config : {
          display: {
        
            hide: [
              {
                method:"card",
              },
              {
                method:"wallet",
              },
              {
                method:"netbanking",
              },
              {
                method:"paylater",
              }
            ],
        
            sequence: ["block.code"], // The sequence in which blocks and methods should be shown
        
            preferences: {
              show_default_blocks: true // Should Checkout show its default blocks?
            }
          }
        }, 
      callback_url: baseApiUrl + "/verifyupipayment",
      order_id: order.id,
      prefill: {
          name: "Ajeet Verma",
          email: "ajeet@gmail.com",
          contact: "1234567890"
      },
      notes: {
          "address": "IIIT Naya Raipur"
      },
      theme: {
          "color": "#121212"
      }
  };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error("Error:", error);
  }
  
}
async function makeCardAndUPIPayment() {
  try {
    const cardPaymentUrl = baseApiUrl + '/makepayment' + '?payment_method=pm_card_visa';
    // Encapsulate card payment in a functio
    async function handleCardPayment() {
      const response = await fetch(cardPaymentUrl);
      const cardPayment = await response.json();
      var newWindow = window.open(cardPayment.url, '_blank');
      // Set a timeout to close the window after 7 seconds to proceed with the 3DS authentication
      await new Promise(resolve => setTimeout(() => {
        newWindow.close();
        resolve();
      }, 7000));
      return cardPayment;
    }

    // Encapsulate UPI payment in a function
    async function handleUPIPayment() {
      try {
        const { data: { key } } = await axios.get(`${baseApiUrl}/getkey`);
        const URL = `${baseApiUrl}/makeupipayment`;
        const { data: { order } } = await axios.get(URL);
        console.log(order);
    
        // Open a new popup window for the Razorpay payment
        const paymentWindow = window.open(`${baseApiUrl}/razorpayPayment?order_id=${order.id}&&key=${key}`, 'Razorpay', 'width=800,height=600');
        
        // Return a new promise that resolves when the payment status is fetched
        return new Promise(async (resolve, reject) => {
          // Poll to check if the window is closed
          const pollTimer = window.setInterval(async function() {
            if (paymentWindow.closed !== false) { // !== is required for compatibility with Opera
              window.clearInterval(pollTimer);
    
              // Verify the payment status
              try {
                const response = await fetch(`${baseApiUrl}/upipaymentstatus`);
                const paymentStatus = await response.json();
                console.log(paymentStatus);
                resolve(paymentStatus); // Resolve the outer promise with the payment status
              } catch (error) {
                reject(error); // Reject the outer promise if there's an error
              }
            }
          }, 200);
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }
    // Execute both payment functions concurrently
    const responses = await Promise.all([handleCardPayment(), handleUPIPayment()]);
    //console.log(responses);
    // set the transaction status in the state
    const UPiStatus = responses[1];
    const UPIStatusStructured = {payment_method : "UPI"  , paymentIntentId: UPiStatus.reference, status: UPiStatus.success ? 'succeeded' : 'failed'};
    
    const cardStatus = await checkStatusandTakeAction([responses[0]]);
    console.log(cardStatus);
    setOpenModal(true);
    setTransactionStatusArray([cardStatus.status[0], UPIStatusStructured]);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function checkStatusandTakeAction(responses) {
  if(responses.length === 1) {
    const status = await fetch(baseApiUrl + '/paymentstatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({paymentid1 : responses[0].paymentIntentId})
    });
    const statusResponse = await status.json();

    if(statusResponse.status[0] === 'requires_capture') {
      const capturePayment = await fetch(baseApiUrl + '/capturepayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({paymentid1 : responses[0].paymentIntentId})
      });
      const captureResponse = await capturePayment.json();
      statusResponse.status = captureResponse.status;
    } else {
      const cancelPayment = await fetch(baseApiUrl + '/cancelpayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({paymentid1 : responses[0].paymentIntentId})
      });
      const cancelResponse = await cancelPayment.json();
      statusResponse.status = cancelResponse.status;
    }
    return statusResponse;
  }
  //console.log(responses);
  const status = await fetch(baseApiUrl + '/paymentstatus', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({paymentid1 : responses[0].paymentIntentId , paymentid2 : responses[1].paymentIntentId})
  }); 
  const statusResponse = await status.json();
  console.log(statusResponse);
  // if status of both the payments is 'requires_capture' then capture the payment , otherwise cancel both the payments 
  if(statusResponse.status[0] === 'requires_capture' && statusResponse.status[1] === 'requires_capture') {  
    // caputre the payment
    const capturePayment = await fetch(baseApiUrl + '/capturepayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({paymentid1 : responses[0].paymentIntentId , paymentid2 : responses[1].paymentIntentId})
    });
    const captureResponse = await capturePayment.json();
    statusResponse.status = captureResponse.status;
  } else {
    // cancel the payment
    const cancelPayment = await fetch(baseApiUrl + '/cancelpayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({paymentid1 : responses[0].paymentIntentId , paymentid2 : responses[1].paymentIntentId})
    });
    const cancelResponse = await cancelPayment.json();
    statusResponse.status = cancelResponse.status;
  }
  return statusResponse;
}

  // Function to close the modal
  const closeModal = () => {
    setTransactionStatusArray(null);
    setOpenModal(false);
  }

  return (
    
    <div className='m-[50px]'>
       {/* {cardForm()}  */}
      <button onClick={makeSamePayment} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Pay Now(Same Brand - 2 cards)</button>
      <button onClick={makeDiffPayment} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Pay Now(2 Cards - 1 Failure)</button>
      {/* <button onClick={makeUPIpayment} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Pay Now(1 upi)</button> */}
      <button onClick={makeCardAndUPIPayment} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Pay Now(1Card & 1 UPI)</button>
      {openModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 max-w-md mx-auto rounded-md text-center">
            <h2 className="text-lg font-semibold mb-4">Transaction Status</h2>
            <p className="mb-4">{transactionStatusArray && 
              transactionStatusArray.map((status, index) => (
                <>
                <p key={index}>{status.payment_method} Payment with PaymentID {status.paymentIntentId} : {status.status} </p>
                </>
              ))
            }</p>
            <button onClick={closeModal} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Close</button>
          </div>
        </div>
      )}
    </div>
   
    
  )
}

export default PaymentForm