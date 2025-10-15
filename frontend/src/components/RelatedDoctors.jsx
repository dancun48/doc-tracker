import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const RelatedDoctors = ({ docId, specialty}) => {

    const { doctors } = useContext(AppContext);
    const [relDoc, setRelDoc] = useState([]);
    const navigate = useNavigate();

    useEffect(()=>{
        if (doctors.length > 0 && specialty) {
            const doctorsData = doctors.filter((doc)=> doc.specialty === specialty && doc._id !== docId);
            setRelDoc(doctorsData);
        }
    }, [doctors, docId, specialty])

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>
                Related Doctors
            </h1>
            <p className='sm:w-1/3 text-center text-sm'>Browse through other similar practitioners</p>
            <div className='w-full grid md:grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {relDoc.slice(0,5).map((item, index) => (
                    <div onClick={() => {navigate(`/appointment/${item._id}`); scrollTo(0,0)}} className='border border-green-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                        <img className='bg-[#F5FEFD] w-[100%] h-[300px] object-contain' src={item.image} />
                        <div className='p-4'>
                            <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-blue-500' : 'text-gray-500'}`}>
                                <p className={`size-2 ${item.available ? 'bg-blue-500' : 'bg-gray-500'} rounded-full`}></p>
                                <p>{item.available ? "Available" : "NOT Available"}</p>
                            </div>
                            <div>
                                <p className='text-gray-700 text-lg font-medium'>
                                    {item.name}
                                </p>
                                <p className='text-gray-600 text-sm'>
                                    {item.specialty}
                                </p>
                            </div>
                        </div>
                        
                    </div>
                ))}
            </div>
            <button onClick={() => {navigate('/doctors'); scrollTo(0,0)}} className='bg-green-200 text-gray-600 px-12 py-3 rounded-full mt-10 hover:scale-105 transition-all duration-500 font-semibold'>More...</button>
        </div>
    )
}

export default RelatedDoctors;