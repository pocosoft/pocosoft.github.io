import { loadDefaultJapaneseParser } from 'budoux';

const parser = loadDefaultJapaneseParser();

/** 日本語の文を文節に分ける。改行位置の候補として使う。 */
export const jaPhrases = (text: string): string[] => parser.parse(text);
