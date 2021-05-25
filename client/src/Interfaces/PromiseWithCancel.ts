export interface PromiseWithCancel<T> extends Promise<T> {
    cancel: () => void;
    dateTime: Date;
    name: string;
}
