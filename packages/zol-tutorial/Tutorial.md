## Tutorial

The full code of this tutorial can be found here XXX TODO

### Using the Zol library

The functions and types provided by Zol are intended to be imported into your code using TypeScript `import` statements in the form of:

```ts
import { declareTable, select, query } from "zol";
```

When you need to use another Zol function (or type) then you should add it to that import statement.

If you are using Visual Studio Code then you can simply type the name of the function you want to use, and then click the lightbulb icon to automatically import it:

![Image of Yaktocat](zol-vscode-import-bulb.png)

In order to follow along with this tutotial, paste in the following import code:

XXX TODO

```ts
import { declareTable, MakeCols, MakeTable, SqlType, Table, insertMany, textCol, numberCol, defaultValue, delete_, e, Col, select, restrict, query, Q } from "zol";
```


### Connecting To a Database

To connect to a database, use the `pg` object that Zol provides:

```ts
import { pg } from "zol";

async function connectToMyDatabase(): Promise<pg.Client> {
    const conn = await pg.connectPg("postgres://myuser:mypassword@localhost:5432/dbname");
    return conn;
}
```

Note: Zol is built on top of the [pg](https://github.com/brianc/node-postgres) npm module, and works
with the same `Client` object, so if you are already using `pg` and have a `Client` then you can just
go ahead and use it with Zol.

### Declaring Tables

Before you can actually work with your database or perform queries, you must first
teach Zol about all of your tables.

Your tables must already exist in your database. You can create them using your favorite GUI tool or the `psql` tool. Zol does not have built-in support for creation of tables nor does it offer built-in migration functionality (see below in the FAQ for why).

Let's say you have a table called "person" that you created like this:

```sql
CREATE TABLE person
(
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INT NOT NULL DEFAULT 0
);
```

In order to use this table with Zol, we need to tell it about all of the fields.

First, a list of all of the fields that are required (do not have a default value):

```ts
// Required fields of "person" table
export interface PersonReq {
    readonly firstName: string;
    readonly lastName: string;
}
```

Now a list of all fields that have a default value (meaning that you can `INSERT` a row
without supplying a value for these fields):

```ts
// Defaultable fields of "person" table
export interface PersonDef {
    readonly age: number; // age is defined in the database to have a default value
}
```

Now we declare a name called `personTable` that will connect everything together:

```ts
export const personTable = declareTable<PersonReq, PersonDef>("person", {
    firstName: ["first_name", SqlType.stringParser],
    lastName: ["last_name", SqlType.stringParser],
    age: ["age", SqlType.intParser]
});
```

That may look like confusing boilerplate, but it's not important to fully understand what it's doing. 

- `PersonReq` and `PersonDef` are the interfaces we declared above.

- `"person"` is the name of the table as it is stored in the database.

- `firstName`, `lastName`, `age` are the field names that we declared in `PersonReq` and `PersonDef`.

- `"first_name"`, `"last_name"`, `"age"` are the names of the columns of the table inside the database.

- `SqlType.stringParser` and `SqlType.intParser` are the types of the fields/columns. These must match up with the column types stored in the database and also with the type of the fields that we declared.

Finally, we will add these two lines of boilerplate that will come in handy later:

```ts
export type PersonCols<s> = MakeCols<s, PersonReq & PersonDef>;
export type PersonTable = MakeTable<PersonReq, PersonDef>;
```

Hopefully that wasn't too much work! Now that Zol knows about this table, we can do some really powerful stuff :)

### Inserting Rows

Zol has a family of `insert` functions that are used to insert data.

Let's add some people using the `insertMany` function (The `conn` object is from the section above "Connecting to a database"):

```ts

```

## Frequently Asked Questions

### Can Zol be used with JavaScript

It should work but is not recommended. You should use TypeScript to get the full benefits of static type checking and IDE autocomplete.

### Why can't Zol automatically create tables? Why doesn't Zol do migrations?

Zol's purpose is to be a replacement for SQL for querying and manipulating data.

The reason to use Zol instead of using SQL is not because SQL has "ugly" syntax, or is difficult to learn, but rather due to the tangible benefits of composability, type safety, and tight integration with your TypeScript code. In fact, to properly use Zol, you must be familiar with and understand SQL.

However, for creating tables, and other DDL operations (such as creating indexes or adding columns), SQL is adequate:

- Composability of DDL operations is not useful (one exception I can think of is Index expressions, where you want to re-use the same expression that you use in your queries)

- Type safety is not helpful. DDL operations are by their nature 100% fully tested: they gotta be executed at some point, and they contain no input, logic or branching code.

If Zol were to have a feature for creating tables, then in order for it to be production quality it would need to support defining unique constraints, check constraints, indexes, foreign keys, index expressions, etc. The work of implementing all of this would have little benefit as SQL does the job just fine, for the reasons listed above.

The story for migrations is the same. Production systems will need to tap into the full power of SQL DDL operations and so an SQL-based migration tool is recommended. One good choice is [Flyway](https://flywaydb.org).

### Is Zol an ORM?

No. Object-relational-mappers attempt to give you access to your database
in the form of objects that you can manipulate.

For example, with an ORM you typically retrieve data from the database
in the form of an Object(or collection of objects) that you can then
manipulate and persist back to the database:

```ts
// Hypothetical ORM code:

const person = await Person.get({id: 7});
console.log("Current age:", person.age);
person.age += 1;
await person.save();
```

In contrast, with Zol you must explicitly issue `SELECT`, `UPDATE`, `INSERT` and `DELETE` queries.

The ORM approach approach appears to be convient, but what it essentially does is
pretend that your database is a document store. This works great if you just need to save and
retrieve data. But it also means that you encounter the ["object-relational impedance mismatch"](https://en.wikipedia.org/wiki/Object-relational_impedance_mismatch)
whenever you need to go beyond that and use database features such as joins, aggregates,
computed expressions, etc...

Note also that ORMs encourage writing code in a style that often results in buggy code. The example
above has a race condition where two concurrent calls will result in the person's age being incremented
only once. When updating records in a database, the correct way is to use an `UPDATE` query, but most ORMs
make this clunky.

Relational databases are designed to be accessed using SQL, or an SQL-like language. Zol can be
considered an SQL-like language that has the benefits of being integrated into the host language
(TypeScript), as well as it being composable and type safe. Any query that you can write in SQL
can be directly written as a Zol query (excluding queries that involve advanced database features).

### Why just PostgreSQL? What about MySQL, MariaDB, SQLite, MSSQL, Oracle?

There is nothing inherent in Zol that makes it PostgreSQL specific. It is possible to add support for other databases. The [Selda](https://github.com/valderman/selda) library from which Zol is ported supports SQLite in addition to PostgreSQL (and will likely eventually support also MySQL). Contributions in this department will be welcome.
