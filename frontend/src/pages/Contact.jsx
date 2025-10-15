import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Contact = () => {
    return (
        <div>
            <div className='text-center text-2xl pt-10 text-gray-500'>
                <p>Contact <span className='text-gray-700 font-semibold'>Us</span></p>
            </div>
            <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
                <img className='w-full max-w-[360px]' src={assets.contact_image} />
                <hr />
                <div className='flex flex-col justify-center items-start gap-6'>
                    <p className='font-semibold text-lg text-gray-600'>Our Office</p>
                    <p className='text-gray-500'>123 Conch St.,<br/> West Avenue, Int'l Waters</p>
                    <p className='text-gray-500'>Tel: (+254) 705 250 517 <br/>Email: duncanochieng48@gmail.com</p>
                    <p className='font-semibold text-lg text-gray-600'>Careers & Partnerships</p>
                    <p className='text-gray-500'>Explore ways of working with us</p>
                    <button className='border border-black px-8 py-4 hover:bg-black hover:text-white transition-all duration-500 rounded-md shadow-md'>Explore Open Positions</button>
                </div>
            </div>
        </div>
    )
}

export default Contact