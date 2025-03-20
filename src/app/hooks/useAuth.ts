import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const user = await response.json();
          setIsAuthenticated(user !== null);
          sessionStorage.setItem("user_id", user.id);
        } else {
          setIsAuthenticated(false);
          if (sessionStorage.getItem("user_id")) {
            router.push('/logout');
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('An unknown error occurred');
        }
        setIsAuthenticated(false);
      }
    };

    // Check authentication on mount
    checkAuth();

    // Add event listener for authentication changes
    window.addEventListener('authChange', checkAuth);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('authChange', checkAuth);
    };
  }, [router]);

  return isAuthenticated;
}
