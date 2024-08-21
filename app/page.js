"use client";
import { Container, Box, Stack, Dialog, TextField, Typography, Button } from "@mui/material";
import { useState } from "react";
import { NavBar } from "./Components/navbar.js"

//Colors
const linen = "#FFF4E9";
const purple_main = "#8D6B94";
const purple_light = "#B185A7";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I am here to help you find a suitable professor. Please describe the type of professor you are looking for.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState(false);
  const [input, setInput] = useState("");


  const handleSubmit = async () => {
    setDialog(false);
    setInput("");

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: input }),  
    });

      const data = await res.json();
    } catch (error) {
      console.error('Error:', error);
    }

  };

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    setMessage("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }

        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);

          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });

        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      bgcolor={linen}
    >
      <Container width="100xw">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mt={10}
          mb={15}
        >
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 3 }}>
            The Professor Finder
          </Typography>

          <Stack
            direction="column"
            width="500px"
            height="500px"
            border="2px solid black"
            p={2}
            spacing={3}
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    message.role === "assistant" ? "flex-start" : "flex-end"
                  }
                >
                  <Box
                    bgcolor={
                      message.role === "assistant"
                        ? "primary.main"
                        : "secondary.main"
                    }
                    color="white"
                    p={3}
                    borderRadius="40px"
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                fullWidth
              />
              <Button variant="contained" onClick={sendMessage}>
                Send
              </Button>
            </Stack>
          </Stack>
          <Dialog open={dialog} onClose={() => setDialog(false)}>
          <Box p={2}>
            <Typography variant="h4">Add Professor</Typography>
            <Box mt={2}>
              <TextField
                fullWidth
                label="URL"
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </Box>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Dialog>
        </Box>
      </Container>

      
    </Box>
  );
}
