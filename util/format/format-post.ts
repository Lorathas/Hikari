import type { EmbeddedToken } from "./embed-formatter";

const whitespaceRegex = /^\s*$/;

export default function formatPost(text: string): Promise<EmbeddedToken[]> {
    throw 'NotImplemented'
}

function tokenizePost(text: string) {
  const tokens = [];

  let buffer = "";

  for (let char of text) {
  }
}

const tokenizeRegex = /(\s+|\S+)/g;

export function tokenizeWithWhitespace(input: string): string[] {
  const tokens = input.match(tokenizeRegex) || [];
  return tokens;
}
