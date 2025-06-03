import React, { useState, createContext, useEffect, useRef } from "react";
import { app_url, chat_url } from "../url";
import { io } from "socket.io-client";

export const AppContext = createContext();

const RADIUS_IN_MILES = process.env.REACT_APP_RADIUS;
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

const initialState = {
  restaurant: {},
  item_order: [],
};

export const AppProvider = ({ children }) => {
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
  const [suggestions, setSuggestions] = useState([]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
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
        window.location.href = `/chatScreen?id=${id}`;
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
          window.location.href = `/chatScreen?id=${id}`;
        }
      }
    } catch (error) {
      console.error("Error handling chat with support:", error);
    }
  };

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
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
      console.error(error.message);
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
        console.error("Error retrieving data from storage:", error);
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

  const restaurant = async () => {
    try {
      const response = await fetch(`${app_url}/restaurants`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      if (data.success) {
        await setResData(data.restaurants);
        await filterRestaurants(null, data.restaurants);
      } else {
        console.log("No restaurants found or API call unsuccessful.");
        setNearbyRestaurants([]);
      }
    } catch (error) {
      console.error("Error fetching menu details:", error);
    }
  };

  const filterRestaurants = async (location, restaurants) => {
    let userLoc = location;

    if (!userLoc) {
      const storedAddress = localStorage.getItem("selectedAddress");
      if (storedAddress) {
        const parsedAddress = JSON.parse(storedAddress);
        userLoc = await geocodeAddress(parsedAddress.address);
      } else {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        }
      }
    }

    if (userLoc) {
      setUserLocation({ latitude: userLoc.lat, longitude: userLoc.lng });

      const restaurantsToFilter = restaurants || resData;

      const filteredRestaurants = await Promise.all(
        (restaurantsToFilter || []).map(async (restaurant) => {
          const location = `${restaurant.location},${restaurant.zipcode},${restaurant.city},${restaurant.state},${restaurant.country}`;
          const restaurantLocation = await geocodeAddress(location);
          if (restaurantLocation) {
            const distanceInMiles = calculateDistance(
              userLoc.lat,
              userLoc.lng,
              restaurantLocation.lat,
              restaurantLocation.lng
            );

            return distanceInMiles <= RADIUS_IN_MILES ? restaurant : null;
          }
          return null;
        })
      );

      const finalRestaurants = filteredRestaurants.filter(
        (restaurant) => restaurant !== null
      );

      setNearbyRestaurants(finalRestaurants);
    }
  };

  // useEffect(() => {
  //   const newSocket = io.connect(`${app_url}`, {
  //     path: "/socket.io",
  //     transports: ["websocket"],
  //   });
  //   setSocket(newSocket);
  //   newSocket.on("connect", () => {
  //     console.log("User App Connected to WebSocket server");
  //   });

  //   newSocket.on("orderNoti", (data) => {
  //     showNotification(data.title, data.message);
  //     setIsOrderNotification(true);
  //   });

  //   newSocket.on("showNoti", (data) => {
  //     showNotification(data.title, data.message);
  //     setIsPromo(true);
  //   });

  //   newSocket.on("disconnect", () => {
  //     console.log("User App Disconnected from WebSocket server");
  //   });

  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   const newSocket = io.connect(chat_url.split("/support")[0], {
  //     path: "/support/socket.io",
  //     transports: ["websocket", "polling"],
  //     autoConnect: true,
  //     query: { token: authToken },
  //   });

  //   setChatSocket(newSocket);

  //   newSocket.on("connect", () => {
  //     console.log("Connected to Chat Server");
  //   });

  //   newSocket.on("disconnect", () => {
  //     console.log("Disconnected from Chat Server");
  //   });

  //   newSocket.on("receive_message", (receive_data) => {
  //     setChats((prevChats) => [...prevChats, receive_data.data]);
  //     if (receive_data.data.sender !== data) {
  //       showNotification("New Message", "You have a new message");
  //       setIsNewMessage(true);
  //     }
  //   });

  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []);

  const refreshData = async () => {
    try {
      if (userId) {
        const response = await fetch(`${app_url}/userData/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const userData = await response.json();
        setData({
          user: userData.user || {},
          orders: userData.orders || [],
          address: userData.address || [],
          reviews: userData.reviews || [],
          vouchers: [],
          coupons: [],
          wallet: { wallet: [], totalWallet: null, walletActivity: [] },
        });
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const sendOrderId = async (resId, orderId) => {
    const data = await { resId: resId, orderId: orderId };
    socket.emit("newOrder", data);
  };

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

  useEffect(() => {
    loadItemOrder();
  }, []);

  const updateCartItem = (item_id, addon_id, size_id, type) => {
    setItemOrder((prevState) => {
      const updatedItems = prevState.item_order
        .map((item) => {
          const isMatchingItem =
            item.item.id === item_id &&
            (addon_id ? item.addon?.id === addon_id : !item.addon) &&
            (size_id ? item.size?.id === size_id : !item.size);

          if (isMatchingItem) {
            const price = parseFloat(item.item.subtotal);

            const addonPrice = item.addon ? parseFloat(item.addon.price) : 0;

            let newQty = item.item.quantity || 1;

            if (type === "increment") {
              newQty += 1;
            } else if (type === "decrement") {
              if (newQty > 1) {
                newQty -= 1;
              } else {
                return null;
              }
            }

            const newSubtotal = ((price / item.item.quantity) * newQty).toFixed(
              2
            );

            return {
              ...item,
              item: {
                ...item.item,
                quantity: newQty,
                subtotal: newSubtotal,
              },
            };
          }
          return item;
        })
        .filter((item) => item !== null);

      const updatedOrder = {
        ...prevState,
        item_order: updatedItems,
      };

      localStorage.setItem("itemOrder", JSON.stringify(updatedOrder));
      console.log("Item order successfully updated in storage");

      return updatedOrder;
    });
  };

  useEffect(() => {
    const createStripeCustomer = async (username, email) => {
      try {
        const response = await fetch(`${app_url}/createStripeCustomer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            email: email,
            name: username,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setCustomerId(data.customerId);
          return data.customerId;
        } else {
          console.error("Failed to create customer:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    createStripeCustomer(data.user.username, data.user.email);
  }, [isFetched]);

  useEffect(() => {
    setDefaultCard(null);
    const fetchDefaultPaymentMethod = async () => {
      try {
        const response = await fetch(`${app_url}/getDefaultPaymentMethod`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ customerId: customerId }),
        });

        const data = await response.json();

        if (!data.success) {
          console.error(data.error || "Error fetching saved default card!");
        } else {
          setDefaultCard(data.defaultCard);
        }
      } catch (error) {
        console.error("Error fetching default payment method:", error);
      }
    };
    fetchDefaultPaymentMethod();
  }, [isFetched, customerId]);

  useEffect(() => {
    const fetchCustomerByEmail = async (email) => {
      try {
        const response = await fetch(`${app_url}/getCustomerByEmail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            email: email,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setCustomerId(data.id);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };
    fetchCustomerByEmail(data.user.email);
  }, [data.user.email]);

  const fetchVouchers = async () => {
    try {
      const response = await fetch(`${app_url}/fetchVouchers/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        setData((prevState) => ({
          ...prevState,
          vouchers: result.data.vouchers,
          coupons: result.data.coupons,
        }));
      } else {
        console.error("Failed to fetch vouchers:", result.message);
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await fetch(`${app_url}/getWallet/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setWallet(result.data);
      } else {
        console.error("Failed to get wallet");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const removeDuplicates = (orders) => {
    const uniqueOrdersMap = new Map();
    orders?.forEach((item) => {
      const orderId = item.order.id;
      if (!uniqueOrdersMap.has(orderId)) {
        uniqueOrdersMap.set(orderId, item);
      }
    });
    return Array.from(uniqueOrdersMap.values());
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${app_url}/orderList/${data.user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const result = await response.json();
      const uniqueOrders = removeDuplicates(result.orders);
      setOrders(uniqueOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`${app_url}/geocode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          address,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return result.coordinates;
      } else {
        console.error(result.message || "Failed to geocode address");
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
    }
  };

  const fetchSuggestions = async (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${app_url}/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ input }),
      });

      const result = await response.json();

      if (result.success) {
        setSuggestions(result.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Implementation of the Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance * 0.621371; // Convert km to miles
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
        refreshData,
        isFetched,
        itemOrder,
        setItemOrder,
        sendOrderId,
        updateCartItem,
        customerId,
        authToken,
        setAuthToken,
        wallet,
        setWallet,
        resData,
        setResData,
        restaurant,
        loadItemOrder,
        filterRestaurants,
        nearbyRestaurants,
        setNearbyRestaurants,
        userLocation,
        setUserLocation,
        fetchVouchers,
        fetchRates,
        fetchWallet,
        socket,
        rates,
        logs,
        setLogs,
        addLog,
        orders,
        setOrders,
        fetchOrders,
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
        suggestions,
        setSuggestions,
        fetchSuggestions,
        calculateDistance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};