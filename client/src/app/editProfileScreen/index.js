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
    username: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    zipcode: "",
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
      if (!userId || !authToken) {
        console.error("Missing userId or authToken");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching user data for userId:", userId);
        const response = await fetch(`${app_url}/getUserData/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);

        if (result.success && result.user) {
          console.log("User data:", result.user);
          setUserData({
            username: result.user.username || "",
            email: result.user.email || "",
            phone: result.user.phone || "",
            state: result.user.state || "",
            city: result.user.city || "",
            zipcode: result.user.zipcode || "",
            currentPassword: "",
          });
        } else {
          throw new Error(result.message || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSnackbar({
          open: true,
          message: error.message || "Error fetching user data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
      const response = await fetch(`${app_url}/updateUser/${userId}`, {
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
            newPassword,
            confirmPassword,
          }),
        }),
      });

      const result = await response.json();
      console.log("Update result:", result);

      if (result.success) {
        setData((prevData) => ({
          ...prevData,
          user: {
            ...prevData.user,
            ...userData,
          },
        }));

        setSnackbar({
          open: true,
          message: result.message || "Profile updated successfully",
          severity: "success",
        });
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred. Please try again.",
        severity: "error",
      });
    }
  };

  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
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
    setZipError(
      cleaned.length === 5 && !isValidUSZip(cleaned) ? "Invalid ZIP code" : null
    );
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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
            />
          </Box>
          <Box className="input-group">
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={userData.email}
              disabled
            />
          </Box>
          <Box className="input-group">
            <TextField
              label="Phone (include country code)"
              variant="outlined"
              fullWidth
              value={userData.phone}
              onChange={(e) => {
                let sanitized = e.target.value.replace(/[^0-9+]/g, "");
                if (sanitized.startsWith("1")) sanitized = sanitized.slice(1);
                handleChange("phone", sanitized.slice(0, 12));
              }}
            />
          </Box>
          <Box className="input-group">
            <FormControl fullWidth variant="outlined">
              <InputLabel>State</InputLabel>
              <Select
                label="State"
                value={userData.state}
                onChange={(e) => handleChange("state", e.target.value)}
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
                  onChange={(e) =>
                    handleChange("currentPassword", e.target.value)
                  }
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
