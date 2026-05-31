import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { Button } from '../ui/Button';

interface Props {
  visible: boolean;
  eventTitle: string;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => Promise<void>;
}

const RATING_LABELS = ['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'];
const RATING_COLORS = ['', Colors.error, Colors.warning, Colors.warning, Colors.success, Colors.primary];

export function RatingModal({ visible, eventTitle, onClose, onSubmit }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStar = (n: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(n);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await onSubmit(rating, comment.trim() || undefined);
    setLoading(false);
    setRating(0);
    setComment('');
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const accentColor = rating > 0 ? RATING_COLORS[rating] : Colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheet, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
                <View style={[styles.handle, { backgroundColor: theme.border }]} />

                <View style={styles.header}>
                  <Ionicons name="star" size={22} color={Colors.warning} />
                  <Text style={[styles.title, { color: theme.text }]}>Etkinliği Değerlendir</Text>
                  <TouchableOpacity onPress={handleClose} accessibilityRole="button" accessibilityLabel="Kapat">
                    <Ionicons name="close" size={22} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.eventName, { color: theme.textSecondary }]} numberOfLines={2}>
                  {eventTitle}
                </Text>

                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                      key={n}
                      onPress={() => handleStar(n)}
                      accessibilityRole="button"
                      accessibilityLabel={`${n} yıldız`}
                    >
                      <Ionicons
                        name={n <= rating ? 'star' : 'star-outline'}
                        size={40}
                        color={n <= rating ? Colors.warning : theme.border}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {rating > 0 && (
                  <Text style={[styles.ratingLabel, { color: accentColor }]}>
                    {RATING_LABELS[rating]}
                  </Text>
                )}

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? Colors.dark.bg : Colors.light.bg,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Yorumunuzu yazın (isteğe bağlı)..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={3}
                  value={comment}
                  onChangeText={setComment}
                  maxLength={300}
                  textAlignVertical="top"
                />

                <Button
                  label="Değerlendirmeyi Gönder"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={rating === 0}
                  fullWidth
                  size="lg"
                  leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
                />
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    gap: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  eventName: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginTop: -Spacing.sm,
  },
  input: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    minHeight: 80,
    lineHeight: FontSize.sm * 1.6,
  },
});
