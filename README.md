# Local Development Instructions

# Pre-requisites

1. Stripe API , if you don’t want to create a new test api , you can use : `sk_test_.......`

2. Folder Structure : 
    1. Client Side React App : 
    
    ```
    └── 📁client
        └── package-lock.json
        └── package.json
        └── 📁public
            └── index.html
        └── README.md
        └── 📁src
            └── App.css
            └── App.js
            └── 📁components
                └── PaymentForm.jsx
            └── index.css
            └── index.js
        └── tailwind.config.js
    ```
    
    b. server side api 
    
    ```
    └── 📁server
        └── .env
        └── index.js
        └── package-lock.json
        └── package.json
        └── test.js
    ```
    

Instructions : 

1. Clone the github : https://github.com/kmr-rohit/Fastr-Card-API.git
2. create a .env file in server folder root & paste stripe test api key.  
    
    ```jsx
    STRIPE_SECRET_KEY = 'sk_test_......'
    ```
    
3. Navigate to client root. 
    1. install npm dependencies : `npm install`
4. Navigate to server root. 
    1. install npm dependencies : `npm install`
5. Run app and server 
    1. First run server (from server directory root ) : `node index.js`
        
    2. Then run React app (from client directory ) :  `npm start`
        
        > Would you like to run the app on another port instead? ... yes
        > 
        
