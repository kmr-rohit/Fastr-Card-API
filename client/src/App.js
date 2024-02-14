
import PaymentForm from './components/PaymentForm';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="display: flex flex-col m-[50px]">
    <div>
          <h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 '>Payment Gateway</h1>
        </div>
        <div className="display: flex m-[50px] ">
          {/* <Sidebar /> */}
          <PaymentForm />
        </div>
    </div>
    
    
  );
}

export default App;
