"use client";

import { FC, useState } from "react";
import { Question } from "@shared/types";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  isChecked: boolean;
  onCheckboxChange: () => void;
}

const AccordionItem: FC<AccordionItemProps> = ({ title, children, isChecked, onCheckboxChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="border-b">
      <div className="flex items-center justify-between">
        <label className="w-full flex justify- center text-left">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onCheckboxChange}
            className=" mr-4 h-4 w-4 flex-shrink-0 item-center text-blue-600 border-border-color rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling
          />
          <span className="font-semibold">{title}</span>
        </label>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 py-4 items-center focus:outline-none"
        >
          <span>{isOpen ? "▲" : "▼"}</span>
        </button>
      </div>
      {isOpen && <div className="pb-4 pl-8">{children}</div>}
    </li>
  );
};

interface QuizSelectorProps {
  questions: Question[];
  selectedIds: number[];
  onCheckboxChange: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const QuizSelector: FC<QuizSelectorProps> = ({
  questions,
  selectedIds,
  onCheckboxChange,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <>
      <label className="block mb-1">問題選択</label>
      <div className="flex justify-end gap-4 mb-4">
        <button
          type="button"
          onClick={onSelectAll}
          className="text-sm text-[#fa173d] hover:underline"
        >
          全て選択
        </button>
        <button
          type="button"
          onClick={onDeselectAll}
          className="text-sm text-[#fa173d] hover:underline"
        >
          全て解除
        </button>
      </div>

      <ul className="divide-y border rounded pb-20">
        {questions.map((q) => (
          <AccordionItem
            key={q.id}
            title={q.question}
            isChecked={selectedIds.includes(q.id)}
            onCheckboxChange={() => onCheckboxChange(q.id)}
          >
            <div className="bg-primary-bg p-4 rounded-lg">
              <p>正解: {q.choices[q.answerIndex]}</p>
              <p className="text-sm mt-2">
                解説: {q.explanation}
              </p>
            </div>
          </AccordionItem>
        ))}
      </ul>
    </>
  );
};