import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Target, TrendingUp, X, CircleCheck as CheckCircle, ChartBar as BarChart, CreditCard as Edit, Crown } from 'lucide-react-native';

const QUIZ_MODES = [
  {
    id: 'daily',
    title: 'Question of the Day',
    icon: Calendar,
    subtitle: 'Jun 7',
    color: '#3B82F6',
    isPremium: false,
  },
  {
    id: 'quick_10',
    title: 'Quick 10 Quiz',
    icon: Target,
    subtitle: '10 questions',
    color: '#8B5CF6',
    isPremium: false,
  },
  {
    id: 'timed',
    title: 'Timed Quiz',
    icon: Clock,
    subtitle: 'Beat the clock',
    color: '#06B6D4',
    isPremium: false,
  },
  {
    id: 'level_up',
    title: 'Level Up',
    icon: TrendingUp,
    subtitle: 'Progressive difficulty',
    color: '#8B5CF6',
    isPremium: true,
  },
  {
    id: 'missed',
    title: 'Missed Questions Quiz',
    icon: X,
    subtitle: 'Practice weak areas',
    color: '#EF4444',
    isPremium: true,
  },
  {
    id: 'weakest',
    title: 'Weakest Subject Quiz',
    icon: BarChart,
    subtitle: 'Focus on gaps',
    color: '#F97316',
    isPremium: true,
  },
  {
    id: 'custom',
    title: 'Build Your Own Quiz',
    icon: Edit,
    subtitle: 'Customize your practice',
    color: '#10B981',
    isPremium: true,
  },
];

const DAILY_QUESTION = {
  question: "Similar to RDP and VNC services on Windows, Linux, and MAC, Apple Remote Desktop is remote managing software. Which port does it usually listen to?",
  options: [
    { id: 'a', text: '3283/tcp', isCorrect: true },
    { id: 'b', text: '3389/tcp', isCorrect: false },
    { id: 'c', text: '22/tcp', isCorrect: false },
    { id: 'd', text: '443/tcp', isCorrect: false },
  ]
};

export default function StudyScreen() {
  const { user } = useAuth();
  const [selectedExam, setSelectedExam] = useState('CompTIA® PenTest+');
  const [showDailyQuestion, setShowDailyQuestion] = useState(false);
  const [studiedDays, setStudiedDays] = useState([7]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDaysInMonth = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleQuizMode = (mode: any) => {
    if (mode.isPremium && user?.subscription_status !== 'premium') {
      Alert.alert(
        'Premium Feature',
        'This quiz mode is available with a premium subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }

    if (mode.id === 'daily') {
      setShowDailyQuestion(true);
    } else {
      // Navigate to quiz screen
      router.push(`/quiz/${mode.id}`);
    }
  };

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswer(optionId);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
  };

  const closeModal = () => {
    setShowDailyQuestion(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <TouchableOpacity 
              style={styles.examSelector}
              onPress={() => router.push('/exam-selection')}
            >
              <Text style={styles.examText}>{selectedExam}</Text>
              <Text style={styles.examSubtext}>Tap to change exam</Text>
            </TouchableOpacity>
          </View>

          {/* Study Calendar */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarGrid}>
              {getDaysInMonth().map((day) => (
                <View
                  key={day}
                  style={[
                    styles.calendarDay,
                    studiedDays.includes(day) && styles.studiedDay,
                    day === 7 && styles.todayDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      studiedDays.includes(day) && styles.studiedDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Studied</Text>
              </View>
            </View>
          </View>

          {/* Premium Subscription Banner */}
          <TouchableOpacity style={styles.premiumBanner}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.premiumGradient}
            >
              <Crown size={24} color="#0F172A" strokeWidth={2} />
              <Text style={styles.premiumText}>Subscribe for all 6 quiz modes</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quiz Modes */}
          <View style={styles.quizModesContainer}>
            <Text style={styles.sectionTitle}>Quiz Modes</Text>
            
            {QUIZ_MODES.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <TouchableOpacity
                  key={mode.id}
                  style={styles.quizModeCard}
                  onPress={() => handleQuizMode(mode)}
                >
                  <View style={styles.quizModeContent}>
                    <View style={[styles.quizModeIcon, { backgroundColor: mode.color }]}>
                      <IconComponent size={24} color="#FFFFFF" strokeWidth={2} />
                    </View>
                    <View style={styles.quizModeText}>
                      <Text style={styles.quizModeTitle}>{mode.title}</Text>
                      <Text style={styles.quizModeSubtitle}>{mode.subtitle}</Text>
                    </View>
                    {mode.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Crown size={16} color="#F59E0B" strokeWidth={2} />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Daily Question Modal */}
        <Modal
          visible={showDailyQuestion}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Calendar size={24} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.modalTitle}>Today's Question of the Day</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color="#94A3B8" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <Text style={styles.questionText}>{DAILY_QUESTION.question}</Text>

              <View style={styles.optionsContainer}>
                {DAILY_QUESTION.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      selectedAnswer === option.id && styles.selectedOption,
                      showResult && option.isCorrect && styles.correctOption,
                      showResult && selectedAnswer === option.id && !option.isCorrect && styles.incorrectOption,
                    ]}
                    onPress={() => handleAnswerSelect(option.id)}
                    disabled={showResult}
                  >
                    <Text style={styles.optionText}>{option.text}</Text>
                    {showResult && option.isCorrect && (
                      <CheckCircle size={20} color="#10B981" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {!showResult ? (
                <TouchableOpacity
                  style={[styles.submitButton, !selectedAnswer && styles.submitButtonDisabled]}
                  onPress={submitAnswer}
                  disabled={!selectedAnswer}
                >
                  <Text style={styles.submitButtonText}>Submit Answer</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultText}>
                    {selectedAnswer === 'a' ? 'Correct!' : 'Incorrect!'}
                  </Text>
                  <Text style={styles.explanationText}>
                    Apple Remote Desktop typically uses port 3283/tcp for remote management connections.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  examSelector: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  examText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  examSubtext: {
    fontSize: 14,
    color: '#94A3B8',
  },
  calendarContainer: {
    marginBottom: 30,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studiedDay: {
    backgroundColor: '#10B981',
  },
  todayDay: {
    backgroundColor: '#F8FAFC',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  studiedDayText: {
    color: '#FFFFFF',
  },
  calendarLegend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  premiumBanner: {
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  quizModesContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  quizModeCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  quizModeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  quizModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quizModeText: {
    flex: 1,
  },
  quizModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  quizModeSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  questionText: {
    fontSize: 16,
    color: '#F8FAFC',
    lineHeight: 24,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
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
  optionText: {
    fontSize: 16,
    color: '#F8FAFC',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
  },
});