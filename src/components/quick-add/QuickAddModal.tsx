"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Sparkles, Calendar, Clock, MapPin, Tag, ArrowRight } from "lucide-react";
import { parseQuickAddVietnamese, ParsedQuickAdd } from "@/services/quickAddParser";
import { EventItem } from "@/types";
import { formatDateVN } from "@/utils/dateUtils";
import { EVENT_TYPE_MAP } from "@/utils/categoryUtils";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (event: Omit<EventItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSaveEvent
}) => {
  const [inputText, setInputText] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedQuickAdd | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.trim().length > 3) {
      const parsed = parseQuickAddVietnamese(val);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  };

  const handleSave = async () => {
    if (!parsedResult || !parsedResult.title) return;

    setIsLoading(true);
    try {
      await onSaveEvent({
        title: parsedResult.title,
        type: parsedResult.type,
        startDateTime: `${parsedResult.date}T${parsedResult.startTime}`,
        endDateTime: `${parsedResult.date}T${parsedResult.endTime}`,
        allDay: false,
        location: parsedResult.location,
        priority: parsedResult.priority,
        status: "confirmed",
        reminders: [{ minutesBefore: 15 }],
        userId: ""
      });

      setInputText("");
      setParsedResult(null);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          Thêm Lịch Nhanh (Smart Add)
        </span>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Gõ tự nhiên bằng tiếng Việt, hệ thống sẽ tự động phân tích tiêu đề, ngày, giờ và địa điểm.
        </p>

        {/* Input Text */}
        <div className="relative">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="VD: Họp phòng CNTT ngày mai 8h hoặc Học online thứ 2 lúc 14h30"
            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
            autoFocus
          />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-400 self-center mr-1">Gợi ý:</span>
          {[
            "Họp phòng CNTT ngày mai 8h",
            "Học online thứ 2 8h",
            "Kiểm tra thiết bị chiều mai 14h",
            "Deadline nộp đồ án tối nay 23h"
          ].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => handleInputChange(sample)}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Smart Preview Card */}
        {parsedResult && (
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Kết quả nhận diện (Preview)
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-normal">
                Độ chính xác: {Math.round(parsedResult.confidence * 100)}%
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40 shadow-xs space-y-2">
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {parsedResult.title}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>{formatDateVN(parsedResult.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>
                    {parsedResult.startTime} - {parsedResult.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>{EVENT_TYPE_MAP[parsedResult.type]?.label}</span>
                </div>
                {parsedResult.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{parsedResult.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!parsedResult || !parsedResult.title}
            isLoading={isLoading}
          >
            Xác nhận & Thêm lịch <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
