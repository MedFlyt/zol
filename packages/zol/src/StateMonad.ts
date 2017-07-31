export interface State<s, a> {
    readonly runState: (x: s) => [a, s];
}

export function pure<s, a>(a: a): State<s, a> {
    const result: State<s, a> = {
        runState: s => [a, s]
    };
    return result;
}

export function bind<s, a, b>(lhs: State<s, a>, rhs: (x: a) => State<s, b>): State<s, b> {
    const result: State<s, b> = {
        runState: s => {
            const [a, s2] = lhs.runState(s);
            return rhs(a).runState(s2);
        }
    };
    return result;
}

export function get<s>(): State<s, s> {
    const result: State<s, s> = {
        runState: s => [s, s]
    };
    return result;
}

export function put<s>(s: s): State<s, void> {
    const result: State<s, void> = {
        runState: () => [undefined, s]
    };
    return result;
}

export function modify<s>(f: (v: s) => s): State<s, void> {
    return bind(get(), x => put(f(x)));
}

export function evalState<s, a>(act: State<s, a>, v: s): a {
    const t = act.runState(v);
    return t[0];
}

export function execState<s, a>(act: State<s, a>, v: s): s {
    const t = act.runState(v);
    return t[1];
}

// --------------------------------------------------------------------
// Generic Monad functions (specialized for State)
// --------------------------------------------------------------------

export function mapM<s, a, b>(f: (x: a) => State<s, b>, elems: a[]): State<s, b[]> {
    if (elems.length === 0) {
        return pure([]);
    } else {
        const x = elems[0];
        const xs = elems.slice(1);
        return bind(f(x), y => bind(mapM(f, xs), ys => pure([y].concat(ys))));
    }
}

export function sequence<s, a>(actions: State<s, a>[]): State<s, a[]> {
    if (actions.length === 0) {
        return pure([]);
    } else {
        const x = actions[0];
        const xs = actions.slice(1);
        return bind(x, y => bind(sequence(xs), ys => pure([y].concat(ys))));
    }
}
