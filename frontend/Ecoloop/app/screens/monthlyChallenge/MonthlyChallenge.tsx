import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faLock, faRecycle, faUnlock} from "@fortawesome/free-solid-svg-icons";
import BackgroundContainer from "../../common/BackgroundContainer";
import config from "../../../config";
import {useIsFocused} from "@react-navigation/native";
import {getFieldFromLocalDatabase} from "../../database/database";

const Item = ({image, redeemed, locked, onClick}) => {
  return (
    <View style={[styles.item]}>
      {locked && (
        <View style={styles.lockIcon}>
          <FontAwesomeIcon icon={faLock} size={20} color="black"/>
        </View>
      )}

      {locked && <View style={styles.itemLockedOverlay}/>}

      {!locked && (
        <View style={styles.lockIcon}>
          <FontAwesomeIcon icon={faUnlock} size={20} color="black"/>
        </View>
      )}

      <Image source={{uri: image}} style={styles.itemImage}/>
      {!redeemed && !locked && (
        <TouchableOpacity onPress={onClick} style={styles.claimButton}>
          <Text style={styles.claimText}>Resgatar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const LevelMarker = ({level, locked}) => {
  return (
    <View
      style={{
        width: "10%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{flexDirection: "row"}}>
        {Array.from({length: level}).map((_, index) => (
          <FontAwesomeIcon
            key={index}
            icon={faRecycle}
            size={20}
            style={{marginHorizontal: 1, marginBottom: 3}}
            color="#315e21"
          />
        ))}
      </View>
      <View
        style={{
          width: "100%",
          backgroundColor: locked ? "#5e7357" : "#468730",
          alignItems: "center",
          borderWidth: 1,
          justifyContent: "center",
          borderRadius: 10,
          elevation: 5,
        }}
      >
        <Text style={{fontSize: 20, fontWeight: "bold", color: "white"}}>
          {level}
        </Text>
      </View>
    </View>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState({});
  const [progress, setProgress] = useState(0);
  const [xpNextLevel, setXpNextLevel] = useState(0);
  const isFocused = useIsFocused();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        if (!isFocused || !isMounted) {
          return;
        }

        const id = await getFieldFromLocalDatabase("user_id");
        if (!isMounted) return;

        setUserId(id);
        if (id) {
          const response = await fetch(`${config.API_ENDPOINT}/user/${id}`, {
            method: "GET",
          });
          if (!isMounted) return;

          if (response.ok) {
            const result = await response.json();
            loadData(result);
          } else {
            console.error("Failed to fetch user data:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  function redeem(level) {
    setLoading(true);

    fetch(config.API_ENDPOINT + `/user/${userId}/redeem?level=${level}`, {
      method: "get",
    }).then(() => {
      fetch(config.API_ENDPOINT + `/user/${userId}`, {
        method: "get",
      })
        .then(async (response) => {
          const result = await response.json();
          loadData(result);
          await new Promise((resolve) => setTimeout(resolve, 500));
          setLoading(false);
        })
        .catch(() => {
          console.log("HERE")
          setLoading(false);
        });
    });
  }

  function loadData(data) {
    let levelOne = data.ecoMonthProgressDto.levels.filter(
      (l) => l.levelNo == 1
    )[0];
    let levelTwo = data.ecoMonthProgressDto.levels.filter(
      (l) => l.levelNo == 2
    )[0];
    let levelThree = data.ecoMonthProgressDto.levels.filter(
      (l) => l.levelNo == 3
    )[0];

    console.log(levelTwo);

    setGameData({
      monthEcoXp: data.ecoMonthProgressDto.monthEcoXp,
      levelOne: levelOne,
      levelTwo: levelTwo,
      levelThree: levelThree,
    });

    if (data.ecoMonthProgressDto.monthEcoXp < levelOne.targetEcoXp) {
      setProgress(0);
      setXpNextLevel(
        levelOne.targetEcoXp - data.ecoMonthProgressDto.monthEcoXp
      );
    } else if (
      data.ecoMonthProgressDto.monthEcoXp >= levelOne.targetEcoXp &&
      data.ecoMonthProgressDto.monthEcoXp < levelTwo.targetEcoXp
    ) {
      let subBarTotalXp = levelTwo.targetEcoXp - levelOne.targetEcoXp;
      let subBarAchievedXp =
        data.ecoMonthProgressDto.monthEcoXp - levelOne.targetEcoXp;
      setProgress((0.5 * subBarAchievedXp) / subBarTotalXp);
      setXpNextLevel(
        levelTwo.targetEcoXp - data.ecoMonthProgressDto.monthEcoXp
      );
    } else if (
      data.ecoMonthProgressDto.monthEcoXp >= levelTwo.targetEcoXp &&
      data.ecoMonthProgressDto.monthEcoXp <= levelThree.targetEcoXp
    ) {
      let subBarTotalXp = levelThree.targetEcoXp - levelTwo.targetEcoXp;
      let subBarAchievedXp =
        data.ecoMonthProgressDto.monthEcoXp - levelTwo.targetEcoXp;
      setProgress((0.5 * subBarAchievedXp) / subBarTotalXp + 0.5);
      setXpNextLevel(
        levelThree.targetEcoXp - data.ecoMonthProgressDto.monthEcoXp
      );
    } else {
      setProgress(1);
    }
  }

  function getMonthDaysLeft() {
    let date = new Date();
    return (
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() -
      date.getDate()
    );
  }

  return (
    <BackgroundContainer>
      <View style={styles.container}>
        <Text style={styles.h1}>Eco Desafio</Text>

        {loading ? (
          <View
            style={{width: "100%", height: "100%", justifyContent: "center"}}
          >
            <ActivityIndicator size="large"/>
          </View>
        ) : (
          <>
            {progress < 1 ? (
              <View style={{justifyContent: "center", alignItems: "center"}}>
                <Text style={styles.h2}>Falta {xpNextLevel} EcoXP</Text>
                <Text
                  style={{fontSize: 15, fontWeight: "bold", color: "black"}}
                >
                  Para Atingir o Nível Seguinte
                </Text>
              </View>
            ) : (
              <View style={{justifyContent: "center", alignItems: "center"}}>
                <Text style={styles.h2}>Parabéns!</Text>
                <Text
                  style={{fontSize: 15, fontWeight: "bold", color: "black"}}
                >
                  Completou o Desafio
                </Text>
              </View>
            )}

            <View style={{width: "100%", alignItems: "center"}}>
              <View style={styles.progressBarContainer}>
                <View style={styles.levelMarkersContainer}>
                  <LevelMarker
                    level="1"
                    locked={
                      (gameData?.monthEcoXp ?? 0) <
                      (gameData?.levelOne?.targetEcoXp ?? 0)
                    }
                  />
                  <LevelMarker
                    level="2"
                    locked={
                      (gameData?.monthEcoXp ?? 0) <
                      (gameData?.levelTwo?.targetEcoXp ?? 0)
                    }
                  />
                  <LevelMarker
                    level="3"
                    locked={
                      (gameData?.monthEcoXp ?? 0) <
                      (gameData?.levelThree?.targetEcoXp ?? 0)
                    }
                  />
                </View>

                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {width: `${progress * 100}%`},
                    ]}
                  />
                </View>
              </View>

              <View style={styles.itemsContainer}>
                <Item
                  image={gameData?.levelOne?.rewardIconUrl ?? ""}
                  locked={
                    (gameData?.monthEcoXp ?? 0) <
                    (gameData?.levelOne?.targetEcoXp ?? 0)
                  }
                  redeemed={gameData?.levelOne?.redeemed ?? false}
                  onClick={() => redeem(1)}
                />
                <Item
                  image={gameData?.levelTwo?.rewardIconUrl ?? ""}
                  locked={
                    (gameData?.monthEcoXp ?? 0) <
                    (gameData?.levelTwo?.targetEcoXp ?? 0)
                  }
                  redeemed={gameData?.levelTwo?.redeemed ?? false}
                  onClick={() => redeem(2)}
                />
                <Item
                  image={gameData?.levelThree?.rewardIconUrl ?? ""}
                  locked={
                    (gameData?.monthEcoXp ?? 0) <
                    (gameData?.levelThree?.targetEcoXp ?? 0)
                  }
                  redeemed={gameData?.levelThree?.redeemed ?? false}
                  onClick={() => redeem(3)}
                />
              </View>
            </View>

            <Text style={{fontWeight: "bold", color: "black", fontSize: 15}}>
              {getMonthDaysLeft()} Dias Para o Desafio Terminar...
            </Text>
          </>
        )}
      </View>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 24,
    marginTop: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: "#000000",
  },
  h2: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#468730",
    textShadowColor: "black",
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 2,
    elevation: 10,
    textAlign: "center",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: "100%",
    marginBottom: 200,
  },
  progressBarContainer: {
    width: "65%",
    marginBottom: 0,
    alignItems: "center",
  },
  progressBarBackground: {
    height: 10,
    borderRadius: 10,
    backgroundColor: "#96b090",
    overflow: "hidden",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#315e21",
    borderRadius: 10,
  },
  levelMarkersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    position: "absolute",
    zIndex: 10,
    top: -32,
  },
  levelText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  /* ITEMS */
  itemsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginTop: 40,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    width: 120,
    height: 200,
    elevation: 5,
    position: "relative",
  },
  itemImage: {
    width: 120,
    height: 200,
    resizeMode: "contain",
  },
  itemLockedOverlay: {
    backgroundColor: "#5e7357",
    width: "100%",
    height: "100%",
    position: "absolute",
    padding: 10,
    borderRadius: 10,
    opacity: 0.4,
    zIndex: 20,
  },
  lockIcon: {
    position: "absolute",
    top: -170,
    left: -100,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    zIndex: 1,
  },
  claimButton: {
    backgroundColor: "black",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  claimText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 17,
  },
});
