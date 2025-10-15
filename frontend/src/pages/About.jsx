import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const About = () => {
    return (
        <div>
            <div className='text-center text-2xl pt-10 text-gray-500'>
                <p>About <span className='text-gray-700 font-medium'>Us</span></p>
            </div>
            {/*---left section--- */}
            <div className='my-10 flex flex-col md:flex-row gap-12 items-center justify-center'>
                <img className='w-full max-w-[360px] rounded-lg' src={assets.about_image} alt="" />
            {/*---right section--- */}
                <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600 text-justify'>
                    <p>
                        It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
                    </p>
                    <p>
                        It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
                    </p>
                    <b className='text-gray-800'>Our Vision</b>
                    <p>
                        It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
                    </p>
                </div>
            </div>
            <div className='text-xl my-4 pt-10 text-center pb-10'>
                <p>Why <span className='text-gray-700 font-semibold'>Choose Us</span></p>
            </div>
            <div className='flex flex-col md:flex-row mb-20'>
                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary rounded-lg mx-2 hover:text-white transition-all duration-300 cursor-pointer shadow-lg'>
                    <b>Efficiency</b>
                    <p className='font-extralight text-lg'>
                        There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour
                    </p>
                </div>
                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary rounded-lg mx-2 hover:text-white transition-all duration-300 cursor-pointer shadow-lg'>
                    <b>Convenience</b>
                    <p className='font-extralight text-lg'>
                        There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour
                    </p>
                </div>
                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary rounded-lg mx-2 hover:text-white transition-all duration-300 cursor-pointer shadow-lg'>
                    <b>Personalized Care</b>
                    <p className='font-extralight text-lg'>
                        There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About