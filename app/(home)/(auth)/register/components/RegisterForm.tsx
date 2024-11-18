'use client';

import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { signIn } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import toast from "react-hot-toast";
import useLoginModal from "@/app/hooks/useLoginModal";
import { useRouter } from 'next/navigation';

import Input from "@/app/components/inputs/Input";
import ProfileImageUpload from "@/app/components/inputs/ProfileImageUpload";
import Button from "@/app/components/Button";

const RegisterForm = () => {
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

  const loginModal = useLoginModal();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    trigger
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
  const confirmPassword = watch('confirmPassword');

  // Password strength checker
  useEffect(() => {
    if (!password) {
      // Reset password strength when password is empty
      setPasswordStrength({
        hasLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
      });
    } else {
      setPasswordStrength({
        hasLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[@$!%*?&]/.test(password)
      });
    }
  }, [password]);

  // Add password validation
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
    } else if (confirmPassword) {
      trigger('confirmPassword');
    }
  }, [password, confirmPassword, setError, trigger]);

  const getPasswordStrengthText = () => {
    const strength = Object.values(passwordStrength).filter(Boolean).length;
    if (strength === 0) return { text: 'Very Weak', color: 'text-red-500' };
    if (strength <= 2) return { text: 'Weak', color: 'text-red-400' };
    if (strength <= 4) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      const { confirmPassword, ...submitData } = data;

      // Remove empty optional fields
      if (!submitData.middleName) delete submitData.middleName;
      if (!submitData.suffix) delete submitData.suffix;

      await axios.post('/api/register', {
        ...submitData,
        image: previewImage || '',
      });

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (result?.error) {
        toast.error('Failed to login automatically');
        return;
      }

      toast.success('Account created! Logging you in...');
      window.location.reload();
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    loginModal.onOpen();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Profile Picture Upload */}
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Profile Picture</h3>
            <ProfileImageUpload
              value={previewImage}
              onChange={(value) => setPreviewImage(value)}
            />
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="md:w-2/3 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {/* Personal Information */}
            <div className="space-y-6">
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
                    label="Middle Name (Optional)"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required={false}
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
                    required={false}
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
                    <div className="absolute -right-[280px] top-0 z-50 w-[250px] p-3 bg-white border rounded-lg shadow-lg">
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

            <div className="mt-6">
              <Button
                disabled={isLoading}
                label={isLoading ? 'Creating Account...' : 'Create Account'}
                onClick={() => {}}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">Already have an account?</h3>
                <p className="text-sm text-gray-500">Sign in to access your account</p>
              </div>
              <button 
                onClick={handleLoginClick}
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm; 