"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const MainPage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8 flex flex-col items-center space-y-8">
        {/* User Profile */}
        <div className="flex items-center space-x-4">
          <Image
            src={user.profileImage}
            width={64}
            height={64}
            alt="Profile Picture"
            className="w-16 h-16 rounded-full border-4 border-indigo-500 shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">{user.userName}</h1>
            {user.firstName && (
              <p className="text-lg text-gray-600">
                {user.firstName} {user.lastName}
              </p>
            )}
          </div>
        </div>

        <p className="text-xl text-center text-gray-700">
          Welcome back, {user.userName}! Ready to find your perfect study buddy?
        </p>

        <button
          onClick={() => router.push("/studentinfo")}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition duration-300 ease-in-out text-lg"
        >
          Find Study Buddy
        </button>

        <button
          onClick={() => { logout(); router.push("/login"); }}
          className="text-sm text-gray-400 hover:text-red-500"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default MainPage;
