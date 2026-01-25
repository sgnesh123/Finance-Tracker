import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props} className="group overflow-hidden rounded-2xl border-none shadow-2xl backdrop-blur-md bg-white/90">
            <div className="flex gap-3">
              <div className="mt-1">
                {variant === "destructive" ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <div className="grid gap-1">
                {title && <ToastTitle className="text-sm font-bold tracking-tight text-slate-900">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-xs font-medium text-slate-500 leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="rounded-xl opacity-0 transition-opacity group-hover:opacity-100" />
          </Toast>
        )
      })}
      <ToastViewport className="p-6 gap-3" />
    </ToastProvider>
  )
}
