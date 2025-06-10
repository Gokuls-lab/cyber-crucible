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
import { ArrowLeft, Calendar, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useExam } from './contexts/ExamContext';

export default function ExamVersionScreen() {
  const { exam, setVersion, subject, setSubject } = useExam();
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    if (!exam) return;
    (async () => {
      const { data, error } = await supabase
        .from('exam_versions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('launch_date', { ascending: false });
      if (!error && Array.isArray(data)) setVersions(data);
    })();
  }, [exam]);

  const handleVersionSelect = async (version: any) => {
    setVersion(version);
    setSubject(null);
    router.push('/(tabs)');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isDiscontinuing = (version: any) => {
    if (!version.discontinue_date) return false;
    const discontinueDate = new Date(version.discontinue_date);
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(now.getMonth() + 6);
    return discontinueDate <= sixMonthsFromNow;
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#F8FAFC" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Choose Exam Version</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.questionText}>
              Which version of {exam?.title || 'this exam'} are you preparing for?
            </Text>

            <View style={styles.versionsContainer}>
              {versions.map((version) => (
                <TouchableOpacity
                  key={version.id}
                  style={[
                    styles.versionCard,
                    version.is_current && styles.selectedVersionCard,
                    isDiscontinuing(version) && styles.deprecatedVersionCard,
                  ]}
                  onPress={() => handleVersionSelect(version)}
                >
                  <View style={styles.versionHeader}>
                    <Text style={styles.versionTitle}>
                      {exam?.title} ({version.version_code})
                    </Text>
                    {version.is_current && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.versionName}>{version.version_name}</Text>

                  <Text style={styles.versionDescription}>
                    {version.description}
                  </Text>

                  {isDiscontinuing(version) && (
                    <View style={styles.warningContainer}>
                      <AlertTriangle size={16} color="#F59E0B" strokeWidth={2} />
                      <Text style={styles.warningText}>
                        Discontinuing {formatDate(version.discontinue_date)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.versionMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color="#94A3B8" strokeWidth={2} />
                      <Text style={styles.metaText}>
                        Launched {formatDate(version.launch_date)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {versions.length === 0 && (
              <View style={styles.noVersions}>
                <Text style={styles.noVersionsText}>No versions available</Text>
                <Text style={styles.noVersionsSubtext}>
                  Please check back later or contact support
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
  versionsContainer: {
    gap: 16,
  },
  versionCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  selectedVersionCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#1E293B',
  },
  deprecatedVersionCard: {
    opacity: 0.8,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  versionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  currentBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  versionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 12,
  },
  versionDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  versionMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  noVersions: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noVersionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  noVersionsSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});