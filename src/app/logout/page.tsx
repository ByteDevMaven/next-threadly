'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { triggerAuthChange } from '../utils/auth';

const Logout = () => {
  const router = useRouter();
  const [message, setMessage] = useState('Logging out...');

  useEffect(() => {
    const logout = async () => {
      try {
        // Send request to API to clear HTTPOnly cookie
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include', 
        });

        triggerAuthChange();

        setMessage('Successfully logged out. Redirecting to login page...');
        setTimeout(() => {
          sessionStorage.removeItem("user_id");
          router.push('/login');
        }, 2000);
      } catch (error) {
        console.error('Logout failed:', error);
        setMessage('Logout failed. Please try again.');
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-lg font-semibold text-gray-700">
        {message}
      </div>
    </div>
  );
};

export default Logout;
