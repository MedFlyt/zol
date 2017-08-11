import { Col, SqlType, unsafeFun, unsafeFun2, unsafeFun3 } from "zol";

/**
 * Number of characters in string
 *
 * SQL equivalent: char_length, length
 */
export function charLength<s>(str: Col<s, string>): Col<s, number> {
    return unsafeFun("char_length", str, SqlType.intParser);
}

/**
 * Convert string to lower case
 *
 * SQL equivalent: lower
 */
export function lower<s>(str: Col<s, string>): Col<s, string> {
    return unsafeFun("lower", str, SqlType.stringParser);
}

/**
 * Convert string to upper case
 *
 * SQL equivalent: upper
 */
export function upper<s>(str: Col<s, string>): Col<s, string> {
    return unsafeFun("upper", str, SqlType.stringParser);
}

/**
 * Location of specified substring. The first character in the haystack
 * is 1 (not 0). A result of 0 means that the substring was not found.
 *
 * SQL equivalent: strpos, position
 */
export function strpos<s>(haystack: Col<s, string>, needle: Col<s, string>): Col<s, number> {
    return unsafeFun2("strpos", haystack, needle, SqlType.intParser);
}

/**
 * Extract substring. The first character in the string has index 1.
 * Extracts starting from "from" until the end of the string.
 *
 * SQL equivalent: substr, substring
 */
export function substr<s>(str: Col<s, string>, from: Col<s, number>): Col<s, string>;

/**
 * Extract substring. The first character in the string has index 1.
 * Extracts starting from "from" for "count" characters.
 *
 * SQL equivalent: substr, substring
 */
export function substr<s>(str: Col<s, string>, from: Col<s, number>, count: Col<s, number>): Col<s, string>;

export function substr<s>(str: Col<s, string>, from: Col<s, number>, count?: Col<s, number>): Col<s, string> {
    if (count === undefined) {
        return unsafeFun2("substr", str, from, SqlType.stringParser);
    } else {
        return unsafeFun3("substr", str, from, count, SqlType.stringParser);
    }
}

/**
 * Character with the given code. For UTF8 the argument is treated as a
 * Unicode code point. For other multibyte encodings the argument must
 * designate an ASCII character. The NULL (0) character is not allowed
 * because text data types cannot store such bytes.
 *
 * SQL equivalent: chr
 */
export function chr<s>(code: Col<s, number>): Col<s, string> {
    return unsafeFun("chr", code, SqlType.stringParser);
}

/**
 * Remove all space characters from the start and end of string.
 *
 * SQL equivalent: btrim
 */
export function btrim<s>(str: Col<s, string>): Col<s, string>;

/**
 * Remove the longest string consisting only of characters in characters
 * from the start and end of string.
 *
 * SQL equivalent: btrim
 */
export function btrim<s>(str: Col<s, string>, characters: Col<s, string>): Col<s, string>;

export function btrim<s>(str: Col<s, string>, characters?: Col<s, string>): Col<s, string> {
    if (characters === undefined) {
        return unsafeFun("btrim", str, SqlType.stringParser);
    } else {
        return unsafeFun2("btrim", str, characters, SqlType.stringParser);
    }
}

/**
 * Remove all space characters from the start of string.
 *
 * SQL equivalent: ltrim
 */
export function ltrim<s>(str: Col<s, string>): Col<s, string>;

/**
 * Remove the longest string consisting only of characters in characters
 * from the start of string.
 *
 * SQL equivalent: ltrim
 */
export function ltrim<s>(str: Col<s, string>, characters: Col<s, string>): Col<s, string>;

export function ltrim<s>(str: Col<s, string>, characters?: Col<s, string>): Col<s, string> {
    if (characters === undefined) {
        return unsafeFun("ltrim", str, SqlType.stringParser);
    } else {
        return unsafeFun2("ltrim", str, characters, SqlType.stringParser);
    }
}

/**
 * Remove all space characters from the end of string.
 *
 * SQL equivalent: rtrim
 */
export function rtrim<s>(str: Col<s, string>): Col<s, string>;

/**
 * Remove the longest string consisting only of characters in characters
 * from the end of string.
 *
 * SQL equivalent: rtrim
 */
export function rtrim<s>(str: Col<s, string>, characters: Col<s, string>): Col<s, string>;

export function rtrim<s>(str: Col<s, string>, characters?: Col<s, string>): Col<s, string> {
    if (characters === undefined) {
        return unsafeFun("rtrim", str, SqlType.stringParser);
    } else {
        return unsafeFun2("rtrim", str, characters, SqlType.stringParser);
    }
}

/**
 * Convert number to its equivalent hexadecimal representation.
 *
 * SQL equivalent: to_hex
 */
export function toHex<s>(num: Col<s, number>): Col<s, string> {
    return unsafeFun("to_hex", num, SqlType.stringParser);
}
