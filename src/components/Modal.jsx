import { X } from 'lucide-react'
import React from 'react'

const Modal = ({children,title ,close}) => {
  return (
    
    <div className='fixed  h-full w-full inset-0 z-50 bg-primary/60 backdrop-blur-sm'>
        <div className='m-auto flex justify-center  items-center h-full'>
            <div className='p-4 relative bg-white shadow-md rounded-lg min-w-xs'>
                <h2 className='flex font-bold text-lg mb-3'>{title}</h2>

                {
                    children
                }
                <button onClick={()=>close?.(false)} className='absolute cursor-pointer top-3 border border-primary/90 right-3 font-bold text-primary rounded-full hover:bg-primary/90 hover:text-white'>
                    <X/>

                </button>

            </div>
        </div>
        
    </div>
  )
}

export default Modal