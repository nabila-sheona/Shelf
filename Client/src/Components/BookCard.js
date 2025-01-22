import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";

const palette = {
  pinkLight: "#f6a5c0",
  pink: "#F48FB1",
  blueLight: "#4fc3f7",
  pinkDark: "#FFC5D2",
  redLight: "#EF9A9A",
  purple: "#CE93D8",
  offWhite: "#FFF9E7",
  orangeLight: "#ffcdd2",
  violet: "#b39ddb",
};

export default function BookCard({ book, onClick }) {
  return (
    <Card
      sx={{
        maxWidth: 345,
        margin: "20px auto",
        boxShadow: 3,
        backgroundColor: palette.offWhite,
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          sx={{ color: palette.pink, mb: 1 }}
        >
          <Button
            onClick={() => onClick(book._id)}
            sx={{
              color: palette.blueLight,
              textDecoration: "underline",
              textTransform: "none",
              fontSize: "1rem",
              padding: 0,
              minWidth: "auto",
              background: "none",
              "&:hover": {
                textDecoration: "none",
                backgroundColor: "transparent",
              },
            }}
          >
            {book.name}
          </Button>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Author: {book.author}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Genres: {book.genre.join(", ")}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Rating: {book.rate || "N/A"} ({book.numberOfRatings} ratings)
        </Typography>
      </CardContent>
    </Card>
  );
}
