import React from 'react'

function Sidebar() {
  return (
    <div>
      <aside class="flex flex-col w-100 h-screen px-4 py-8 overflow-y-auto bg-white ">
        <div class="flex flex-col justify-between flex-1 mt-6">
            <nav>
                <a class="flex items-center px-8 py-4 text-gray-700   rounded-lg " href="#">
                    <span class="mx-6 text-3xl">Card</span>
                </a>

                <a class="flex items-center px-8 py-4 mt-5 text-gray-600 transition-colors duration-300 transform rounded-lg " href="#">
                    <span class="mx-6 text-3xl">Net Banking</span>
                </a>

                <a class="flex items-center px-8 py-4 mt-5 text-gray-600 transition-colors duration-300 transform rounded-lg" href="#">
                    {/* <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 5V7M15 11V13M15 17V19M5 5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg> */}
                    <span class="mx-6 text-3xl">UPI</span>
                </a>

                <a class="flex items-center px-8 py-4 mt-5 text-gray-600 transition-colors duration-300 transform rounded-lg " href="#">
                    <span class="mx-6 text-3xl">E-Currency</span>
                </a>
            </nav>
        </div>
    </aside>
    </div>
  )
}

export default Sidebar;