import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle } from 'lucide-react';

const EmailVerification = () => {
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true);
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    };

    checkEmailConfirmation();
  }, [navigate]);

  const handleResendEmail = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: 'user@example.com', // This should be the user's email
    });

    if (error) {
      setMessage('Error resending email. Please try again.');
    } else {
      setMessage('Verification email sent! Please check your inbox.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-presspage-blue text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Content Analyzer</h1>
            <span className="text-xs text-gray-300">by Presspage</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-presspage-blue rounded-lg flex items-center justify-center mx-auto mb-4">
              {isVerified ? (
                <CheckCircle className="text-white text-2xl" />
              ) : (
                <Mail className="text-white text-2xl" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isVerified ? 'Email Verified!' : 'Verify Your Email'}
            </h2>
            <p className="text-gray-600">
              {isVerified 
                ? 'Your email has been verified successfully.'
                : 'Please check your email and click the verification link to continue.'
              }
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            {message && (
              <Alert className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {!isVerified && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or request a new verification email.
                </p>
                <Button 
                  onClick={handleResendEmail}
                  className="w-full bg-presspage-blue hover:bg-presspage-blue/90"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailVerification; 