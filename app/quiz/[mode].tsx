import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Target, CheckCircle, X, RotateCcw } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import { supabase } from '@/lib/supabase';
import { updateProgress } from '@/lib/progress';

interface Question {
  id: string;
  question_text: string;
  explanation: string;
  difficulty: string;
  domain: string;
  options: {
    id: string;
    option_text: string;
    option_letter: string;
    is_correct: boolean;
  }[];
}

export default function QuizScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const { user } = useAuth();
  const { exam, version } = useExam();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  const fetchQuestions = useCallback(async () => {
    if (!version) return;
    
    setLoading(true);
    try {
      let questionCount = 10; // Default for quick_10
      
      if (mode === 'timed') {
        questionCount = 20;
        setTimeLeft(30 * 60); // 30 minutes
      }

      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          explanation,
          difficulty,
          domain,
          question_options (
            id,
            option_text,
            option_letter,
            is_correct
          )
        `)
        .eq('exam_version_id', version.id)
        .limit(questionCount);

      if (error) throw error;

      const formattedQuestions = data.map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        explanation: q.explanation,
        difficulty: q.difficulty,
        domain: q.domain,
        options: q.question_options.sort((a: any, b: any) => 
          a.option_letter.localeCompare(b.option_letter)
        ),
      }));

      setQuestions(formattedQuestions);
    } catch (err) {
      console.error('Error fetching questions:', err);
      Alert.alert('Error', 'Failed to load quiz questions');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [version, mode]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Timer effect for timed quizzes
  useEffect(() => {
    if (timeLeft === null || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizCompleted]);

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswer(optionId);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    // Save the answer
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer
    }));

    setShowResult(true);
  };

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    if (quizCompleted) return;
    
    setQuizCompleted(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      const sessionAnswers = [];

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswerId = userAnswers[i];
        const correctOption = question.options.find(opt => opt.is_correct);
        const isCorrect = userAnswerId === correctOption?.id;
        
        if (isCorrect) correctAnswers++;

        sessionAnswers.push({
          question_id: question.id,
          selected_option_id: userAnswerId,
          is_correct: isCorrect,
        });
      }

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      // Create quiz session
      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user?.id,
          exam_version_id: version?.id,
          quiz_type: mode,
          score: correctAnswers,
          total_questions: questions.length,
          time_taken_seconds: timeTaken,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save individual answers
      const answersToInsert = sessionAnswers.map(answer => ({
        ...answer,
        user_id: user?.id,
        quiz_session_id: session.id,
      }));

      const { error: answersError } = await supabase
        .from('user_answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      // Update user progress
      if (user && version) {
        await updateProgress(user.id, version.id, {
          questionsAnswered: questions.length,
          correctAnswers,
          timeTaken,
        });
      }

      // Navigate to results
      router.replace(`/results?session=${session.id}`);
    } catch (err) {
      console.error('Error completing quiz:', err);
      Alert.alert('Error', 'Failed to save quiz results');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuizTitle = () => {
    switch (mode) {
      case 'quick_10': return 'Quick 10 Quiz';
      case 'timed': return 'Timed Quiz';
      case 'level_up': return 'Level Up Quiz';
      case 'missed': return 'Missed Questions';
      case 'weakest': return 'Weakest Subject';
      case 'custom': return 'Custom Quiz';
      default: return 'Quiz';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading quiz...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (questions.length === 0) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#F8FAFC" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.title}>Quiz</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No questions available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchQuestions}>
              <RotateCcw size={20} color="#F8FAFC" strokeWidth={2} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#F8FAFC" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>{getQuizTitle()}</Text>
          {timeLeft !== null && (
            <View style={styles.timerContainer}>
              <Clock size={16} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Question */}
          <View style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <View style={styles.questionMeta}>
                <Text style={styles.difficultyText}>{currentQuestion.difficulty}</Text>
                <Text style={styles.domainText}>{currentQuestion.domain}</Text>
              </View>
            </View>
            <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedAnswer === option.id && styles.selectedOption,
                  showResult && option.is_correct && styles.correctOption,
                  showResult && selectedAnswer === option.id && !option.is_correct && styles.incorrectOption,
                ]}
                onPress={() => handleAnswerSelect(option.id)}
                disabled={showResult}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLetter}>{option.option_letter}.</Text>
                  <Text style={styles.optionText}>{option.option_text}</Text>
                </View>
                {showResult && option.is_correct && (
                  <CheckCircle size={20} color="#10B981" strokeWidth={2} />
                )}
                {showResult && selectedAnswer === option.id && !option.is_correct && (
                  <X size={20} color="#EF4444" strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Explanation */}
          {showResult && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {!showResult ? (
            <TouchableOpacity
              style={[styles.actionButton, !selectedAnswer && styles.actionButtonDisabled]}
              onPress={handleNextQuestion}
              disabled={!selectedAnswer}
            >
              <Text style={styles.actionButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={handleContinue}>
              <Text style={styles.actionButtonText}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#F8FAFC',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionHeader: {
    marginBottom: 16,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  domainText: {
    fontSize: 12,
    color: '#94A3B8',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  questionText: {
    fontSize: 18,
    color: '#F8FAFC',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#475569',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    borderColor: '#F59E0B',
    backgroundColor: '#1E293B',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: '#7F1D1D',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    marginRight: 12,
    minWidth: 20,
  },
  optionText: {
    fontSize: 16,
    color: '#F8FAFC',
    flex: 1,
  },
  explanationContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  actionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  actionButton: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});