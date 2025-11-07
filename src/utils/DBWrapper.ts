//@ts-nocheck
/*
 * @Author: hongbin
 * @Date: 2023-04-21 18:09:32
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-21 18:25:55
 * @Description:
 */
class DBWrapper {
    _name: any;
    _version: any;
    _onupgradeneeded: any;
    _db: null;
    constructor(
        name: any,
        version: any,
        { onupgradeneeded, onversionchange = this._onversionchange } = {}
    ) {
        this._name = name;
        this._version = version;
        this._onupgradeneeded = onupgradeneeded;
        this._onversionchange = onversionchange;

        this._db = null;

        const methodsToWrap = {
            readonly: ["get", "count", "getKey", "getAll", "getAllKeys"],
            readwrite: ["add", "put", "clear", "delete"],
        };

        for (const [mode, methods] of Object.entries(methodsToWrap)) {
            for (const method of methods) {
                if (method in IDBObjectStore.prototype) {
                    DBWrapper.prototype[method] = async function (
                        storeName: any,
                        ...args: any
                    ) {
                        return await this._call(
                            method,
                            storeName,
                            mode,
                            ...args
                        );
                    };
                }
            }
        }
    }

    get db() {
        return this._db;
    }

    async open() {
        if (this._db) return;
        this._db = await new Promise((resolve, reject) => {
            let openRequestTimedOut = false;
            setTimeout(() => {
                openRequestTimedOut = true;
                reject(new Error("The open request was blocked and timed out"));
            }, this.OPEN_TIMEOUT);
            const openRequest = indexedDB.open(this._name, this._version);

            openRequest.onerror = () => reject(openRequest.error);

            openRequest.onupgradeneeded = (evt) => {
                if (openRequestTimedOut) {
                    openRequest.transaction.abort();
                    evt.target.result.close();
                } else if (this._onupgradeneeded) {
                    this._onupgradeneeded(evt);
                }
            };

            openRequest.onsuccess = ({ target }) => {
                const db = target.result;

                if (openRequestTimedOut) {
                    db.close();
                } else {
                    db.onversionchange = this._onversionchange.bind(this);
                    resolve(db);
                }
            };
        });
        return this;
    }
    OPEN_TIMEOUT(arg0: () => void, OPEN_TIMEOUT: any) {
        throw new Error("Method not implemented.");
    }

    async getKey(storeName: any, query: any) {
        return (await this.getAllKeys(storeName, query, 1))[0];
    }

    async getAll(storeName: any, query: any, count: any) {
        return await this.getAllMatching(storeName, {
            query,
            count,
        });
    }

    async getAllKeys(storeName: any, query: any, count: number) {
        return (
            await this.getAllMatching(storeName, {
                query,
                count,
                includeKeys: true,
            })
        ).map(({ key }) => key);
    }

    async getAllMatching(
        storeName: any,
        { index, query = null, direction = "next", count, includeKeys } = {}
    ) {
        return await this.transaction(
            [storeName],
            "readonly",
            (
                txn: { objectStore: (arg0: any) => any },
                done: (arg0: any[]) => void
            ) => {
                const store = txn.objectStore(storeName);
                const target = index ? store.index(index) : store;
                const results: any[] = [];

                target.openCursor(query, direction).onsuccess = ({
                    target,
                }) => {
                    const cursor = target.result;

                    if (cursor) {
                        const { primaryKey, key, value } = cursor;
                        results.push(
                            includeKeys
                                ? {
                                      primaryKey,
                                      key,
                                      value,
                                  }
                                : value
                        );

                        if (count && results.length >= count) {
                            done(results);
                        } else {
                            cursor.continue();
                        }
                    } else {
                        done(results);
                    }
                };
            }
        );
    }

    async transaction(
        storeNames: any[],
        type: string,
        callback: {
            (txn: any, done: any): void;
            (txn: any, done: any): void;
            (arg0: any, arg1: (value: any) => void): void;
        }
    ) {
        await this.open();
        return await new Promise((resolve, reject) => {
            const txn = this._db.transaction(storeNames, type);

            txn.onabort = ({ target }) => reject(target.error);

            txn.oncomplete = () => resolve();

            callback(txn, (value: unknown) => resolve(value));
        });
    }

    async _call(method: string, storeName: any, type: string, ...args: any[]) {
        const callback = (
            txn: {
                objectStore: (arg0: any) => {
                    (): any;
                    new (): any;
                    [x: string]: (arg0: any) => {
                        (): any;
                        new (): any;
                        onsuccess: ({ target }: { target: any }) => void;
                    };
                };
            },
            done: (arg0: any) => void
        ) => {
            txn.objectStore(storeName)[method](...args).onsuccess = ({
                target,
            }) => {
                done(target.result);
            };
        };

        return await this.transaction([storeName], type, callback);
    }

    _onversionchange() {
        this.close();
    }

    close() {
        if (this._db) {
            this._db.close();

            this._db = null;
        }
    }

    static async deleteDatabase(name: string) {
        await new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(name);

            request.onerror = ({ target }) => {
                reject(target.error);
            };

            request.onblocked = () => {
                reject(new Error("Delete blocked"));
            };

            request.onsuccess = () => {
                resolve();
            };
        });
    }
}

DBWrapper.prototype.OPEN_TIMEOUT = 2000;

export default DBWrapper;
