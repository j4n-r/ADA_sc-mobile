import axios from 'axios';
import { config } from '../app.config';

interface User {
  email: String;
  password: String;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  // Add any other expected fields from your auth response
}

export async function authUser({ email, password }: User): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      `${config.API_BASE_URL}/auth/token`,
      {
        email: email,
        password: password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Axios throws for non-2xx status codes by default,
    // so no need to check res.ok explicitly like with fetch.
    console.log(response.data);

    return response.data; // response.data contains the JSON payload
  } catch (e: any) {
    let errorMessage = 'Authentication failed';
    if (axios.isAxiosError(e) && e.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Auth Error Data:', e.response.data);
      console.error('Auth Error Status:', e.response.status);
      errorMessage =
        e.response.data?.message ||
        e.response.data?.error ||
        `Request failed with status ${e.response.status}`;
    } else if (axios.isAxiosError(e) && e.request) {
      // The request was made but no response was received
      console.error('Auth Error Request:', e.request);
      errorMessage = 'No response from server.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Auth Error Message:', e.message);
      errorMessage = e.message;
    }
    // await logAuthEvent('login_error', { email, error: errorMessage }); // If using logging
    throw new Error(errorMessage);
  }
}
