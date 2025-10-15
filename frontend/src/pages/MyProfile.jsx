import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets_frontend/assets';
import { AppContext } from '../context/AppContext'
import axios from 'axios';
import { toast } from 'react-toastify';

const MyProfile = () => {
    const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const updateUserProfileData = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('phone', userData.phone);
            formData.append('address', JSON.stringify(userData.address || {}));
            formData.append('gender', userData.gender);
            formData.append('dob', userData.dob);

            if (image) {
                formData.append('image', image);
            }

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, {
                headers: { token }
            });
            
            if (data.success) {
                toast.success(data.message);
                await loadUserProfileData();
                setIsEdit(false);
                setImage(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    }

    // SIMPLIFIED RENDERING LOGIC
    if (userData === null) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div>Loading user profile...</div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div>Please log in to view your profile</div>
            </div>
        );
    }

    // Check if userData exists and is an object (not false)
    if (!userData || typeof userData !== 'object') {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div>
                    <p>Unable to load profile data</p>
                    <button 
                        onClick={loadUserProfileData}
                        className="mt-4 border border-primary hover:bg-primary px-8 py-2 rounded-full hover:text-white transition-all duration-500"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // SAFE ACCESS WITH DEFAULTS
    const safeUserData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        image: userData.image || '/default-avatar.png',
        gender: userData.gender || '',
        dob: userData.dob || '',
        address: userData.address || { line1: '', line2: '' }
    };
    if (userData && typeof userData === 'object') {
    return (
        <div className='max-w-lg flex flex-col gap-2 text-sm'>
            {isEdit ? (
                <label htmlFor="image">
                    <div className='inline-block relative cursor-pointer'>
                        <img 
                            className='w-36 rounded opacity-75' 
                            src={image ? URL.createObjectURL(image) : safeUserData.image} 
                            alt="Profile" 
                        />
                        <img 
                            className='w-10 bottom-12 absolute right-12' 
                            src={image ? '' : assets.upload_icon} 
                            alt="Upload" 
                        />
                    </div>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden />
                </label>
            ) : (
                <img 
                    className='w-36 rounded' 
                    src={safeUserData.image} 
                    alt="Profile" 
                />
            )}
            
            {isEdit ? (
                <input 
                    className='bg-gray-100 text-3xl font-medium max-w-60 mt-4' 
                    type="text" 
                    value={safeUserData.name} 
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                />
            ) : (
                <p className='font-medium text-3xl text-neutral-800 mt-4'>{safeUserData.name}</p>
            )}
            
            <hr className='bg-zinc-400 h-[1px] border-none' />
            
            <div>
                <p className='text-neutral-500 underline mt-3'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
                    <p className="font-medium">Email ID:</p>
                    <p className='text-blue-600'>{safeUserData.email}</p>
                    
                    <p className='font-medium'>Phone:</p>
                    {isEdit ? (
                        <input 
                            className='bg-gray-100 max-w-52' 
                            type="text" 
                            value={safeUserData.phone} 
                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                        />
                    ) : (
                        <p className='text-blue-600'>{safeUserData.phone}</p>
                    )}
                    
                    <p className='font-medium'>Address:</p>
                    {isEdit ? (
                        <div>
                            <input 
                                className='bg-gray-100 w-full mb-1' 
                                type="text" 
                                value={safeUserData.address.line1 || ''} 
                                onChange={(e) => setUserData(prev => ({
                                    ...prev, 
                                    address: { ...prev.address, line1: e.target.value }
                                }))} 
                            />
                            <input 
                                className='bg-gray-100 w-full' 
                                type="text" 
                                value={safeUserData.address.line2 || ''} 
                                onChange={(e) => setUserData(prev => ({
                                    ...prev, 
                                    address: { ...prev.address, line2: e.target.value }
                                }))} 
                            />
                        </div>
                    ) : (
                        <p className='text-gray-500'>
                            {safeUserData.address.line1}
                            <br />
                            {safeUserData.address.line2}
                        </p>
                    )}
                </div>
            </div>
            
            <div>
                <p className='text-neutral-500 underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
                    <p className='font-medium'>Gender:</p>
                    {isEdit ? (
                        <select 
                            className='max-w-20 bg-gray-100' 
                            onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                            value={safeUserData.gender}
                        >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                        </select>
                    ) : (
                        <p className='text-gray-500'>{safeUserData.gender}</p>
                    )}
                    
                    <p className='font-medium'>Birthday:</p>
                    {isEdit ? (
                        <input 
                            className='max-w-28 bg-gray-100' 
                            type="date" 
                            onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                            value={safeUserData.dob} 
                        />
                    ) : (
                        <p className='text-gray-400'>{safeUserData.dob}</p>
                    )}
                </div>
            </div>
            
            <div className='mt-10'>
                {isEdit ? (
                    <button 
                        className='border border-primary hover:bg-primary px-8 py-2 rounded-full hover:text-white transition-all duration-500 disabled:opacity-50' 
                        onClick={updateUserProfileData}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                ) : (
                    <button 
                        className='border border-primary hover:bg-primary px-8 py-2 rounded-full hover:text-white transition-all duration-500' 
                        onClick={() => setIsEdit(true)}
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    )}
}

export default MyProfile;