import React from 'react'
import { assets } from '../assets/assets_frontend/assets'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate();
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                {/*-------left section-------*/}
                <div>
                    <img src={assets.logo} alt="logo" className='size-16 cursor-pointer mb-5' />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6 text-justify'>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                </div>

                {/*-----center section ------*/}
                <div>
                    <p className='text-xl font-medium mb-5'>
                        COMPANY
                    </p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li onClick={() => {navigate('/'); scrollTo(0,0)}} className='cursor-pointer hover:underline transition-all duration-500'>Home</li>
                        <li onClick={() => {navigate('/about'); scrollTo(0,0)}} className='cursor-pointer hover:underline transition-all duration-500'>About Us</li>
                        <li onClick={() => {navigate('/contact'); scrollTo(0,0)}} className='cursor-pointer hover:underline transition-all duration-500'>Contact Us</li>
                        <li onClick={() => {navigate('/privacy-policy'); scrollTo(0,0)}} className='cursor-pointer hover:underline transition-all duration-500'>Privacy Policy</li>
                    </ul>
                </div>

                {/*--------right section--------*/}
                <div>
                    <p className='text-xl font-medium mb-5'>
                        Get in Touch
                    </p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>(+254) 705 250 517</li>
                        <li>duncanochieng48@gmail.com</li>
                    </ul>
                </div>
            </div>

            {/*-------copyright section----------*/}
            <div>
                <hr/>
                <p></p>
                <div className='flex justify-between py-5 text-sm text-center'>
                    <span>Copyright &copy; 2025</span>
                    <span>Doc Tracker</span>
                    <span>All Rights Reserved.</span>
                </div>
                
            </div>
            
        </div>
    )
}

export default Footer;