import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useExam } from './contexts/ExamContext';

export default function SubjectSelectionScreen() {
  const { exam, version, setSubject } = useExam();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!version) return;
    
    (async () => {
      try {
        // Get subjects linked to this exam version
        const { data: subjectLinks, error: linkError } = await supabase
          .from('subject_exam_versions')
          .select('subject_id')
          .eq('exam_version_id', version.id);

        if (linkError) throw linkError;

        if (subjectLinks.length === 0) {
          setSubjects([]);
          setLoading(false);
          return;
        }

        const subjectIds = subjectLinks.map(link => link.subject_id);

        // Get subject details
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .in('id', subjectIds);

        if (subjectsError) throw subjectsError;

        setSubjects(subjectsData || []);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [version]);

  const handleSubjectSelect = (subject: any) => {
    setSubject(subject);
    router.push('/(tabs)');
  };

  const handleAllSubjects = () => {
    setSubject(null);
    router.push('/(tabs)');
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#F8FAFC" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Choose Subject</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.questionText}>
              Which subject would you like to focus on for {exam?.title}?
            </Text>

            <View style={styles.subjectsContainer}>
              {/* All Subjects Option */}
              <TouchableOpacity
                style={[styles.subjectCard, styles.allSubjectsCard]}
                onPress={handleAllSubjects}
              >
                <View style={styles.subjectInfo}>
                  <View style={styles.subjectIcon}>
                    <BookOpen size={24} color="#F59E0B" strokeWidth={2} />
                  </View>
                  <View style={styles.subjectText}>
                    <Text style={styles.subjectName}>All Subjects</Text>
                    <Text style={styles.subjectDescription}>
                      Practice questions from all subject areas
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>

              {/* Individual Subjects */}
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.subjectCard}
                  onPress={() => handleSubjectSelect(subject)}
                >
                  <View style={styles.subjectInfo}>
                    <View style={styles.subjectIcon}>
                      <BookOpen size={24} color="#3B82F6" strokeWidth={2} />
                    </View>
                    <View style={styles.subjectText}>
                      <Text style={styles.subjectName}>{subject.name}</Text>
                      <Text style={styles.subjectDescription}>
                        {subject.description}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#94A3B8" strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading subjects...</Text>
              </View>
            )}

            {!loading && subjects.length === 0 && (
              <View style={styles.noSubjects}>
                <Text style={styles.noSubjectsText}>No subjects available</Text>
                <Text style={styles.noSubjectsSubtext}>
                  You can still practice with all available questions
                </Text>
                <TouchableOpacity style={styles.continueButton} onPress={handleAllSubjects}>
                  <Text style={styles.continueButtonText}>Continue with All Questions</Text>
                </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
  },
  subjectsContainer: {
    gap: 16,
  },
  subjectCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  allSubjectsCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#1E293B',
  },
  subjectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectText: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  noSubjects: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noSubjectsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  noSubjectsSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});