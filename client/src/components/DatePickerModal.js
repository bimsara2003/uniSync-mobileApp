import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePickerModal({ visible, onClose, value, onSelect, title }) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = value.split("-").map(Number);
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    } else {
      const today = new Date();
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth());
    }
  }, [value, visible]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getDaysArray = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];
    // Padding days for empty start slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleDaySelect = (day) => {
    if (!day) return;
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const selectedDate = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onSelect(selectedDate);
    onClose();
  };

  const isSelected = (day) => {
    if (!day || !value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return y === currentYear && m === currentMonth + 1 && d === day;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day
    );
  };

  const days = getDaysArray();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header with Custom Title */}
          <View style={styles.headerRow}>
            <Text style={styles.titleText}>{title || "Select Date"}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIconButton}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Month/Year Navigation */}
          <View style={styles.navigationRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#1a3c6e" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#1a3c6e" />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((day, idx) => (
              <Text key={idx} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              const selected = isSelected(day);
              const current = isToday(day);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => day && handleDaySelect(day)}
                  disabled={!day}
                  style={[
                    styles.dayCell,
                    selected && styles.selectedDayCell,
                    !day && styles.emptyDayCell,
                  ]}
                >
                  {day ? (
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.selectedDayText,
                        current && !selected && styles.todayDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  ) : null}
                  {current && !selected && <View style={styles.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Clear Button / Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={() => {
                onSelect("");
                onClose();
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear Date</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.88,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeIconButton: {
    padding: 4,
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a3c6e",
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 2,
    position: "relative",
  },
  emptyDayCell: {
    backgroundColor: "transparent",
  },
  selectedDayCell: {
    backgroundColor: "#1a3c6e",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  selectedDayText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  todayDayText: {
    color: "#1a3c6e",
    fontWeight: "700",
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1a3c6e",
    position: "absolute",
    bottom: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#f1f5f9",
    paddingTop: 14,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  doneButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
});
