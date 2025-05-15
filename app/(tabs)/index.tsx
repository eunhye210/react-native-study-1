import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import {
  Text,
  StatusBar,
  Switch,
  View,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
  Button,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const MOVIE_URL =
  "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";
const AXIOS_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NTk3ZTQ5MWVkNmU4MGYwZGUxMmUzNDllYjYwZWE2ZSIsIm5iZiI6MTUzMzE5MjY1NS4yMDYsInN1YiI6IjViNjJhOWNmMGUwYTI2N2VlNzAyYjdkYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Xv4oEQTKm9GbehUNW1O_xByTJ78x0-FFiO8_E2mts5o",
  },
};

const MovieItem = ({ item, lightMode, onClick }) => {
  return (
    <TouchableOpacity style={styles.movieItem} onPress={onClick}>
      <Image
        style={styles.movieImg}
        source={{ uri: `https://image.tmdb.org/t/p/w500/${item.poster_path}` }}
      />
      <Text
        style={{
          ...styles.movieTitle,
          color: lightMode ? "#000" : "#fff",
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};

const Index = () => {
  const [lightMode, setLightMode] = useState<boolean>(true);
  const [movies, setMovies] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(undefined);
  const [search, setSearch] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { containerStyle, barStyle } = useMemo(() => {
    const containerStyle = lightMode
      ? styles.lightContainer
      : styles.darkContainer;
    const barStyle: "light-content" | "dark-content" = lightMode
      ? "dark-content"
      : "light-content";
    return { containerStyle, barStyle };
  }, [lightMode]);

  const fetchMovies = async () => {
    try {
      const { data } = await axios.get(MOVIE_URL, AXIOS_OPTIONS);
      setMovies(data.results);
      setMovieList(data.results);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  };

  const onMovieSearch = (search: string) => {
    if (!search) {
      setMovieList(movies);
      return;
    }
    const filteredMovieList = movies.filter((movie) => {
      return movie.title.toLowerCase().includes(search);
    });
    setMovieList(filteredMovieList);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchMovies();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={containerStyle}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* 키보드에 가려지지 않도록 */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* 상단 Status Bar Theme 적용 */}
            <StatusBar barStyle={barStyle} />
            {/* Theme 변경 Switch */}
            <View style={styles.switchContainer}>
              <Text style={{ color: lightMode ? "#000" : "#fff" }}>
                {lightMode ? "LIGHT" : "DARK"}
              </Text>
              <Switch
                trackColor={{ false: "#D8E0EA", true: "#D8E0EA" }}
                thumbColor={lightMode ? "#81b0ff" : "#f4f3f4"}
                onValueChange={() =>
                  setLightMode((previousState) => !previousState)
                }
                value={lightMode}
              />
            </View>
            {/* Movie List */}
            <View style={styles.movieList}>
              <Text
                style={{
                  ...styles.ListTitle,
                  color: lightMode ? "#000" : "#fff",
                }}
              >
                Movie List
              </Text>
              <FlatList
                data={movieList}
                keyExtractor={(item) => item.id.toString()}
                horizontal={false}
                numColumns={4}
                renderItem={({ item }) => (
                  <MovieItem
                    item={item}
                    lightMode={lightMode}
                    onClick={() => setSelectedItem(item)}
                  />
                )}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={["#81b0ff"]} // 안드로이드 전용
                    tintColor="#81b0ff" // iOS 전용
                  />
                }
              />
            </View>
            {/* 검색어 */}
            <View style={styles.searchContainer}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="검색어를 입력하세요"
                style={styles.searchInput}
                onSubmitEditing={({ nativeEvent }) => {
                  onMovieSearch(nativeEvent.text);
                }}
              />
              <Button
                title="취소"
                onPress={() => {
                  setSearch("");
                  setMovieList(movies);
                }}
              />
            </View>
            <MovieDetailModal
              movie={selectedItem}
              visible={!!selectedItem}
              onClose={() => setSelectedItem(undefined)}
            />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const MovieDetailModal = ({ movie, visible, onClose }) => {
  if (!movie) return <></>;
  return (
    <Modal transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalWrapper}>
        <View style={styles.modalView}>
          <Text>{movie.title}</Text>
          <Image
            style={styles.movieImg}
            source={{
              uri: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            }}
          />
          <Button title="닫기" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  lightContainer: {
    flex: 1,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: "#94A3B8",
  },
  switchContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingRight: 7,
    "switch-text": {
      color: "red",
    },
  },
  searchContainer: {
    flexDirection: "row",
    gap: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    padding: 5,
  },
  movieList: {
    height: "80%",
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  ListTitle: {
    paddingVertical: 5,
    fontWeight: "bold",
  },
  movieItem: {
    width: "25%",
    alignItems: "center",
    padding: 4,
    marginBottom: 10,
  },
  movieImg: {
    width: "100%",
    height: 100,
  },
  movieTitle: {
    paddingTop: 5,
    paddingHorizontal: 5,
    textAlign: "center",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: 200,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Index;
