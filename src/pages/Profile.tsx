import React from 'react';
import { Header } from '@/components/Header';
import UserProfile from '@/components/UserProfile';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="default" title="Mi Perfil" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Mi Perfil
            </h1>
            <p className="text-gray-600">
              Gestiona la información de tu cuenta
            </p>
          </div>
          
          <UserProfile />
        </div>
      </main>
    </div>
  );
};

export default Profile; 