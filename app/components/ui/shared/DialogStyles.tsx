// Common styles for modern dialogs
export const dialogStyles = {
  content: "sm:max-w-[500px] w-full h-[90vh] sm:h-auto z-[50] p-0 gap-0 rounded-2xl border-none shadow-2xl",
  header: "p-6 border-b border-gray-100",
  title: "text-xl font-semibold text-gray-900",
  description: "text-sm text-gray-500 mt-1",
  body: "p-6 flex-1 overflow-y-auto",
  footer: "p-6 border-t border-gray-100 bg-gray-50/50",
  propertyCard: "bg-gray-50/70 p-4 rounded-xl space-y-1",
  propertyTitle: "font-medium text-gray-900",
  propertySubtitle: "text-sm text-gray-500",
  formGroup: "space-y-1.5",
  label: "text-sm font-medium text-gray-700",
  helperText: "text-xs text-gray-500 mt-1",
  buttonGroup: "flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto",
};

// Modern input styles
export const inputStyles = {
  base: "h-11 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20",
  select: "h-11 rounded-lg border-gray-200",
  textarea: "min-h-[120px] rounded-lg border-gray-200 resize-none focus:border-indigo-500 focus:ring-indigo-500/20",
};

// Button variants
export const buttonStyles = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white font-medium",
  secondary: "border-gray-200 hover:bg-gray-50 text-gray-700 font-medium",
}; 