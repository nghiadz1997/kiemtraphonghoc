"use client";

import React from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionText?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Hôm nay bạn chưa có lịch nào 🎉",
  description = "Hãy lên kế hoạch cho ngày hôm nay để không bỏ lỡ những việc quan trọng!",
  onAction,
  actionText = "+ Thêm lịch",
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
        {icon || <Calendar className="w-7 h-7" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {onAction && (
        <Button onClick={onAction} size="sm" variant="primary">
          <Plus className="w-4 h-4 mr-1" />
          {actionText}
        </Button>
      )}
    </div>
  );
};
