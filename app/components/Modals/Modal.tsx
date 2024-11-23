'use client';

import Button from "@/app/components/Button";
import { useCallback, useEffect, useState, useRef } from "react";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: () => void;  // Make optional
  title?: string;
  body?: React.ReactElement;
  footer?: React.ReactElement;
  actionLabel?: string;    // Make optional
  disabled?: boolean;
  secondaryAction?: () => void;
  onSecondaryActionDisabled?: boolean;
  secondaryActionLabel?: string;
  onSubmitDisabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  body,
  footer,
  actionLabel,
  disabled,
  secondaryAction,
  secondaryActionLabel,
  onSecondaryActionDisabled,
  onSubmitDisabled,
  className,
  size = 'lg',
}) => {

  const [showModal, setShowModal] = useState(isOpen);
  const scrollPosition = useRef(0);

  useEffect(() => {
    setShowModal(isOpen);
    
    if (isOpen) {
      // Save the current scroll position
      scrollPosition.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restore the scroll position
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo({
        top: scrollPosition.current,
        behavior: 'instant'
      });
    }

    return () => {
      if (document.body.style.position === 'fixed') {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo({
          top: scrollPosition.current,
          behavior: 'instant'
        });
      }
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) {
      return;
    }

    setShowModal(false);
    onClose();
  }, [disabled, onClose]);

  const handleSubmit = useCallback(() => {
    if(onSubmitDisabled) {
      return;
    }

    onSubmit?.();

  }, [onSubmitDisabled, onSubmit]);

  const handleSecondaryAction = useCallback(() => {
    if(onSecondaryActionDisabled || !secondaryAction){
      return;
    }

    secondaryAction();
  }, [onSecondaryActionDisabled, secondaryAction]);

  const sizeClasses = {
    sm: 'md:w-[40%] lg:w-[35%] xl:w-[30%]',
    md: 'md:w-[60%] lg:w-[55%] xl:w-[50%]',
    lg: 'md:w-[85%] lg:w-[80%] xl:w-[75%]',
    xl: 'md:w-[90%] lg:w-[85%] xl:w-[80%]',
    full: 'md:w-[95%] lg:w-[90%] xl:w-[85%]'
  };

  if(!isOpen) {
    return null;
  }

  return ( 
    <>
      <div className="
        justify-center
        items-center
        flex
        overflow-x-hidden
        overflow-y-auto
        fixed
        inset-0
        z-50
        outline-none
        focus:outline-none
        bg-neutral-800/70
      "
      >
        <div
          className={`
            relative
            w-full
            ${sizeClasses[size]}
            my-6
            mx-auto
            h-full
            lg:h-auto
            md:h-auto
            ${className}
          `}
        >
          {/* CONTENT */}
          <div className={`
              translate
              duration-300
              h-full
              ${showModal ? 'translate-y-0' : 'translate-y-full'}
              ${showModal ? 'opacity-100' : 'opacity-0'}
            `}>
              <div className="
                translate
                h-full
                lg:h-auto
                md:h-auto
                border-0
                rounded-lg
                shadow-lg
                relative
                flex
                flex-col
                w-full
                bg-white
                outline-none
                focus:ouline-none
              ">
                {/* HEADER */}
                {title && (
                  <div className="flex items-center p-6 rounded-t justify-center relative border-b-[1px]">
                    <button
                      onClick={handleClose}
                      className="p-1 border-0 hover:opacity-70 transition absolute left-9"
                    >
                      <IoMdClose size={18}/>
                    </button>
                    <div className="text-lg font-semibold">
                      {title}
                    </div>
                  </div>
                )}
                
                {/* BODY */}
                <div className="relative p-6 flex-auto overflow-y-auto max-h-[70vh]">
                  {body}
                </div>

                {/* FOOTER */}
                {(actionLabel || secondaryActionLabel) && (
                  <div className="flex flex-col gap-2 p-6">
                    <div className="flex flex-row items-center gap-4 w-full">
                      {secondaryAction && secondaryActionLabel && (
                        <Button 
                          outline
                          disabled={onSecondaryActionDisabled}
                          label={secondaryActionLabel}
                          onClick={handleSecondaryAction}
                        />
                      )}
                      {actionLabel && (
                        <Button 
                          disabled={onSubmitDisabled}
                          label={actionLabel}
                          onClick={handleSubmit}
                        />
                      )}
                    </div>
                    {footer}
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </>
   );
}
 
export default Modal;