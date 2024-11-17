'use client';

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { FaPesoSign } from "react-icons/fa6";
import { useEffect, useState } from "react";
import RichTextEditor from './RichTextEditor';

interface InputProps {
  id: string;
  label?: string;
  type?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  textArea?: boolean;
  onFocus?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
  onChange?: (value: string) => void;
  setValue?: (id: string, value: string) => void;
  validation?: Record<string, any>;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  disabled,
  formatPrice,
  register,
  required,
  errors,
  textArea,
  onFocus,
  onBlur,
  value,
  onChange,
  setValue,
  validation
}) => {
  const [hasValue, setHasValue] = useState(false);
  const [editorValue, setEditorValue] = useState('');

  // Update editor value when form value changes
  useEffect(() => {
    if (textArea) {
      setEditorValue(value || '');
    }
  }, [value, textArea]);

  // Update hasValue when value changes
  useEffect(() => {
    if (!textArea) {
      setHasValue(!!value);
    }
  }, [value, textArea]);

  if (textArea) {
    return (
      <div className="w-full relative">
        <label className="text-md text-zinc-400 mb-2 block">
          {label}
        </label>
        <RichTextEditor
          value={editorValue}
          onChange={(content) => {
            setEditorValue(content);
            if (setValue) {
              setValue(id, content);
            }
            // Trigger react-hook-form validation
            const event = {
              target: { value: content }
            } as React.ChangeEvent<HTMLInputElement>;
            register(id, validation || { required }).onChange(event);
          }}
        />
        {errors[id] && (
          <span className="text-rose-500 text-sm mt-1 block">
            This field is required
          </span>
        )}
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
  };

  return (
    <div className="w-full relative">
      {formatPrice && (
        <FaPesoSign size={24} className="text-neutral-700 absolute top-5 left-2" />
      )}

      <input
        id={id}
        disabled={disabled}
        {...register(id, validation || { required })}
        placeholder=" "
        type={type}
        onChange={(e) => {
          register(id).onChange(e); // Keep the react-hook-form onChange
          handleInputChange(e); // Add our own onChange
        }}
        className={`
          peer
          w-full
          p-4
          pt-6
          font-light
          bg-white
          border
          rounded-md
          outline-none
          transition
          disabled:opacity-70
          disabled:cursor-not-allowed
          ${formatPrice ? 'pl-9' : 'pl-4'}
          ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
          ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black-300'}
        `}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      <label
        className={`
          absolute
          text-md
          duration-150
          transform
          -translate-y-3
          top-5
          z-10
          origin-[0]
          ${formatPrice ? 'left-9' : 'left-4'}
          ${hasValue || type === 'date' ? 'scale-75 -translate-y-4' : 'peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0'}
          ${errors[id] ? 'text-rose-500' : 'text-zinc-400'}
          peer-focus:scale-75
          peer-focus:-translate-y-4
          peer-[:not(:placeholder-shown)]:scale-75
          peer-[:not(:placeholder-shown)]:-translate-y-4
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default Input;

