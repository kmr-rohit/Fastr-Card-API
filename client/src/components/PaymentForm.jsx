import React from 'react'
const baseApiUrl = 'http://localhost:3000/api';

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
  checkStatusandTakeAction(responses);

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
  checkStatusandTakeAction(responses);
  
}

async function checkStatusandTakeAction(responses) {
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
    console.log(captureResponse);
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
    console.log(cancelResponse);
  }
  return statusResponse;
}


function PaymentForm() {
  return (
    <div>
      <button onClick={makeSamePayment} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Pay Now(Same Brand - 2 cards)</button>
      <button onClick={makeDiffPayment} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Pay Now(2 Cards - 1 Failure)</button>
    </div>
   
    
  )
}

export default PaymentForm