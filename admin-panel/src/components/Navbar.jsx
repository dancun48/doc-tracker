import React, { useContext } from 'react';
import { assets } from '../assets/assets_admin/assets';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import {useNavigate} from 'react-router-dom';

const Navbar = () => {

    const {aToken, setAToken} = useContext(AdminContext);
    const {dToken, setDToken} = useContext(DoctorContext);

    const navigate = useNavigate();

    const logOut = () => {
        navigate('/');  // when the logout button is clicked, the page is set to the homepage
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken');
        dToken && setDToken('')
        dToken && localStorage.removeItem('dToken');
    }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
        <div className='flex items-center gap-2 text-xs'>
            <img src={assets.admin_logo} alt="" className='size-16 cursor-pointer' />
            <p className='border px-2.5 py-1 rounded-full border-gray-500 text-gray-600'>
                {aToken ? 'Admin' : 'Doctor'}
            </p>
        </div>
        <button onClick={logOut} className='bg-primary text-white text-sm px-10 py-2 rounded-full'>Log Out</button>
    </div>
  )
}

export default Navbar