import { getSheetOrThrow } from "./utils/sheet";
import { ok, error } from "./utils/output";

// Define the expected type for the quiz data
interface QuizData {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
  newCategory?: string;
  targetSheet: string; // The name of the sheet to add the quiz to
}

/**
 * Adds a new quiz to the specified spreadsheet.
 * @param quizData The quiz data to add.
 * @returns A success or error response.
 */
export function addQuiz(quizData: QuizData): GoogleAppsScript.Content.TextOutput {
  try {
    const { question, options, answer, explanation, category, newCategory, targetSheet } = quizData;

    // Basic validation
    if (!question || !options || !answer || !explanation || (!category && !newCategory) || !targetSheet) {
      return error("Missing required fields.");
    }

    const sheet = getSheetOrThrow(targetSheet);

    const finalCategory = category === 'new' ? newCategory : category;

    // Assuming the order of columns is: Question, Option1, Option2, ..., Answer, Explanation, Category
    const newRow = [
      question,
      ...options,
      // Fill remaining option columns with empty strings if options array is shorter than expected
      ...Array(4 - options.length).fill(""), 
      answer,
      explanation,
      finalCategory
    ];

    sheet.appendRow(newRow);

    return ok({ message: "Quiz added successfully!" });
  } catch (err: unknown) {
    return error(err instanceof Error ? err.message : "Unknown error while adding quiz.");
  }
}
