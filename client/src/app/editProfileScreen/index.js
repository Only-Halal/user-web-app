import React, { useContext, useState, useEffect } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { AppContext } from "../../context/appContext";
import { statesList, stateZipRanges } from "../../components/states";
import { app_url } from "../../url";
import Header from "../../components/header"; 
import "../../styles/EditProfileScreen.css";

const EditProfileScreen = () => {
  const { data, authToken, setData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    zipcode: '',
    currentPassword: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [zipError, setZipError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${app_url}/getUserData/${userId}`, { 
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const result = await response.json();
      
      if (result.success && result.user) {
        setUserData({
          username: result.user.username || '',
          email: result.user.email || '',
          phone: result.user.phone || '',
          state: result.user.state || '',
          city: result.user.city || '',
          zipcode: result.user.zipcode || '',
          currentPassword: "",
        });
        console.log('result', result);
        setLoading(false);
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to fetch user data",
          severity: "error",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setSnackbar({
        open: true,
        message: "Error fetching user data",
        severity: "error",
      });
      setLoading(false);
    }
  };

  if (userId && authToken) {
    fetchUserData();
  }
}, [userId, authToken]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleUpdate = async () => {
    if (!userData.username) {
      setSnackbar({
        open: true,
        message: "Username is required",
        severity: "error",
      });
      return;
    }

    try {
      const updateUser = await fetch(`${app_url}/updateUser/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: userData.username,
          phone: userData.phone,
          state: userData.state,
          city: userData.city,
          zipcode: userData.zipcode,
          ...(isPasswordVisible && {
            currentPassword: userData.currentPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
          }),
        }),
      });

      const result = await updateUser.json();

      if (result.success) {
        setData((prevData) => ({
          ...prevData,
          user: {
            ...prevData.user,
            username: userData.username,
            phone: userData.phone,
            state: userData.state,
            city: userData.city,
            zipcode: userData.zipcode,
          },
        }));
        
        setSnackbar({
          open: true,
          message: result.message || "Profile updated successfully",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to update profile",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    }
  };

  const handleChange = (field, value) => {
    setUserData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const isValidUSZip = (zip) => {
    const zipNum = parseInt(zip, 10);
    return Object.values(stateZipRanges).some(([start, end]) => {
      return zipNum >= parseInt(start) && zipNum <= parseInt(end);
    });
  };

  const handleZipChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    handleChange("zipcode", cleaned);
    if (cleaned.length === 5) {
      if (isValidUSZip(cleaned)) {
        setZipError(null);
      } else {
        setZipError("Invalid ZIP code");
      }
    } else {
      setZipError(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // if (loading) {
  //   return <div>Loading user data...</div>;
  // }

  return (
    <>
      <Header name="Update Profile" />
      <Box className="edit-profile-container">
        <Box className="form-container">
          <Box className="input-group">
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={userData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              InputProps={{ style: { fontFamily: "Roboto, sans-serif" } }}
            />
          </Box>
          <Box className="input-group">
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={userData.email}
              disabled
              InputProps={{
                style: { fontFamily: "Roboto, sans-serif", color: "#666" },
              }}
            />
          </Box>
          <Box className="input-group">
            <TextField
              label="Phone (include country code)"
              variant="outlined"
              fullWidth
              value={userData.phone}
              onChange={(e) => {
                let sanitizedText = e.target.value.replace(/[^0-9+]/g, "");
                if (sanitizedText.length > 0 && sanitizedText[0] === "1") {
                  sanitizedText = sanitizedText.slice(1);
                }
                if (sanitizedText.length > 12) {
                  sanitizedText = sanitizedText.slice(0, 12);
                }
                handleChange("phone", sanitizedText);
              }}
              InputProps={{ style: { fontFamily: "Roboto, sans-serif" } }}
            />
          </Box>
          <Box className="input-group">
            <FormControl fullWidth variant="outlined">
              <InputLabel>State</InputLabel>
              <Select
                label="State"
                value={userData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                {statesList.map((state) => (
                  <MenuItem key={state.value} value={state.value}>
                    {state.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box className="input-group">
            <TextField
              label="City"
              variant="outlined"
              fullWidth
              value={userData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              InputProps={{ style: { fontFamily: "Roboto, sans-serif" } }}
            />
          </Box>
          <Box className="input-group">
            <TextField
              label="Zipcode"
              variant="outlined"
              fullWidth
              value={userData.zipcode}
              onChange={(e) => handleZipChange(e.target.value)}
              inputProps={{ maxLength: 5 }}
              error={!!zipError}
              helperText={zipError}
              InputProps={{ style: { fontFamily: "Roboto, sans-serif" } }}
            />
          </Box>
          <Box className="separator" />
          {isPasswordVisible && (
            <>
              <Box className="input-group">
                <TextField
                  label="Current Password"
                  variant="outlined"
                  fullWidth
                  type="password"
                  value={userData.currentPassword}
                  onChange={(e) => handleChange("currentPassword", e.target.value)}
                  InputProps={{ style: { fontFamily: "Roboto, sans-serif" } }}
                />
              </Box>
              <Box className="input-group">
                <TextField
                  label="New Password"
                  variant="outlined"
                  fullWidth
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{ style: { fontFamily: "Roboto, sans-serif" } }}
                />
              </Box>
              <Box className="input-group">
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  fullWidth
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{ style: { fontFamily: "Roboto, sans-serif" } }}
                />
              </Box>
            </>
          )}
          <Button
            variant="contained"
            className="change-password-button"
            onClick={togglePasswordVisibility}
          >
            {isPasswordVisible ? "Cancel Password Change" : "Change Password"}
          </Button>
          <Button
            variant="contained"
            className="update-button"
            onClick={handleUpdate}
          >
            Update
          </Button>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
        >
          <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default EditProfileScreen;