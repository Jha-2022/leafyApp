import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PRESET_CITIES } from '../../backend';

export default function WeatherWidget({
  weather,
  onRefresh,
  onSelectCity,
  currentTime,
  isRefreshing,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  if (!weather) return null;

  return (
    <>
      {/* Compact Real-Time Weather Bar */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [styles.widgetContainer, pressed && styles.widgetPressed]}
        accessibilityLabel="Live weather and time information"
      >
        <View style={styles.topRow}>
          {/* Weather Icon & Temp */}
          <View style={styles.weatherMain}>
            <View style={styles.iconCircle}>
              <Text style={styles.weatherIcon}>{weather.icon}</Text>
            </View>
            <View>
              <View style={styles.tempLocationRow}>
                <Text style={styles.temperature}>{weather.temperature}°C</Text>
                <Text style={styles.cityText}>📍 {weather.city}</Text>
              </View>
              <Text style={styles.conditionText}>{weather.condition}</Text>
            </View>
          </View>

          {/* Live Time & Humidity */}
          <View style={styles.statsRight}>
            <Text style={styles.clockText}>🕒 {currentTime || weather.lastUpdated}</Text>
            <View style={styles.humidityBadge}>
              <Text style={styles.humidityText}>💧 {weather.humidity}%</Text>
            </View>
          </View>
        </View>

        {/* Botanical Care Advisory Strip */}
        <View style={styles.advisoryStrip}>
          <Text style={styles.leafIcon}>🌿</Text>
          <Text style={styles.advisoryText} numberOfLines={1}>
            {weather.botanicalAdvice}
          </Text>
          <Text style={styles.moreHint}>ⓘ</Text>
        </View>
      </Pressable>

      {/* Expanded Real-Time Weather Details Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>🌤️ Live Weather & Plant Insights</Text>
                <Text style={styles.modalSubtitle}>
                  Real-time conditions in {weather.city} • {currentTime}
                </Text>
              </View>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Primary Weather Hero Card */}
              <View style={styles.weatherHeroCard}>
                <View style={styles.heroLeft}>
                  <Text style={styles.heroIcon}>{weather.icon}</Text>
                  <View>
                    <Text style={styles.heroTemp}>{weather.temperature}°C</Text>
                    <Text style={styles.heroFeelsLike}>
                      Feels like {weather.apparentTemperature}°C
                    </Text>
                  </View>
                </View>

                <View style={styles.heroRight}>
                  <Text style={styles.heroCondition}>{weather.condition}</Text>
                  <Text style={styles.heroCity}>📍 {weather.city}</Text>
                </View>
              </View>

              {/* Grid Metrics */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxIcon}>💧</Text>
                  <Text style={styles.metricBoxLabel}>Humidity</Text>
                  <Text style={styles.metricBoxVal}>{weather.humidity}%</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxIcon}>💨</Text>
                  <Text style={styles.metricBoxLabel}>Wind Speed</Text>
                  <Text style={styles.metricBoxVal}>{weather.windSpeed} km/h</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxIcon}>🌧️</Text>
                  <Text style={styles.metricBoxLabel}>Precipitation</Text>
                  <Text style={styles.metricBoxVal}>{weather.precipitation} mm</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxIcon}>🕒</Text>
                  <Text style={styles.metricBoxLabel}>Last Sync</Text>
                  <Text style={styles.metricBoxVal}>{weather.lastUpdated}</Text>
                </View>
              </View>

              {/* Botanical Care Advisory */}
              <View style={styles.advisoryCard}>
                <View style={styles.advisoryHeader}>
                  <Text style={styles.advisoryHeaderIcon}>🌿</Text>
                  <Text style={styles.advisoryHeaderTitle}>Live Botanical Advisory</Text>
                </View>
                <Text style={styles.advisoryBody}>{weather.botanicalAdvice}</Text>
                <View style={styles.tipBulletRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipBulletText}>
                    {weather.temperature > 28
                      ? 'High temperatures accelerate soil evaporation. Check potting soil before dusk.'
                      : 'Moderate temperature allows stable root moisture absorption.'}
                  </Text>
                </View>
                <View style={styles.tipBulletRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipBulletText}>
                    {weather.humidity >= 60
                      ? 'Humidity is healthy for Monsteras, Ferns, and Pothos.'
                      : 'Consider grouping plants or misting to boost microclimate humidity.'}
                  </Text>
                </View>
              </View>

              {/* City Selector */}
              <Text style={styles.citySelectHeader}>Switch Location</Text>
              <View style={styles.cityPillsWrap}>
                {PRESET_CITIES.map((c) => {
                  const isSelected = weather.city.toLowerCase() === c.name.toLowerCase() || (c.name.startsWith('Auto') && weather.city === 'Mumbai');
                  return (
                    <Pressable
                      key={c.name}
                      onPress={() => {
                        onSelectCity?.(c.name);
                      }}
                      style={[styles.cityPill, isSelected && styles.cityPillActive]}
                    >
                      <Text
                        style={[
                          styles.cityPillText,
                          isSelected && styles.cityPillTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => {
                  onRefresh?.();
                }}
                disabled={isRefreshing}
                style={({ pressed }) => [
                  styles.refreshBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.refreshBtnText}>
                  {isRefreshing ? '⏳ Syncing...' : '🔄 Refresh Live Weather'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  widgetContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  widgetPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIcon: {
    fontSize: 18,
  },
  tempLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A4729',
  },
  cityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#526E50',
  },
  conditionText: {
    fontSize: 11,
    color: '#6A8068',
  },
  statsRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  clockText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3F5F3E',
  },
  humidityBadge: {
    backgroundColor: '#EAF2E9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  humidityText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2A4729',
  },
  advisoryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F8F2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    gap: 6,
  },
  leafIcon: {
    fontSize: 12,
  },
  advisoryText: {
    flex: 1,
    fontSize: 11,
    color: '#3F5F3E',
    fontWeight: '600',
  },
  moreHint: {
    fontSize: 11,
    color: '#84A282',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FCF0DA',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '88%',
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
  modalTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2A4729',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#6A8068',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAE2D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3F5F3E',
  },
  modalScroll: {
    maxHeight: 460,
  },
  weatherHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
    marginBottom: 12,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIcon: {
    fontSize: 36,
  },
  heroTemp: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2A4729',
  },
  heroFeelsLike: {
    fontSize: 11.5,
    color: '#6A8068',
  },
  heroRight: {
    alignItems: 'flex-end',
  },
  heroCondition: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3F5F3E',
  },
  heroCity: {
    fontSize: 12,
    color: '#526E50',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metricBox: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.25)',
  },
  metricBoxIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  metricBoxLabel: {
    fontSize: 10.5,
    color: '#6A8068',
    textTransform: 'uppercase',
  },
  metricBoxVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A4729',
    marginTop: 1,
  },
  advisoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
    marginBottom: 14,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  advisoryHeaderIcon: {
    fontSize: 16,
  },
  advisoryHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A4729',
  },
  advisoryBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#3F5F3E',
    fontWeight: '600',
    marginBottom: 8,
  },
  tipBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  tipBullet: {
    fontSize: 14,
    color: '#84A282',
    fontWeight: '800',
  },
  tipBulletText: {
    flex: 1,
    fontSize: 12,
    color: '#526E50',
    lineHeight: 17,
  },
  citySelectHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A4729',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cityPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  cityPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.35)',
  },
  cityPillActive: {
    backgroundColor: '#84A282',
    borderColor: '#84A282',
  },
  cityPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#3F5F3E',
  },
  cityPillTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(132, 162, 130, 0.25)',
  },
  refreshBtn: {
    backgroundColor: '#84A282',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
