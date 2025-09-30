import { Box, Typography } from "@mui/material";

export default function AboutPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        About This App
      </Typography>
      <Typography>
        1. The Editor lets you view and edit release note text.
        <br />
        2. The Usage page shows your local counters for token usage and latency.
        <br />
        3. The Configuration page allows you to connect a GitHub repository and review prompt templates.
        <br />
        4. The About page provides these instructions.
      </Typography>
    </Box>
  );
}
