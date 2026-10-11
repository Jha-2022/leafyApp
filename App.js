import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { fetchGeminiResponse, GEMINI_CONFIG, fetchLiveWeather } from './backend';
import FormattedMessage from './src/components/FormattedMessage';
import PlantLibrary, { PLANT_DATABASE, getNextWateringSchedule } from './src/components/PlantLibrary';
import Settings from './src/components/Settings';
import WeatherWidget from './src/components/WeatherWidget';

const SIDEBAR_ITEMS = ['New Chat', 'Plant Library', 'Gemini API Key', 'Settings'];

// Calculate time-based greeting strictly in Asia/Kolkata (IST)
function getISTGreeting() {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false,
    });
    const hour = parseInt(formatter.format(new Date()), 10);

    if (hour >= 0 && hour < 12) {
      return 'good morning';
    }
    if (hour >= 12 && hour < 15) {
      return 'good afternoon';
    }
    return 'good evening';
  } catch (e) {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      return 'good morning';
    }
    if (hour >= 12 && hour < 15) {
      return 'good afternoon';
    }
    return 'good evening';
  }
}

export default function App() {
  const { width } = useWindowDimensions();
  const sidebarWidth = Math.min(width * 0.78, 320);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('chat'); // 'chat' | 'plantLibrary' | 'settings'
  const [plants, setPlants] = useState(PLANT_DATABASE);
  const [activePlantChat, setActivePlantChat] = useState(null);
  const [greeting, setGreeting] = useState(() => getISTGreeting());

  // Real-Time Clock & Atmospheric Weather State
  const [liveWeather, setLiveWeather] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [isWeatherRefreshing, setIsWeatherRefreshing] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(GEMINI_CONFIG.DEFAULT_API_KEY || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const flatListRef = useRef(null);
  const sidebarAnim = useRef(new Animated.Value(0)).current;

  // Real-Time Clock updater (every 10 seconds)
  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setCurrentTime(timeString);
      } catch (e) {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    };
    updateClock();
    const clockTimer = setInterval(updateClock, 10000);
    return () => clearInterval(clockTimer);
  }, []);

  // Fetch live meteorological weather data on mount, city change, and 15-minute background refresh
  const loadWeather = async (cityObj = selectedCity) => {
    setIsWeatherRefreshing(true);
    try {
      const data = await fetchLiveWeather(cityObj);
      if (data) {
        setLiveWeather(data);
      }
    } catch (err) {
      console.log('Error loading weather:', err);
    } finally {
      setIsWeatherRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedCity);
    const weatherTimer = setInterval(() => {
      loadWeather(selectedCity);
    }, 15 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, [selectedCity]);

  // Update IST greeting periodically
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getISTGreeting());
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll chat when keyboard opens
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
    });
    return () => sub.remove();
  }, []);

  // Make Android bottom navigation bar disappear when not in use
  useEffect(() => {
    if (Platform.OS === 'android') {
      const hideNavigationBar = () => {
        try {
          if (NavigationBar.setHidden) {
            NavigationBar.setHidden(true);
          } else if (NavigationBar.setVisibilityAsync) {
            NavigationBar.setVisibilityAsync('hidden').catch(() => {});
          }
        } catch (e) {
          // Ignore unsupported runtime environments
        }
      };

      hideNavigationBar();

      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          hideNavigationBar();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  const setSidebarVisible = (visible) => {
    if (visible) {
      Keyboard.dismiss();
    }
    setSidebarOpen(visible);
    Animated.timing(sidebarAnim, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  // Right-to-left swipe gesture responder to close sidebar
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 35;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -25 || gestureState.vx < -0.2) {
          setSidebarVisible(false);
        }
      },
    })
  ).current;

  const overlayOpacity = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  const sidebarTranslate = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-sidebarWidth, 0],
  });

  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Formulate real-time context
    const nowDateTime = new Date().toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const weatherSummary = liveWeather
      ? `${liveWeather.city}: ${liveWeather.temperature}°C, ${liveWeather.condition}, humidity ${liveWeather.humidity}%, wind ${liveWeather.windSpeed} km/h (Advisory: ${liveWeather.botanicalAdvice})`
      : 'Standard ambient conditions';

    // If chatting with a specific plant, instruct Gemini to respond in-character as that plant
    let promptToSend = trimmed;
    if (activePlantChat) {
      const scheduledWatering = getNextWateringSchedule(activePlantChat);
      promptToSend = `You are roleplaying as the living houseplant "${activePlantChat.name}" (${activePlantChat.scientificName}).
Current Environmental Real-Time Conditions:
- Time: ${nowDateTime}
- Atmospheric Weather: ${weatherSummary}
- Botanical Advisory for today: ${liveWeather?.botanicalAdvice || 'Optimal growth conditions'}

Care profile:
- Water: ${activePlantChat.water}
- Next scheduled watering: ${scheduledWatering}
- Sunlight: ${activePlantChat.light}
- Difficulty: ${activePlantChat.difficulty}
- Pet friendly: ${activePlantChat.petFriendly ? 'Yes (Pet safe)' : 'No (Toxic to pets)'}
- Soil: ${activePlantChat.soil || 'Well-draining mix'}
- Description: ${activePlantChat.description}

Persona instructions:
- Speak directly in the first person as the plant itself ("I love...", "My leaves...", "Give me a sip of water when...", "I feel happiest when...").
- When asked when to water you next, reference your upcoming schedule: ${scheduledWatering}.
- Be aware of the real-time weather and temperature outside or in your room (${liveWeather ? `${liveWeather.temperature}°C, ${liveWeather.condition}` : 'current climate'}) and weave it naturally into your mood or care tips if relevant!
- Be cheerful, warm, cute, and botanically accurate.
- Answer questions about your care, leaves, watering, light, and health.
- Keep responses readable and engaging using bold text and bullet points where helpful.

User message: "${trimmed}"
Respond as ${activePlantChat.name}:`;
    } else {
      promptToSend = `[Real-Time Context: Current local time is ${nowDateTime}. Live weather in ${weatherSummary}]\n\nUser inquiry: ${trimmed}`;
    }

    // Get response from Gemini
    const aiText = await fetchGeminiResponse(promptToSend, geminiApiKey);

    const aiMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: aiText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleStartPlantChat = (plant) => {
    setActivePlantChat(plant);
    setCurrentScreen('chat');
    const nextWatering = getNextWateringSchedule(plant);
    const plantGreeting = `🌱 **Hi! I'm your ${plant.name}** (${plant.scientificName})!\n\nI'm so glad we're connected! As your plant companion, you can ask me anything:\n• 📅 **Next Watering**: ${nextWatering}\n• 💧 **Watering**: ${plant.water}\n• ☀️ **Sunlight**: ${plant.light}\n• 🌱 **Care**: ${plant.difficulty}\n• 🐾 **Pet Safety**: ${plant.petFriendly ? 'Pet safe!' : 'Keep curious pets away'}\n\nAsk me how I'm feeling, when I'm thirsty, or how to keep my leaves lush!`;
    setMessages([
      {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: plantGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleNewChat = () => {
    setActivePlantChat(null);
    setMessages([]);
    setInputText('');
  };

  const handleAddPlant = (newPlant) => {
    setPlants((prev) => [newPlant, ...prev]);
  };

  const handleDeletePlant = (plantId) => {
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
    setActivePlantChat((prev) => (prev && prev.id === plantId ? null : prev));
  };

  const handleUpdatePlant = (updatedPlant) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === updatedPlant.id ? updatedPlant : p))
    );
    setActivePlantChat((prev) =>
      prev && prev.id === updatedPlant.id ? updatedPlant : prev
    );
  };

  const handleResetPlants = () => {
    setPlants(PLANT_DATABASE);
  };

  const promptPills = [
    { label: '💡 Brainstorm App Ideas', text: 'Give me 5 creative ideas for a mobile app' },
    { label: '💻 Code Helper', text: 'Write a React Native function to fetch data from an API' },
    { label: '📝 Draft Email', text: 'Draft a polite follow up email for a project review' },
    { label: '🧠 Explain Science', text: 'Explain how neural networks learn in simple terms' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {Platform.OS === 'android' && <NavigationBar.NavigationBar hidden={true} />}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Main Panel View */}
        <View style={styles.panel}>
          {currentScreen === 'plantLibrary' ? (
            <PlantLibrary
              plants={plants}
              weather={liveWeather}
              onBack={() => setCurrentScreen('chat')}
              onOpenSidebar={() => setSidebarVisible(true)}
              onChatPlant={handleStartPlantChat}
              onAskPlant={(plantName) => {
                const found = plants?.find((p) => p.name === plantName) || {
                  name: plantName,
                  scientificName: '',
                  water: 'Regularly',
                  light: 'Bright indirect',
                  difficulty: 'Easy',
                  petFriendly: true,
                  description: 'A beautiful botanical companion.',
                };
                handleStartPlantChat(found);
              }}
            />
          ) : currentScreen === 'settings' ? (
            <Settings
              plants={plants}
              weather={liveWeather}
              currentTime={currentTime}
              onRefreshWeather={() => loadWeather(selectedCity)}
              onSelectCity={(city) => {
                setSelectedCity(city);
                loadWeather(city);
              }}
              onAddPlant={handleAddPlant}
              onUpdatePlant={handleUpdatePlant}
              onDeletePlant={handleDeletePlant}
              onResetPlants={handleResetPlants}
              onOpenSidebar={() => setSidebarVisible(true)}
              onNavigateLibrary={() => setCurrentScreen('plantLibrary')}
            />
          ) : (
            <>
              {/* Header Bar */}
              <View style={styles.headerBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              onPress={() => setSidebarVisible(!sidebarOpen)}
              style={styles.menuButton}
            >
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </Pressable>

            <View style={styles.headerTitleRow}>
              <Text style={styles.appTitle} numberOfLines={1}>
                {activePlantChat ? `${activePlantChat.icon} ${activePlantChat.name}` : 'Leafy Chat'}
              </Text>
              <View style={[styles.badge, activePlantChat && styles.plantBadge]}>
                <Text style={styles.badgeText}>{activePlantChat ? 'Bot' : 'AI'}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowKeyInput(!showKeyInput)}
              style={styles.apiKeyButton}
            >
              <Text style={styles.apiKeyButtonText}>🔑 Key</Text>
            </Pressable>

            <Pressable onPress={handleNewChat} style={styles.newChatHeaderButton}>
              <Text style={styles.newChatHeaderText}>+ New</Text>
            </Pressable>
          </View>

          {/* Gemini API Key Bar (Expandable) */}
          {showKeyInput && (
            <View style={styles.apiKeyContainer}>
              <Text style={styles.apiKeyLabel}>Gemini API Key:</Text>
              <TextInput
                placeholder="Paste AI Studio API Key here..."
                placeholderTextColor="#A09A90"
                secureTextEntry
                style={styles.apiKeyInput}
                value={geminiApiKey}
                onChangeText={setGeminiApiKey}
              />
            </View>
          )}

          {/* Real-Time Live Weather & Clock Widget */}
          <WeatherWidget
            weather={liveWeather}
            currentTime={currentTime}
            isRefreshing={isWeatherRefreshing}
            onRefresh={() => loadWeather(selectedCity)}
            onSelectCity={(city) => {
              setSelectedCity(city);
              loadWeather(city);
            }}
          />

          {/* Main Content Area */}
          <View style={styles.flexOne}>
            {messages.length === 0 ? (
              <ScrollView
                contentContainerStyle={styles.centeredScrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.aiSparkleIcon}>
                  <Text style={styles.sparkleText}>✨</Text>
                </View>
                <Text style={styles.helloText}>{greeting}</Text>
                <Text style={styles.subGreetingText}>How can Leafy help you today?</Text>

                {/* Starter Prompt Cards */}
                {/* <View style={styles.pillsContainer}>
                  {promptPills.map((pill, index) => (
                    <Pressable
                      key={index}
                      onPress={() => handleSendMessage(pill.text)}
                      style={({ pressed }) => [styles.pillCard, pressed && styles.pillPressed]}
                    >
                      <Text style={styles.pillText}>{pill.label}</Text>
                    </Pressable>
                  ))}
                </View> */}
              </ScrollView>
            ) : (
              <FlatList
                ref={flatListRef}
                contentContainerStyle={styles.chatListContent}
                data={messages}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => {
                  const isUser = item.sender === 'user';
                  return (
                    <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
                      {!isUser && (
                        <View style={styles.aiAvatar}>
                          <Text style={styles.avatarText}>
                            {activePlantChat ? activePlantChat.icon : '✨'}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                        <FormattedMessage text={item.text} isUser={isUser} />
                        <Text style={[styles.messageTime, isUser ? styles.userTimeText : styles.aiTimeText]}>
                          {item.timestamp}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingRow}>
                <Text style={styles.loadingText}>
                  {activePlantChat
                    ? `${activePlantChat.icon} ${activePlantChat.name} is typing...`
                    : '✨ Gemini is thinking...'}
                </Text>
              </View>
            )}

            {/* Bottom Chatbox Input Field */}
            <View style={styles.chatBoxContainer}>
              <TextInput
                multiline
                placeholder={
                  activePlantChat
                    ? `Message ${activePlantChat.name}...`
                    : 'Ask Gemini anything...'
                }
                placeholderTextColor="#84A282"
                style={styles.chatTextInput}
                value={inputText}
                onChangeText={setInputText}
              />

              <Pressable
                disabled={!inputText.trim() || isLoading}
                onPress={() => handleSendMessage()}
                style={({ pressed }) => [
                  styles.sendButton,
                  { backgroundColor: inputText.trim() && !isLoading ? '#84A282' : '#C4D4C3' },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.sendIconText}>↑</Text>
              </Pressable>
            </View>
          </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Backdrop Overlay for Sidebar */}
      <Animated.View
        pointerEvents={sidebarOpen ? 'auto' : 'none'}
        style={[styles.overlay, { opacity: overlayOpacity }]}
        {...(sidebarOpen ? panResponder.panHandlers : {})}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setSidebarVisible(false)} />
      </Animated.View>

      {/* Animated Sidebar Drawer */}
      <Animated.View
        {...(sidebarOpen ? panResponder.panHandlers : {})}
        style={[
          styles.sidebar,
          {
            width: sidebarWidth,
            transform: [{ translateX: sidebarTranslate }],
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Leafy</Text>
        </View>

        <Pressable
          onPress={() => {
            handleNewChat();
            setCurrentScreen('chat');
            setSidebarVisible(false);
          }}
          style={styles.sidebarNewChatBtn}
        >
          <Text style={styles.sidebarNewChatText}>+ Start New Chat</Text>
        </Pressable>

        {SIDEBAR_ITEMS.map((label) => {
          const isActive =
            (label === 'Plant Library' && currentScreen === 'plantLibrary') ||
            (label === 'Settings' && currentScreen === 'settings') ||
            (label === 'New Chat' && currentScreen === 'chat');

          return (
            <Pressable
              key={label}
              onPress={() => {
                if (label === 'New Chat') {
                  handleNewChat();
                  setCurrentScreen('chat');
                } else if (label === 'Plant Library') {
                  setCurrentScreen('plantLibrary');
                } else if (label === 'Settings') {
                  setCurrentScreen('settings');
                } else if (label === 'Gemini API Key') {
                  setShowKeyInput(true);
                  setCurrentScreen('chat');
                }
                setSidebarVisible(false);
              }}
              style={({ pressed }) => [
                styles.sidebarItem,
                isActive && styles.sidebarItemActive,
                pressed && styles.sidebarItemPressed,
              ]}
            >
              <Text
                style={[
                  styles.sidebarItemText,
                  isActive && styles.sidebarItemTextActive,
                ]}
              >
                {label === 'Plant Library'
                  ? '🌿 '
                  : label === 'New Chat'
                  ? '💬 '
                  : label === 'Gemini API Key'
                  ? '🔑 '
                  : '⚙️ '}
                {label}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#84A282',
  },
  keyboardContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '94%',
    flex: 1,
    marginVertical: 38,
    backgroundColor: '#FCF0DA',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  flexOne: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(132, 162, 130, 0.25)',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#84A282',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: '#FCF0DA',
    borderRadius: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginHorizontal: 8,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3F5F3E',
    flexShrink: 1,
  },
  badge: {
    backgroundColor: '#84A282',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  plantBadge: {
    backgroundColor: '#2A4729',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  apiKeyButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#84A282',
  },
  apiKeyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3F5F3E',
  },
  newChatHeaderButton: {
    backgroundColor: '#84A282',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  newChatHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#84A282',
    gap: 8,
  },
  apiKeyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3F5F3E',
  },
  apiKeyInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C2B29',
    padding: 0,
  },
  centeredScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  aiSparkleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#84A282',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sparkleText: {
    fontSize: 26,
  },
  helloText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3F5F3E',
    marginBottom: 6,
    textAlign: 'center',
  },
  subGreetingText: {
    fontSize: 14,
    color: '#6A8068',
    marginBottom: 24,
    textAlign: 'center',
  },
  pillsContainer: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  pillCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.3)',
  },
  pillPressed: {
    backgroundColor: '#EAE4DC',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3F5F3E',
  },
  chatListContent: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#84A282',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#84A282',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.3)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#2C2B29',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  aiTimeText: {
    color: '#A09A90',
  },
  loadingRow: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#6A8068',
    fontStyle: 'italic',
  },
  chatBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#84A282',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
    shadowColor: '#84A282',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#2C2B29',
    minHeight: 40,
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: -2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 20,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FCF0DA',
    paddingTop: 56,
    paddingHorizontal: 20,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 25,
  },
  sidebarHeader: {
    marginBottom: 16,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F5F3E',
  },
  sidebarNewChatBtn: {
    backgroundColor: '#84A282',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  sidebarNewChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sidebarItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#84A282',
  },
  sidebarItemPressed: {
    opacity: 0.6,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#3F5F3E',
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(132, 162, 130, 0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  sidebarItemTextActive: {
    fontWeight: '800',
    color: '#2A4729',
  },
});
