import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  styled,
  alpha,
} from "@mui/material";
import { DeliveryDining, Schedule, Star } from "@mui/icons-material";

const RestaurantCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "all 0.3s ease",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
}));

const StyledCardMedia = styled(CardMedia)({
  height: 180,
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
  },
});

const RatingChip = styled(Chip)(({}) => ({
  position: "absolute",
  top: 12,
  left: 12,
  backgroundColor: "#f09600",
  color: "white",
  fontWeight: "bold",
  zIndex: 1,
}));

const DeliveryInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const CuisineChip = styled(Chip)(({ theme }) => ({
  marginTop: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.text.secondary,
}));

function Restaurants() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/restaurantMenu");
  };

  const restaurants = [
    {
      id: 1,
      name: "Burger Palace",
      cuisine: "Fast Food",
      image: "card-burger.jpg",
      rating: 4.5,
      deliveryTime: "15-30 min",
      deliveryFee: "Free",
      minOrder: "TK 200",
    },
    {
      id: 2,
      name: "Spice Route",
      cuisine: "Eastern Cuisine",
      image: "card-nihari.jpeg",
      rating: 4.2,
      deliveryTime: "25-40 min",
      deliveryFee: "TK 49",
      minOrder: "TK 300",
    },
    {
      id: 3,
      name: "Pizza Heaven",
      cuisine: "Italian",
      image: "card-fries.jpg",
      rating: 4.7,
      deliveryTime: "20-35 min",
      deliveryFee: "TK 39",
      minOrder: "TK 250",
    },
    {
      id: 4,
      name: "Sushi World",
      cuisine: "Japanese",
      image: "card-burger.jpg",
      rating: 4.8,
      deliveryTime: "30-45 min",
      deliveryFee: "TK 59",
      minOrder: "TK 400",
    },
    {
      id: 5,
      name: "Taco Fiesta",
      cuisine: "Mexican",
      image: "card-nihari.jpeg",
      rating: 4.3,
      deliveryTime: "20-30 min",
      deliveryFee: "TK 49",
      minOrder: "TK 350",
    },
    {
      id: 6,
      name: "Noodle Bar",
      cuisine: "Chinese",
      image: "card-fries.jpg",
      rating: 4.1,
      deliveryTime: "15-25 min",
      deliveryFee: "Free",
      minOrder: "TK 300",
    },
    {
      id: 7,
      name: "Noodle Bar",
      cuisine: "Chinese",
      image: "card-fries.jpg",
      rating: 4.1,
      deliveryTime: "15-25 min",
      deliveryFee: "Free",
      minOrder: "TK 300",
    },
    {
      id: 8,
      name: "Noodle Bar",
      cuisine: "Chinese",
      image: "card-fries.jpg",
      rating: 4.1,
      deliveryTime: "15-25 min",
      deliveryFee: "Free",
      minOrder: "TK 300",
    },
  ];

  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, maxWidth: 1400, margin: "0 auto" }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 4,
          fontWeight: 700,
          color: "text.primary",
          textAlign: { xs: "center", md: "left" },
        }}
      >
        Popular Restaurants
      </Typography>

      <Grid container spacing={3}>
        {restaurants.map((restaurant) => (
          <Grid item key={restaurant.id} xs={12} sm={6} md={4} lg={4}>
            <RestaurantCard onClick={handleClick}>
              <StyledCardMedia image={restaurant.image} alt={restaurant.name}>
                <RatingChip
                  size="small"
                  icon={<Star fontSize="small" />}
                  label={restaurant.rating}
                />
              </StyledCardMedia>
              <CardContent sx={{ pt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 600 }}
                  >
                    {restaurant.name}
                  </Typography>
                </Box>

                <CuisineChip label={restaurant.cuisine} size="small" />

                <DeliveryInfo>
                  <Schedule fontSize="small" />
                  <Typography variant="body2">
                    {restaurant.deliveryTime}
                  </Typography>
                  <DeliveryDining
                    fontSize="small"
                    sx={{ ml: 1, color: "#7f8488" }}
                  />
                  <Typography variant="body2">
                    {restaurant.deliveryFee}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: "auto" }}>
                    Min: {restaurant.minOrder}
                  </Typography>
                </DeliveryInfo>
              </CardContent>
            </RestaurantCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Restaurants;
