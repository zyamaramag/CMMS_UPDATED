import { Ban, Check, Clock, X } from "lucide-react"
import { MaterialRequest } from "../data/mockData"
import { cn } from "./ui/utils"

type StepState = "complete" | "current" | "upcoming" | "not-applicable"

interface ProgressStep {
  label: string
  state: StepState
}

function getSteps(status: MaterialRequest["status"]): ProgressStep[] {
  if (status === "rejected") {
    return [
      { label: "Submitted", state: "complete" },
      { label: "Rejected", state: "current" },
      { label: "Issued", state: "not-applicable" },
    ]
  }
  if (status === "cancelled") {
    return [
      { label: "Submitted", state: "complete" },
      { label: "Cancelled", state: "current" },
      { label: "Issued", state: "not-applicable" },
    ]
  }

  const currentIndex = status === "pending" ? 1 : status === "approved" ? 2 : 3
  return ["Submitted", "Under review", "Approved", "Issued"].map(
    (label, index) => ({
      label,
      state:
        index < currentIndex
          ? "complete"
          : index === currentIndex
            ? "current"
            : "upcoming",
    }),
  )
}

export default function RequestProgress({
  request,
  className,
}: {
  request: MaterialRequest
  className?: string
}) {
  const steps = getSteps(request.status)
  const statusDescription =
    request.status === "pending"
      ? "Awaiting administrator review"
      : request.status === "approved"
        ? "Approved and awaiting warehouse issue"
        : request.status === "issued"
          ? "Materials issued from inventory"
          : request.status === "rejected"
            ? `Rejected${
                request.rejectionReason ? `: ${request.rejectionReason}` : ""
              }`
            : "Cancelled by requester"

  return (
    <div
      className={cn("space-y-2", className)}
      role="group"
      aria-label={`Request ${request.id} progress: ${statusDescription}`}
    >
      <div className="flex items-start" aria-hidden="true">
        {steps.map((step, index) => {
          const isNegative =
            step.label === "Rejected" || step.label === "Cancelled"
          const Icon = isNegative
            ? step.label === "Rejected"
              ? X
              : Ban
            : step.state === "complete"
              ? Check
              : Clock
          return (
            <div key={step.label} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    step.state === "complete" &&
                      "border-green-700 bg-green-700 text-white",
                    step.state === "current" &&
                      !isNegative &&
                      "border-amber-600 bg-amber-100 text-amber-900",
                    step.state === "current" &&
                      isNegative &&
                      "border-red-700 bg-red-700 text-white",
                    (step.state === "upcoming" ||
                      step.state === "not-applicable") &&
                      "border-stone-400 bg-white text-stone-500",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] font-bold leading-tight",
                    step.state === "not-applicable"
                      ? "text-stone-500 line-through"
                      : "text-stone-700",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "mt-3 h-0.5 min-w-2 flex-1",
                    step.state === "complete" ? "bg-green-700" : "bg-stone-300",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-stone-600">
        <span className="font-bold">Current status:</span> {statusDescription}.
      </p>
    </div>
  )
}
