import { pg, nullCol, insertReturning, order, Order, limit, declareTable, MakeCols, MakeTable, SqlType, insertMany, textCol, numberCol, defaultValue, delete_, e, Col, select, restrict, query, Q, leftJoin, booleanCol, ilike, like, aggregate, groupBy, count, insertOnConflictDoNothing, ConflictTarget, exists, arbitrary, not, Debug } from "zol";

/*
### Connecting To a Database

To connect to a database, use the `pg` object that Zol provides:
*/

export async function connect(): Promise<pg.Client> {
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!! Modify the following line with your database credentials !!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    const conn = await pg.connectPg("postgres://user1:pass1@localhost:5432/test1");
    return conn;
}

/*
Note: Zol is built on top of the [pg](https://github.com/brianc/node-postgres) npm module, and works
with the same `Client` object, so if you are already using `pg` and have a `Client` then you can use that
seamlessly with Zol.
*/

/*
### Declaring Tables

In this guide, we will be working with a database that contains 3 tables:

#### "language"

language    year_created  descendant_of
--------    ------------  -------------
JavaScript  1995          NULL
TypeScript  2012          JavaScript
Java        1995          NULL
C           1972          NULL
C++         1985          C
Smalltalk   1969          NULL
Scheme      1970          NULL

#### "book"

book_id     name                                                 year_published
-------     ----                                                 --------------
1           'Design Patterns'                                    1994
2           'JavaScript: The Good Parts'                         2008
3           'Structure and Interpretation of Computer Programs'  1985
4           'The Little Schemer'                                 1974
5           'The C Programming Language'                         1978
6           'Programming Pearls'                                 1986
7           'Compilers: Principles, Techniques, and Tools'       1986
8           'Thinking in Java'                                   1998

#### "book_language"

book_id  language    
-------  --------
1        C++
1        Smalltalk
2        JavaScript
3        Scheme
4        Scheme
5        C
6        C
6        BASIC
7        C
7        Pascal
8        Java

Your tables must already exist in your database. You can create them using your favorite GUI tool or the `psql` tool. Zol does not have built-in support for creation of tables nor does it offer built-in migration functionality (see below in the FAQ for why).

Let's start with the "language" table. It can be created in SQL with this code:
*/

const createTablesSql =
    `
    CREATE TABLE IF NOT EXISTS language
    (
        language TEXT NOT NULL,
        year_created INT NOT NULL,
        descendant_of TEXT
    );

    CREATE TABLE IF NOT EXISTS book
    (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        year_published INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS book_language
    (
        book_id INT NOT NULL REFERENCES book(id),
        language TEXT NOT NULL,

        UNIQUE (book_id, language)
    );
    `;

/*
Zol comes with a `pg.query_` function that can be used to run arbitrary SQL code. We can use it to create our tables in an empty database.

Note: For production projects you should use more powerful too for managing your database schema and migrations. And you should also of course add appropriate indexes.
*/

export async function createTables(conn: pg.Client) {
    await pg.query_(conn, createTablesSql);
}

/*
In order to use our tables with Zol, we need to declare their schema. It is recommended to put this code in a namespace called `Tables`.

Note: It is possible that a future version of Zol may automate this step by inspecting your database schema and generating the code automatically.
*/

export namespace Tables {
    // The first step is to declare the name and types of the table columns. The table columns are split into two groups: columns that require
    // a value when inserting new rows, and columns that have a database-level "default" value.
    //
    // Follow the convention and name these interfaces the same as the table name with the suffixes "Req"(required) and "Def"(default).
    //
    // The types of the fields in these interfaces should be the JavaScript type that corresponds to the type of the column in the database.
    // Columns that are NULLABLE in the database should be also nullable here (like `descendantOf`).
    interface LanguageReq {
        readonly language: string;
        readonly yearCreated: number;
    }

    interface LanguageDef {
        readonly descendantOf: string | null;
    }

    // The second step is to declare for our table the mapping of the fields to the actual database columns.
    //
    // Name 
    export const language = declareTable<LanguageReq, LanguageDef>("language", {
        language: ["language", SqlType.stringParser],
        yearCreated: ["year_created", SqlType.intParser],
        descendantOf: ["descendant_of", SqlType.stringParser]
    });

    // The 3rd step is to declare these 2 types, which will be useful for us later on
    export type LanguageCols<s> = MakeCols<s, LanguageReq & LanguageDef>;
    export type Language = MakeTable<LanguageReq, LanguageDef>;

    // ----------------------------------------------------------------

    interface BookReq {
        readonly name: string;
        readonly yearPublished: number;
    }

    interface BookDef {
        readonly id: number;
    }

    export const book = declareTable<BookReq, BookDef>("book", {
        id: ["id", SqlType.numberParser],
        name: ["name", SqlType.stringParser],
        yearPublished: ["year_published", SqlType.intParser]
    });

    export type BookCols<s> = MakeCols<s, BookReq & BookDef>;
    export type Book = MakeTable<BookReq, BookDef>;

    // ----------------------------------------------------------------

    interface BookLanguageReq {
        readonly bookId: number;
        readonly language: string;
    }

    interface BookLanguageDef {
    }

    export const bookLanguage = declareTable<BookLanguageReq, BookLanguageDef>("book_language", {
        bookId: ["book_id", SqlType.numberParser],
        language: ["language", SqlType.stringParser]
    });

    export type BookLanguageCols<s> = MakeCols<s, BookLanguageReq & BookLanguageDef>;
    export type BookLanguage = MakeTable<BookLanguageReq, BookLanguageDef>;
}


/*




Interesting queries:
  - languages whose name is a substring of another language name
        (with query that can be used as subquery;
	 table of all languages together with count of child/parents;
	 list of language that have child/parent, etc...)
  - book created N years after language
  - List of books that contain none of their languages in the book name

*/

// --------------------------------------------------------------------
// Inserting Rows
// --------------------------------------------------------------------

export async function insertLanguages(conn: pg.Client) {
    const vals: Tables.Language[] = [
        { language: textCol("JavaScript"), yearCreated: numberCol(1995), descendantOf: nullCol() },
        { language: textCol("TypeScript"), yearCreated: numberCol(2012), descendantOf: textCol("JavaScript") },
        { language: textCol("Java"), yearCreated: numberCol(1995), descendantOf: nullCol() },
        { language: textCol("C"), yearCreated: numberCol(1972), descendantOf: nullCol() },
        { language: textCol("C++"), yearCreated: numberCol(1985), descendantOf: textCol("C") },
        { language: textCol("Smalltalk"), yearCreated: numberCol(1969), descendantOf: nullCol() },
        { language: textCol("Scheme"), yearCreated: numberCol(1970), descendantOf: nullCol() },
    ];

    await insertMany(conn, Tables.language, vals);
}

/*

INSERT INTO language
  (language, name)
VALUES
  ('JavaScript', 1995),
  ('TypeScript', 2012)

*/

export async function createBook(conn: pg.Client, name: string, yearPublished: number, languages: string[]): Promise<void> {
    const val: Tables.Book = {
        id: defaultValue(),
        name: textCol(name),
        yearPublished: numberCol(yearPublished)
    };
    const book = await insertReturning(conn, Tables.book, val, row => ({ id: row.id }));

    const languageVals = languages.map((language): Tables.BookLanguage => ({
        language: textCol(language),
        bookId: numberCol(book.id)
    }));
    await insertMany(conn, Tables.bookLanguage, languageVals);
}

export async function insertData(conn: pg.Client): Promise<void> {
    await insertLanguages(conn);
    await createBook(conn, "Design Patterns", 1994, ["C++", "Smalltalk"]);
    await createBook(conn, "JavaScript: The Good Parts", 2008, ["JavaScript"]);
    await createBook(conn, "Structure and Interpretation of Computer Programs", 1985, ["Scheme"]);
    await createBook(conn, "The Little Schemer", 1974, ["Scheme"]);
    await createBook(conn, "The C Programming Language", 1978, ["C"]);
    await createBook(conn, "Programming Pearls", 1986, ["C", "BASIC"]);
    await createBook(conn, "Compilers: Principles, Techniques, and Tools", 1986, ["C", "Pascal"]);
    await createBook(conn, "Thinking in Java", 1998, ["Java"]);
}

export async function withDatabase(action: (conn: pg.Client) => Promise<void>): Promise<void> {
    const conn = await connect();
    try {
        await createTables(conn);
        await deleteAllData(conn);
        await insertData(conn);
        await action(conn);
    } finally {
        await pg.closePg(conn);
    }
}




export async function runQuery<T extends object>(theQuery: <s>(q: Q<s>) => MakeCols<s, T>): Promise<void> {
    await withDatabase(async conn => {
        // Debug.enableDebug();
        const rows = await query(conn, theQuery);
        // console.log(Debug.getLastQueryMetrics(conn).querySQL());
        if (rows.length === 0) {
            console.log("No Results");
            return;
        }
        const fields = Object.keys(rows[0]);
        const matrix: any[][] = [];
        matrix.push(fields);
        for (const row of rows) {
            const matrixRow: any[] = [];
            for (const field of fields) {
                matrixRow.push((row as any)[field]);
            }
            matrix.push(matrixRow);
        }
        prettyPrintMatrix(matrix);
    });
}

function prettyPrintMatrix(matrix: any[][]): void {
    function colToString(val: any): string {
        return "" + val;
    }

    const colMaxLengths: number[] = [];
    for (const matrixRow of matrix) {
        for (let i = 0; i < matrixRow.length; i++) {
            const val = colToString(matrixRow[i]);
            if (colMaxLengths[i] === undefined || colMaxLengths[i] < val.length) {
                colMaxLengths[i] = val.length;
            }
        }
    }

    function printRow(matrixRow: any[]) {
        let str = "";
        for (let i = 0; i < matrixRow.length; i++) {
            const val = colToString(matrixRow[i]);
            str += " " + val;
            str += " ".repeat(colMaxLengths[i] - val.length);
            str += " |";
        }
        console.log(str);
    }

    printRow(matrix[0]);
    let str = "";
    for (let i = 0; i < colMaxLengths.length; i++) {
        str += "-".repeat(colMaxLengths[i] + 2);
        str += "+";
    }
    console.log(str);
    for (let i = 1; i < matrix.length; i++) {
        printRow(matrix[i]);
    }
}




// --------------------------------------------------------------------
// Basic Queries
// --------------------------------------------------------------------

export function babyLanguages<s>(q: Q<s>) {
    const language = select(q, Tables.language);
    restrict(q, e(language.yearCreated, ">", numberCol(1990)));
    return {
        name: language.language,
        yearCreated: language.yearCreated
    }
}

export function isBabyLanguage<s>(language: Tables.LanguageCols<s>): Col<s, boolean> {
    return e(language.yearCreated, ">", numberCol(1990));
}

/*

SELECT
  language as "name"
  year_created as "yearCreated"
FROM language
WHERE year_created > 1990

*/

function formatLanguage(name: string, year: number) {
    return "Language " + name + "was created in " + year;
}

export async function printBabyLanguages() {
    await withDatabase(async conn => {
        const rows = await query(conn, babyLanguages);
        for (const row of rows) {
            console.log(formatLanguage(row.name, row.yearCreated));
        }
    });
}

// --------------------------------------------------------------------
// Order
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Limit
// --------------------------------------------------------------------

/*
*/
export function oldestBook<s>(q: Q<s>) {
    return limit(q, 0, 1, q => {
        const book = select(q, Tables.book);
        order(q, book.yearPublished, Order.Asc);
        return {
            id: book.id,
            name: book.name
        }
    });
}

/*
SELECT
  name
FROM book
ORDER BY year_published ASC
OFFSET 0 LIMIT 1
*/

/*
Num rows: 1
{ name: 'The Little Schemer' }
*/

// --------------------------------------------------------------------
// Joins
// --------------------------------------------------------------------

/*
To join two (or more) tables, we "select" both the tables, and then use "restrict" to join the tables on the specified columns:
*/

export function booksWithLanguages<s>(q: Q<s>) {
    const book = select(q, Tables.book);
    const bookLanguage = select(q, Tables.bookLanguage);
    restrict(q, e(book.id, "=", bookLanguage.bookId));
    return {
        bookId: book.id,
        bookName: book.name,
        bookYearPublished: book.yearPublished,
        bookLanguage: bookLanguage.language
    };
}

/*
SELECT
  book.id AS "bookId",
  book.name AS "bookName",
  book.year_published AS "bookYearPublished",
  book_language.language AS "bookLanguage"
FROM book, book_language
WHERE book.id = book_language.book_id
*/

// --------------------------------------------------------------------
// Left Join
// --------------------------------------------------------------------

/*

*/
export function languagesAndBooks<s>(q: Q<s>) {
    const language = select(q, Tables.language);
    const book = leftJoin(q,
        q => {
            return booksWithLanguages(q)
        },
        row => e(row.bookLanguage, "=", language.language)
    );

    return {
        language: language.language,
        bookId: book.bookId,
        bookName: book.bookName
    };
}

/*
SELECT
  AS language,
  AS "bookId",
  AS "bookName"
FROM language
LEFT JOIN 
*/

// --------------------------------------------------------------------
// Aggregations
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Inner Queries
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Complex Queries
// --------------------------------------------------------------------

export function languagesContainingMyName<s>(q: Q<s>, languageName: Col<s, string>) {
    const language = select(q, Tables.language);
    restrict(q, e(language.language, "!=", languageName));
    const pattern = e(e(textCol("%"), "||", languageName), "||", textCol("%"));
    restrict(q, ilike(language.language, pattern));
    return {
        language: language.language
    };
}

export function languagesContaining_C<s>(q: Q<s>) {
    return languagesContainingMyName(q, textCol("C"));
}

export function languagesContaining_Java<s>(q: Q<s>) {
    return languagesContainingMyName(q, textCol("Java"));
}

export function languagesWithNamesCount<s>(q: Q<s>) {
    // TODO
    const language = select(q, Tables.language);
    leftJoin(q,
        q => {
            return aggregate(q, q => {
                const language2 = select(q, Tables.language);
                const x = groupBy(q, language2.language);
                return {
                    x: x
                }
            });
        },
        row => booleanCol(true)
    );
    return {
        x: booleanCol(true)
    };
}

export function bookHasAllLanguagesInName<s>(bookId: Col<s, number>): Col<s, boolean> {
    return not(exists(q => {
        const book = select(q, Tables.book);
        const bookLanguage = select(q, Tables.bookLanguage);
        restrict(q, e(book.id, "=", bookId));
        restrict(q, e(bookLanguage.bookId, "=", bookId));
        const pattern = e(e(textCol("%"), "||", bookLanguage.language), "||", textCol("%"));
        const languageNameInBookName = ilike(book.name, pattern);
        restrict(q, not(languageNameInBookName));
        return arbitrary();
    }));
}

export function booksWithLanguagesInNameStatus<s>(q: Q<s>) {
    const book = select(q, Tables.book);
    return {
        bookId: book.id,
        bookName: book.name,
        bookNameHasAllLanguages: bookHasAllLanguagesInName(book.id)
    }
}

/*
If we are only interested in a specific book, we can restrict the previous query to a specific ID.

(In real code, you would not hardcode the id to be "1" but would pass it as an argument to the xxx function)
*/

export function xxx<s>(q: Q<s>) {
    const bookId = numberCol(1);
    const book = booksWithLanguagesInNameStatus(q);
    restrict(q, e(book.bookId, "=", bookId));
    return book;
}

/*
We of course are not limiting to just restricting by ID, but can use any code we want.

We can even combine multiple queries together.

For example, we can utilise the "oldestBook" query we previously wrote, to find out if the oldest book contains all of its languages in its name:
*/

export function oldestBookHasLanguagesInName<s>(q: Q<s>) {
    const book = oldestBook(q);
    const bookWithStatus = booksWithLanguagesInNameStatus(q);
    restrict(q, e(book.id, "=", bookWithStatus.bookId));
    return {
        oldestBookName: book.name,
        hasAllLanguages: bookWithStatus.bookNameHasAllLanguages
    }
}
/*
 hasAllLanguages | oldestBookName     |
-----------------+--------------------+
 true            | The Little Schemer |
*/

// TODO combine booksWithLanguagesInNameStatus with isBabyLanguage and/or maybe other cool combinations

// --------------------------------------------------------------------
// Updating Rows
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Deleting Rows
// --------------------------------------------------------------------

export async function deleteBabyLanguages(conn: pg.Client) {
    await delete_(conn, Tables.language, row => isBabyLanguage(row));
}

export async function deleteAllData(conn: pg.Client) {
    await delete_(conn, Tables.bookLanguage, () => booleanCol(true));
    await delete_(conn, Tables.book, () => booleanCol(true));
    await delete_(conn, Tables.language, () => booleanCol(true));

    // Reset this sequence so that our book "id" values start from "1" again
    await pg.query_(conn, "ALTER SEQUENCE book_id_seq RESTART");
}

// --------------------------------------------------------------------
// Primary Keys
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Type safe foreign keys
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Insert with ON CONFLICT clause (upsert)
// --------------------------------------------------------------------

export async function bookAddLanguage(conn: pg.Client, bookId: number, language: string): Promise<void> {
    const row: Tables.BookLanguage = {
        bookId: numberCol(bookId),
        language: textCol(language)
    };
    await insertOnConflictDoNothing(conn, Tables.bookLanguage, row, ConflictTarget.tableColumns(["bookId", "language"]));
}

// --------------------------------------------------------------------
// Transactions
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// "newtype" ids and foreign keys
// --------------------------------------------------------------------

// book_id

// --------------------------------------------------------------------
// More Features
// --------------------------------------------------------------------

// distinct, ifThenElse, matchNull, inList, isNull, isNotNull, not

// --------------------------------------------------------------------
// Unsafe Functions
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Debugging Queries
// --------------------------------------------------------------------

