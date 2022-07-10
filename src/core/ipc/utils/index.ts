import { IProcessMessagePortMap, TProcessKey, IIpcMessageCtx, IRequestResponse, IHandleMessageParams, IIpcMessage } from '../typings';
import { CODE_RQUEST_SUCCESS } from '../constants';
import { getUuid } from './uuid';

export const getRenderProcessKey = (renderSender: Electron.webContents, processMessagePortMap: IProcessMessagePortMap): TProcessKey => {
  const id = renderSender.id;
  const hasValue = !!processMessagePortMap[id];
  if (hasValue) {
    throw new Error(`the id ${id} is already exists`);
  }
  return id;
};

export const generateMessageCtx = (params: IHandleMessageParams): IIpcMessageCtx => {
  const { message, resolveHandle } = params;
  const { headers } = message;
  const ctx: IIpcMessageCtx = {
    ...message,
    request: {
      resolve: function (result: any) {
        const requestResponse: IRequestResponse = {
          headers,
          data: {
            code: CODE_RQUEST_SUCCESS,
            body: result,
          },
        };
        resolveHandle(requestResponse);
      },
    },
  };
  return ctx;
};

export const generateIpcMessage = (channel: string, args?: any): IIpcMessage => {
  return {
    channel,
    headers: {
      reqId: getUuid(),
    },
    data: {
      body: args,
    },
  };
};