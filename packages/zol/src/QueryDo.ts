import { Query } from "./Query/Type";

declare var global: any;
(<any>global).Promise = Query;

export function doQ<S, T>(f: () => Promise<T>): Query<S, T> {
    console.log("doQ start");
    const result = <any>f();
    console.log("doQ end");
    return result;
    /*
    console.log("doQ");
    const saved = (<any>global).Promise;
    (<any>global).Promise = Query;
    const p = f().then(result => {
        (<any>global).Promise = saved;
        return result;
    });
    return <any>p;
    */
}
