export type ServerActionResult<T = undefined> = {
    success: boolean;
    data?: T extends undefined ? [] : T;
    error?: string;
};
