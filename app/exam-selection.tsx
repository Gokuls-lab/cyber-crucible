import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useExam } from './contexts/ExamContext';

export default function ExamSelectionScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [exams, setExams] = useState<any[]>([]);
  const { setExam, setVersion } = useExam();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('exams').select('*').eq('is_active', true);
      if (!error && Array.isArray(data)) setExams(data);
    })();
  }, []);

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exam.short_name && exam.short_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExamSelect = (exam: any) => {
    setExam(exam);
    setVersion(null);
    router.push('/exam-version');
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#F8FAFC" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Choose Exam</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search certifications..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Exams List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.examsList}>
            <Text style={styles.subtitle}>What are you preparing for?</Text>
            {filteredExams.map((exam) => (
              <TouchableOpacity
                key={exam.id}
                style={styles.examCard}
                onPress={() => handleExamSelect(exam)}
              >
                <View style={styles.examInfo}>
                  <Text style={styles.examName}>{exam.title}</Text>
                  <Text style={styles.examCode}>{exam.short_name}</Text>
                  <View style={styles.examMeta}>
                    <Text style={styles.examMetaText}>
                      {exam.total_questions || 0} questions
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>
            ))}
            {filteredExams.length === 0 && searchQuery && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No certifications found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try adjusting your search terms
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  examsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    marginBottom: 24,
  },
  examCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  examCode: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  examMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});