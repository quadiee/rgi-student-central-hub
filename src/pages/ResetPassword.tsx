import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// PERSONALISE: use your Supabase credentials
const supabase = createClient(
  "https://hsmavqldffsxetwyyhgj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbWF2cWxkZmZzeGV0d3l5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDAyNDYsImV4cCI6MjA2NjMxNjI0Nn0.-IgvTTnQcoYd2Q1jIH9Nt3zTcrnUtMAxPe0UAFZguAE"
);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const query = useQuery();

  // Supabase will redirect here with access_token in the URL
  const access_token = query.get("access_token") || query.get("token"); // Support both formats

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!access_token) {
      setError("Invalid or missing reset token.");
      return;
    }
    setLoading(true);

    // PATCH: Supabase's updateUser does not accept accessToken in options.
    // Instead, set the user's session to the reset token (using setSession), then call updateUser.
    // This is the new supported way as of Supabase JS v2+.
    try {
      // Set the session with the access token from the URL
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token: access_token  // Supabase needs a refresh_token, so we just pass access_token again (it will work for password resets)
      });
      if (sessionError) {
        setError(sessionError.message || "Failed to initialize password reset session.");
        setLoading(false);
        return;
      }

      // Now call updateUser to set new password
      const { error: updateError } = await supabase.auth.updateUser({ password });
      setLoading(false);

      if (updateError) {
        setError(updateError.message || "Failed to reset password. Please try again.");
      } else {
        setDone(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err: any) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded shadow text-center">
        <h2 className="text-xl font-bold text-green-700 mb-3">Password Updated!</h2>
        <p>Your password has been changed. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Set a New Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Setting Password..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;