import React ,{useState} from 'react'
import axios from "axios";
const baseApiUrl = 'http://localhost:3000/api';

function CardDetailsForm({ onAddCard }) {
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const validateCardNumber = (number) => {
    const regex = /^[0-9]{16}$/; // Simple validation for 16 digit card number
    return regex.test(number);
  };
  const handleSubmit = () => {
    if (!validateCardNumber(cardNumber)) {
      alert('Invalid card number. Card number should be 16 digits.');
      return;
    }
    
    onAddCard({ cardNumber, nameOnCard, cvv, expiryDate });
    // Clear form fields after adding
    setCardNumber('');
    setNameOnCard('');
    setCvv('');
    setExpiryDate('');
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2">Card Number</label>
        <input
          type="number"
          className="w-full px-4 py-2 border rounded"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          maxLength="16"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Name on Card</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded"
          placeholder="Name on Card"
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
        />
      </div>
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <label className="block mb-2">CVV</label>
          <input
          type="text"
          className="w-full px-4 py-2 border rounded"
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
        />
        </div>
        <div className="w-1/2 ml-2">
          <label className="block mb-2">Expiry Date</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            placeholder="Expiry Date (MM/YY)"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
      </div>
      {/* Add Button */}
      <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition duration-300">
        Add Card
      </button>
      {/* Add Another Card Button */}
      {/* <button className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300">
        Add Another Card
      </button> */}
    </div>
  );
}

function UPIForm({ onAddUPI }) {
  const [upiId, setUpiId] = useState('');

  const handleSubmit = () => {
    onAddUPI({ upiId });
    setUpiId(''); // Clear UPI ID field after adding
  };
  return (
    <div>
      <div className="mb-4">
        <label className="block mb-2">UPI ID</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded"
          placeholder="UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />
        <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition duration-300">
          Add UPI ID
        </button>
      </div>
    </div>
  );
}
function AddedCardasTile({ card, onRemove }) {
  return (
    <div className="flex items-center justify-between border p-4 rounded mb-4 shadow-lg">
      <div>
        <h3 className="text-lg font-bold">VISA **** {card.cardNumber.slice(-4)}</h3>
        <p className="text-sm">Expiry: {card.expiryDate}</p>
        <p className="text-sm">Name: {card.nameOnCard}</p>
      </div>
      <button onClick={() => onRemove(card)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Remove
      </button>
    </div>
  );
}

function AddedUPIasTile({ upi, onRemove }) {
  return (
    <div className="flex items-center justify-between border p-4 rounded mb-4 shadow-lg">
      <div>
        <h3 className="text-lg font-bold">{upi.upiId}</h3>
      </div>
      <button onClick={() => onRemove(upi)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Remove
      </button>
    </div>
  );
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
  const [paymentMethods, setPaymentMethods] = useState([
    { payment_method_type: 'card', selected: true },
    { payment_method_type: 'upi', selected: false }
  ]);
  const [addedCards, setAddedCards] = useState([]);
  const [addedUPIs, setAddedUPIs] = useState([]);

  const handleAddCard = (cardDetails) => {
    setAddedCards([...addedCards, cardDetails]);
  };

  const handleAddUPI = (upiDetails) => {
    setAddedUPIs([...addedUPIs, upiDetails]);
  };

  const handleRemoveCard = (cardToRemove) => {
    setAddedCards(addedCards.filter(card => card.cardNumber !== cardToRemove.cardNumber));
  };

  const handleRemoveUPI = (upiToRemove) => {
    setAddedUPIs(addedUPIs.filter(upi => upi.upiId !== upiToRemove.upiId));
  };

  const handleExportPaymentMethods = () => {
    //console.log(addedCards);
    //console.log(addedUPIs);
    if(addedCards.length === 0 && addedUPIs.length === 0) {
      alert('Please add atleast one payment method to proceed');
      return;
    }
    if(addedCards.length == 1 && addedUPIs.length  == 1) {
      makeCardAndUPIPayment();
    }
    if(addedCards.length == 2 && addedUPIs.length  == 0) {
      makeSamePayment();
    }
  };

  return (
    <div className='m-[50px]'>
      {/* // Payment Gateway */}
      <div className='flex flex-row w-full'>
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        {/* Left Part */}
        <div className="w-full md:w-1/2 mb-4">
            <label className="block mb-2">Select Payment Method</label>
            <div className="relative">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    id={`payment-method-${index}`}
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green-600"
                    checked={method.selected}
                    onChange={() => {
                      const newMethods = [...paymentMethods];
                      newMethods[index].selected = !newMethods[index].selected;
                      setPaymentMethods(newMethods);
                    }}
                  />
                  <label htmlFor={`payment-method-${index}`} className="ml-2 text-gray-700">
                    {method.payment_method_type.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
     <div className="container mx-auto p-4 ">
     {paymentMethods.find(method => method.payment_method_type === 'card' && method.selected) && (
          <CardDetailsForm onAddCard={handleAddCard} />
        )}
        {paymentMethods.find(method => method.payment_method_type === 'upi' && method.selected) && (
          <UPIForm onAddUPI={handleAddUPI} />
        )}
   </div>
   </div>
   <div className="w-full">
     <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Added Payment Methods</h2>
     <div className="bg-gray-100 p-4 rounded-lg shadow">
       <h3 className="text-xl font-semibold text-gray-700 mb-3">Added Cards</h3>
       {addedCards.length > 0 ? (
         addedCards.map((card, index) => (
            <AddedCardasTile key={index} card={card} onRemove={handleRemoveCard} />
         ))
       ) : (
         <p className="text-gray-600">No cards added yet.</p>
       )}
     </div>
     <div className="bg-gray-100 p-4 rounded-lg shadow mt-6">
       <h3 className="text-xl font-semibold text-gray-700 mb-3">Added UPI IDs</h3>
       {addedUPIs.length > 0 ? (
         addedUPIs.map((upi, index) => (
          <AddedUPIasTile key={index} upi={upi} onRemove={handleRemoveUPI} />
         ))
       ) : (
         <p className="text-gray-600">No UPI IDs added yet.</p>
       )}
     </div>
     <div className="container mx-auto p-4 ">
        <button onClick={handleExportPaymentMethods} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300">
          PAY Now
        </button>
      </div>
  </div>
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