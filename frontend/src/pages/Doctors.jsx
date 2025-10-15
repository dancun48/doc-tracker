import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const Doctors = () => {

    const { specialty } = useParams();

    const { doctors } = useContext(AppContext);

    const [filterDoc, setFilterDoc] = useState([]);
    const [showFilter, setShowFilter] = useState(false);

    const navigate = useNavigate();

    const applyFilter = () => {
        if (specialty) {
            setFilterDoc(doctors.filter(doc => doc.specialty === specialty));
        } else {
            setFilterDoc(doctors);
        }
    }
    useEffect(() => applyFilter(), [doctors, specialty]);

    return (
        <div>
            <p className='text-gray-600'>Connect with a Specialist</p>
            <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
            <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`} onClick={()=>setShowFilter(prev => !prev)}>Filters</button>
                <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
                    <p 
                        onClick={() => specialty === 'General Physician' ? navigate('/doctors' ) : navigate('/doctors/General Physician')}
                        className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer shadow-sm hover:text-black hover:border-gray-500 ${specialty === "General Physician" ? "bg-primary text-white" : ""} transition-all duration-300`}
                    >
                        General Physician
                    </p>
                    <p 
                        onClick={() => specialty === 'Gynecologist' ? navigate('/doctors' ) : navigate('/doctors/Gynecologist')} 
                        className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer shadow-sm hover:text-black hover:border-gray-500 ${specialty === "Gynecologist" ? "bg-primary text-white" : ""} transition-all duration-300`}
                    >
                        Gynecologist
                    </p>
                    <p 
                        onClick={() => specialty === 'Dermatologist' ? navigate('/doctors' ) : navigate('/doctors/Dermatologist')} 
                        className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer shadow-sm hover:text-black hover:border-gray-500 ${specialty === "Dermatologist" ? "bg-primary text-white" : ""} transition-all duration-300`}
                    >
                        Dermatologist
                    </p>
                    <p 
                        onClick={() => specialty === 'Pediatrician' ? navigate('/doctors' ) : navigate('/doctors/Pediatrician')} 
                        className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer shadow-sm hover:text-black hover:border-gray-500 ${specialty === "Pediatrician" ? "bg-primary text-white" : ""} transition-all duration-300`}
                    >
                        Pediatrician
                    </p>
                    <p 
                        onClick={() => specialty === 'Neurologist' ? navigate('/doctors' ) : navigate('/doctors/Neurologist')} 
                        className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer shadow-sm hover:text-black hover:border-gray-500 ${specialty === "Neurologist" ? "bg-primary text-white" : ""} transition-all duration-300`}
                    >
                        Neurologist
                    </p>
                    <p 
                        onClick={() => specialty === 'Gastroenterologist' ? navigate('/doctors' ) : navigate('/doctors/Gastroenterologist')} 
                        className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer shadow-sm hover:text-black hover:border-gray-500 ${specialty === "Gastroenterologist" ? "bg-primary text-white" : ""} transition-all duration-300`}
                    >
                        Gastroenterologist
                    </p>
                </div>
                <div className='w-full grid md:grid-cols-auto gap-4 gap-y-6 sm:grid-cols-3'>
                    {
                        filterDoc.map((item, index) => (
                    <div onClick={() => navigate(`/appointment/${item._id}`)} className='border border-green-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
                        <img className='bg-[#F5FEFD] w-[100%] h-[300px] object-contain' src={item.image} />
                        <div className='p-4'>
                            <div className={`flex items-center gap-2 text-sm ${item.available ? 'text-blue-500' : 'text-gray-500'}`}>
                                <p className={`size-2 ${item.available ? 'bg-blue-500' : 'bg-gray-500'} rounded-full`}></p>
                                <p>{item.available ? "Available" : "NOT Available"}</p>
                            </div>
                            <div>
                                <p className='text-gray-700 text-lg font-medium'>{item.name}</p>
                                <p className='text-gray-600 text-sm'>{item.specialty}</p>
                            </div>
                        </div>
                        
                    </div>
                ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Doctors