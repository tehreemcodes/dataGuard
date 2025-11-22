import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 10 }}>
      <Typography variant="h5" mb={2}>Login</Typography>

      <TextField fullWidth label="Email" value={email}
        onChange={(e)=>setEmail(e.target.value)} margin="normal" />

      <TextField type="password" fullWidth label="Password"
        value={password} onChange={(e)=>setPassword(e.target.value)}
        margin="normal" />

      <Button variant="contained" fullWidth sx={{ mt: 2 }}>
        Login
      </Button>
    </Box>
  );
}
