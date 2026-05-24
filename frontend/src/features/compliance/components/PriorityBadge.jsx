const STYLES = {
  low:      "text-gray-500",
  medium:   "text-blue-600",
  high:     "text-orange-600",
  critical: "text-red-600 font-semibold",
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`text-xs ${STYLES[priority] || "text-gray-500"} capitalize`}>
      {priority || "—"}
    </span>
  );
}
