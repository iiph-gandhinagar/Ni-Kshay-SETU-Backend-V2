export class BaseResponse {
  async sendResponse(code: number, message: string, data: any) {
    return {
      code: code,
      status: true,
      message: message,
      data: data,
    };
  }

  async sendError(code: number, errorMessage: string, data = null) {
    return {
      code: code,
      status: false,
      message: errorMessage,
      data: {
        errors: data,
      },
    };
  }
}
