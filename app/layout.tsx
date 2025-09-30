// app/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Drawer,
  Box,
  IconButton,
  Tooltip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EditNoteIcon from "@mui/icons-material/EditNote";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";

const THEME = createTheme({
  palette: { mode: "dark" }, // adjust to taste
});

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const NAV_ITEMS = [
  { text: "Editor", href: "/editor", icon: <EditNoteIcon /> },
  { text: "Usage", href: "/usage", icon: <QueryStatsIcon /> },
  { text: "Configuration", href: "/config", icon: <SettingsIcon /> },
  { text: "About", href: "/about", icon: <InfoIcon /> },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState<boolean>(true);

  // persist the open state between reloads
  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("drawerOpen") : null;
    if (saved != null) setOpen(saved === "1");
  }, []);
  React.useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("drawerOpen", open ? "1" : "0");
  }, [open]);

  const drawerWidth = open ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={THEME}>
          <CssBaseline />

          {/* Top app bar shifts based on drawer width */}
          <AppBar
            position="fixed"
            elevation={1}
            sx={{
              ml: `${drawerWidth}px`,
              width: `calc(100% - ${drawerWidth}px)`,
              transition: (t) =>
                t.transitions.create(["margin-left", "width"], {
                  easing: t.transitions.easing.sharp,
                  duration: t.transitions.duration.shorter,
                }),
            }}
          >
            <Toolbar sx={{ minHeight: 56 }}>
              <Typography variant="h6" noWrap>
                Release Notes → Press Release
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Collapsible permanent drawer */}
          <Drawer
            variant="permanent"
            PaperProps={{
              sx: {
                overflowX: "hidden",
                whiteSpace: "nowrap",
                width: drawerWidth,
                boxSizing: "border-box",
                transition: (t) =>
                  t.transitions.create("width", {
                    easing: t.transitions.easing.sharp,
                    duration: t.transitions.duration.shorter,
                  }),
              },
            }}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
              },
            }}
          >
            {/* Brand header: icon toggles open/closed */}
            <Toolbar
              disableGutters
              sx={{
                minHeight: 56,
                px: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Tooltip title={open ? "Collapse" : "Expand"}>
                <IconButton
                  onClick={() => setOpen((v) => !v)}
                  size="small"
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                  }}
                  aria-label={open ? "Collapse navigation" : "Expand navigation"}
                >
                  <AutoAwesomeIcon fontSize="medium" />
                </IconButton>
              </Tooltip>

              {/* App name fades when collapsed */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  opacity: open ? 1 : 0,
                  pointerEvents: open ? "auto" : "none",
                  transition: (t) =>
                    t.transitions.create("opacity", {
                      easing: t.transitions.easing.easeOut,
                      duration: t.transitions.duration.shorter,
                    }),
                }}
              >
                Summariz0r
              </Typography>
            </Toolbar>

            <Divider />

            {/* Navigation items */}
            <List sx={{ py: 1 }}>
              {NAV_ITEMS.map((item) => {
                const selected =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const button = (
                  <ListItemButton
                    key={item.text}
                    component={Link}
                    href={item.href}
                    selected={selected}
                    sx={{
                      minHeight: 44,
                      px: open ? 2 : 1.25,
                      borderRadius: 1.5,
                      mx: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 1.75 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ noWrap: true }}
                      sx={{
                        opacity: open ? 1 : 0,
                        transition: (t) =>
                          t.transitions.create("opacity", {
                            easing: t.transitions.easing.easeOut,
                            duration: t.transitions.duration.shorter,
                          }),
                      }}
                    />
                  </ListItemButton>
                );

                // When collapsed, wrap with a tooltip so labels are still discoverable
                return open ? (
                  button
                ) : (
                  <Tooltip title={item.text} placement="right" key={item.text}>
                    {button}
                  </Tooltip>
                );
              })}
            </List>
          </Drawer>

          {/* Main content shifts based on drawer width */}
          <Box
            component="main"
            sx={{
              ml: `${drawerWidth}px`,
              p: 3,
              transition: (t) =>
                t.transitions.create("margin-left", {
                  easing: t.transitions.easing.sharp,
                  duration: t.transitions.duration.shorter,
                }),
            }}
          >
            <Toolbar sx={{ minHeight: 56 }} />
            {children}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
