"use client";

import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useEffect, useState } from "react";

interface Usage {
  id: number;
  tokensIn: number;
  tokensOut: number;
  duration: number;
}

export default function UsagePage() {
  const [usage, setUsage] = useState<Usage[]>([]);

  useEffect(() => {
    // fetch from API route later
    setUsage([
      { id: 1, tokensIn: 200, tokensOut: 500, duration: 1200 },
    ]);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        LLM Usage
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tokens In</TableCell>
            <TableCell>Tokens Out</TableCell>
            <TableCell>Duration (ms)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usage.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.tokensIn}</TableCell>
              <TableCell>{u.tokensOut}</TableCell>
              <TableCell>{u.duration}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
