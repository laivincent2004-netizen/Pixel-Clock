import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import * as Font from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

const backgrounds = [
  require("./assets/images/pixel-sky-bg.jpg"),
  require("./assets/images/pixel-grass-bg.jpg"),
  require("./assets/images/pixel-sunset-bg.jpg"),
];

const clockColors = ["#00ffcc", "#ffcc00", "#ff6699", "#ffffff"];

export default function App() {
  const [time, setTime] = useState(new Date());
  const [bgIndex, setBgIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const [themeVisible, setThemeVisible] = useState(false);
  const [themeTab, setThemeTab] = useState("Background");

  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const [isScrollOpen, setIsScrollOpen] = useState(true); // 控制卷轴开关

  // 🟢 加载字体
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        PressStart2P: require("./assets/fonts/PressStart2P-Regular.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  // 🟢 时钟计时
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🟢 从存储中恢复数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem("tasks");
        const savedBg = await AsyncStorage.getItem("bgIndex");
        const savedColor = await AsyncStorage.getItem("colorIndex");

        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedBg !== null) setBgIndex(Number(savedBg));
        if (savedColor !== null) setColorIndex(Number(savedColor));
      } catch (err) {
        console.log("加载数据失败:", err);
      }
    };
    loadData();
  }, []);

  // 🟢 保存任务、背景、颜色
  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    AsyncStorage.setItem("bgIndex", String(bgIndex));
  }, [bgIndex]);

  useEffect(() => {
    AsyncStorage.setItem("colorIndex", String(colorIndex));
  }, [colorIndex]);

  // 时间格式
  const formatTime = (date) => date.toLocaleTimeString("en-GB");
  const formatDate = (date) => {
    const day = date.toLocaleDateString("zh-CN", { weekday: "long" });
    const dateStr = date.toLocaleDateString("zh-CN");
    return `${dateStr} · ${day}`;
  };

  // 任务管理
  const addTask = () => {
    if (input.trim() === "") return;
    setTasks([...tasks, { text: input, done: false }]);
    setInput("");
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((t) => !t.done));
  };

  if (!fontsLoaded) return <Text>加载中...</Text>;

  return (
    <ImageBackground
      source={backgrounds[bgIndex]}
      style={styles.background}
      resizeMode="cover"
    >
      {/* 🎨 左上角 Theme 按钮 */}
      <TouchableOpacity
        style={styles.themeButton}
        onPress={() => setThemeVisible(true)}
      >
        <Text style={styles.themeButtonText}>🎨</Text>
      </TouchableOpacity>

      {/* 📋 任务单 */}
      <View style={{ position: "absolute", top: 50, right: 20 }}>
        {isScrollOpen ? (
          <ImageBackground
            source={require("./assets/images/scroll.png")}
            style={styles.scrollOpen}
            resizeMode="stretch"
          >
            {/* 右上角关闭按钮 */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsScrollOpen(false)}
            >
              <Text style={styles.closeBtnText}>×</Text>
            </TouchableOpacity>

            {/* 卷轴内部内容 */}
            <View style={styles.scrollContent}>
              <FlatList
                data={tasks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => toggleTask(index)}>
                    <Text
                      style={[
                        styles.taskItem,
                        item.done && styles.taskDone,
                      ]}
                    >
                      - {item.text}
                    </Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 200 }}
              />

              {/* 输入框 + 按钮贴底部 */}
              <TextInput
                style={styles.input}
                placeholder="添加任务..."
                placeholderTextColor="#ccc"
                value={input}
                onChangeText={setInput}
              />
              <View style={styles.taskButtons}>
                <TouchableOpacity onPress={addTask} style={styles.addButton}>
                  <Text style={styles.addText}>添加</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={clearCompleted}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearText}>清除完成</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        ) : (
          <TouchableOpacity onPress={() => setIsScrollOpen(true)}>
            <Image
              source={require("./assets/images/scroll-closed.png")}
              style={{ width: 80, height: 50 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 🕒 时钟 + 日期 */}
      <View style={{ alignItems: "center" }}>
        <Text style={[styles.clock, { color: clockColors[colorIndex] }]}>
          {formatTime(time)}
        </Text>
        <Text style={[styles.date, { color: clockColors[colorIndex] }]}>
          {formatDate(time)}
        </Text>
      </View>

      {/* 🎨 主题浮窗 */}
      <Modal visible={themeVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.tabBar}>
              <TouchableOpacity onPress={() => setThemeTab("Background")}>
                <Text
                  style={[
                    styles.tabText,
                    themeTab === "Background" && styles.tabActive,
                  ]}
                >
                  背景
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setThemeTab("Color")}>
                <Text
                  style={[
                    styles.tabText,
                    themeTab === "Color" && styles.tabActive,
                  ]}
                >
                  颜色
                </Text>
              </TouchableOpacity>
            </View>

            {themeTab === "Background" && (
              <View style={styles.previewGrid}>
                {backgrounds.map((bg, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setBgIndex(i)}
                    style={[
                      styles.previewBox,
                      bgIndex === i && styles.previewSelected,
                    ]}
                  >
                    <Image source={bg} style={styles.previewImage} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {themeTab === "Color" && (
              <View style={styles.colorRow}>
                {clockColors.map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setColorIndex(i)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      colorIndex === i && styles.colorSelected,
                    ]}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setThemeVisible(false)}
            >
              <Text style={styles.closeText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  clock: { fontSize: 36, fontFamily: "PressStart2P", marginBottom: 10 },
  date: { fontSize: 12, fontFamily: "PressStart2P", color: "#fff" },

  themeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  themeButtonText: { fontSize: 18, color: "#fff" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 12,
    width: 280,
    alignItems: "center",
  },

  tabBar: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-around",
    width: "100%",
  },
  tabText: { fontFamily: "PressStart2P", fontSize: 10, color: "#aaa" },
  tabActive: { color: "#fff", textDecorationLine: "underline" },

  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  previewBox: {
    margin: 5,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 6,
  },
  previewImage: { width: 80, height: 45, borderRadius: 4 },
  previewSelected: { borderColor: "#00ffcc" },

  colorRow: { flexDirection: "row", marginBottom: 10 },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#333",
    marginHorizontal: 5,
  },
  colorSelected: { borderColor: "#fff" },

  closeButton: {
    marginTop: 10,
    backgroundColor: "#00ffcc",
    padding: 8,
    borderRadius: 6,
  },
  closeText: { fontFamily: "PressStart2P", fontSize: 10, color: "#000" },

  // 📋 任务卷轴
  scrollOpen: {
    width: 220,
    height: 280,
    paddingVertical: 55,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  closeBtnText: {
    fontSize: 18,
    color: "white",
  },
  scrollContent: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
  },
  taskItem: {
    fontFamily: "PressStart2P",
    fontSize: 10,
    color: "#fff",
    marginBottom: 2,
  },
  taskDone: { color: "#aaa", textDecorationLine: "line-through" },
  input: {
    fontFamily: "PressStart2P",
    fontSize: 8,
    color: "#fff",
    borderBottomWidth: 1,
    borderColor: "#fff",
    marginBottom: 5,
    padding: 2,
  },
  taskButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addButton: {
    backgroundColor: "#00ffcc",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
    borderRadius: 4,
  },
  clearButton: {
    backgroundColor: "#ff6699",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
    flex: 1,
    borderRadius: 4,
  },
  addText: { fontFamily: "PressStart2P", fontSize: 8, color: "#000" },
  clearText: { fontFamily: "PressStart2P", fontSize: 8, color: "#fff" },
});
