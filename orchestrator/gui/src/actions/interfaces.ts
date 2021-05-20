/* eslint-disable @typescript-eslint/no-explicit-any */
import { RSAAAction } from 'redux-api-middleware';

export type Payload = Record<string, any>
export type Meta = Record<string, any>
export type Type = string | {
    type: string;
    meta: Meta;
};

// Action Results
export interface MinimalAction {
    type: Type;
    asyncDispatch: (action: RSAAAction | BasicAction) => void;
}

export interface BasicAction extends MinimalAction {
    payload: Payload;
    meta?: Meta;
}

export type ActionRequestResult = BasicAction;

export interface ActionSuccessResult extends BasicAction {
    payload: Payload;
    meta?: Meta;
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
    meta?: Meta;
}
