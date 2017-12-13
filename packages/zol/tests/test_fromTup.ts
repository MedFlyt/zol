import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { arbitrary, booleanCol, e, exists, inList, Inner, inQuery, leftJoin, nullCol, order, Order, Q, query, restrictEq, selectValues, textCol } from "../src/zol";

function selectFruit<s>(q: Q<s>) {
    return selectValues(q, [
        { name: textCol<s>("apple"), color: textCol<s>("red"), tasty: booleanCol<s>(true) },
        { name: textCol<s>("orange"), color: textCol<s>("orange"), tasty: booleanCol<s>(true) },
        { name: textCol<s>("banana"), color: textCol<s>("yellow"), tasty: booleanCol<s>(false) }
    ]);
}

function selectTree<s>(q: Q<s>) {
    return selectValues(q, [
        { name: textCol<s>("apple"), size: textCol<s>("small") },
        { name: textCol<s>("banana"), size: textCol<s>("large") }
    ]);
}

test("fromTup ELit", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        const fruit = selectFruit(q);
        order(q, fruit.name, Order.Asc);

        const tree = leftJoin(q,
            q => {
                const tree = selectTree(q);
                return {
                    treeName: tree.name,
                    treeSize: tree.size,
                    foo: nullCol<Inner<{}>>()
                };
            },
            row => e(row.treeName, "=", fruit.name)
        );

        return {
            fruitName: fruit.name,
            fruitColor: fruit.color,
            fruitTasty: fruit.tasty,
            treeSize: tree.treeSize,
            treeFoo: tree.foo
        };
    });

    const expected: typeof actual = [
        { fruitName: "apple", fruitColor: "red", fruitTasty: true, treeSize: "small", treeFoo: null },
        { fruitName: "banana", fruitColor: "yellow", fruitTasty: false, treeSize: "large", treeFoo: null },
        { fruitName: "orange", fruitColor: "orange", fruitTasty: true, treeSize: null, treeFoo: null }
    ];

    t.deepEqual(actual, expected);
}));

test("fromTup ECast", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        const fruit = selectFruit(q);
        order(q, fruit.name, Order.Asc);

        const tree = leftJoin(q,
            q => {
                const tree = selectTree(q);
                return {
                    treeName: tree.name,
                    treeSize: tree.size,
                    foo: booleanCol<Inner<{}>>(false)
                };
            },
            row => e(row.treeName, "=", fruit.name)
        );

        return {
            fruitName: fruit.name,
            fruitColor: fruit.color,
            fruitTasty: fruit.tasty,
            treeSize: tree.treeSize,
            treeFoo: tree.foo
        };
    });

    const expected: typeof actual = [
        { fruitName: "apple", fruitColor: "red", fruitTasty: true, treeSize: "small", treeFoo: false },
        { fruitName: "banana", fruitColor: "yellow", fruitTasty: false, treeSize: "large", treeFoo: false },
        { fruitName: "orange", fruitColor: "orange", fruitTasty: true, treeSize: null, treeFoo: null }
    ];

    t.deepEqual(actual, expected);
}));

test("fromTup EInList", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        const fruit = selectFruit(q);
        order(q, fruit.name, Order.Asc);

        const tree = leftJoin(q,
            q => {
                const tree = selectTree(q);
                return {
                    treeName: tree.name,
                    treeSize: tree.size,
                    foo: inList<Inner<{}>, string>(textCol("X"), [textCol("Y")])
                };
            },
            row => e(row.treeName, "=", fruit.name)
        );

        return {
            fruitName: fruit.name,
            fruitColor: fruit.color,
            fruitTasty: fruit.tasty,
            treeSize: tree.treeSize,
            treeFoo: tree.foo
        };
    });

    const expected: typeof actual = [
        { fruitName: "apple", fruitColor: "red", fruitTasty: true, treeSize: "small", treeFoo: false },
        { fruitName: "banana", fruitColor: "yellow", fruitTasty: false, treeSize: "large", treeFoo: false },
        { fruitName: "orange", fruitColor: "orange", fruitTasty: true, treeSize: null, treeFoo: null }
    ];

    t.deepEqual(actual, expected);
}));

test("fromTup EInQuery", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        const fruit = selectFruit(q);
        order(q, fruit.name, Order.Asc);

        const tree = leftJoin(q,
            q => {
                const tree = selectTree(q);
                return {
                    treeName: tree.name,
                    treeSize: tree.size,
                    foo: inQuery<Inner<{}>, string>(textCol("X"), q => {
                        const fruit = selectFruit(q);
                        restrictEq(q, fruit.name, textCol("blah"));
                        return textCol("Y");
                    })
                };
            },
            row => e(row.treeName, "=", fruit.name)
        );

        return {
            fruitName: fruit.name,
            fruitColor: fruit.color,
            fruitTasty: fruit.tasty,
            treeSize: tree.treeSize,
            treeFoo: tree.foo
        };
    });

    const expected: typeof actual = [
        { fruitName: "apple", fruitColor: "red", fruitTasty: true, treeSize: "small", treeFoo: false },
        { fruitName: "banana", fruitColor: "yellow", fruitTasty: false, treeSize: "large", treeFoo: false },
        { fruitName: "orange", fruitColor: "orange", fruitTasty: true, treeSize: null, treeFoo: null }
    ];

    t.deepEqual(actual, expected);
}));

test("fromTup EExists", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        const fruit = selectFruit(q);
        order(q, fruit.name, Order.Asc);

        const tree = leftJoin(q,
            q => {
                const tree = selectTree(q);
                return {
                    treeName: tree.name,
                    treeSize: tree.size,
                    foo: exists<Inner<{}>>(q => {
                        const fruit = selectFruit(q);
                        restrictEq(q, fruit.name, textCol("blah"));
                        return arbitrary();
                    })
                };
            },
            row => e(row.treeName, "=", fruit.name)
        );

        return {
            fruitName: fruit.name,
            fruitColor: fruit.color,
            fruitTasty: fruit.tasty,
            treeSize: tree.treeSize,
            treeFoo: tree.foo
        };
    });

    const expected: typeof actual = [
        { fruitName: "apple", fruitColor: "red", fruitTasty: true, treeSize: "small", treeFoo: false },
        { fruitName: "banana", fruitColor: "yellow", fruitTasty: false, treeSize: "large", treeFoo: false },
        { fruitName: "orange", fruitColor: "orange", fruitTasty: true, treeSize: null, treeFoo: null }
    ];

    t.deepEqual(actual, expected);
}));

test("fromTup EBinOp", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        const fruit = selectFruit(q);
        order(q, fruit.name, Order.Asc);

        const tree = leftJoin(q,
            q => {
                const tree = selectTree(q);
                return {
                    treeName: tree.name,
                    treeSize: tree.size,
                    foo: e<Inner<{}>>(textCol("a"), "||", textCol("b"))
                };
            },
            row => e(row.treeName, "=", fruit.name)
        );

        return {
            fruitName: fruit.name,
            fruitColor: fruit.color,
            fruitTasty: fruit.tasty,
            treeSize: tree.treeSize,
            treeFoo: tree.foo
        };
    });

    const expected: typeof actual = [
        { fruitName: "apple", fruitColor: "red", fruitTasty: true, treeSize: "small", treeFoo: "ab" },
        { fruitName: "banana", fruitColor: "yellow", fruitTasty: false, treeSize: "large", treeFoo: "ab" },
        { fruitName: "orange", fruitColor: "orange", fruitTasty: true, treeSize: null, treeFoo: null }
    ];

    t.deepEqual(actual, expected);
}));
