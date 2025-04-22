
import { cn } from "@/lib/utils";

type StatusIndicatorProps = {
  status: 'Active' | 'Processing';
};

export const StatusIndicator = ({ status }: StatusIndicatorProps) => (
  <div className="flex items-center">
    <div
      className="h-2.5 w-2.5 rounded-full mr-2"
      style={{ backgroundColor: status === 'Active' ? '#00A99D' : '#FFB547' }}
    />
    <div className="font-medium text-gray-900">{status}</div>
  </div>
);
