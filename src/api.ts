const API = {
  baseUrl: 'http://localhost:8000/',
  async fetch(uri: string) {
    let url = new URL(uri, this.baseUrl);
    let response = await fetch(url.toString());
    if (!response.ok) {
      throw new APIError(response);
    }
    return response;
  }
};

export default API;

export class APIError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    if (message) {
      super(message);
    } else {
      super(`${response.status} ${response.statusText}`);
    }

    this.name = this.constructor.name;
    this.response = response;
  }
}
