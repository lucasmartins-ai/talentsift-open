import type {
  CandidateDocumentParser,
  ParsedCandidateDocument,
} from "./parser";

const decoder = new TextDecoder("utf-8", { fatal: false });

// Text/plain only. PDF extraction is a deferred idea; the upgrade path is a
// real PDF parser behind this same interface.
export class TextCandidateParser implements CandidateDocumentParser {
  async parse(input: {
    contentType: "application/pdf" | "text/plain";
    bytes: Uint8Array;
  }): Promise<ParsedCandidateDocument> {
    if (input.contentType === "application/pdf") {
      return {
        text: "",
        warnings: [
          {
            code: "pdf_not_supported",
            message:
              "PDF text extraction is not enabled in this demo. Provide a .txt CV for ranking.",
          },
        ],
      };
    }

    const text = decoder.decode(input.bytes).trim();
    if (text.length === 0) {
      return {
        text: "",
        warnings: [
          { code: "empty_document", message: "No readable text was found." },
        ],
      };
    }

    return { text, warnings: [] };
  }
}

export const textCandidateParser = new TextCandidateParser();
