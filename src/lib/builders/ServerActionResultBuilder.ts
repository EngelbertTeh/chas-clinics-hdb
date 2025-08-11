import { ServerActionResult } from "@/types/ServerActionResult";

export class ServerActionResultBuilder<T = undefined> {
    private result: ServerActionResult<T>;

    constructor() {
        this.result = {
            success: false,
        };
    }

    success(data?: T extends undefined ? [] : T): ServerActionResult<T> {
        this.result.success = true;
        if (data) {
            this.result.data = data;
        }
        return this.result;
    }

    error(message: string) {
        this.result.error = message;
        return this.result;
    }
}
