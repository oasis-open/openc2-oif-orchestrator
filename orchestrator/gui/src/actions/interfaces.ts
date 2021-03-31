import { RSAAAction } from 'redux-api-middleware';

type Type = string | {
    type: string;
    meta: Record<string, any>;
};

// Action Results
export interface MinimalAction {
    type: Type;
    asyncDispatch: (action: RSAAAction | BasicAction) => void;
}

export interface BasicAction extends MinimalAction {
    payload: Record<string, any>;
    meta?: Record<string, any>;
}

export type ActionRequestResult = BasicAction;

export interface ActionSuccessResult extends BasicAction {
    payload: Record<string, any>;
    meta?: Record<string, any>;
}

export interface ActionFailureResult extends BasicAction  {
    payload: {
        message: string;
        name: string;
        response: any;
        status: number;
        statusText: string;
        stack: string;
    };
    meta?: Record<string, any>;
}
