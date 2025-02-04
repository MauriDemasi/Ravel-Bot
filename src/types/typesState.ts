export type BaseStateProps = {
    id: string;
    status: "idle" | "processing" | "completed" | "error";
    input: any;
    output?: any;
    error?: Error;
    timestamp: Date;

}

