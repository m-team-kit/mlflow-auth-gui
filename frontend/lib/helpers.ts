export class NetworkError extends Error {
  response: Response;

  constructor(response: Response) {
    super(response.statusText);
    this.response = response;
  }
}

export const jsonIfOk = async (response: Response) => {
  if (response.ok) {
    return response.json();
  } else {
    throw new NetworkError(response);
  }
};

export const ifOk = async (response: Response) => {
  if (response.ok) {
    return response;
  } else {
    throw new NetworkError(response);
  }
};
