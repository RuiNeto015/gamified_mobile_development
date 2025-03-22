import React, {useEffect, useState} from "react";
import {Dimensions, Image, SafeAreaView, StyleSheet, View} from "react-native";
import {Button, Text, useTheme} from "@ui-kitten/components";
import * as Progress from 'react-native-progress';
import {useNavigation, useRoute} from "@react-navigation/native";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import config from "../../../config";
import BackgroundContainer from "../../common/BackgroundContainer";
import CommonTitle from "../../common/CommonTitle";

const useProgress = (start) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!start) return;

    const duration = 2500;
    const intervalTime = 50;
    const increment = intervalTime / duration;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + increment;
        if (nextProgress >= 1) {
          clearInterval(interval);
          return 1;
        }
        return nextProgress;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [start]);

  return progress;
};

// Main QuizQuestionScreen component
const QuizQuestionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const {data} = route.params || {};

  // Get the expiration time in milliseconds
  const expireAt = data?.expireAt || 0;

  // Calculate the initial seconds remaining
  const calculateInitialSeconds = () => {
    const now = Date.now();
    const timeRemaining = Math.floor((expireAt - now) / 1000);
    return timeRemaining > 0 ? timeRemaining : 0;
  };

  // State variables
  const [questionData, setQuestionData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedbackSplash, setFeedbackSplash] = useState(null);
  const [timerExpired, setTimerExpired] = useState(calculateInitialSeconds() === 0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [seconds, setSeconds] = useState(calculateInitialSeconds());

  // Animation progress state
  const progress = useProgress(!!feedbackSplash || timerExpired);

  // Timer effect
  useEffect(() => {
    if (seconds > 0) {
      const intervalId = setInterval(() => setSeconds((prev) => prev - 1), 1000);
      return () => clearInterval(intervalId);
    } else {
      setTimerExpired(true);
    }
  }, [seconds]);

  // Fetch question data from API
  const fetchQuestion = async () => {
    try {
      if (!questionData) {
        const response = await fetch(config.API_ENDPOINT + "/quiz/random");
        const data = await response.json();
        setQuestionData(data);
      }
    } catch (error) {
      console.error("Error fetching question data:", error);
    }
  };

  // Submit answer to API and handle feedback
  const submitAnswer = async (index) => {
    try {
      const response = await fetch(
        `${config.API_ENDPOINT}/user/${data.updatedUser.id}/respond-quiz?token=${data.token}&question=${questionData.id}&answer=${index}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error submitting answer:", error);
      return null;
    }
  };

  // Handle answer selection
  const handleAnswerSelection = async (index) => {
    if (hasNavigated) return;

    setSelectedAnswer(index);
    const result = await submitAnswer(index);
    if (result && result.wasCorrect) {
      navigation.navigate("SuccessQuizScreen");
      return;
    } else {
      setFeedbackSplash("incorrect");
    }

    setTimeout(() => {
      navigation.reset({index: 0, routes: [{name: "RecyclingHomeScreen"}]});
    }, 3000);
  };

  // Fallback action if timer expires
  useEffect(() => {
    if (timerExpired && !hasNavigated && feedbackSplash === "incorrect") {
      setHasNavigated(true);

      setTimeout(() => {
        navigation.reset({index: 0, routes: [{name: "RecyclingHomeScreen"}]});
      }, 3000);
    }
  }, [timerExpired, hasNavigated]);

  useEffect(() => {
    fetchQuestion();
  }, []);

  // Format time to mm:ss format
  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Icon component for Home button
  const HomeIcon = () => (
    <FontAwesomeIcon icon={faClose} size={32} color={theme["background-basic-color-1"]}/>
  );

  return (
    <BackgroundContainer>
      <SafeAreaView style={[styles.container]}>
        {!feedbackSplash && (
          <View style={styles.headerContainer}>
            <CommonTitle text="Quiz"/>
          </View>
        )}
        {!feedbackSplash && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Tempo restante: {formatTime(seconds)}</Text>
          </View>
        )}

        {(feedbackSplash || timerExpired) &&
            <Progress.Bar
                color={"#0a7731"}
                width={Dimensions.get('window').width + 15}
                progress={progress}
            />
        }

        {timerExpired && !feedbackSplash && (
          <View style={styles.feedbackSplash}>
            <Text category="h4" status="danger">Acabou o tempo!</Text>
          </View>
        )}

        {feedbackSplash === "correct" && (
          <View style={styles.feedbackSplash}>
            <Text category="h2" status="success">Parabéns!</Text>
            <Text category="h2">Resposta correta!</Text>
            <View>
              <Image style={styles.img} source={require("../../images/winner.png")}/>
            </View>
            <Text style={styles.bonusPoints} category="h2">+2 Eco XP bónus!</Text>
          </View>
        )}

        {feedbackSplash === "incorrect" && (
          <View style={styles.feedbackSplashWrong}>
            <Text category="h2" status="danger">Quase lá!</Text>
            <Text category="h6" style={styles.correctAnswerText}>
              A resposta correta é:{"\n"}
              {questionData.answerOptions[questionData.correctAnswer].answerStr}
            </Text>
            <Image style={styles.imgWrong} source={require("../../images/wrong_quiz.png")}/>
          </View>
        )}

        {!feedbackSplash && questionData ? !timerExpired && (
          <View style={styles.questionContainer}>
            <Text category="h6" style={styles.questionText}>
              {questionData.question}
            </Text>
            {questionData.answerOptions.map((option, index) => (
              <Button
                key={index}
                style={styles.answerButton}
                onPress={() => handleAnswerSelection(index)}
                appearance={selectedAnswer === index ? "filled" : "outline"}
              >
                <Text style={styles.answerButtonText}>{option.answerStr}</Text>
              </Button>
            ))}
          </View>
        ) : (
          !feedbackSplash && (
            <Text category="h5" style={styles.loadingText}>A carregar pergunta...</Text>
          )
        )}

        {!feedbackSplash && !timerExpired && (
          <View style={styles.homeButtonContainer}>
            <Button
              onPress={() =>
                navigation.reset({index: 0, routes: [{name: "RecyclingHomeScreen"}]})
              }
              status="danger"
              accessoryLeft={HomeIcon}
            >
              Não quero responder
            </Button>
          </View>
        )}
      </SafeAreaView>
    </BackgroundContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  img: {
    marginTop: 120,
    width: 400,
    height: 200,
  },
  imgWrong: {
    width: '90%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginVertical: 40,
    marginBottom: 70
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  questionText: {
    marginBottom: 60,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  answerButton: {
    marginVertical: 10,
    fontSize: 20,
    width: "90%",
  },
  answerButtonText: {
    fontSize: 310,
    color: "#773b0a",
  },
  feedbackSplash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bonusPoints: {
    marginTop: 30
  },
  feedbackSplashWrong: {
    flex: 1,
    marginTop: 70,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  correctAnswerText: {
    marginTop: 0,
    width: "100%",
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
  homeButtonContainer: {
    marginBottom: 70,
    alignItems: "center",
  },
});

export default QuizQuestionScreen;