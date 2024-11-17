'use client';

import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaUser } from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io";

const SignUpPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      image: '',
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      // Handle image upload first if exists
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        // Add your image upload logic here
        // imageUrl = await uploadImage(formData);
      }

      // Register user
      await axios.post('/api/register', {
        ...data,
        image: imageUrl,
        role: 'TENANT'
      });

      toast.success('Account created successfully!');
      router.push('/login');
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screenflex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile preview"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500">
                    <IoMdCloudUpload size={24} />
                    <span>Upload Photo</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <Input
              id="name"
              label="Full Name"
              register={register}
              errors={errors}
              required
            />

            <Input
              id="email"
              label="Email address"
              type="email"
              register={register}
              errors={errors}
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              register={register}
              errors={errors}
              required
            />

            <Input
              id="phoneNumber"
              label="Phone Number"
              type="tel"
              register={register}
              errors={errors}
              required
            />

            <div className="space-y-2">
              <Button
                disabled={isLoading}
                label={isLoading ? "Creating account..." : "Sign up"}
                onClick={() => {}}
              />
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                outline
                label="Sign in"
                onClick={() => router.push('/login')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

