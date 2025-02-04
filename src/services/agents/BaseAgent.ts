import { BaseStateProps } from "../../types/typesState";

export abstract class BaseAgent {
    protected id: string;
    protected state: BaseStateProps;

    constructor(id: string) {
        this.id = id;
        this.state = {
            id,
            status: "idle",
            input:null,
            timestamp: new Date()
        };
    }

    //abstract process(input:any): Promise<any>;

    protected async setState ( newState: Partial<BaseStateProps> ) {
        this.state = { 
            ...this.state, 
            ...newState,
            timestamp: new Date()
        };
        return this.state;
    }
    
    public getState() {
        return this.state;
    }

    protected async handleError(error: Error):Promise<void> {
        await this.setState({
            status: "error",
            error
        })
        throw error;
    }
}