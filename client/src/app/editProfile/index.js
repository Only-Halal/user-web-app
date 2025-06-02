import React, { useContext, useState } from "react";
import { AppContext } from "../../context/appContext.js";
import { statesList, stateZipRanges } from "../../components/states.js";
import { app_url } from "../../url";
import { toast } from "react-toastify";
import Header from "../../components/header.js";

const EditProfile = () => {
  const { data, authToken, setData } = useContext(AppContext);
  const user = data.user;

  const [userData, setUserData] = useState({
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
    state: user.state || "",
    city: user.city || "",
    zipcode: user.zipcode || "",
    currentPassword: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [zipError, setZipError] = useState(null);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleUpdate = async () => {
    try {
      const updateUser = await fetch(`${app_url}/updateUser/${user.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body:
          userData.currentPassword !== ""
            ? JSON.stringify({
                username: userData.username,
                phone: userData.phone,
                state: userData.state,
                city: userData.city,
                zipcode: userData.zipcode,
                currentPassword: userData.currentPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword,
              })
            : JSON.stringify({
                username: userData.username,
                phone: userData.phone,
                state: userData.state,
                city: userData.city,
                zipcode: userData.zipcode,
              }),
      });

      const response = await updateUser.json();

      if (response.success) {
        toast.success(response.message);

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
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile");
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

  return (
    <div className="min-h-screen bg-white">
      <Header name={"Update Profile"} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              value={userData.email}
              readOnly
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Phone (include country code)
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              State
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.state}
              onChange={(e) => handleChange("state", e.target.value)}
            >
              <option value="">Select State</option>
              {statesList.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              City
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Zipcode
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                zipError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              value={userData.zipcode}
              maxLength={5}
              onChange={(e) => handleZipChange(e.target.value)}
            />
            {zipError && (
              <p className="mt-1 text-sm text-red-600">{zipError}</p>
            )}
          </div>

          <div className="border-t border-gray-300 my-6"></div>

          {isPasswordVisible && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userData.currentPassword}
                  onChange={(e) =>
                    handleChange("currentPassword", e.target.value)
                  }
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            type="button"
            className="w-full mb-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-150"
            onClick={togglePasswordVisibility}
          >
            {isPasswordVisible ? "Hide Password Fields" : "Change Password"}
          </button>

          <button
            type="button"
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-150"
            onClick={handleUpdate}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
