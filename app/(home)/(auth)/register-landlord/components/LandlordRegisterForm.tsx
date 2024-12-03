'use client';

import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { signIn } from "next-auth/react";
import axios from "axios";
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import toast from "react-hot-toast";
import useLoginModal from "@/app/hooks/useLoginModal";
import { useRouter } from 'next/navigation';
import { BiErrorCircle } from "react-icons/bi";
import { cn } from "@/lib/utils";

// Shadcn Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import ProfileImageUpload from "@/app/components/inputs/ProfileImageUpload";
import { sendNotification } from "@/app/actions/notifications/sendNotification";
import { createVerificationEmailTemplate } from "@/lib/email-templates/verification";
import { createVerificationSMSTemplate } from "@/lib/sms-templates/verification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface VerificationState {
  emailCode: string;
  phoneCode: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  showEmailVerification: boolean;
  showPhoneVerification: boolean;
}

interface RegisterFormValues {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  image: string;
  role: 'USER';
}

// Add this type for the countdown
type CountdownState = {
  timeLeft: number;
  intervalId?: NodeJS.Timeout;
};

const LandlordRegisterForm = () => {
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
  const [loginError, setLoginError] = useState('');
  const [verification, setVerification] = useState<VerificationState>({
    emailCode: '',
    phoneCode: '',
    emailVerified: false,
    phoneVerified: false,
    showEmailVerification: false,
    showPhoneVerification: false,
  });

  const loginModal = useLoginModal();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
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

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

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
      form.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
    } else if (confirmPassword) {
      form.trigger('confirmPassword');
    }
  }, [password, confirmPassword, form.setError, form.trigger]);

  const getPasswordStrengthText = () => {
    const strength = Object.values(passwordStrength).filter(Boolean).length;
    if (strength === 0) return { text: 'Very Weak', color: 'text-red-500' };
    if (strength <= 2) return { text: 'Weak', color: 'text-red-400' };
    if (strength <= 4) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  // Generate a 6-digit code
  const generateVerificationCode = () => {
    return String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
  };

  // Update the formatPhoneNumber function
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.startsWith('63') ? cleaned : '63' + cleaned.replace(/^0/, '')
  };

  // Send verification email
  const sendVerificationEmail = async (email: string, firstName: string) => {
    const code = generateVerificationCode();
    console.log('Generated email code:', code);
    
    try {
      const template = createVerificationEmailTemplate({
        name: firstName,
        code,
        expiresIn: '10 minutes'
      });

      // Store the code in state before attempting to send the email
      setVerification(prev => ({
        ...prev,
        emailCode: code,
        showEmailVerification: true
      }));

      // Attempt to send the notification, but don't block verification on it
      sendNotification({
        email: {
          to: email,
          subject: template.subject,
          body: template.body,
          from: 'noreply@renteaseapp.com',
          replyTo: 'support@renteaseapp.com'
        }
      }).catch(error => {
        console.error('Email notification error:', error);
        // Don't show error to user since we already have the code in state
      });

      toast.success('Verification code generated');
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error('Failed to generate verification code');
    }
  };

  // Update the sendVerificationSMS function
  const sendVerificationSMS = async (phoneNumber: string) => {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const code = generateVerificationCode();
    console.log('Generated SMS code:', code);
    console.log('Formatted phone number:', formattedNumber); // Debug log
    
    try {
      const template = createVerificationSMSTemplate({ code });

      // Store the code in state before attempting to send the SMS
      setVerification(prev => ({
        ...prev,
        phoneCode: code,
        showPhoneVerification: true
      }));

      // Attempt to send the notification, but don't block verification on it
      sendNotification({
        sms: {
          to: formattedNumber,
          message: template.content,
          type: "plain"
        }
      }).catch(error => {
        console.error('SMS notification error:', error);
        // Don't show error to user since we already have the code in state
      });

      toast.success('Verification code generated');
    } catch (error) {
      console.error('SMS verification error:', error);
      toast.error('Failed to generate verification code');
    }
  };

  // Verify codes
  const verifyEmailCode = async (inputCode: string) => {
    const normalizedInput = inputCode.trim();
    const normalizedStored = verification.emailCode.trim();
    
    console.log('Input code:', normalizedInput);
    console.log('Stored email code:', normalizedStored);

    if (normalizedInput === normalizedStored) {
      setVerification(prev => ({ 
        ...prev, 
        emailVerified: true, 
        showEmailVerification: false 
      }));
      toast.success('Email verified successfully');
    } else {
      toast.error('Invalid verification code');
    }
  };

  const verifyPhoneCode = async (inputCode: string) => {
    const normalizedInput = inputCode.trim();
    const normalizedStored = verification.phoneCode.trim();
    
    console.log('Input code:', normalizedInput);
    console.log('Stored phone code:', normalizedStored);

    if (normalizedInput === normalizedStored) {
      setVerification(prev => ({ 
        ...prev, 
        phoneVerified: true, 
        showPhoneVerification: false 
      }));
      toast.success('Phone number verified successfully');
    } else {
      toast.error('Invalid verification code');
    }
  };

  const onSubmit = async (data: any) => {
    if (!verification.emailVerified || !verification.phoneVerified) {
      toast.error('Please verify your email and phone number first');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const { confirmPassword, ...submitData } = data;

      // Remove empty optional fields
      if (!submitData.middleName) delete submitData.middleName;
      if (!submitData.suffix) delete submitData.suffix;

      // Check both email and phone number at once
      const checkResponse = await axios.get(`/api/check-user?email=${submitData.email}&phoneNumber=${submitData.phoneNumber}`);
      const { existingFields } = checkResponse.data;

      if (existingFields.email || existingFields.phoneNumber) {
        // Reset verification state for existing fields
        setVerification(prev => ({
          ...prev,
          ...(existingFields.email && {
            emailVerified: false,
            emailCode: ''
          }),
          ...(existingFields.phoneNumber && {
            phoneVerified: false,
            phoneCode: ''
          })
        }));

        // Reset form fields for existing entries
        if (existingFields.email) {
          form.setValue('email', '');
          form.setError('email', {
            type: 'manual',
            message: 'This email is already registered'
          });
        }
        if (existingFields.phoneNumber) {
          form.setValue('phoneNumber', '');
          form.setError('phoneNumber', {
            type: 'manual',
            message: 'This phone number is already registered'
          });
        }

        // Show appropriate error message
        if (existingFields.email && existingFields.phoneNumber) {
          toast.error('Both email and phone number are already registered');
          setLoginError('Both email and phone number are already registered');
        } else if (existingFields.email) {
          toast.error('Email is already registered');
          setLoginError('Email is already registered');
        } else {
          toast.error('Phone number is already registered');
          setLoginError('Phone number is already registered');
        }

        setIsLoading(false);
        return;
      }

      // If no existing fields, proceed with registration
      await axios.post('/api/register/landlord', {
        ...submitData,
        image: previewImage || '',
      });

      // Then attempt automatic sign in
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: '/landlord/dashboard'
      });

      if (signInResult?.error) {
        setLoginError(signInResult.error);
        toast.error('Account created but failed to login automatically');
        return;
      }

      if (signInResult?.ok) {
        toast.success('Account created successfully!');
        router.push(signInResult.url || '/listings');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Something went wrong.');
      }
      setLoginError(error.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    loginModal.onOpen();
  };

  // Add verification dialogs
  const VerificationDialog = ({ 
    isOpen, 
    onClose, 
    title, 
    onVerify, 
    resendCode 
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onVerify: (code: string) => void;
    resendCode: () => void;
  }) => {
    const [code, setCode] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [countdown, setCountdown] = useState<CountdownState>({ timeLeft: 0 });

    const handleResend = async () => {
      setIsResending(true);
      try {
        await resendCode();
        toast.success('Verification code resent successfully');
        // Start 2-minute countdown
        setCountdown(prev => {
          // Clear any existing interval
          if (prev.intervalId) {
            clearInterval(prev.intervalId);
          }
          
          // Set new countdown
          const intervalId = setInterval(() => {
            setCountdown(current => {
              if (current.timeLeft <= 1) {
                clearInterval(current.intervalId);
                return { timeLeft: 0 };
              }
              return { ...current, timeLeft: current.timeLeft - 1 };
            });
          }, 1000);

          return { timeLeft: 120, intervalId }; // 120 seconds = 2 minutes
        });
      } catch (error) {
        toast.error('Failed to resend verification code');
      } finally {
        setIsResending(false);
      }
    };

    // Format remaining time as MM:SS
    const formatTimeLeft = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Clear interval on unmount or dialog close
    useEffect(() => {
      return () => {
        if (countdown.intervalId) {
          clearInterval(countdown.intervalId);
        }
      };
    }, [countdown.intervalId]);

    // Reset states when dialog opens
    useEffect(() => {
      if (isOpen) {
        setCode('');
        setIsVerifying(false);
        // Start initial 2-minute countdown
        setCountdown(prev => {
          if (prev.intervalId) {
            clearInterval(prev.intervalId);
          }
          const intervalId = setInterval(() => {
            setCountdown(current => {
              if (current.timeLeft <= 1) {
                clearInterval(current.intervalId);
                return { timeLeft: 0 };
              }
              return { ...current, timeLeft: current.timeLeft - 1 };
            });
          }, 1000);
          return { timeLeft: 120, intervalId };
        });
      }
    }, [isOpen]);

    const handleVerify = async () => {
      setIsVerifying(true);
      try {
        await onVerify(code);
      } finally {
        setIsVerifying(false);
      }
    };


    return (
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-indigo-950">{title}</DialogTitle>
            <DialogDescription>
              Enter the verification code sent to your {title.toLowerCase().includes('email') ? 'email address' : 'phone number'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                value={code}
                onChange={(e) => {
                  const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(sanitizedValue);
                }}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                placeholder="000000"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                disabled={isVerifying}
              />
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the code?{' '}
                {countdown.timeLeft > 0 ? (
                  <span className="text-muted-foreground">
                    Resend available in {formatTimeLeft(countdown.timeLeft)}
                  </span>
                ) : (
                  <button 
                    onClick={handleResend}
                    disabled={isResending || isVerifying || countdown.timeLeft > 0}
                    className="ml-1 text-primary hover:underline disabled:opacity-50"
                    type="button"
                  >
                    {isResending ? 'Resending...' : 'Resend'}
                  </button>
                )}
              </p>
            </div>
            <Button
              onClick={handleVerify}
              disabled={code.length !== 6 || isVerifying}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
              type="button"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Add these validation functions near the top of the component
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone: string) => {
    // Matches Philippine mobile numbers (09XXXXXXXXX or 639XXXXXXXXX)
    const phoneRegex = /^(09|\+?639)\d{9}$/;
    return phoneRegex.test(phone);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Profile Picture */}
          <Card className="lg:w-1/3 h-fit bg-white border-indigo-100 lg:sticky lg:top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-indigo-950">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center space-y-4">
                <ProfileImageUpload
                  value={previewImage}
                  onChange={(value) => setPreviewImage(value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Column */}
          <Card className="lg:w-2/3 bg-white border-indigo-100">
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-950 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>Middle Name (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="suffix"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>Suffix (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-950 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <FormField
                        control={form.control}
                        name="email"
                        rules={{
                          required: "Email is required",
                          validate: (value) => isValidEmail(value) || "Please enter a valid email address"
                        }}
                        render={({ field, fieldState }: { field: any, fieldState: any }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  disabled={isLoading || verification.emailVerified}
                                  placeholder="example@email.com"
                                  className={cn(
                                    fieldState.error?.message?.includes('already registered') && 
                                    "border-red-500 focus-visible:ring-red-500"
                                  )}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <Button
                                    type="button"
                                    variant={verification.emailVerified ? "outline" : "secondary"}
                                    className={verification.emailVerified 
                                      ? "text-green-700 border-green-700 hover:bg-green-50" 
                                      : "bg-indigo-600 text-white hover:bg-indigo-700"}
                                    size="sm"
                                    onClick={() => sendVerificationEmail(field.value, form.getValues('firstName'))}
                                    disabled={isLoading || verification.emailVerified || !field.value || fieldState.invalid}
                                  >
                                    {verification.emailVerified ? '✓ Verified' : 'Verify'}
                                  </Button>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="relative">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        rules={{
                          required: "Phone number is required",
                          validate: (value) => isValidPhoneNumber(value) || "Please enter a valid Philippine mobile number (e.g., 09123456789)"
                        }}
                        render={({ field, fieldState }: { field: any, fieldState: any }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  disabled={isLoading || verification.phoneVerified}
                                  placeholder="09123456789"
                                  className={cn(
                                    fieldState.error?.message?.includes('already registered') && 
                                    "border-red-500 focus-visible:ring-red-500"
                                  )}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <Button
                                    type="button"
                                    variant={verification.phoneVerified ? "outline" : "secondary"}
                                    className={verification.phoneVerified 
                                      ? "text-green-700 border-green-700 hover:bg-green-50" 
                                      : "bg-indigo-600 text-white hover:bg-indigo-700"}
                                    size="sm"
                                    onClick={() => sendVerificationSMS(field.value)}
                                    disabled={isLoading || verification.phoneVerified || !field.value || fieldState.invalid}
                                  >
                                    {verification.phoneVerified ? '✓ Verified' : 'Verify'}
                                  </Button>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-950 mb-4">Security</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={isLoading} 
                                type="password" 
                                onFocus={() => setShowPasswordTooltip(true)}
                                onBlur={(e) => {
                                  if (e.relatedTarget?.id !== 'confirmPassword') {
                                    setShowPasswordTooltip(false);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            {showPasswordTooltip && (
                              <div className="absolute -right-[280px] top-0 z-50 w-[250px] p-4 bg-white border rounded-lg shadow-lg">
                                <div className="text-sm font-semibold mb-2">
                                  Password Strength: 
                                  <span className={`ml-1 ${getPasswordStrengthText().color}`}>
                                    {getPasswordStrengthText().text}
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm">
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
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={isLoading} 
                              type="password" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                    disabled={isLoading || !verification.emailVerified || !verification.phoneVerified}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  {loginError && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                      <BiErrorCircle size={16} />
                      <span>{loginError}</span>
                    </div>
                  )}
                </div>

                {/* Sign In Link */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Already have an account?</h3>
                      <p className="text-sm text-muted-foreground">
                        Sign in to access your account
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLoginClick}
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Dialogs */}
        <VerificationDialog
          isOpen={verification.showEmailVerification}
          onClose={() => setVerification(prev => ({ ...prev, showEmailVerification: false }))}
          title="Email Verification"
          onVerify={verifyEmailCode}
          resendCode={() => {
            const email = form.getValues('email');
            const firstName = form.getValues('firstName');
            sendVerificationEmail(email, firstName);
          }}
        />

        <VerificationDialog
          isOpen={verification.showPhoneVerification}
          onClose={() => setVerification(prev => ({ ...prev, showPhoneVerification: false }))}
          title="Phone Verification"
          onVerify={verifyPhoneCode}
          resendCode={() => {
            const phoneNumber = form.getValues('phoneNumber');
            sendVerificationSMS(phoneNumber);
          }}
        />
      </form>
    </Form>
  );
};

export default LandlordRegisterForm; 