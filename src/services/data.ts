
class BoundElement {
    public elem: Element;
    public symbol: string;
    public binder: DataBinder;

    public refresh(val: any = undefined): void {
        const value = val ? val : this.binder.resolve(this.symbol);
        const strValue = value ? ('' + value) : undefined;
        console.log('bound value was', strValue);
        if (this.elem instanceof HTMLInputElement){
            const input = this.elem as HTMLInputElement;
            input.value = strValue;
        } else {
            this.elem.innerHTML = strValue;
        }
    }

    public async write(data: any): Promise<void> {
        this.binder.write(this.symbol, data);
    }
}

class DataProvider<T> {
    public getter: () => T;
    public setter: (v: T) => void;
}

class DataListener<T> {
    public symbol: string;
    public callback: (arg: T) => void;
}

class DataBinder {

    dataMap: Map<string, any> = new Map<string, any>();
    elements: Map<Element, BoundElement> = new Map<Element, BoundElement>();
    callbacks: Map<string, Array<DataListener<any>>> = new Map<string, Array<DataListener<any>>>();


    public resolve<T>(symbol: string): T {
        if (this.dataMap.has(symbol)){
            return this.dataMap.get(symbol).getter();
        } else {
            return undefined;
        }
    }

    public async write<T>(symbol: string, next: T):Promise<void> {
        if (this.dataMap.has(symbol)){
            const provider = this.dataMap.get(symbol);
            await provider.setter(next);
        } else {
            throw ('there is no data provider for the symbol, ' + symbol);
        }
    }

    public provide<T>(symbol: string, getter: () => T, setter: (v: T) => void): DataProvider<T> {
        var provider = new DataProvider<T>();
        if (this.dataMap.has(symbol)){
            provider = this.dataMap.get(symbol);



        }
        provider.getter = getter;
        provider.setter = (val => {
            if (this.callbacks.has(symbol)){
                this.callbacks.get(symbol).forEach(cb => cb.callback(val));
            }
            setter(val);
        });

        const firstValue = getter();
        if (firstValue){
            if (this.callbacks.has(symbol)){
                this.callbacks.get(symbol).forEach(cb => cb.callback(firstValue));
            }
        }

        console.log('provided ', symbol, ' with a new setter', getter());
        this.dataMap.set(symbol, provider);
        return provider;
    }



    public on<T>(symbol: string, callback: (v:T)=>void): DataListener<T> {
        const listener = new DataListener<T>();
        listener.symbol = symbol;
        listener.callback = callback;
        if (this.callbacks.has(symbol)){
            this.callbacks.get(symbol).push(listener);
        } else {
            this.callbacks.set(symbol, [listener]);
        }
        if (this.dataMap.has(symbol)){
            listener.callback(this.resolve(symbol));
        }
        return listener;
    }

    public bindElem(elem: Element): BoundElement {
        const attr = elem.getAttribute('data-bind');
        if (!attr) return;

        if (!this.dataMap.has(attr)){
            this.provide(attr, () => undefined, v => {});
        }

        const provider = this.dataMap.get(attr);
        const bound = new BoundElement();
        bound.elem = elem;
        bound.symbol = attr;
        bound.binder = this;
        this.elements.set(elem, bound);
        this.on(attr, s => bound.refresh(s));

        if (elem instanceof HTMLInputElement){
            const input = elem as HTMLInputElement;

            let schedule: NodeJS.Timeout;
            const scheduleWrite = () => {
                const originalValue = input.value;
                if (schedule !== undefined){
                    clearTimeout(schedule);
                }
                schedule = setTimeout(() => {
                    // if (input.value == originalValue){
                    //     return;
                    // }
                    bound.write(input.value);
                }, 300);
            }

            input.addEventListener('keyup', (evt: Event) => {
                scheduleWrite();
            });
            input.addEventListener('blur', (evt: Event) => {
                scheduleWrite();
            });
        }

        bound.refresh();
        return bound;
    }

    public refreshElements(): void {
        this.elements.forEach((bound, elem) => {
            console.log('refreshing elem');
            bound.refresh();
        });
    }

}

const srvc = new DataBinder();

export default srvc;
