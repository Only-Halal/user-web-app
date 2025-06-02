import React, { useState, createContext, useEffect, useRef } from "react";
import { app_url, chat_url } from "../url";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import { useRouter } from "next/router";

export const AppContext = createContext();

const RADIUS_IN_MILES = process.env.NEXT_PUBLIC_RADIUS;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const initialState = {
  restaurant: {},
  item_order: [],
};

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isFetched, setIsFetched] = useState(false);
  const [userId, setUserId] = useState(0);
  const [customerId, setCustomerId] = useState();
  const [defaultCard, setDefaultCard] = useState(null);
  const [data, setData] = useState({
    user: {},
    orders: [],
    address: [],
    reviews: [],
    vouchers: [],
    coupons: [],
    wallet: { wallet: [], totalWallet: null, walletActivity: [] },
  });
  const [resData, setResData] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [itemOrder, setItemOrder] = useState(initialState);
  const [wallet, setWallet] = useState(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);
  const [rates, setRates] = useState({});
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chats, setChats] = useState([]);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isOrderNotification, setIsOrderNotification] = useState(false);
  const [isPromo, setIsPromo] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const showNotification = (title, options) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  };

  const handleChatWithSupport = async (id) => {
    setChats([]);
    try {
      const roomResponse = await fetch(
        `${chat_url}/fetchRoom/${id}?role=customer`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const roomJson = await roomResponse.json();

      if (roomJson.success === true) {
        navigate(`/chatScreen?id=${id}`);
        // router.push(`/chatScreen?id=${id}`);
      } else {
        const createRoomResponse = await fetch(`${chat_url}/createRoom`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            id: data.user.user_id,
            username: data.user.username,
            role: "customer",
            orderId: id,
          }),
        });

        const createRoomJson = await createRoomResponse.json();

        if (createRoomJson.success === true) {
          navigate(`/chatScreen?id=${id}`);
          // router.push(`/chatScreen?id=${id}`);
        }
      }
    } catch (error) {
      console.error("Error handling chat with support:", error);
    }
  };

  const fetchRates = async () => {
    try {
      const response = await fetch(`${app_url}/fetchRates`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        await setRates(data.rates);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("userToken");
        if (storedToken) {
          setAuthToken(storedToken);

          const storedUserId = localStorage.getItem("userId");
          if (storedUserId) {
            setUserId(storedUserId);
          }
        }
      } catch (error) {
        console.error("Error retrieving data from localStorage:", error);
      }
    };

    fetchRates();
    initializeAuth();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userId) {
          const response = await fetch(`${app_url}/userData/${userId}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const userData = await response.json();
          if (!userData.success) {
            setIsFetched(false);
          } else {
            setData({
              user: userData.user || {},
              orders: userData.orders || [],
              address: userData.address || [],
              reviews: userData.reviews || [],
              vouchers: [],
              coupons: [],
              wallet: { wallet: [], totalWallet: null, walletActivity: [] },
            });

            const storedAddress = localStorage.getItem("selectedAddress");
            if (
              !storedAddress &&
              userData.address &&
              userData.address.length > 0
            ) {
              const latestAddress =
                userData.address[userData.address.length - 1];
              localStorage.setItem(
                "selectedAddress",
                JSON.stringify(latestAddress)
              );
              setSelectedAddress(latestAddress);
            } else if (storedAddress) {
              setSelectedAddress(JSON.parse(storedAddress));
            }
            setIsFetched(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId, authToken]);

  const loadItemOrder = async () => {
    try {
      const savedOrder = localStorage.getItem("itemOrder");
      if (savedOrder) {
        setItemOrder(JSON.parse(savedOrder));
      } else {
        setItemOrder([]);
      }
    } catch (error) {
      console.error("Error loading item order:", error);
    }
  };

  const updateCartItem = (item_id, addon_id, size_id, type) => {
    setItemOrder((prevState) => {
      const updatedItems = prevState.item_order
        .map((item) => {
          // ... (same logic as before)
        })
        .filter((item) => item !== null);

      const updatedOrder = {
        ...prevState,
        item_order: updatedItems,
      };

      localStorage.setItem("itemOrder", JSON.stringify(updatedOrder));
      return updatedOrder;
    });
  };

  return (
    <AppContext.Provider
      value={{
        defaultCard,
        setDefaultCard,
        data,
        setData,
        userId,
        setUserId,
        selectedAddress,
        setSelectedAddress,
        // refreshData,
        isFetched,
        itemOrder,
        setItemOrder,
        // sendOrderId,
        updateCartItem,
        customerId,
        authToken,
        setAuthToken,
        wallet,
        setWallet,
        resData,
        setResData,
        // restaurant,
        loadItemOrder,
        // filterRestaurants,
        nearbyRestaurants,
        setNearbyRestaurants,
        userLocation,
        setUserLocation,
        // fetchVouchers,
        fetchRates,
        // fetchWallet,
        socket,
        rates,
        logs,
        setLogs,
        addLog,
        orders,
        setOrders,
        // fetchOrders,
        GOOGLE_API_KEY,
        chatSocket,
        setChatSocket,
        chats,
        setChats,
        isNewMessage,
        isOrderNotification,
        isPromo,
        isTapped,
        setIsTapped,
        handleChatWithSupport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
