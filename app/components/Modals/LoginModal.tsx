'use client';

import {signIn} from 'next-auth/react'
import axios from "axios";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { BiErrorCircle } from "react-icons/bi";
import { useCallback, useState } from "react";
import Link from 'next/link';

import {
  FieldValues,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import useRegisterModal from "@/app/hooks/useRegisterModel";
import Modal from "./Modal";
import { title } from "process";
import Heading from "../../components/Heading";
import Input from "../../components/inputs/Input";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import useLoginModal from "@/app/hooks/useLoginModal";
import { useRouter } from 'next/navigation';

const LoginModal = () => {
  const router = useRouter();

  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState:{
      errors,
    },
    reset
  } = useForm<FieldValues> ({
    defaultValues: {
      email: '',
      password: ''
    },
    criteriaMode: 'all'
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const result = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        setLoginError(result.error);
        toast.error('Failed to login');
        return;
      }

      if (result?.ok) {
        // Fetch session to ensure it's established
        const session = await axios.get('/api/auth/session');
        const userRole = session.data?.user?.role;

        // Define dashboard routes
        const dashboardRoutes = {
          ADMIN: '/admin/dashboard',
          LANDLORD: '/landlord/dashboard',
          USER: '/listings',
          TENANT: '/dashboard'
        };

        // Get the correct redirect path
        const redirectPath = dashboardRoutes[userRole as keyof typeof dashboardRoutes] || '/';
        
        toast.success('Logged in successfully');
        loginModal.onClose();
        
        // Use replace instead of push to avoid back button issues
        router.replace(redirectPath);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  const toggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4" onKeyDown={handleKeyPress}>
      <Heading
        title="Welcome back!"
        subtitle="Login to your account"
      />
      <div className="flex flex-col gap-1">
        <Input 
          id="email"
          label="Email"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          type="email"
          validation={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Please enter a valid email address"
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Input 
          id="password"
          type="password"
          label="Password"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          validation={{
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          }}
        />
        {(errors.password || loginError) && (
          <div className="flex items-center gap-2 text-rose-500 text-sm pl-1 pt-1">
            <BiErrorCircle size={16} />
            <span>
              {errors.password ? 
                errors.password.message as string : 
                loginError
              }
            </span>
          </div>
        )}
      </div>
    </div>
  )

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
        <hr />
        
        <div className="text-neutral-500 text-center mt-2 font-light">
          <div className="flex flex-row items-center gap-2 justify-center">
            <div>
              First time using RentEase?
            </div>
            <Link 
              href="/register" 
              className="text-neutral-800 cursor-pointer hover:underline"
              onClick={() => loginModal.onClose()}
            >
              Create an account
            </Link>      
          </div>
        </div>
    </div>
  )

  return ( 
    <Modal 
      disabled={isLoading}
      isOpen={loginModal.isOpen}
        title="Login"
        actionLabel="Continue"
        onClose={loginModal.onClose}
        onSubmit={handleSubmit(onSubmit)}
        body={bodyContent}
        footer={footerContent}
        size='sm'
    />
   );
}
 
export default LoginModal;