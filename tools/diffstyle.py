#!/usr/bin/env python

import difflib
import optparse
import sys


def process(original, corrected):
    """
    Returns a list of violations that are found
    """
    original_lines = []
    corrected_lines = []
    gen = difflib.unified_diff(original, corrected, n=0)

    try:
        # Skip the first 2 lines of the diff output (the header lines)
        next(gen)
        next(gen)
    except StopIteration:
        # There was no diff output, no violations to return
        return []

    current_line = parse_starting_line_num(next(gen))

    all_violations = []

    for line in gen:
        if line[0] == "-":
            original_lines.append(line[1:])
        elif line[0] == "+":
            corrected_lines.append(line[1:])
        elif line[0] == "@":
            all_violations += process_chunk(
                current_line,
                original_lines,
                corrected_lines)

            original_lines = []
            corrected_lines = []
            current_line = parse_starting_line_num(line)
        else:
            raise RuntimeError("Impossible line: " + line)

    all_violations += process_chunk(
        current_line,
        original_lines,
        corrected_lines)

    return all_violations


class Violation(object):
    def __init__(self, line, col, text):
        self.line = line
        self.col = col
        self.text = text
        self.filename = None

    def get_message(self):
        if self.text:
            return "Fix Style, should be: " + self.text
        else:
            return "Invalid Whitespace"

    def __repr__(self):
        filenameStr = self.filename

        if not filenameStr:
            filenameStr = "<unknown>"

        return filenameStr + ':' + \
            str(self.line) + ':' + \
            str(self.col) + ': ' + \
            self.get_message()

    def format_msg(self, msg_template):
        return msg_template.format(path=self.filename,
                                   line=self.line,
                                   col=self.col,
                                   msg=self.get_message())


def create_message(original_line, corrected_line):
    if original_line.strip() == corrected_line.strip():
        return "Fix Indentation/Whitespace"
    else:
        return corrected_line.strip()


def process_chunk(line_num, original_lines, corrected_lines):
    violations = []

    if len(original_lines) == len(corrected_lines):
        for i in range(0, len(original_lines)):
            column = string_diff_column(original_lines[i], corrected_lines[i])
            message = create_message(original_lines[i], corrected_lines[i])
            violations.append(Violation(line_num + i, column, message))

    elif len(original_lines) == 0:
        v = Violation(line_num, 1, "New line required here")
        violations.append(v)

    elif len(original_lines) < len(corrected_lines):
        for i in range(0, len(original_lines)):
            column = string_diff_column(original_lines[i], corrected_lines[i])
            message = create_message(original_lines[i], corrected_lines[i])
            violations.append(Violation(line_num + i, column, message))

    elif len(corrected_lines) == 0:
        for i in range(0, len(original_lines)):
            v = Violation(line_num + i, 1, "")
            violations.append(v)

    elif len(original_lines) > len(corrected_lines):
        for i in range(0, len(corrected_lines)):
            column = string_diff_column(original_lines[i], corrected_lines[i])
            message = create_message(original_lines[i], corrected_lines[i])
            violations.append(Violation(line_num + i, column, message))

    return violations


def parse_starting_line_num(line):
    """
    >>> parse_starting_line_num("@@ -7,2 +6 @@")
    7
    >>> parse_starting_line_num("@@ -12 +10 @@")
    12
    """
    startIndex = 4
    endIndex1 = line.find(',', startIndex)
    endIndex2 = line.find(' ', startIndex)
    if endIndex1 != -1:
        endIndex = endIndex1
    if endIndex2 != -1 and (endIndex1 == -1 or endIndex2 < endIndex):
        endIndex = endIndex2
    numStr = line[startIndex:endIndex]
    return int(numStr)


def string_diff_column(str1, str2):
    """
    >>> string_diff_column("ab1", "ab2")
    3
    >>> string_diff_column("ab1c3e", "ab2c4e")
    3
    >>> string_diff_column("abc", "abcd")
    3
    >>> string_diff_column("abcd", "abc")
    3
    >>> string_diff_column("a", "")
    1
    >>> string_diff_column("", "a")
    1
    >>> string_diff_column("", "")
    1
    """
    c = 1
    for i in range(0, min(len(str1), len(str2))):
        c = i
        if str1[i] != str2[i]:
            break

    if c >= len(str1) or c >= len(str2):
        c -= 1

    return c + 1


def read_file(filename):
    with open(filename) as f:
        return f.readlines()


if __name__ == "__main__":
    usage = "usage: %prog [--msg-template=TEMPLATE] FILE [-c CORRECTED_FILE]"
    parser = optparse.OptionParser(usage=usage)

    parser.add_option("--msg-template",
                      action="store",
                      type="string",
                      dest="msg_template",
                      metavar="TEMPLATE",
                      help=("Template used to display messages. This is a "
                            "python new-style format string used to format "
                            "the message information. See doc for all "
                            "details"))

    parser.set_defaults(msg_template="{path}:{line}:{col}: {msg}")

    files_group = optparse.OptionGroup(parser, "Files")

    files_group.add_option("-c",
                           action="store",
                           type="string",
                           dest="corrected_filename",
                           metavar="CORRECTED_FILE",
                           help=("File that the input file should be compared "
                                 "with. If not supplied, will be read from "
                                 "stdin"))

    parser.add_option_group(files_group)

    options, args = parser.parse_args()

    if len(args) != 1:
        parser.error("You must supply an input file")

    original_filename = args[0]

    original_file = read_file(original_filename)

    if options.corrected_filename:
        corrected_file = read_file(options.corrected_filename)
    else:
        corrected_file = sys.stdin.readlines()

    violations = process(original_file, corrected_file)

    for v in violations:
        v.filename = original_filename

        # Write entire lines to the output in one shot, so that output from
        # parallel runs can be mixed
        sys.stdout.write(v.format_msg(options.msg_template) + "\n")
        sys.stdout.flush()

    if len(violations) == 0:
        # No violtaions: success!
        sys.exit(0)
    else:
        sys.exit(1)
