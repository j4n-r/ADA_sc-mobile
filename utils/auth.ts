import { config } from '../app.config';
interface User {
  email: String;
  password: String;
}

export async function authUser({ email, password }: User) {
  console.log(config.API_BASE_URL);
  const res = await fetch(`${config.API_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email, password: password }),
  });

  console.log(res);
  if (!res.ok) {
    throw new Error('Authentication failed');
  }
  return res.json();
}
