'use client';

import axios from "axios";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useCallback, useEffect, useState } from "react";
import { IoMdCloudUpload } from "react-icons/io";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';

import {
  FieldValues,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import useRegisterModal from "@/app/hooks/useRegisterModel";
import useLoginModal from "@/app/hooks/useLoginModal";
import Modal from "./Modal";
import Heading from "../Heading";
import Input from "../inputs/Input";
import toast from "react-hot-toast";
import Button from "../Button";
import { signIn } from "next-auth/react";
import ProfileImageUpload from "../inputs/ProfileImageUpload";
import { useRouter } from "next/navigation";

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
    watch
  } = useForm<FieldValues>({
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      image: '',
      role: 'USER'
    }
  });

  const password = watch('password');

  // Add password strength checker
  useEffect(() => {
    if (password) {
      setPasswordStrength({
        hasLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[@$!%*?&]/.test(password)
      });
    }
  }, [password]);

  const getPasswordStrengthText = () => {
    const strength = Object.values(passwordStrength).filter(Boolean).length;
    if (strength === 0) return { text: 'Very Weak', color: 'text-red-500' };
    if (strength <= 2) return { text: 'Weak', color: 'text-red-400' };
    if (strength <= 4) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const router = useRouter();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...submitData } = data;
      
      // Register the user
      const response = await axios.post('/api/register', {
        ...submitData,
        image: previewImage || '',
      });

      if (!response?.data) {
        throw new Error('Failed to register');
      }

      // Add a small delay to ensure the user is created in the database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Automatically sign in after registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error('Failed to login automatically');
        console.error('Sign in error:', signInResult.error);
        return;
      }

      if (signInResult?.ok) {
        toast.success('Registered & logged in successfully!');
        registerModal.onClose();
        router.push('/'); // Redirect to home page
        router.refresh(); // Refresh the session
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error?.response?.data?.error || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  const toggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [loginModal, registerModal]);

  const passwordSection = (
    <div className="relative">
      <Input 
        id="password"
        type="password"
        label="Password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        onFocus={() => setShowPasswordTooltip(true)}
        onBlur={(e) => {
          if (e.relatedTarget?.id !== 'confirmPassword') {
            setShowPasswordTooltip(false);
          }
        }}
      />
      {showPasswordTooltip && (
        <div className="absolute -top-[180px] left-0 right-0 z-50 password-tooltip p-3 bg-white border rounded-lg shadow-lg">
          <div className="text-sm font-semibold mb-2">
            Password Strength: 
            <span className={`ml-1 ${getPasswordStrengthText().color}`}>
              {getPasswordStrengthText().text}
            </span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              {passwordStrength.hasLength ? 
                <BsCheckCircleFill className="text-green-500" /> : 
                <BsXCircleFill className="text-red-500" />
              }
              <span>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-2">
              {passwordStrength.hasUpperCase ? 
                <BsCheckCircleFill className="text-green-500" /> : 
                <BsXCircleFill className="text-red-500" />
              }
              <span>One uppercase letter</span>
            </div>
            <div className="flex items-center gap-2">
              {passwordStrength.hasLowerCase ? 
                <BsCheckCircleFill className="text-green-500" /> : 
                <BsXCircleFill className="text-red-500" />
              }
              <span>One lowercase letter</span>
            </div>
            <div className="flex items-center gap-2">
              {passwordStrength.hasNumber ? 
                <BsCheckCircleFill className="text-green-500" /> : 
                <BsXCircleFill className="text-red-500" />
              }
              <span>One number</span>
            </div>
            <div className="flex items-center gap-2">
              {passwordStrength.hasSpecialChar ? 
                <BsCheckCircleFill className="text-green-500" /> : 
                <BsXCircleFill className="text-red-500" />
              }
              <span>One special character (@$!%*?&)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const bodyContent = (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Column - Profile Picture Upload */}
      <div className="md:w-1/3 flex flex-col items-center justify-start space-y-4">
        <div className="w-full max-w-xs bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Profile Picture</h3>
          <ProfileImageUpload
            value={previewImage}
            onChange={(value) => {
              setPreviewImage(value);
            }}
          />
        </div>
      </div>

      {/* Right Column - Form Fields */}
      <div className="md:w-2/3">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Heading
            title="Welcome to RentEase!"
            subtitle="Create an Account"
          />

          <div className="space-y-6 mt-6">
            {/* Name Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  id="firstName"
                  label="First Name"
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                  required
                />
                <Input 
                  id="middleName"
                  label="Middle Name"
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input 
                  id="lastName"
                  label="Last Name"
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                  required
                />
                <Input 
                  id="suffix"
                  label="Suffix (Optional)"
                  disabled={isLoading}
                  register={register}
                  errors={errors}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
              <Input 
                id="email"
                label="Email"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
              />
              <Input 
                id="phoneNumber"
                label="Phone Number"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
              />
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">Security</h3>
              {passwordSection}
              <Input 
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-2">
      {/* <hr />
      <Button 
        outline 
        label="Continue with Google"
        icon={FcGoogle}
        onClick={() => signIn('google')}
      /> */}
      <div className="text-neutral-500 text-center mt-1 font-light">
        <div className="flex flex-row items-center gap-2 justify-center">
          <div>
            Already have an account?
          </div>
          <div 
            className="text-neutral-800 cursor-pointer hover:underline" 
            onClick={toggle}
          >
            Login
          </div>      
        </div>
      </div>
    </div>
  )

  return ( 
    <Modal 
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Register"
      actionLabel="Continue"
      onClose={registerModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
      className="max-w-4xl"
      size="xl"
    />
   );
}
 
export default RegisterModal;
