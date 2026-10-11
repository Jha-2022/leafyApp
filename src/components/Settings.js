import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getNextWateringSchedule } from './PlantLibrary';
import { PRESET_CITIES } from '../../backend';

const EMOJI_OPTIONS = ['🌿', '🪴', '🌸', '🌱', '🍃', '✨', '🌳', '🕷️', '🪔', '📿', '🌵', '🌺', '🌾', '🎋'];
const DIFFICULTY_OPTIONS = ['Beginner', 'Easy', 'Moderate', 'Difficult'];
const LIGHT_OPTIONS = ['Low Light', 'Medium indirect', 'Bright indirect', 'Direct sunlight', 'Any light'];

export default function Settings({
  plants,
  weather,
  currentTime,
  onRefreshWeather,
  onSelectCity,
  onAddPlant,
  onUpdatePlant,
  onDeletePlant,
  onResetPlants,
  onOpenSidebar,
  onNavigateLibrary,
}) {
  const [editingPlant, setEditingPlant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(null);
  const [savedNotice, setSavedNotice] = useState('');

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingPlant({ id: null });
    setForm({
      name: '',
      scientificName: '',
      icon: '🌿',
      water: 'Every 1-2 weeks',
      waterIntervalDays: '7',
      preferredWaterTime: '09:00 AM',
      light: 'Bright indirect',
      difficulty: 'Easy',
      petFriendly: true,
      description: '',
      soil: 'Chunky, well-aerated potting mix',
      careTips: 'Water when top 2 inches of soil feel dry\nProvide plenty of bright, indirect sunlight',
    });
  };

  const handleOpenEdit = (plant) => {
    setIsAdding(false);
    setEditingPlant(plant);
    setForm({
      name: plant.name || '',
      scientificName: plant.scientificName || '',
      icon: plant.icon || '🌿',
      water: plant.water || '',
      waterIntervalDays: String(plant.waterIntervalDays || 7),
      preferredWaterTime: plant.preferredWaterTime || '09:00 AM',
      light: plant.light || 'Bright indirect',
      difficulty: plant.difficulty || 'Easy',
      petFriendly: Boolean(plant.petFriendly),
      description: plant.description || '',
      soil: plant.soil || '',
      careTips: Array.isArray(plant.careTips) ? plant.careTips.join('\n') : '',
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Plant name cannot be empty.');
      return;
    }

    const intervalDays = parseInt(form.waterIntervalDays, 10);
    const validIntervalDays = isNaN(intervalDays) || intervalDays <= 0 ? 7 : intervalDays;

    const updatedTips = form.careTips
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (isAdding) {
      const newPlant = {
        id: `custom-plant-${Date.now()}`,
        name: form.name.trim(),
        scientificName: form.scientificName.trim() || form.name.trim(),
        category: 'Indoor',
        icon: form.icon.trim() || '🌿',
        water: form.water.trim() || 'Regularly',
        waterIntervalDays: validIntervalDays,
        preferredWaterTime: form.preferredWaterTime.trim() || '09:00 AM',
        light: form.light.trim() || 'Bright indirect',
        difficulty: form.difficulty.trim() || 'Easy',
        petFriendly: form.petFriendly,
        description:
          form.description.trim() ||
          `A wonderful botanical houseplant cherished for its vibrant green foliage and natural air-purifying qualities.`,
        soil: form.soil.trim() || 'Standard well-draining houseplant mix.',
        careTips:
          updatedTips.length > 0
            ? updatedTips
            : ['Water when soil dries out', 'Protect from drafts and cold air vents'],
      };

      onAddPlant?.(newPlant);
      setIsAdding(false);
      setEditingPlant(null);
      setForm(null);

      setSavedNotice(`✓ "${newPlant.name}" added to Plant Library!`);
      setTimeout(() => setSavedNotice(''), 4000);
      return;
    }

    const updatedPlant = {
      ...editingPlant,
      name: form.name.trim(),
      scientificName: form.scientificName.trim(),
      icon: form.icon.trim() || '🌿',
      water: form.water.trim() || 'Regularly',
      waterIntervalDays: validIntervalDays,
      preferredWaterTime: form.preferredWaterTime.trim() || '09:00 AM',
      light: form.light.trim() || 'Bright indirect',
      difficulty: form.difficulty.trim() || 'Easy',
      petFriendly: form.petFriendly,
      description: form.description.trim(),
      soil: form.soil.trim(),
      careTips: updatedTips.length > 0 ? updatedTips : editingPlant.careTips,
    };

    onUpdatePlant?.(updatedPlant);
    setIsAdding(false);
    setEditingPlant(null);
    setForm(null);

    setSavedNotice(`✓ "${updatedPlant.name}" updated! Changes appear in Plant Library.`);
    setTimeout(() => {
      setSavedNotice('');
    }, 4000);
  };

  const handleDeleteConfirm = (plant) => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to remove "${plant.name}" from your Plant Library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeletePlant?.(plant.id);
            setSavedNotice(`✓ "${plant.name}" removed from library.`);
            setTimeout(() => setSavedNotice(''), 4000);
          },
        },
      ]
    );
  };

  const handleResetConfirm = () => {
    Alert.alert(
      'Reset Plant Library',
      'Are you sure you want to restore all plant cards back to their default details?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Defaults',
          style: 'destructive',
          onPress: () => {
            onResetPlants?.();
            setSavedNotice('✓ All plant cards reset to default botanical data.');
            setTimeout(() => setSavedNotice(''), 4000);
          },
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <Text style={styles.headerSubtitle}>Plant Library Card Editor</Text>
        </View>

        {onNavigateLibrary && (
          <Pressable
            onPress={onNavigateLibrary}
            style={({ pressed }) => [styles.viewLibBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.viewLibBtnText}>🌿 Library</Text>
          </Pressable>
        )}
      </View>

      {/* Success Notification Banner */}
      {savedNotice.length > 0 && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeBannerText}>{savedNotice}</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Info Card Banner */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <Text style={styles.infoIcon}>📝</Text>
            <Text style={styles.infoTitle}>Plant Library Management</Text>
          </View>
          <Text style={styles.infoDesc}>
            Add new plants or edit details for any existing plant card below. Custom names, watering
            schedules, difficulty, and care tips will instantly appear in the Plant Library and your
            interactive plant chatbots.
          </Text>
        </View>

        {/* Real-Time Live Weather Card in Settings */}
        {weather && (
          <View style={styles.weatherStatusCard}>
            <View style={styles.weatherStatusHeader}>
              <View style={styles.weatherStatusHeaderLeft}>
                <View style={styles.weatherStatusIconCircle}>
                  <Text style={styles.weatherStatusIcon}>{weather.icon}</Text>
                </View>
                <View>
                  <Text style={styles.weatherStatusTitle}>Real-Time Weather</Text>
                  <Text style={styles.weatherStatusSub}>
                    {weather.city} • {currentTime || weather.lastUpdated} • {weather.condition}
                  </Text>
                </View>
              </View>
              {onRefreshWeather && (
                <Pressable
                  onPress={onRefreshWeather}
                  style={({ pressed }) => [styles.syncWeatherBtn, pressed && styles.btnPressed]}
                >
                  <Text style={styles.syncWeatherBtnText}>🔄 Refresh</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.weatherMetricsRow}>
              <View style={styles.weatherMetricBox}>
                <Text style={styles.weatherMetricLabel}>Temperature</Text>
                <Text style={styles.weatherMetricVal}>{weather.temperature}°C</Text>
              </View>
              <View style={styles.weatherMetricDivider} />
              <View style={styles.weatherMetricBox}>
                <Text style={styles.weatherMetricLabel}>Humidity</Text>
                <Text style={styles.weatherMetricVal}>{weather.humidity}%</Text>
              </View>
              <View style={styles.weatherMetricDivider} />
              <View style={styles.weatherMetricBox}>
                <Text style={styles.weatherMetricLabel}>Wind Speed</Text>
                <Text style={styles.weatherMetricVal}>{weather.windSpeed} km/h</Text>
              </View>
            </View>

            <View style={styles.weatherAdviceRow}>
              <Text style={styles.weatherAdviceIcon}>🌿</Text>
              <Text style={styles.weatherAdviceText}>{weather.botanicalAdvice}</Text>
            </View>

            {onSelectCity && (
              <View style={styles.settingsCitySelectWrap}>
                <Text style={styles.settingsCitySelectLabel}>Switch City / Region:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cityChipsScroll}
                >
                  {PRESET_CITIES.map((c) => {
                    const isSelected =
                      weather.city.toLowerCase() === c.name.toLowerCase() ||
                      (c.name.startsWith('Auto') && weather.city === 'Mumbai');
                    return (
                      <Pressable
                        key={c.name}
                        onPress={() => onSelectCity(c.name)}
                        style={[styles.settingsCityChip, isSelected && styles.settingsCityChipActive]}
                      >
                        <Text
                          style={[
                            styles.settingsCityChipText,
                            isSelected && styles.settingsCityChipTextActive,
                          ]}
                        >
                          {c.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Add Plant Banner Button */}
        <Pressable
          onPress={handleOpenAdd}
          style={({ pressed }) => [styles.addPlantBanner, pressed && styles.btnPressed]}
        >
          <View style={styles.addPlantIconBadge}>
            <Text style={styles.addPlantIconText}>🌱</Text>
          </View>
          <View style={styles.addPlantTextWrap}>
            <Text style={styles.addPlantTitle}>+ Add a New Plant</Text>
            <Text style={styles.addPlantSub}>Customize details, watering schedule & tips</Text>
          </View>
          <View style={styles.addPlantActionTag}>
            <Text style={styles.addPlantActionText}>New +</Text>
          </View>
        </Pressable>

        {/* Plant List Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Plant Cards ({plants?.length || 0})</Text>
            <Text style={styles.sectionSubtitle}>Tap "Edit Details" to customize</Text>
          </View>
          <Pressable
            onPress={handleOpenAdd}
            style={({ pressed }) => [styles.miniAddBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.miniAddBtnText}>+ Add Plant</Text>
          </Pressable>
        </View>

        {plants?.map((plant) => (
          <View key={plant.id} style={styles.plantSettingCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.plantIconBadge}>
                <Text style={styles.plantIconText}>{plant.icon}</Text>
              </View>
              <View style={styles.cardHeaderInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.plantName}>{plant.name}</Text>
                  {plant.petFriendly && (
                    <View style={styles.petBadge}>
                      <Text style={styles.petBadgeText}>🐾 Pet Safe</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.scientificName}>{plant.scientificName}</Text>
              </View>
            </View>

            {/* Quick Summary Specs */}
            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>💧 Water</Text>
                <Text style={styles.specValue}>{plant.water}</Text>
              </View>
              <View style={styles.specDivider} />
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>☀️ Light</Text>
                <Text style={styles.specValue}>{plant.light}</Text>
              </View>
              <View style={styles.specDivider} />
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>🌱 Care</Text>
                <Text style={styles.specValue}>{plant.difficulty}</Text>
              </View>
            </View>

            {/* Next Watering Schedule */}
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleIcon}>📅</Text>
              <Text style={styles.scheduleText}>Next: {getNextWateringSchedule(plant)}</Text>
            </View>

            {/* Action Buttons: Edit & Delete */}
            <View style={styles.cardActionsRow}>
              <Pressable
                onPress={() => handleOpenEdit(plant)}
                style={({ pressed }) => [styles.editBtn, pressed && styles.btnPressed]}
              >
                <Text style={styles.editBtnText}>✏️ Edit Details</Text>
              </Pressable>

              <Pressable
                onPress={() => handleDeleteConfirm(plant)}
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.btnPressed]}
                accessibilityLabel={`Delete ${plant.name}`}
              >
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Reset to Defaults Option */}
        <View style={styles.resetContainer}>
          <Pressable
            onPress={handleResetConfirm}
            style={({ pressed }) => [styles.resetBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.resetBtnText}>🔄 Reset All Plants to Defaults</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Add / Edit Plant Modal */}
      {editingPlant && form && (
        <Modal
          animationType="slide"
          transparent
          visible={!!editingPlant}
          onRequestClose={() => {
            setIsAdding(false);
            setEditingPlant(null);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBackdrop}
          >
            <View style={styles.modalCard}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Text style={styles.modalHeaderIcon}>{form.icon}</Text>
                  <View>
                    <Text style={styles.modalHeaderTitle}>
                      {isAdding ? 'Add New Plant' : 'Edit Plant Details'}
                    </Text>
                    <Text style={styles.modalHeaderSub}>
                      {isAdding ? 'Configure botanical card' : editingPlant.name}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    setIsAdding(false);
                    setEditingPlant(null);
                  }}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalFormScroll}>
                {/* Plant Name */}
                <Text style={styles.fieldLabel}>Plant Display Name *</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="e.g. Ficus Elastica, Jade Plant, Monstera..."
                  placeholderTextColor="#84A282"
                />

                {/* Scientific Name */}
                <Text style={styles.fieldLabel}>Scientific Botanical Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.scientificName}
                  onChangeText={(text) => setForm({ ...form, scientificName: text })}
                  placeholder="e.g. Ficus elastica, Crassula ovata..."
                  placeholderTextColor="#84A282"
                />

                {/* Emoji / Icon */}
                <Text style={styles.fieldLabel}>Plant Icon / Emoji</Text>
                <View style={styles.emojiPickerRow}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => setForm({ ...form, icon: emoji })}
                      style={[styles.emojiChip, form.icon === emoji && styles.emojiChipActive]}
                    >
                      <Text style={styles.emojiChipText}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Water Instructions */}
                <Text style={styles.fieldLabel}>Watering Frequency Label</Text>
                <TextInput
                  style={styles.input}
                  value={form.water}
                  onChangeText={(text) => setForm({ ...form, water: text })}
                  placeholder="e.g. Every 1-2 weeks, When soil dries..."
                  placeholderTextColor="#84A282"
                />

                {/* Watering Interval in Days & Preferred Time */}
                <View style={styles.twoColumnRow}>
                  <View style={styles.twoColumnItem}>
                    <Text style={styles.fieldLabel}>Water Interval (Days)</Text>
                    <TextInput
                      style={styles.input}
                      value={form.waterIntervalDays}
                      keyboardType="numeric"
                      onChangeText={(text) => setForm({ ...form, waterIntervalDays: text })}
                      placeholder="e.g. 7"
                      placeholderTextColor="#84A282"
                    />
                  </View>
                  <View style={styles.twoColumnItem}>
                    <Text style={styles.fieldLabel}>Preferred Time</Text>
                    <TextInput
                      style={styles.input}
                      value={form.preferredWaterTime}
                      onChangeText={(text) => setForm({ ...form, preferredWaterTime: text })}
                      placeholder="e.g. 09:30 AM"
                      placeholderTextColor="#84A282"
                    />
                  </View>
                </View>

                {/* Sunlight Requirements */}
                <Text style={styles.fieldLabel}>Sunlight Requirement</Text>
                <View style={styles.chipsWrap}>
                  {LIGHT_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setForm({ ...form, light: opt })}
                      style={[styles.chip, form.light === opt && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, form.light === opt && styles.chipTextActive]}>
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={[styles.input, { marginTop: 6 }]}
                  value={form.light}
                  onChangeText={(text) => setForm({ ...form, light: text })}
                  placeholder="Or custom sunlight instructions..."
                  placeholderTextColor="#84A282"
                />

                {/* Care Difficulty */}
                <Text style={styles.fieldLabel}>Care Difficulty</Text>
                <View style={styles.chipsWrap}>
                  {DIFFICULTY_OPTIONS.map((diff) => (
                    <Pressable
                      key={diff}
                      onPress={() => setForm({ ...form, difficulty: diff })}
                      style={[styles.chip, form.difficulty === diff && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, form.difficulty === diff && styles.chipTextActive]}>
                        {diff}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Pet Friendly Toggle */}
                <Text style={styles.fieldLabel}>Pet Safety</Text>
                <View style={styles.petToggleRow}>
                  <Pressable
                    onPress={() => setForm({ ...form, petFriendly: true })}
                    style={[styles.petToggleBtn, form.petFriendly && styles.petToggleBtnSafe]}
                  >
                    <Text
                      style={[
                        styles.petToggleText,
                        form.petFriendly && styles.petToggleTextActive,
                      ]}
                    >
                      🐾 Pet Safe
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setForm({ ...form, petFriendly: false })}
                    style={[styles.petToggleBtn, !form.petFriendly && styles.petToggleBtnToxic]}
                  >
                    <Text
                      style={[
                        styles.petToggleText,
                        !form.petFriendly && styles.petToggleTextActive,
                      ]}
                    >
                      ⚠️ Toxic to Pets
                    </Text>
                  </Pressable>
                </View>

                {/* Description */}
                <Text style={styles.fieldLabel}>Plant Description / About</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  numberOfLines={4}
                  value={form.description}
                  onChangeText={(text) => setForm({ ...form, description: text })}
                  placeholder="About the plant appearance, native habitat, and care vibe..."
                  placeholderTextColor="#84A282"
                />

                {/* Soil & Substrate */}
                <Text style={styles.fieldLabel}>Recommended Soil & Mix</Text>
                <TextInput
                  style={styles.input}
                  value={form.soil}
                  onChangeText={(text) => setForm({ ...form, soil: text })}
                  placeholder="e.g. Chunky, well-aerated potting mix..."
                  placeholderTextColor="#84A282"
                />

                {/* Care Tips */}
                <Text style={styles.fieldLabel}>Pro Care Tips (one per line)</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  numberOfLines={4}
                  value={form.careTips}
                  onChangeText={(text) => setForm({ ...form, careTips: text })}
                  placeholder="Tip 1&#10;Tip 2&#10;Tip 3"
                  placeholderTextColor="#84A282"
                />
              </ScrollView>

              {/* Modal Action Buttons */}
              <View style={styles.modalActionRow}>
                <Pressable
                  onPress={() => {
                    setIsAdding(false);
                    setEditingPlant(null);
                  }}
                  style={[styles.modalBtn, styles.cancelBtn]}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  style={[styles.modalBtn, styles.saveBtn]}
                >
                  <Text style={styles.saveBtnText}>
                    {isAdding ? '➕ Add to Library' : '💾 Save Changes'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
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
  btnPressed: {
    opacity: 0.75,
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
  viewLibBtn: {
    backgroundColor: '#84A282',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  viewLibBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  noticeBanner: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#34A853',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  noticeBannerText: {
    color: '#137333',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A4729',
  },
  infoDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#526E50',
  },
  weatherStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
  },
  weatherStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weatherStatusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherStatusIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherStatusIcon: {
    fontSize: 18,
  },
  weatherStatusTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#2A4729',
  },
  weatherStatusSub: {
    fontSize: 11,
    color: '#6A8068',
    marginTop: 1,
  },
  syncWeatherBtn: {
    backgroundColor: '#EAF2E9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  syncWeatherBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2A4729',
  },
  weatherMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF7',
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  weatherMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  weatherMetricDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(132, 162, 130, 0.25)',
  },
  weatherMetricLabel: {
    fontSize: 9,
    color: '#6A8068',
  },
  weatherMetricVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2A4729',
    marginTop: 1,
  },
  weatherAdviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F8F2',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    marginBottom: 8,
  },
  weatherAdviceIcon: {
    fontSize: 12,
    marginTop: 1,
  },
  weatherAdviceText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#3F5F3E',
    fontWeight: '600',
  },
  settingsCitySelectWrap: {
    marginTop: 4,
  },
  settingsCitySelectLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6A8068',
    marginBottom: 6,
  },
  cityChipsScroll: {
    gap: 6,
  },
  settingsCityChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  settingsCityChipActive: {
    backgroundColor: '#84A282',
    borderColor: '#84A282',
  },
  settingsCityChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3F5F3E',
  },
  settingsCityChipTextActive: {
    color: '#FFFFFF',
  },
  addPlantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#84A282',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#84A282',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  addPlantIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlantIconText: {
    fontSize: 22,
  },
  addPlantTextWrap: {
    flex: 1,
  },
  addPlantTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A4729',
  },
  addPlantSub: {
    fontSize: 11,
    color: '#6A8068',
    marginTop: 2,
  },
  addPlantActionTag: {
    backgroundColor: '#84A282',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addPlantActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A4729',
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#6A8068',
  },
  miniAddBtn: {
    backgroundColor: '#84A282',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  miniAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  plantSettingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.28)',
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  plantIconText: {
    fontSize: 22,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plantName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#2A4729',
  },
  petBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  petBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#137333',
  },
  scientificName: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#6A8068',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(132, 162, 130, 0.25)',
  },
  specLabel: {
    fontSize: 9.5,
    color: '#6A8068',
  },
  specValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2A4729',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F8F2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 8,
    gap: 6,
  },
  scheduleIcon: {
    fontSize: 12,
  },
  scheduleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2A4729',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#84A282',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FCE8E6',
    borderWidth: 1,
    borderColor: '#F28B82',
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 15,
  },
  resetContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  resetBtn: {
    backgroundColor: '#FCE8E6',
    borderWidth: 1,
    borderColor: '#F28B82',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#C5221F',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FCF0DA',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '90%',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(132, 162, 130, 0.3)',
    marginBottom: 10,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalHeaderIcon: {
    fontSize: 28,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2A4729',
  },
  modalHeaderSub: {
    fontSize: 12,
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
  modalCloseText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3F5F3E',
  },
  modalFormScroll: {
    maxHeight: 460,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3F5F3E',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#84A282',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5,
    color: '#2C2B29',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoColumnItem: {
    flex: 1,
  },
  emojiPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  emojiChip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.3)',
  },
  emojiChipActive: {
    backgroundColor: '#84A282',
    borderColor: '#84A282',
  },
  emojiChipText: {
    fontSize: 18,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.4)',
  },
  chipActive: {
    backgroundColor: '#84A282',
    borderColor: '#84A282',
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#3F5F3E',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  petToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  petToggleBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.3)',
  },
  petToggleBtnSafe: {
    backgroundColor: '#E6F4EA',
    borderColor: '#34A853',
  },
  petToggleBtnToxic: {
    backgroundColor: '#FCE8E6',
    borderColor: '#EA4335',
  },
  petToggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6A8068',
  },
  petToggleTextActive: {
    color: '#2A4729',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(132, 162, 130, 0.3)',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#84A282',
  },
  cancelBtnText: {
    color: '#3F5F3E',
    fontSize: 13.5,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#84A282',
    elevation: 2,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
