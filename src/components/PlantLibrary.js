import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export const PLANT_DATABASE = [
  {
    id: 'monstera',
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    category: 'Indoor',
    difficulty: 'Easy',
    water: 'Every 1-2 weeks',
    waterIntervalDays: 7,
    preferredWaterTime: '09:30 AM',
    light: 'Bright indirect',
    icon: '🌿',
    petFriendly: false,
    description:
      'Famous for its iconic natural split leaves (fenestrations). Native to the tropical rainforests of Central America, it makes a bold design statement in any room.',
    careTips: [
      'Wipe large leaves with a damp cloth to remove dust and maximize photosynthesis.',
      'Allow the top 2-3 inches of soil to dry out before watering again.',
      'Provide a moss pole or trellis for support as it grows climbing aerial roots.',
    ],
    soil: 'Chunky, well-aerated aroid potting mix with perlite and bark.',
  },
  {
    id: 'snake-plant',
    name: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    category: 'Air Purifying',
    difficulty: 'Beginner',
    water: 'Every 2-4 weeks',
    waterIntervalDays: 14,
    preferredWaterTime: '10:00 AM',
    light: 'Low to Bright light',
    icon: '🪴',
    petFriendly: false,
    description:
      'One of the hardiest houseplants known. It purifies indoor air and uniquely produces oxygen at night, making it ideal for bedroom nightstands.',
    careTips: [
      'Thrives on neglect; underwatering is always safer than overwatering.',
      'Tolerates low light corners, though growth is faster in brighter rooms.',
      'Never let water sit in the central rosette to prevent crown rot.',
    ],
    soil: 'Gritty, fast-draining cactus or succulent blend.',
  },
  {
    id: 'peace-lily',
    name: 'Peace Lily',
    scientificName: 'Spathiphyllum wallisii',
    category: 'Indoor',
    difficulty: 'Easy',
    water: 'Weekly (keep moist)',
    waterIntervalDays: 4,
    preferredWaterTime: '09:00 AM',
    light: 'Low to Medium indirect',
    icon: '🌸',
    petFriendly: false,
    description:
      'Striking dark glossy foliage paired with elegant white spathes. It visibly signals thirst by gently drooping, recovering quickly upon watering.',
    careTips: [
      'Sensitive to tap water chemicals; use filtered or rainwater if leaf tips brown.',
      'Enjoys moderate to high humidity; mist leaves or place near a humidifier.',
      'Blooms best with consistent indirect light away from harsh afternoon sun.',
    ],
    soil: 'Rich, moisture-retentive organic potting mix.',
  },
  {
    id: 'aloe-vera',
    name: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    category: 'Medicinal',
    difficulty: 'Easy',
    water: 'Every 3 weeks (dry out)',
    waterIntervalDays: 15,
    preferredWaterTime: '08:30 AM',
    light: 'Direct sunlight',
    icon: '🌱',
    petFriendly: false,
    description:
      'A legendary medicinal succulent prized for millennia. Its fleshy leaves contain cooling, moisturizing gel celebrated for healing minor skin burns.',
    careTips: [
      'Needs at least 6 hours of bright sunny light daily.',
      'Water thoroughly, then let the pot drain completely until bone dry.',
      'Use a terracotta pot with a drainage hole to avoid root rot.',
    ],
    soil: 'Sandy, porous cactus and succulent potting mix.',
  },
  {
    id: 'pothos',
    name: 'Golden Pothos',
    scientificName: 'Epipremnum aureum',
    category: 'Low Light',
    difficulty: 'Beginner',
    water: 'Every 7-10 days',
    waterIntervalDays: 6,
    preferredWaterTime: '09:00 AM',
    light: 'Any light level',
    icon: '🍃',
    petFriendly: false,
    description:
      'Known as Devil’s Ivy because it is virtually impossible to kill. Features lush heart-shaped leaves marbled with golden splashes, perfect for trailing from shelves.',
    careTips: [
      'Propagates easily in water from simple stem cuttings with a node.',
      'Leaves droop slightly when thirsty, making care guesswork-free.',
      'Higher indirect light preserves bright golden variegation.',
    ],
    soil: 'Standard well-draining houseplant mix.',
  },
  {
    id: 'zz-plant',
    name: 'ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia',
    category: 'Low Light',
    difficulty: 'Beginner',
    water: 'Once a month',
    waterIntervalDays: 21,
    preferredWaterTime: '10:30 AM',
    light: 'Low to Bright indirect',
    icon: '✨',
    petFriendly: false,
    description:
      'Features naturally waxy, ultra-glossy leaves that reflect light. Stores water inside underground potato-like rhizomes, making it drought-proof.',
    careTips: [
      'Overwatering is the only true threat; allow the soil to dry out completely.',
      'Thrives in windowless offices under fluorescent lights.',
      'Wipe leaves occasionally with water for a mirror-like natural shine.',
    ],
    soil: 'Coarse, well-draining potting soil with perlite.',
  },
  {
    id: 'fiddle-leaf',
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    category: 'Indoor',
    difficulty: 'Moderate',
    water: 'When top 2 inches dry',
    waterIntervalDays: 5,
    preferredWaterTime: '09:00 AM',
    light: 'Bright consistent light',
    icon: '🌳',
    petFriendly: false,
    description:
      'A popular architectural interior tree featuring massive, violin-shaped leaves with heavy veining. Rewards consistent care with rapid growth.',
    careTips: [
      'Dislikes being moved; pick a bright spot away from drafts and AC vents.',
      'Rotate the pot a quarter-turn each week to encourage straight, even growth.',
      'Dust leaves regularly so they absorb maximum sunlight.',
    ],
    soil: 'Rich, aerated peat-based soil with drainage holes.',
  },
  {
    id: 'spider-plant',
    name: 'Spider Plant',
    scientificName: 'Chlorophytum comosum',
    category: 'Air Purifying',
    difficulty: 'Beginner',
    water: 'Once a week',
    waterIntervalDays: 5,
    preferredWaterTime: '08:30 AM',
    light: 'Bright to Medium indirect',
    icon: '🕷️',
    petFriendly: true,
    description:
      'A cheerful, pet-safe air purifier that shoots out arching runners with miniature "spiderette" babies. Highly resilient and family-friendly.',
    careTips: [
      '100% non-toxic and safe around curious cats and dogs.',
      'Brown tips can occur from fluoride in city tap water; use distilled if possible.',
      'Easily snip baby spiderettes and plant them in soil for instant new gifts.',
    ],
    soil: 'Standard, well-draining all-purpose potting soil.',
  },
  {
    id: 'tulsi',
    name: 'Holy Basil (Tulsi)',
    scientificName: 'Ocimum tenuiflorum',
    category: 'Medicinal',
    difficulty: 'Easy',
    water: 'Daily (keep moist)',
    waterIntervalDays: 1,
    preferredWaterTime: '07:30 AM',
    light: 'Direct warm sunlight',
    icon: '🪔',
    petFriendly: true,
    description:
      'Revered across India as the queen of herbs. Renowned for its aromatic leaves, therapeutic adaptogenic teas, and stress-relieving properties.',
    careTips: [
      'Loves warm temperatures and at least 4-6 hours of daily sun.',
      'Pinch off top flowering buds to encourage dense, bushy foliage.',
      'Keep soil evenly moist, but not waterlogged.',
    ],
    soil: 'Nutrient-rich, loamy organic garden soil with compost.',
  },
  {
    id: 'string-of-pearls',
    name: 'String of Pearls',
    scientificName: 'Curio rowleyanus',
    category: 'Succulents',
    difficulty: 'Moderate',
    water: 'Every 2-3 weeks',
    waterIntervalDays: 12,
    preferredWaterTime: '10:00 AM',
    light: 'Bright indirect light',
    icon: '📿',
    petFriendly: false,
    description:
      'A mesmerizing trailing succulent with pea-shaped spherical foliage designed to store water in arid climates. Spectacular in hanging macrame planters.',
    careTips: [
      'Ensure the top of the pot gets light so the crown stays lush and full.',
      'Water thoroughly only when the bead-like pearls feel slightly soft to touch.',
      'Bottom-watering helps prevent fungal rot on delicate shallow roots.',
    ],
    soil: 'Gritty, fast-draining cactus and perlite mixture.',
  },
];

/**
 * Calculates and formats the next upcoming watering date and time for a plant.
 *
 * @param {object} plant - The plant data item.
 * @returns {string} Formatted string like "Thu, Oct 15 • 9:00 AM".
 */
export function getNextWateringSchedule(plant) {
  if (!plant) return '';
  if (plant.nextWatering) return plant.nextWatering;

  const days = plant.waterIntervalDays || 7;
  const time = plant.preferredWaterTime || '09:00 AM';

  const date = new Date();
  date.setDate(date.getDate() + days);

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return `${formattedDate} • ${time}`;
}

export default function PlantLibrary({
  plants = PLANT_DATABASE,
  weather,
  onBack,
  onOpenSidebar,
  onChatPlant,
  onAskPlant,
}) {
  const [activePlant, setActivePlant] = useState(null);
  const displayPlants = plants && plants.length > 0 ? plants : PLANT_DATABASE;

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable
          onPress={onOpenSidebar}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
          accessibilityLabel="Open sidebar menu"
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </Pressable>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>🌿 Plant Library</Text>
          <Text style={styles.headerSubtitle}>Explore care guides & botanicals</Text>
        </View>
      </View>

      {/* Real-Time Weather Botanical Advisory Banner */}
      {weather && (
        <View style={styles.weatherBanner}>
          <View style={styles.weatherBannerIconWrap}>
            <Text style={styles.weatherBannerIcon}>{weather.icon}</Text>
          </View>
          <View style={styles.weatherBannerTextWrap}>
            <Text style={styles.weatherBannerTitle}>
              {weather.temperature}°C • {weather.condition} in {weather.city}
            </Text>
            <Text style={styles.weatherBannerTip} numberOfLines={1}>
              {weather.botanicalAdvice}
            </Text>
          </View>
          <View style={styles.weatherHumidityBadge}>
            <Text style={styles.weatherHumidityText}>💧 {weather.humidity}%</Text>
          </View>
        </View>
      )}

      {/* Plant Cards List */}
      <FlatList
        data={displayPlants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.plantCard}>
            <Pressable
              onPress={() => setActivePlant(item)}
              style={({ pressed }) => [pressed && styles.cardPressed]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.plantIconCircle}>
                  <Text style={styles.plantIconText}>{item.icon}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.plantName}>{item.name}</Text>
                    {item.petFriendly && (
                      <View style={styles.petBadge}>
                        <Text style={styles.petBadgeText}>🐾 Pet Safe</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.scientificName}>{item.scientificName}</Text>
                </View>
              </View>

              {/* Quick Metrics */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>💧 Water</Text>
                  <Text style={styles.metricValue}>{item.water}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>☀️ Light</Text>
                  <Text style={styles.metricValue}>{item.light}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>🌱 Care</Text>
                  <Text style={styles.metricValue}>{item.difficulty}</Text>
                </View>
              </View>

              {/* Next Watering Reminder */}
              <View style={styles.wateringScheduleBox}>
                <View style={styles.calendarIconContainer}>
                  <Text style={styles.calendarIcon}>📅</Text>
                </View>
                <View style={styles.scheduleDetails}>
                  <Text style={styles.scheduleTitle}>Next Watering</Text>
                  <Text style={styles.scheduleTimestamp}>
                    {getNextWateringSchedule(item)}
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Chat with Plant Button */}
            <Pressable
              onPress={() => {
                if (onChatPlant) {
                  onChatPlant(item);
                } else if (onAskPlant) {
                  onAskPlant(item.name);
                }
              }}
              style={({ pressed }) => [
                styles.plantChatBtn,
                pressed && styles.plantChatBtnPressed,
              ]}
              accessibilityLabel={`Chat with ${item.name}`}
            >
              <Text style={styles.plantChatBtnText}>💬 Chat with {item.name}</Text>
            </Pressable>
          </View>
        )}
      />

      {/* Detail Modal */}
      {activePlant && (
        <Modal
          animationType="slide"
          transparent
          visible={!!activePlant}
          onRequestClose={() => setActivePlant(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconCircle}>
                  <Text style={styles.modalIconText}>{activePlant.icon}</Text>
                </View>
                <View style={styles.modalTitleBlock}>
                  <Text style={styles.modalTitle}>{activePlant.name}</Text>
                  <Text style={styles.modalSub}>{activePlant.scientificName}</Text>
                </View>
                <Pressable
                  onPress={() => setActivePlant(null)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Description */}
                <Text style={styles.sectionHeading}>About</Text>
                <Text style={styles.modalDescription}>{activePlant.description}</Text>

                {/* Key specs */}
                <Text style={styles.sectionHeading}>Quick Guide</Text>
                <View style={styles.specsGrid}>
                  <View style={styles.specBox}>
                    <Text style={styles.specTitle}>💧 Watering</Text>
                    <Text style={styles.specDetail}>{activePlant.water}</Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={styles.specTitle}>☀️ Sunlight</Text>
                    <Text style={styles.specDetail}>{activePlant.light}</Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={styles.specTitle}>🌡️ Difficulty</Text>
                    <Text style={styles.specDetail}>{activePlant.difficulty}</Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={styles.specTitle}>🐾 Safety</Text>
                    <Text style={styles.specDetail}>
                      {activePlant.petFriendly ? 'Pet Friendly' : 'Toxic to Pets'}
                    </Text>
                  </View>
                </View>

                {/* Next Watering in Modal */}
                <View style={styles.wateringScheduleBox}>
                  <View style={styles.calendarIconContainer}>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </View>
                  <View style={styles.scheduleDetails}>
                    <Text style={styles.scheduleTitle}>Next Watering Reminder</Text>
                    <Text style={styles.scheduleTimestamp}>
                      {getNextWateringSchedule(activePlant)}
                    </Text>
                  </View>
                </View>

                {/* Soil requirement */}
                <Text style={styles.sectionHeading}>Soil & Substrate</Text>
                <Text style={styles.modalDescription}>{activePlant.soil}</Text>

                {/* Care Tips */}
                <Text style={styles.sectionHeading}>Pro Care Tips</Text>
                {activePlant.careTips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>✓</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Action: Chat with this plant */}
              <View style={styles.modalFooter}>
                <Pressable
                  onPress={() => {
                    const plant = activePlant;
                    setActivePlant(null);
                    if (onChatPlant) {
                      onChatPlant(plant);
                    } else if (onAskPlant) {
                      onAskPlant(plant.name);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.askAiButton,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.askAiButtonText}>
                    💬 Chat with {activePlant.name}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(132, 162, 130, 0.25)',
  },
  iconBtn: {
    width: 38,
    height: 38,
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
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3F5F3E',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6A8068',
  },
  btnPressed: {
    opacity: 0.75,
  },
  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
    elevation: 1,
  },
  weatherBannerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherBannerIcon: {
    fontSize: 16,
  },
  weatherBannerTextWrap: {
    flex: 1,
  },
  weatherBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2A4729',
  },
  weatherBannerTip: {
    fontSize: 10.5,
    color: '#6A8068',
    marginTop: 1,
  },
  weatherHumidityBadge: {
    backgroundColor: '#F3F8F2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  weatherHumidityText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#3F5F3E',
  },
  listContent: {
    paddingBottom: 16,
    gap: 10,
  },
  plantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.3)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardPressed: {
    opacity: 0.88,
  },
  wateringScheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F8F2',
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 10,
    gap: 8,
  },
  calendarIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.25)',
  },
  calendarIcon: {
    fontSize: 14,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6A8068',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleTimestamp: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2A4729',
    marginTop: 1,
  },
  plantChatBtn: {
    marginTop: 10,
    backgroundColor: '#84A282',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#84A282',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  plantChatBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  plantChatBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  plantIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  plantIconText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plantName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A4729',
  },
  petBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  petBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#137333',
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6A8068',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAF6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(132, 162, 130, 0.25)',
  },
  metricLabel: {
    fontSize: 10,
    color: '#6A8068',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2A4729',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FCF0DA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(132, 162, 130, 0.3)',
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#84A282',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalIconText: {
    fontSize: 26,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A4729',
  },
  modalSub: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6A8068',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAE2D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3F5F3E',
  },
  modalBody: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A4729',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#3F5F3E',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  specBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.3)',
  },
  specTitle: {
    fontSize: 11,
    color: '#6A8068',
    marginBottom: 2,
  },
  specDetail: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2A4729',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipBullet: {
    color: '#84A282',
    fontWeight: '800',
    marginRight: 8,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#3F5F3E',
  },
  modalFooter: {
    paddingTop: 8,
  },
  askAiButton: {
    backgroundColor: '#84A282',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#84A282',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  askAiButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
