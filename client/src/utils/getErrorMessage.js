export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err?.response) return 'Unable to connect to the server. Please try again.';
  if (err.response.status === 401) return 'Your session has expired. Please log in again.';
  return err.response.data?.message || fallback;
}