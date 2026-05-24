const STATUS_STYLES = {
  scheduled:   "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-orange-50 text-orange-700 border-orange-200",
  submitted:   "bg-purple-50 text-purple-700 border-purple-200",
  approved:    "bg-teal-50 text-teal-700 border-teal-200",
  completed:   "bg-green-50 text-green-700 border-green-200",
  overdue:     "bg-red-50 text-red-700 border-red-200",
  cancelled:   "bg-gray-50 text-gray-500 border-gray-200",
  archived:    "bg-gray-50 text-gray-400 border-gray-200",
};

const STATUS_LABELS = {
  scheduled:   "Scheduled",
  in_progress: "In Progress",
  submitted:   "Submitted",
  approved:    "Approved",
  completed:   "Completed",
  overdue:     "Overdue",
  cancelled:   "Cancelled",
  archived:    "Archived",
};

export default function OccurrenceStatusBadge({ status, size = "sm" }) {
  const style = STATUS_STYLES[status] || "bg-gray-50 text-gray-500 border-gray-200";
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${size === "xs" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"} ${style}`}>
      {label}
    </span>
  );
}
