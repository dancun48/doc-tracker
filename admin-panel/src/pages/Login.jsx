import React, { useContext, useState } from 'react';
// import {assets} from '../assets/assets_admin/assets';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../context/DoctorContext';
import { useNavigate } from 'react-router-dom';


const Login = () => {

    const [state, setState] = useState('Admin');
    const {setAToken, backendUrl} = useContext(AdminContext);   // will help us call the API in this page
    const {setDToken} = useContext(DoctorContext);   // will help us call the API in this page

    // state variables to store the email_id and password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate()

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            if (state === 'Admin') {
                const {data} = await axios.post(backendUrl + '/api/admin/login', {email, password});
                if (data.success) {
                    localStorage.setItem('aToken',data.token)
                    setAToken(data.token)
                    navigate('/admin-dashboard')
                } else{
                    toast.error(data.message)
                }
            } else {
                const {data} = await axios.post(backendUrl + '/api/doctor/login', {email, password});
                if (data.success) {
                    localStorage.setItem('dToken',data.token)
                    setDToken(data.token)
                    console.log(data.token)
                    navigate('/doctor-dashboard')
                } else{
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }

    }
    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flec flec-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5e5e5e] text-sm shadow-lg'>
                <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state}</span> Login</p>
                <div className='w-full'>
                    <p>Email</p>
                    <input onChange={(e)=>setEmail(e.target.value)} value={email} className='border border-[#dadada] rounded w-full p-2 mt-2' type="email" required />
                </div>
                <div className='w-full'>
                    <p>Password</p>
                    <input onChange={(e)=>setPassword(e.target.value)} value={password} className='border border-[#dadada] rounded w-full p-2 mt-2' type="password" required />
                </div>
                <button className='bg-primary text-white w-full py-2 rounded-md text-base mt-4'>Login</button>
                {
                    state === "Admin"
                    ? <p className='mt-2'>Doctor Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Doctor')}>Click here</span></p>
                    : <p className='mt-2'>Admin Login? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Admin')}>Click here</span></p>
                }
            </div>
        </form>
    )
}

export default Login