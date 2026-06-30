export type ParserWarning = {
  code: string;
  message: string;
};

export type ParsedCandidateDocument = {
  text: string;
  warnings: ParserWarning[];
};

export interface CandidateDocumentParser {
  parse(input: {
    contentType: "application/pdf" | "text/plain";
    bytes: Uint8Array;
  }): Promise<ParsedCandidateDocument>;
}
